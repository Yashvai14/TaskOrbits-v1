import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { signToken } from '@/lib/auth'

export async function POST(req: Request) {
  const { email, password, name } = await req.json()

  if (!email || !password)
    return NextResponse.json({ error: 'Email and password required' }, { status: 400 })

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing)
    return NextResponse.json({ error: 'Email already in use' }, { status: 400 })

  const passwordHash = await bcrypt.hash(password, 12)
  const user = await prisma.user.create({ data: { email, passwordHash, name } })
  const token = signToken({ userId: user.id, email })

  const res = NextResponse.json({ success: true, redirect: '/onboarding' })
  res.cookies.set('token', token, { httpOnly: true, maxAge: 60 * 60 * 24 * 7, path: '/' })
  return res
}
