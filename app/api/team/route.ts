import { NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'
import { sendInviteEmail } from '@/lib/mailer'

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
    include: { user: { select: { id: true, name: true, email: true, slackId: true, telegramId: true } as any } }
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
    // Generate a unique secure token for the invite link
    const token = crypto.randomBytes(24).toString('hex')
    const invite = await prisma.invitation.create({
      data: {
        email,
        organizationId: member.organizationId,
        invitedBy: user.id,
        status: token  // reuse status field to store token (schema already has it)
      }
    })
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const inviteLink = `${appUrl}/invite/${token}`
    
    // Get org name for the email
    const org = await prisma.organization.findUnique({ where: { id: member.organizationId }, select: { name: true } })
    const orgName = org?.name || 'Your Team'
    
    // Send the real invite email via Gmail SMTP
    const telegramBotUsername = process.env.TELEGRAM_BOT_USERNAME || 'TaskOrbitsAssistantBot'
    try {
      await sendInviteEmail(email, inviteLink, orgName, telegramBotUsername)
      console.log(`📧 Invite email sent to ${email}`)
    } catch (mailErr) {
      console.error('Email send failed (invite link still valid):', mailErr)
    }
    
    console.log(`\n🔗 INVITE LINK for ${email}: ${inviteLink}\n`)
    return NextResponse.json({ ...invite, inviteLink })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create invite' }, { status: 500 })
  }
}
