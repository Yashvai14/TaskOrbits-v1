import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const INTERNAL_API_SECRET = process.env.INTERNAL_API_SECRET || "super-secret-key-123";

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || authHeader !== `Bearer ${INTERNAL_API_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();

    // The data comes from the Python backend
    const {
      title,
      description,
      priority,
      deadline,
      sourceType,
      sourceId,
      sourceUserId,
      originalMessage,
      confidenceScore,
      extractionStatus,
      assigneeId
    } = data;

    // Use a default user or owner for now, since we don't have user routing based on slack ID
    let matchingUser = await prisma.user.findFirst();

    // If the external platform sent a source user ID, precisely look it up!
    if (sourceUserId) {
      const explicitUser = await prisma.user.findFirst({
        where: {
          OR: [
            { slackId: sourceUserId } as any,
            { telegramId: sourceUserId } as any
          ]
        }
      });
      if (explicitUser) {
        matchingUser = explicitUser;
      }
    }

    // Validate the AI-extracted assigneeId actually exists in the DB
    let resolvedAssigneeId: string | null = null;
    if (assigneeId) {
      const aiAssignee = await prisma.user.findUnique({ where: { id: assigneeId } });
      if (aiAssignee) {
        resolvedAssigneeId = aiAssignee.id;
      } else {
        console.warn(`[external] LLM hallucinated assigneeId: ${assigneeId} — falling back to default user`);
        resolvedAssigneeId = matchingUser?.id || null;
      }
    } else {
      resolvedAssigneeId = matchingUser?.id || null;
    }

    const task = await prisma.task.create({
      data: {
        title: title || "Untitled AI Task",
        description: description || null,
        priority: priority || "medium",
        dueDate: (() => {
          if (!deadline) return null;
          const d = new Date(deadline);
          return isNaN(d.getTime()) ? null : d;
        })(),
        status: extractionStatus === 'auto-created' ? 'todo' : 'pending',
        assignedTo: resolvedAssigneeId,
        sourceType: sourceType || null,
        sourceId: sourceId || null,
        originalMessage: originalMessage || null,
        confidenceScore: confidenceScore ? parseFloat(confidenceScore) : null,
        extractionStatus: extractionStatus || null
      }
    });

    return NextResponse.json({ success: true, task }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating external task:", error);
    return NextResponse.json({ error: "Failed to create task", details: error.message || String(error) }, { status: 500 });
  }
}
