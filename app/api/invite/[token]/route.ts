import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function GET(req: Request, { params }: { params: { token: string } }) {
  const { token } = params
  try {
    // Token is stored in the `status` field
    const invite = await prisma.invitation.findFirst({
      where: { status: token }
    })
    if (!invite) {
      return NextResponse.json({ error: 'Invalid or expired invite link.' }, { status: 404 })
    }
    return NextResponse.json({ email: invite.email, organizationId: invite.organizationId })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function POST(req: Request, { params }: { params: { token: string } }) {
  const { token } = params
  try {
    const { name, password } = await req.json()
    if (!name || !password || password.length < 8) {
      return NextResponse.json({ error: 'Name and password (min 8 chars) required.' }, { status: 400 })
    }

    // Find invite by token
    const invite = await prisma.invitation.findFirst({
      where: { status: token }
    })
    if (!invite) {
      return NextResponse.json({ error: 'Invalid or expired invite link.' }, { status: 404 })
    }

    // Check if user already exists
    const existing = await prisma.user.findUnique({ where: { email: invite.email } })
    if (existing) {
      return NextResponse.json({ error: 'An account with this email already exists. Please login.' }, { status: 409 })
    }

    const passwordHash = await bcrypt.hash(password, 12)

    // Create the user and add to organization in a transaction
    await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email: invite.email,
          name,
          passwordHash,
          onboardingCompleted: true
        }
      })

      await tx.organizationMember.create({
        data: {
          userId: newUser.id,
          organizationId: invite.organizationId,
          role: 'member'
        }
      })

      // Mark invite as accepted
      await tx.invitation.update({
        where: { id: invite.id },
        data: { status: 'accepted' }
      })
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Invite registration error:', error)
    return NextResponse.json({ error: 'Registration failed.' }, { status: 500 })
  }
}
