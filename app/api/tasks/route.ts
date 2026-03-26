import { NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const membership = await prisma.organizationMember.findFirst({
    where: { userId: user.id },
    include: { organization: { include: { teams: true } } },
  })

  const teamId = membership?.organization?.teams?.[0]?.id

  const tasks = await prisma.task.findMany({
    where: {
      OR: [
        { assignedTo: user.id },
        ...(teamId ? [{ teamId }] : [])
      ]
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(tasks)
}

export async function POST(req: Request) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { title, description, status, priority, teamId, dueDate } = await req.json()
  if (!title) return NextResponse.json({ error: 'Title required' }, { status: 400 })

  let finalTeamId = teamId
  if (!finalTeamId) {
    const mem = await prisma.organizationMember.findFirst({
      where: { userId: user.id },
      include: { organization: { include: { teams: true } } },
    })
    finalTeamId = mem?.organization?.teams?.[0]?.id || null
  }

  const task = await prisma.task.create({
    data: {
      title,
      description: description || null,
      status: status || 'todo',
      priority: priority || 'medium',
      assignedTo: user.id,
      teamId: finalTeamId,
      dueDate: dueDate ? new Date(dueDate) : null,
    },
  })

  return NextResponse.json(task)
}
