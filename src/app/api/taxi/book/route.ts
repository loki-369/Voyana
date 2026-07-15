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

export async function POST(request: Request) {
  try {
    const travelerId = await getUserIdFromRequest(request);
    if (!travelerId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { pickupLocation, dropLocation, pickupLat, pickupLng, dropLat, dropLng, vehicleType } = body;

    if (!pickupLocation || !dropLocation) {
      return NextResponse.json(
        { error: "Pickup and drop locations are required" },
        { status: 400 }
      );
    }

    // 1. Find an available driver (filter by vehicleType if provided, else grab any)
    const driverFilter: any = { status: "AVAILABLE" };
    if (vehicleType) {
      driverFilter.vehicleType = vehicleType;
    }

    const availableDriver = await prisma.driverProfile.findFirst({
      where: driverFilter,
      include: { user: true },
    });

    // Calculate a mock distance (using GPS coordinates or random between 2-15km)
    let distanceKm = 5.2;
    if (pickupLat && pickupLng && dropLat && dropLng) {
      const latDiff = Math.abs(pickupLat - dropLat);
      const lngDiff = Math.abs(pickupLng - dropLng);
      // Rough approximation: 1 degree latitude is ~111km
      distanceKm = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff) * 111;
      if (distanceKm < 1) distanceKm = 1.5;
    } else {
      distanceKm = Math.floor(Math.random() * 10) + 3;
    }

    // Standard rate: ₹15 per km for Hatchback/Sedan, ₹22 for SUV, ₹8 for Bike
    let ratePerKm = 18;
    if (vehicleType === "SUV") ratePerKm = 25;
    else if (vehicleType === "Bike") ratePerKm = 10;
    else if (vehicleType === "Tempo") ratePerKm = 35;

    const estimatedFare = Math.round(distanceKm * ratePerKm + 50); // ₹50 base fare

    // Generate a 4-digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    const booking = await prisma.$transaction(async (tx) => {
      // Create booking
      const newBooking = await tx.taxiBooking.create({
        data: {
          travelerId,
          driverId: availableDriver ? availableDriver.id : null,
          pickupLocation,
          dropLocation,
          pickupLat: pickupLat ? parseFloat(pickupLat) : 34.0837,
          pickupLng: pickupLng ? parseFloat(pickupLng) : 74.7973,
          dropLat: dropLat ? parseFloat(dropLat) : 34.0484,
          dropLng: dropLng ? parseFloat(dropLng) : 74.3805,
          estimatedFare,
          otp,
          status: availableDriver ? "ACCEPTED" : "PENDING",
        },
        include: {
          driver: {
            include: { user: true },
          },
        },
      });

      // Update driver status if matched
      if (availableDriver) {
        await tx.driverProfile.update({
          where: { id: availableDriver.id },
          data: { status: "ON_TRIP" },
        });

        // Notify driver
        await tx.notification.create({
          data: {
            userId: availableDriver.userId,
            title: "New Ride Assigned",
            body: `Pickup: ${pickupLocation}. Drop: ${dropLocation}. Est Fare: ₹${estimatedFare}. OTP is required to start ride.`,
            type: "TAXI_UPDATE",
          },
        });
      }

      return newBooking;
    });

    return NextResponse.json({ booking, driverMatched: !!availableDriver }, { status: 201 });
  } catch (error: any) {
    console.error("POST taxi book error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
