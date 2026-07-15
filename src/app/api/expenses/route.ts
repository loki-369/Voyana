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

export async function GET(request: Request) {
  try {
    const userId = await getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const tripId = searchParams.get("tripId");

    const query: any = { userId };
    if (tripId) {
      query.tripId = tripId;
    }

    const expenses = await prisma.expense.findMany({
      where: query,
      orderBy: { date: "desc" },
    });

    return NextResponse.json({ expenses }, { status: 200 });
  } catch (error: any) {
    console.error("GET expenses error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { amount, category, description, tripId, date } = body;

    if (!amount || !category) {
      return NextResponse.json(
        { error: "Amount and category are required" },
        { status: 400 }
      );
    }

    // Verify if trip belongs to user (if tripId is provided)
    if (tripId) {
      const trip = await prisma.trip.findFirst({
        where: { id: tripId, userId },
      });
      if (!trip) {
        return NextResponse.json({ error: "Trip not found or unauthorized" }, { status: 404 });
      }
    }

    const expense = await prisma.expense.create({
      data: {
        userId,
        tripId: tripId || null,
        amount: parseFloat(amount),
        category,
        description: description || "",
        date: date ? new Date(date) : new Date(),
      },
    });

    return NextResponse.json({ expense }, { status: 201 });
  } catch (error: any) {
    console.error("POST expense error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
