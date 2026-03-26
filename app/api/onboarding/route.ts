import { NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { orgName, orgLogo, userRole, teamName, teamMembers } = await req.json()

  const roleMap: Record<string, string> = {
    owner: 'owner', manager: 'manager', employee: 'member',
    member: 'member', freelancer: 'freelancer', personal: 'owner',
  }
  const mappedRole = roleMap[userRole] ?? 'member'

  const org = await prisma.organization.create({
    data: { name: orgName || 'My Organization', logoUrl: orgLogo || null, ownerId: user.id },
  })

  await prisma.organizationMember.create({
    data: { userId: user.id, organizationId: org.id, role: mappedRole },
  })

  if (teamName) {
    const team = await prisma.team.create({
      data: { name: teamName, organizationId: org.id },
    })
    await prisma.teamMember.create({
      data: { teamId: team.id, userId: user.id, role: mappedRole },
    })
    if (Array.isArray(teamMembers) && teamMembers.length > 0) {
      await prisma.invitation.createMany({
        data: teamMembers.map((email: string) => ({
          email, organizationId: org.id, teamId: team.id, invitedBy: user.id,
        })),
      })
    }
  }

  await prisma.dashboardPreference.create({ data: { userId: user.id } })
  await prisma.user.update({
    where: { id: user.id },
    data: { onboardingCompleted: true },
  })

  return NextResponse.json({ success: true, redirect: '/dashboard' })
}
