import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { signToken } from '@/lib/auth'

export async function POST(req: Request) {
  const { email, password } = await req.json()

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user || !user.passwordHash)
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })

  const valid = await bcrypt.compare(password, user.passwordHash)
  if (!valid)
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })

  const token = signToken({ userId: user.id, email })
  const redirect = user.onboardingCompleted ? '/dashboard' : '/onboarding'

  const res = NextResponse.json({ success: true, redirect })
  res.cookies.set('token', token, { httpOnly: true, maxAge: 60 * 60 * 24 * 7, path: '/' })
  return res
}
