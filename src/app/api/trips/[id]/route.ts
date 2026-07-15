import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

async function getUserIdFromRequest(request: Request): Promise<string | null> {
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
  if (!token) return null;
  const payload = verifyToken(token);
  return payload ? payload.id : null;
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = await getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const trip = await prisma.trip.findFirst({
      where: { id, userId },
    });

    if (!trip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    const body = await request.json();
    const {
      destination,
      startDate,
      endDate,
      budget,
      companions,
      transportation,
      accommodation,
      notes,
    } = body;

    const updatedTrip = await prisma.trip.update({
      where: { id },
      data: {
        destination: destination !== undefined ? destination : trip.destination,
        startDate: startDate !== undefined ? new Date(startDate) : trip.startDate,
        endDate: endDate !== undefined ? new Date(endDate) : trip.endDate,
        budget: budget !== undefined ? parseFloat(budget) : trip.budget,
        companions: companions !== undefined ? companions : trip.companions,
        transportation: transportation !== undefined ? transportation : trip.transportation,
        accommodation: accommodation !== undefined ? accommodation : trip.accommodation,
        notes: notes !== undefined ? notes : trip.notes,
      },
      include: {
        destinations: true,
        itineraries: true,
        expenses: true,
        checklists: true,
      },
    });

    return NextResponse.json({ trip: updatedTrip }, { status: 200 });
  } catch (error: any) {
    console.error("PUT trip error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = await getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const trip = await prisma.trip.findFirst({
      where: { id, userId },
    });

    if (!trip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    await prisma.trip.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Trip deleted successfully" }, { status: 200 });
  } catch (error: any) {
    console.error("DELETE trip error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
