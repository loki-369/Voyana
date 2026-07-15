import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

// Helper to authenticate user from request
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

    const trips = await prisma.trip.findMany({
      where: { userId },
      include: {
        destinations: true,
        itineraries: true,
        expenses: true,
        checklists: true,
      },
      orderBy: { startDate: "asc" },
    });

    return NextResponse.json({ trips }, { status: 200 });
  } catch (error: any) {
    console.error("GET trips error:", error);
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

    if (!destination || !startDate || !endDate) {
      return NextResponse.json(
        { error: "Destination, start date, and end date are required" },
        { status: 400 }
      );
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Calculate total days
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    // Create the trip transactionally
    const newTrip = await prisma.$transaction(async (tx) => {
      const trip = await tx.trip.create({
        data: {
          userId,
          destination,
          startDate: start,
          endDate: end,
          budget: parseFloat(budget) || 0,
          companions: companions || "Solo",
          transportation: transportation || "Flight & Taxi",
          accommodation: accommodation || "Hotel",
          notes: notes || "",
        },
      });

      // 1. Create a checklist
      const checklists = [
        { tripId: trip.id, task: `Print flight tickets to ${destination}`, completed: false },
        { tripId: trip.id, task: "Carry passport & identification docs", completed: true },
        { tripId: trip.id, task: "Pack chargers & power banks", completed: false },
        { tripId: trip.id, task: "Check destination weather forecasts", completed: false },
        { tripId: trip.id, task: "Withdraw local currency cash", completed: false },
        { tripId: trip.id, task: "Setup travel insurance", completed: false },
      ];
      await tx.checklistItem.createMany({ data: checklists });

      // 2. Create itineraries
      const itineraries = [];
      for (let i = 1; i <= Math.min(diffDays, 14); i++) {
        let activities = `Day ${i}: Arrive in ${destination}. Local orientation, explore nearby attractions, and settle into ${accommodation || "your accommodation"}.`;
        if (i > 1 && i < diffDays) {
          activities = `Day ${i}: Full day exploring ${destination}'s main tourist spots. Consider booking a local guide and trying traditional local meals.`;
        } else if (i === diffDays) {
          activities = `Day ${i}: Last day in ${destination}. Souvenir shopping, packing up, checking out of ${accommodation || "hotel"}, and heading home.`;
        }

        itineraries.push({
          tripId: trip.id,
          dayNumber: i,
          activities,
          expenses: 0.0,
        });
      }
      await tx.itineraryDay.createMany({ data: itineraries });

      // 3. Create initial destination links
      await tx.destinationLink.create({
        data: {
          tripId: trip.id,
          name: `${destination} Entry Point`,
          status: "CURRENT",
          weather: "Sunny, 24°C",
          distanceTraveled: 0,
          notes: `Starting our journey in ${destination}!`,
        },
      });

      return trip;
    });

    const fullTrip = await prisma.trip.findUnique({
      where: { id: newTrip.id },
      include: {
        destinations: true,
        itineraries: true,
        expenses: true,
        checklists: true,
      },
    });

    return NextResponse.json({ trip: fullTrip }, { status: 201 });
  } catch (error: any) {
    console.error("POST trip error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
