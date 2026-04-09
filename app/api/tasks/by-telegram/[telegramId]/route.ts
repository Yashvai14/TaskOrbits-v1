import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const INTERNAL_API_SECRET = process.env.INTERNAL_API_SECRET || "super-secret-key-123";

export async function GET(req: Request, { params }: { params: { telegramId: string } }) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader || authHeader !== `Bearer ${INTERNAL_API_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { telegramId } = params;

  try {
    // Find user by telegramId
    const user = await (prisma.user as any).findFirst({
      where: { telegramId }
    });

    if (!user) {
      return NextResponse.json({ tasks: [], message: "No user found with this Telegram ID." });
    }

    // Fetch their active tasks
    const tasks = await prisma.task.findMany({
      where: {
        assignedTo: user.id,
        status: { notIn: ["done", "cancelled"] },
        extractionStatus: { not: "pending-review" }
      },
      orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
      select: {
        id: true,
        title: true,
        description: true,
        priority: true,
        status: true,
        dueDate: true,
        createdAt: true,
        assignee: { select: { name: true, email: true } }
      }
    });

    return NextResponse.json({ tasks, userName: user.name });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
