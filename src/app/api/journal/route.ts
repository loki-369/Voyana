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

    const entries = await prisma.journalEntry.findMany({
      where: { userId },
      orderBy: { date: "desc" },
    });

    return NextResponse.json({ entries }, { status: 200 });
  } catch (error: any) {
    console.error("GET journal entries error:", error);
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
    const { title, content, mood, location, weather, photos, voiceNoteUrl, date } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: "Title and content are required" },
        { status: 400 }
      );
    }

    const entry = await prisma.journalEntry.create({
      data: {
        userId,
        title,
        content,
        mood: mood || "Neutral",
        location: location || "",
        weather: weather || "",
        photos: photos || "",
        voiceNoteUrl: voiceNoteUrl || "",
        date: date ? new Date(date) : new Date(),
      },
    });

    return NextResponse.json({ entry }, { status: 201 });
  } catch (error: any) {
    console.error("POST journal entry error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
