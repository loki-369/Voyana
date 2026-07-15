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
      include: { driverProfile: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let bookings = [];

    if (user.role === "DRIVER" && user.driverProfile) {
      bookings = await prisma.taxiBooking.findMany({
        where: { driverId: user.driverProfile.id },
        include: {
          traveler: {
            select: {
              name: true,
              phone: true,
              avatarUrl: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    } else {
      bookings = await prisma.taxiBooking.findMany({
        where: { travelerId: user.id },
        include: {
          driver: {
            include: {
              user: {
                select: {
                  name: true,
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
    console.error("GET taxi bookings error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
