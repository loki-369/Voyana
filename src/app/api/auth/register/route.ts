import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, generateToken, verifyToken } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, name, role, phone, additionalData } = body;

    if (!email || !password || !name || !role) {
      return NextResponse.json(
        { error: "Name, email, password, and role are required" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email is already registered" },
        { status: 409 }
      );
    }

    const hashedPassword = hashPassword(password);

    // Create user and profile depending on role
    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          role,
          phone: phone || null,
          verified: role === "TRAVELER", // travelers are verified by default for simplicity
          avatarUrl: `https://images.unsplash.com/photo-${role === "TRAVELER" ? "1535713875002-d1d0cf377fde" : "1570295999919-56ceb5ecca61"}?auto=format&fit=crop&w=150&h=150&q=80`,
        },
      });

      if (role === "GUIDE") {
        await tx.guideProfile.create({
          data: {
            userId: newUser.id,
            languages: additionalData?.languages || "English",
            experience: Number(additionalData?.experience) || 1,
            specialization: additionalData?.specialization || "General Sightseeing",
            pricePerDay: Number(additionalData?.pricePerDay) || 1000,
            location: additionalData?.location || "Unknown",
            bio: additionalData?.bio || "I am a local travel guide.",
            availability: "AVAILABLE",
          },
        });
      } else if (role === "VENDOR") {
        await tx.vendorProfile.create({
          data: {
            userId: newUser.id,
            storeName: additionalData?.storeName || `${name}'s Rental Store`,
            location: additionalData?.location || "Main City Center",
          },
        });
      } else if (role === "DRIVER") {
        await tx.driverProfile.create({
          data: {
            userId: newUser.id,
            vehicleType: additionalData?.vehicleType || "Car",
            vehicleNumber: additionalData?.vehicleNumber || "XX-00-XX-0000",
            vehicleModel: additionalData?.vehicleModel || "Standard Sedan",
            status: "AVAILABLE",
            latitude: 34.0837,
            longitude: 74.7973, // Default center
          },
        });
      }

      return newUser;
    });

    const fullUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        guideProfile: true,
        vendorProfile: true,
        driverProfile: true,
      },
    });

    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    const { password: _, ...safeUser } = fullUser!;

    const response = NextResponse.json({
      user: safeUser,
      token,
    });

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("Register error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
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

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const body = await request.json();
    const { role } = body;

    if (!role) {
      return NextResponse.json({ error: "Role is required" }, { status: 400 });
    }

    const updatedUser = await prisma.$transaction(async (tx) => {
      const u = await tx.user.update({
        where: { id: payload.id },
        data: { role },
      });

      if (role === "GUIDE") {
        const existing = await tx.guideProfile.findUnique({ where: { userId: u.id } });
        if (!existing) {
          await tx.guideProfile.create({
            data: {
              userId: u.id,
              languages: "English, Hindi, Kashmiri",
              experience: 5,
              specialization: "Cultural tours & Trekking",
              pricePerDay: 2000,
              location: "Srinagar, J&K",
              bio: "I am a local travel guide.",
              availability: "AVAILABLE",
              verifiedBadge: true,
            },
          });
        }
      } else if (role === "VENDOR") {
        const existing = await tx.vendorProfile.findUnique({ where: { userId: u.id } });
        if (!existing) {
          await tx.vendorProfile.create({
            data: {
              userId: u.id,
              storeName: `${u.name}'s Rental Hub`,
              location: "Gulmarg Gondola Base",
            },
          });
        }
      } else if (role === "DRIVER") {
        const existing = await tx.driverProfile.findUnique({ where: { userId: u.id } });
        if (!existing) {
          await tx.driverProfile.create({
            data: {
              userId: u.id,
              vehicleType: "SUV",
              vehicleNumber: "JK-01-A-1234",
              vehicleModel: "Mahindra Scorpio 4x4",
              status: "AVAILABLE",
              latitude: 34.0837,
              longitude: 74.7973,
            },
          });
        }
      }

      return u;
    });

    const fullUser = await prisma.user.findUnique({
      where: { id: updatedUser.id },
      include: {
        guideProfile: true,
        vendorProfile: true,
        driverProfile: true,
      },
    });

    const newToken = generateToken({
      id: fullUser!.id,
      email: fullUser!.email,
      role: fullUser!.role,
      name: fullUser!.name,
    });

    const { password: _, ...safeUser } = fullUser!;

    const response = NextResponse.json({
      user: safeUser,
      token: newToken,
    });

    response.cookies.set("token", newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("Role switch PUT error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
