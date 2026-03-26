import { NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const membership = await prisma.organizationMember.findFirst({
    where: { userId: user.id },
    include: { organization: true },
  })

  return NextResponse.json({
    id: user.id,
    email: user.email,
    name: user.name,
    orgName: membership?.organization?.name ?? null,
    role: membership?.role ?? null,
    onboardingCompleted: user.onboardingCompleted,
  })
}

export async function PATCH(req: Request) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  
  try {
    const { name } = await req.json()
    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { name }
    })
    return NextResponse.json(updated)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
  }
}
