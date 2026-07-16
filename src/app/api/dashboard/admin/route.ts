import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

async function verifyAdminRole(request: Request): Promise<boolean> {
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

  const user = await prisma.user.findUnique({ where: { id: payload.id } });
  return user ? (user.role === "ADMIN" || user.role === "SUPERADMIN") : false;
}

export async function GET(request: Request) {
  try {
    const isAdmin = await verifyAdminRole(request);
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized. Admin role required." }, { status: 401 });
    }

    // 1. Fetch totals
    const userCount = await prisma.user.count();
    const travelerCount = await prisma.user.count({ where: { role: "TRAVELER" } });
    const guideCount = await prisma.user.count({ where: { role: "GUIDE" } });
    const vendorCount = await prisma.user.count({ where: { role: "VENDOR" } });
    const driverCount = await prisma.user.count({ where: { role: "DRIVER" } });

    const tripCount = await prisma.trip.count();
    const bookingCount = await prisma.guideBooking.count();
    const orderCount = await prisma.rentalOrder.count();
    const rideCount = await prisma.taxiBooking.count();

    // 2. Fetch revenue estimates
    const guideBookings = await prisma.guideBooking.findMany({
      where: { status: "COMPLETED" },
      select: { totalPrice: true },
    });
    const guideRevenue = guideBookings.reduce((sum, b) => sum + b.totalPrice, 0);

    const rentalOrders = await prisma.rentalOrder.findMany({
      where: { status: "DELIVERED" },
      select: { totalPrice: true },
    });
    const rentalRevenue = rentalOrders.reduce((sum, o) => sum + o.totalPrice, 0);

    const taxiBookings = await prisma.taxiBooking.findMany({
      where: { status: "COMPLETED" },
      select: { estimatedFare: true },
    });
    const taxiRevenue = taxiBookings.reduce((sum, b) => sum + b.estimatedFare, 0);

    const totalRevenue = guideRevenue * 0.1 + rentalRevenue * 0.15 + taxiRevenue * 0.05; // Platform commision rates

    // 3. Fetch Verification requests (Guides/Vendors not yet verified)
    const pendingGuides = await prisma.guideProfile.findMany({
      where: { verifiedBadge: false },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
    });

    const pendingVendors = await prisma.vendorProfile.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
            verified: true,
          },
        },
      },
    });

    // 4. Activity Logs (Mock audit logs if db is fresh)
    const auditLogs = await prisma.auditLog.findMany({
      include: {
        user: {
          select: {
            name: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    return NextResponse.json({
      stats: {
        users: {
          total: userCount,
          traveler: travelerCount,
          guide: guideCount,
          vendor: vendorCount,
          driver: driverCount,
        },
        trips: tripCount,
        bookings: bookingCount,
        orders: orderCount,
        rides: rideCount,
        revenue: {
          total: Math.round(totalRevenue),
          guides: Math.round(guideRevenue),
          rentals: Math.round(rentalRevenue),
          taxi: Math.round(taxiRevenue),
        },
      },
      pendingGuides,
      pendingVendors: pendingVendors.filter(v => !v.user.verified),
      auditLogs,
    }, { status: 200 });
  } catch (error: any) {
    console.error("GET admin stats error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const isAdmin = await verifyAdminRole(request);
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized. Admin role required." }, { status: 401 });
    }

    const body = await request.json();
    const { guideId, verify } = body;

    if (!guideId) {
      return NextResponse.json({ error: "Guide ID is required" }, { status: 400 });
    }

    const guide = await prisma.guideProfile.findUnique({
      where: { id: guideId },
      include: { user: true },
    });

    if (!guide) {
      return NextResponse.json({ error: "Guide profile not found" }, { status: 404 });
    }

    const updated = await prisma.$transaction(async (tx) => {
      const uProfile = await tx.guideProfile.update({
        where: { id: guideId },
        data: { verifiedBadge: !!verify },
      });

      await tx.user.update({
        where: { id: guide.userId },
        data: { verified: !!verify },
      });

      await tx.auditLog.create({
        data: {
          action: "GUIDE_VERIFIED",
          details: `Guide ${guide.user.name} (${guide.user.email}) verification set to ${!!verify}`,
          userId: guide.userId,
        },
      });

      await tx.notification.create({
        data: {
          userId: guide.userId,
          title: verify ? "Verification Approved! 🏆" : "Verification Status Updated",
          body: verify
            ? "Congratulations! Your profile has been reviewed and verified by administrators. The verified badge is now active on your profile."
            : "Your verification status has been updated.",
          type: "TRIP_ALERT",
        },
      });

      return uProfile;
    });

    return NextResponse.json({ guide: updated }, { status: 200 });
  } catch (error: any) {
    console.error("PUT admin guide verify error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
