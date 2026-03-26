import { NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const member = await prisma.organizationMember.findFirst({
    where: { userId: user.id },
    include: { organization: true }
  })

  if (!member) return NextResponse.json({ error: 'No organization found' }, { status: 404 })

  const members = await prisma.organizationMember.findMany({
    where: { organizationId: member.organizationId },
    include: { user: { select: { name: true, email: true } } }
  })

  const invites = await prisma.invitation.findMany({
    where: { organizationId: member.organizationId }
  })

  return NextResponse.json({ members, invites })
}

export async function POST(req: Request) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const member = await prisma.organizationMember.findFirst({
    where: { userId: user.id }
  })

  if (!member) return NextResponse.json({ error: 'No organization found' }, { status: 404 })

  try {
    const { email } = await req.json()
    const invite = await prisma.invitation.create({
      data: {
        email,
        organizationId: member.organizationId,
        invitedBy: user.id
      }
    })
    return NextResponse.json(invite)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create invite' }, { status: 500 })
  }
}
