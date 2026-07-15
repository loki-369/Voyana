import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

async function verifyTripOwner(request: Request, tripId: string): Promise<boolean> {
  let token = "";
  const cookieHeader = request.headers.get("cookie");
  if (cookieHeader) {
    const match = cookieHeader.match(/token=([^;]+)/);
    if (match) token = match[1];
  }
  if (!token) {
    const authHeader = request.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    }
  }
  if (!token) return false;
  const payload = verifyToken(token);
  if (!payload) return false;

  const trip = await prisma.trip.findFirst({
    where: { id: tripId, userId: payload.id },
  });
  return !!trip;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: tripId } = await params;
    const isOwner = await verifyTripOwner(request, tripId);
    if (!isOwner) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, status, gpsCoordinates, notes, weather, distanceTraveled } = body;

    if (!name) {
      return NextResponse.json({ error: "Destination name is required" }, { status: 400 });
    }

    const link = await prisma.destinationLink.create({
      data: {
        tripId,
        name,
        status: status || "UPCOMING",
        gpsCoordinates: gpsCoordinates || null,
        notes: notes || "",
        weather: weather || null,
        distanceTraveled: distanceTraveled ? parseFloat(distanceTraveled) : null,
      },
    });

    return NextResponse.json({ destination: link }, { status: 201 });
  } catch (error: any) {
    console.error("POST destination error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: tripId } = await params;
    const isOwner = await verifyTripOwner(request, tripId);
    if (!isOwner) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { destinationId, name, status, gpsCoordinates, notes, weather, distanceTraveled, visitedDate, photos } = body;

    if (!destinationId) {
      return NextResponse.json({ error: "Destination ID is required" }, { status: 400 });
    }

    const link = await prisma.destinationLink.findFirst({
      where: { id: destinationId, tripId },
    });

    if (!link) {
      return NextResponse.json({ error: "Destination node not found" }, { status: 404 });
    }

    const updated = await prisma.destinationLink.update({
      where: { id: destinationId },
      data: {
        name: name !== undefined ? name : link.name,
        status: status !== undefined ? status : link.status,
        gpsCoordinates: gpsCoordinates !== undefined ? gpsCoordinates : link.gpsCoordinates,
        notes: notes !== undefined ? notes : link.notes,
        weather: weather !== undefined ? weather : link.weather,
        distanceTraveled: distanceTraveled !== undefined ? parseFloat(distanceTraveled) : link.distanceTraveled,
        visitedDate: visitedDate !== undefined ? (visitedDate ? new Date(visitedDate) : null) : link.visitedDate,
        photos: photos !== undefined ? photos : link.photos,
      },
    });

    return NextResponse.json({ destination: updated }, { status: 200 });
  } catch (error: any) {
    console.error("PUT destination error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: tripId } = await params;
    const isOwner = await verifyTripOwner(request, tripId);
    if (!isOwner) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { destinationId } = body;

    if (!destinationId) {
      return NextResponse.json({ error: "Destination ID is required" }, { status: 400 });
    }

    await prisma.destinationLink.delete({
      where: { id: destinationId },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error("DELETE destination error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
