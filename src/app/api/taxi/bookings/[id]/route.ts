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
    const { id: bookingId } = await params;
    const userId = await getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { status, otp } = body; // status: STARTED, COMPLETED, CANCELLED, ACCEPTED

    if (!status) {
      return NextResponse.json({ error: "Status is required" }, { status: 400 });
    }

    const booking = await prisma.taxiBooking.findUnique({
      where: { id: bookingId },
      include: {
        driver: true,
      },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Verify role/ownership
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const isDriver = booking.driver && booking.driver.userId === userId;
    const isTraveler = booking.travelerId === userId;

    if (!isDriver && !isTraveler && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized to update this booking" }, { status: 401 });
    }

    const updated = await prisma.$transaction(async (tx) => {
      // 1. If starting ride, verify OTP
      if (status === "STARTED") {
        if (!otp) {
          throw new Error("OTP is required to start the ride");
        }
        if (booking.otp !== otp) {
          throw new Error("Incorrect Ride OTP. Please check with traveler.");
        }
      }

      // Update booking status
      const updatedBooking = await tx.taxiBooking.update({
        where: { id: bookingId },
        data: { status },
      });

      // Handle driver profile status transitions
      if (booking.driverId) {
        if (status === "COMPLETED" || status === "CANCELLED") {
          await tx.driverProfile.update({
            where: { id: booking.driverId },
            data: { status: "AVAILABLE" },
          });
        } else if (status === "STARTED") {
          await tx.driverProfile.update({
            where: { id: booking.driverId },
            data: { status: "ON_TRIP" },
          });
        }
      }

      // 2. If completed, auto-log expense & payments for traveler
      if (status === "COMPLETED") {
        // Find if traveler has an active trip currently ongoing
        const now = new Date();
        const activeTrip = await tx.trip.findFirst({
          where: {
            userId: booking.travelerId,
            startDate: { lte: now },
            endDate: { gte: now },
          },
        });

        // Add payment record
        await tx.payment.create({
          data: {
            userId: booking.travelerId,
            amount: booking.estimatedFare,
            status: "SUCCESS",
            gateway: "UPI",
            transactionId: `TXN-TAXI-${booking.id.substring(0, 8).toUpperCase()}`,
          },
        });

        // Create traveler expense
        await tx.expense.create({
          data: {
            userId: booking.travelerId,
            tripId: activeTrip ? activeTrip.id : null,
            amount: booking.estimatedFare,
            category: "Taxi",
            description: `Taxi Ride: ${booking.pickupLocation} to ${booking.dropLocation}`,
            date: new Date(),
          },
        });

        // Notify traveler
        await tx.notification.create({
          data: {
            userId: booking.travelerId,
            title: "Ride Completed",
            body: `Your ride with ${booking.driver?.vehicleModel || "driver"} has ended. ₹${booking.estimatedFare} has been charged and logged under your trip expenses.`,
            type: "TAXI_UPDATE",
          },
        });
      }

      if (status === "CANCELLED") {
        const notifyTarget = isDriver ? booking.travelerId : (booking.driver ? booking.driver.userId : null);
        if (notifyTarget) {
          await tx.notification.create({
            data: {
              userId: notifyTarget,
              title: "Ride Cancelled",
              body: `The ride booking from ${booking.pickupLocation} was cancelled.`,
              type: "TAXI_UPDATE",
            },
          });
        }
      }

      return updatedBooking;
    });

    return NextResponse.json({ booking: updated }, { status: 200 });
  } catch (error: any) {
    console.error("PUT taxi booking error:", error);
    return NextResponse.json({ error: error.message || "Something went wrong" }, { status: 400 });
  }
}
