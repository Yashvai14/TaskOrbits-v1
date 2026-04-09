import { NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: Request) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { name, slackId, telegramId } = await req.json()
    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        ...(name ? { name } : {}),
        ...({ slackId: slackId || null } as any),
        ...({ telegramId: telegramId || null } as any)
      }
    })
    return NextResponse.json({ success: true, user: { name: updated.name, email: updated.email } })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update profile' }, { status: 500 })
  }
}
