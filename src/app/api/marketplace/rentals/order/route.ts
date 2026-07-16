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
      include: { vendorProfile: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let orders: any[] = [];
    if (user.role === "VENDOR" && user.vendorProfile) {
      orders = await prisma.rentalOrder.findMany({
        where: { vendorId: user.vendorProfile.id },
        include: {
          traveler: {
            select: {
              name: true,
              email: true,
              phone: true,
            },
          },
          items: {
            include: { item: true },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    } else {
      orders = await prisma.rentalOrder.findMany({
        where: { travelerId: user.id },
        include: {
          vendor: true,
          items: {
            include: { item: true },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    }

    return NextResponse.json({ orders }, { status: 200 });
  } catch (error: any) {
    console.error("GET rental orders error:", error);
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
    const { vendorId, startDate, endDate, items } = body; // items: [{ itemId, quantity }]

    if (!vendorId || !startDate || !endDate || !items || !items.length) {
      return NextResponse.json(
        { error: "Vendor ID, dates, and items are required" },
        { status: 400 }
      );
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    const durationDays = Math.max(
      1,
      Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    );

    // Fetch items to check availability and calculate price
    const itemIds = items.map((i: any) => i.itemId);
    const dbItems = await prisma.rentalItem.findMany({
      where: { id: { in: itemIds } },
    });

    let totalPrice = 0;
    const orderItemsData: any[] = [];

    for (const itemInput of items) {
      const dbItem = dbItems.find((i) => i.id === itemInput.itemId);
      if (!dbItem) {
        return NextResponse.json({ error: `Item ${itemInput.itemId} not found` }, { status: 404 });
      }
      totalPrice += dbItem.pricePerDay * itemInput.quantity * durationDays;
      orderItemsData.push({
        itemId: itemInput.itemId,
        quantity: itemInput.quantity,
      });
    }

    const order = await prisma.$transaction(async (tx) => {
      // 1. Create Order
      const newOrder = await tx.rentalOrder.create({
        data: {
          vendorId,
          travelerId,
          startDate: start,
          endDate: end,
          totalPrice,
          status: "PENDING",
          items: {
            create: orderItemsData,
          },
        },
        include: {
          items: {
            include: { item: true },
          },
        },
      });

      // 2. Notify Vendor
      const traveler = await tx.user.findUnique({ where: { id: travelerId } });
      const vendor = await tx.vendorProfile.findUnique({ where: { id: vendorId } });
      if (vendor) {
        await tx.notification.create({
          data: {
            userId: vendor.userId,
            title: "New Rental Order",
            body: `${traveler?.name || "A traveler"} ordered ${items.length} items for ${durationDays} days. Total: ₹${totalPrice}.`,
            type: "TRIP_ALERT",
          },
        });
      }

      return newOrder;
    });

    return NextResponse.json({ order }, { status: 201 });
  } catch (error: any) {
    console.error("POST rental order error:", error);
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
    const { orderId, status } = body; // status: CONFIRMED, SHIPPED, DELIVERED, RETURNED, CANCELLED

    if (!orderId || !status) {
      return NextResponse.json({ error: "Order ID and status are required" }, { status: 400 });
    }

    const order = await prisma.rentalOrder.findUnique({
      where: { id: orderId },
      include: { vendor: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const isVendor = order.vendor.userId === userId;
    const isTraveler = order.travelerId === userId;

    if (!isVendor && !isTraveler) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const updated = await prisma.$transaction(async (tx) => {
      const uOrder = await tx.rentalOrder.update({
        where: { id: orderId },
        data: { status },
      });

      const vendorUser = await tx.user.findUnique({ where: { id: order.vendor.userId } });

      if (isVendor) {
        // Notify traveler
        await tx.notification.create({
          data: {
            userId: order.travelerId,
            title: `Rental Order Update`,
            body: `Your rental order from ${vendorUser?.name} is now ${status.toLowerCase()}.`,
            type: "TRIP_ALERT",
          },
        });
      } else if (isTraveler && status === "CANCELLED") {
        // Notify vendor of cancel
        await tx.notification.create({
          data: {
            userId: order.vendor.userId,
            title: `Rental Order Cancelled`,
            body: `Traveler has cancelled the rental order scheduled for ${new Date(order.startDate).toLocaleDateString()}.`,
            type: "TRIP_ALERT",
          },
        });
      }

      return uOrder;
    });

    return NextResponse.json({ order: updated }, { status: 200 });
  } catch (error: any) {
    console.error("PUT rental order error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
