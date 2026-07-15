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
    const { task } = body;

    if (!task) {
      return NextResponse.json({ error: "Task is required" }, { status: 400 });
    }

    const item = await prisma.checklistItem.create({
      data: {
        tripId,
        task,
        completed: false,
      },
    });

    return NextResponse.json({ item }, { status: 201 });
  } catch (error: any) {
    console.error("POST checklist item error:", error);
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
    const { itemId, completed, task } = body;

    if (!itemId) {
      return NextResponse.json({ error: "Item ID is required" }, { status: 400 });
    }

    const item = await prisma.checklistItem.findFirst({
      where: { id: itemId, tripId },
    });

    if (!item) {
      return NextResponse.json({ error: "Checklist item not found" }, { status: 404 });
    }

    const updatedItem = await prisma.checklistItem.update({
      where: { id: itemId },
      data: {
        completed: completed !== undefined ? completed : item.completed,
        task: task !== undefined ? task : item.task,
      },
    });

    return NextResponse.json({ item: updatedItem }, { status: 200 });
  } catch (error: any) {
    console.error("PUT checklist item error:", error);
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
    const { itemId } = body;

    if (!itemId) {
      return NextResponse.json({ error: "Item ID is required" }, { status: 400 });
    }

    await prisma.checklistItem.delete({
      where: { id: itemId },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error("DELETE checklist item error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
