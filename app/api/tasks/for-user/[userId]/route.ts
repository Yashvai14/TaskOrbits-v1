import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const INTERNAL_SECRET = process.env.INTERNAL_API_SECRET || "super-secret-key-123";

export async function GET(req: Request, { params }: { params: { userId: string } }) {
  if (req.headers.get("authorization") !== `Bearer ${INTERNAL_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const tasks = await prisma.task.findMany({
      where: {
        assignedTo: params.userId,
        status: { not: "cancelled" },
        extractionStatus: { not: "pending-review" }
      },
      orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
      include: {
        assignee: { select: { name: true, email: true } }
      }
    });
    return NextResponse.json({ tasks });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
