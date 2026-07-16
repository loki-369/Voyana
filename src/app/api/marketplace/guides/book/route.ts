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

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let bookings: any[] = [];

    if (user.role === "GUIDE") {
      const guideProfile = await prisma.guideProfile.findUnique({
        where: { userId: user.id },
      });
      if (guideProfile) {
        bookings = await prisma.guideBooking.findMany({
          where: { guideId: guideProfile.id },
          include: {
            traveler: {
              select: {
                name: true,
                email: true,
                phone: true,
                avatarUrl: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        });
      }
    } else {
      bookings = await prisma.guideBooking.findMany({
        where: { travelerId: user.id },
        include: {
          guide: {
            include: {
              user: {
                select: {
                  name: true,
                  email: true,
                  phone: true,
                  avatarUrl: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    }

    return NextResponse.json({ bookings }, { status: 200 });
  } catch (error: any) {
    console.error("GET bookings error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const travelerId = await getUserIdFromRequest(request);
    if (!travelerId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { guideId, startDate, endDate } = body;

    if (!guideId || !startDate || !endDate) {
      return NextResponse.json(
        { error: "Guide ID, start date, and end date are required" },
        { status: 400 }
      );
    }

    const guide = await prisma.guideProfile.findUnique({
      where: { id: guideId },
      include: { user: true },
    });

    if (!guide) {
      return NextResponse.json({ error: "Guide profile not found" }, { status: 404 });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    const durationDays = Math.max(
      1,
      Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    );

    const totalPrice = durationDays * guide.pricePerDay;

    const booking = await prisma.$transaction(async (tx) => {
      // 1. Create guide booking
      const newBooking = await tx.guideBooking.create({
        data: {
          guideId,
          travelerId,
          startDate: start,
          endDate: end,
          totalPrice,
          status: "PENDING",
        },
      });

      // 2. Create notification for guide
      const traveler = await tx.user.findUnique({ where: { id: travelerId } });
      await tx.notification.create({
        data: {
          userId: guide.userId,
          title: "New Guide Booking Request",
          body: `${traveler?.name || "A traveler"} has requested you for a ${durationDays}-day trip starting ${start.toLocaleDateString()}. Total: ₹${totalPrice}.`,
          type: "TRIP_ALERT",
        },
      });

      return newBooking;
    });

    return NextResponse.json({ booking }, { status: 201 });
  } catch (error: any) {
    console.error("POST booking error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const userId = await getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { bookingId, status } = body; // status: CONFIRMED, COMPLETED, CANCELLED

    if (!bookingId || !status) {
      return NextResponse.json({ error: "Booking ID and status are required" }, { status: 400 });
    }

    const booking = await prisma.guideBooking.findUnique({
      where: { id: bookingId },
      include: { guide: true },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Verify ownership (either guide user or traveler user)
    const isGuide = booking.guide.userId === userId;
    const isTraveler = booking.travelerId === userId;

    if (!isGuide && !isTraveler) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const updated = await prisma.$transaction(async (tx) => {
      const uBooking = await tx.guideBooking.update({
        where: { id: bookingId },
        data: { status },
      });

      // Send notifications to the counterparty
      const guideUser = await tx.user.findUnique({ where: { id: booking.guide.userId } });
      const travelerUser = await tx.user.findUnique({ where: { id: booking.travelerId } });

      if (isGuide) {
        await tx.notification.create({
          data: {
            userId: booking.travelerId,
            title: `Guide Booking ${status}`,
            body: `Guide ${guideUser?.name} has ${status.toLowerCase()} your booking request from ${new Date(booking.startDate).toLocaleDateString()}.`,
            type: "TRIP_ALERT",
          },
        });
      } else if (isTraveler) {
        await tx.notification.create({
          data: {
            userId: booking.guide.userId,
            title: `Guide Booking cancelled by traveler`,
            body: `Traveler ${travelerUser?.name} has cancelled the booking scheduled from ${new Date(booking.startDate).toLocaleDateString()}.`,
            type: "TRIP_ALERT",
          },
        });
      }

      return uBooking;
    });

    return NextResponse.json({ booking: updated }, { status: 200 });
  } catch (error: any) {
    console.error("PUT booking error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
