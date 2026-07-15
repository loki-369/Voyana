import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const location = searchParams.get("location");

    const query: any = {};
    if (location) {
      query.location = { contains: location };
    }

    const guides = await prisma.guideProfile.findMany({
      where: query,
      include: {
        user: {
          select: {
            name: true,
            email: true,
            phone: true,
            avatarUrl: true,
            verified: true,
          },
        },
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

    return NextResponse.json({ guides }, { status: 200 });
  } catch (error: any) {
    console.error("GET guides error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
