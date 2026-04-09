import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const INTERNAL_API_SECRET = process.env.INTERNAL_API_SECRET || "super-secret-key-123";

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || authHeader !== `Bearer ${INTERNAL_API_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch all users to act as valid assignees for the AI
    // In a multi-tenant app, this would be filtered by Organization ID
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        slackId: true,
        telegramId: true
      }
    });

    return NextResponse.json({ users }, { status: 200 });
  } catch (error) {
    console.error("Error fetching team members:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
