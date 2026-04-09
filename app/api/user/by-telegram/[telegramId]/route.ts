import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const INTERNAL_SECRET = process.env.INTERNAL_API_SECRET || "super-secret-key-123";

export async function GET(req: Request, { params }: { params: { telegramId: string } }) {
  if (req.headers.get("authorization") !== `Bearer ${INTERNAL_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await (prisma.user as any).findFirst({
    where: { telegramId: params.telegramId },
    select: { id: true, name: true, email: true, telegramId: true }
  });

  if (!user) return NextResponse.json({ user: null });
  return NextResponse.json({ user });
}
