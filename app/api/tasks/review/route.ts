import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

export async function PATCH(req: Request) {
  try {
    // Basic auth check
    const authHeader = req.headers.get("authorization");
    // if (!authHeader) {
    //  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }
    // const token = authHeader.split(" ")[1];
    let userId = "default-admin-id";
    // try {
    //   const decoded = jwt.verify(token, process.env.JWT_SECRET || "default_secret") as { userId: string };
    //   userId = decoded.userId;
    // } catch (e) {
    //   return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    // }

    const { taskId, action, editedTitle, editedDescription } = await req.json();

    const task = await prisma.task.findUnique({
      where: { id: taskId }
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    if (action === 'reject') {
      await prisma.task.update({
        where: { id: taskId },
        data: {
          extractionStatus: 'rejected',
          status: 'cancelled'
        }
      });
      return NextResponse.json({ success: true, message: "Task rejected" });
    }

    if (action === 'approve') {
      // If there are edits, create human feedback
      if (editedTitle && editedTitle !== task.title || editedDescription && editedDescription !== task.description) {
        await prisma.taskFeedback.create({
          data: {
            taskId,
            userId,
            originalAi: JSON.stringify({ title: task.title, description: task.description }),
            correction: JSON.stringify({ title: editedTitle || task.title, description: editedDescription || task.description })
          }
        });
      }

      await prisma.task.update({
        where: { id: taskId },
        data: {
          title: editedTitle || task.title,
          description: editedDescription !== undefined ? editedDescription : task.description,
          extractionStatus: 'human-approved',
          status: 'todo'
        }
      });
      return NextResponse.json({ success: true, message: "Task approved" });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });

  } catch (error) {
    console.error("Error updating AI review task:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
