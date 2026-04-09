import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD
  }
})

export async function sendInviteEmail(
  to: string,
  inviteLink: string,
  orgName: string,
  telegramBotUsername: string
) {
  const telegramDeepLink = `https://t.me/${telegramBotUsername}?start=invite`
  
  const html = `
  <!DOCTYPE html>
  <html>
  <head><meta charset="UTF-8"></head>
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background-color: #0f172a; margin: 0; padding: 40px 20px;">
    <div style="max-width: 520px; margin: 0 auto; background: linear-gradient(135deg, #1e1b4b, #0f172a); border: 1px solid rgba(139,92,246,0.3); border-radius: 20px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #4f46e5, #7c3aed); padding: 40px; text-align: center;">
        <div style="font-size: 40px; margin-bottom: 12px;">🚀</div>
        <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 700;">You're Invited to TaskOrbits</h1>
        <p style="color: rgba(255,255,255,0.7); margin: 8px 0 0; font-size: 14px;">${orgName} wants you to join their workspace</p>
      </div>
      <div style="padding: 40px;">
        <p style="color: #cbd5e1; font-size: 15px; line-height: 1.6; margin: 0 0 32px;">
          You've been invited to collaborate on TaskOrbits — an AI-powered task management platform that connects Telegram, Slack, and Gmail directly to your board.
        </p>

        <div style="text-align: center; margin-bottom: 32px;">
          <a href="${inviteLink}" style="display: inline-block; background: linear-gradient(135deg, #4f46e5, #7c3aed); color: white; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 15px;">
            ✅ Accept Invitation & Create Account
          </a>
        </div>

        <div style="background: rgba(99,102,241,0.1); border: 1px solid rgba(99,102,241,0.2); border-radius: 12px; padding: 20px; margin-bottom: 24px;">
          <h3 style="color: #a5b4fc; margin: 0 0 12px; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">📱 After Joining — Connect Your Telegram</h3>
          <p style="color: #94a3b8; font-size: 13px; margin: 0 0 12px;">Click the button below to start the TaskOrbits Telegram bot. This lets the AI automatically assign tasks to you when your name is mentioned!</p>
          <a href="${telegramDeepLink}" style="display: inline-block; background: #0088cc; color: white; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-size: 13px; font-weight: 600;">
            🤖 Connect Telegram Bot
          </a>
        </div>

        <p style="color: #475569; font-size: 12px; margin: 0; text-align: center;">
          This invite link is unique to ${to}. If you didn't expect this, you can safely ignore this email.
        </p>
      </div>
    </div>
  </body>
  </html>
  `

  await transporter.sendMail({
    from: `"TaskOrbits" <${process.env.GMAIL_USER}>`,
    to,
    subject: `You're invited to join ${orgName} on TaskOrbits 🚀`,
    html
  })
}
