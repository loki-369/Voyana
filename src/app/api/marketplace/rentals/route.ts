import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

async function getVendorProfileFromRequest(request: Request): Promise<any | null> {
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
  if (!payload || payload.role !== "VENDOR") return null;

  return await prisma.vendorProfile.findUnique({
    where: { userId: payload.id },
  });
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const vendorId = searchParams.get("vendorId");

    const query: any = {};
    if (category) query.category = category;
    if (vendorId) query.vendorId = vendorId;

    const items = await prisma.rentalItem.findMany({
      where: query,
      include: {
        vendor: true,
        reviews: {
          include: {
            reviewer: {
              select: {
                name: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({ items }, { status: 200 });
  } catch (error: any) {
    console.error("GET rental items error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const vendor = await getVendorProfileFromRequest(request);
    if (!vendor) {
      return NextResponse.json({ error: "Unauthorized. Vendor role required." }, { status: 401 });
    }

    const body = await request.json();
    const { name, category, pricePerDay, description, imageUrl, availableCount } = body;

    if (!name || !category || !pricePerDay) {
      return NextResponse.json(
        { error: "Name, category, and pricePerDay are required" },
        { status: 400 }
      );
    }

    const item = await prisma.rentalItem.create({
      data: {
        vendorId: vendor.id,
        name,
        category,
        pricePerDay: parseFloat(pricePerDay),
        description: description || "",
        imageUrl: imageUrl || "https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&w=300&h=300&q=80",
        availableCount: parseInt(availableCount) || 1,
      },
    });

    return NextResponse.json({ item }, { status: 201 });
  } catch (error: any) {
    console.error("POST rental item error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
