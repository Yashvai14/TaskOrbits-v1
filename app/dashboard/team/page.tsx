'use client'
import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { Header } from '@/components/dashboard/Header'
import { Loader2, Plus, Mail, Copy, CheckCheck, Link2, Settings, MessageSquare, Bot } from 'lucide-react'

type MemberData = {
  id: string,
  role: string,
  user: { id: string, name: string | null, email: string, slackId?: string | null, telegramId?: string | null }
}
type InviteData = { id: string, email: string, status: string, createdAt: string, inviteLink?: string }

export default function TeamPage() {
  const router = useRouter()
  const [user, setUser] = useState<{ name?: string, email?: string } | null>(null)
  const [members, setMembers] = useState<MemberData[]>([])
  const [invites, setInvites] = useState<InviteData[]>([])
  const [loading, setLoading] = useState(true)
  const [emailToInvite, setEmailToInvite] = useState('')
  const [inviting, setInviting] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [profileSlack, setProfileSlack] = useState('')
  const [profileTelegram, setProfileTelegram] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)
  const [profileSaved, setProfileSaved] = useState(false)

  const fetchAll = useCallback(async () => {
    try {
      const [uRes, tRes] = await Promise.all([
        fetch('/api/user/me'),
        fetch('/api/team')
      ])
      if (uRes.status === 401) { router.push('/authentication'); return }
      const userData = await uRes.json()
      setUser(userData)
      if (tRes.ok) {
        const data = await tRes.json()
        setMembers(data.members || [])
        setInvites(data.invites || [])
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => { fetchAll() }, [fetchAll])

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!emailToInvite) return
    setInviting(true)
    try {
      const res = await fetch('/api/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailToInvite })
      })
      if (res.ok) {
        const newInvite = await res.json()
        setInvites(prev => [...prev, newInvite])
        setEmailToInvite('')
      }
    } catch (e) {
      console.error(e)
    } finally {
      setInviting(false)
    }
  }

  const copyLink = (invite: InviteData) => {
    const link = invite.inviteLink || `${window.location.origin}/invite/${invite.status}`
    navigator.clipboard.writeText(link)
    setCopiedId(invite.id)
    setTimeout(() => setCopiedId(null), 2500)
  }

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingProfile(true)
    try {
      await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slackId: profileSlack, telegramId: profileTelegram })
      })
      setProfileSaved(true)
      setTimeout(() => setProfileSaved(false), 3000)
    } catch (e) {
      console.error(e)
    } finally {
      setSavingProfile(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="animate-spin text-indigo-500" size={32} />
    </div>
  )

  const pendingInvites = invites.filter(i => i.status !== 'accepted')

  return (
    <div className="flex min-h-screen bg-gray-50/50">
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Header user={user || undefined} />
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-[1000px] mx-auto space-y-8">
            <h1 className="text-2xl font-bold text-gray-900">Team Management</h1>

            {/* My Integration IDs */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex items-center gap-2 mb-5">
                <Settings size={18} className="text-indigo-500" />
                <h2 className="font-bold text-gray-900">My Integration IDs</h2>
              </div>
              <p className="text-sm text-gray-500 mb-5">
                Link your Slack and Telegram accounts so that AI can automatically assign tasks to you when your name is mentioned.
              </p>
              <form onSubmit={saveProfile} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <MessageSquare size={13} /> Slack Member ID
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. U07PXXXXXX (from Slack profile)"
                    value={profileSlack}
                    onChange={e => setProfileSlack(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Bot size={13} /> Telegram Chat ID
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 8308952876 (from @userinfobot)"
                    value={profileTelegram}
                    onChange={e => setProfileTelegram(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                  />
                </div>
                <div className="md:col-span-2">
                  <button type="submit" disabled={savingProfile} className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2 transition-colors">
                    {savingProfile ? <Loader2 size={15} className="animate-spin" /> : profileSaved ? <><CheckCheck size={15} /> Saved!</> : 'Save Integration IDs'}
                  </button>
                </div>
              </form>
              <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-700">
                💡 <strong>To find your Telegram Chat ID:</strong> Send a message to <strong>@userinfobot</strong> on Telegram and copy the <code>Id</code> it returns.
              </div>
            </div>

            {/* Invite New Members */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex items-center gap-2 mb-5">
                <Link2 size={18} className="text-purple-500" />
                <h2 className="font-bold text-gray-900">Invite Team Members</h2>
              </div>
              <p className="text-sm text-gray-500 mb-5">
                Enter their email to generate a secure invite link. Copy and share it — no email service needed!
              </p>
              <form onSubmit={handleInvite} className="flex gap-3 mb-6">
                <div className="flex-1 relative">
                  <Mail className="absolute left-4 top-3.5 text-gray-400" size={16} />
                  <input
                    type="email"
                    value={emailToInvite}
                    onChange={e => setEmailToInvite(e.target.value)}
                    placeholder="teammate@company.com"
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-purple-100 outline-none transition-all"
                  />
                </div>
                <button type="submit" disabled={inviting || !emailToInvite} className="bg-purple-600 text-white px-5 py-3 rounded-xl font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center gap-2 text-sm">
                  {inviting ? <Loader2 size={16} className="animate-spin" /> : <><Plus size={16} /> Generate Link</>}
                </button>
              </form>

              {/* Pending Invites with copy buttons */}
              {pendingInvites.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Pending Invitations — Copy Link to Share</h3>
                  {pendingInvites.map(inv => (
                    <div key={inv.id} className="flex items-center justify-between p-4 rounded-xl border border-orange-100 bg-orange-50/40">
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{inv.email}</p>
                        <p className="text-xs text-purple-600 font-mono mt-1 truncate max-w-sm">
                          {inv.inviteLink || `${typeof window !== 'undefined' ? window.location.origin : ''}/invite/${inv.status}`}
                        </p>
                      </div>
                      <button
                        onClick={() => copyLink(inv)}
                        className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-medium hover:bg-gray-50 transition-colors ml-4 shrink-0"
                      >
                        {copiedId === inv.id ? <><CheckCheck size={13} className="text-green-500" /> Copied!</> : <><Copy size={13} /> Copy Link</>}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Active Members */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <h2 className="font-bold text-gray-900 mb-5">Active Members ({members.length})</h2>
              <div className="space-y-3">
                {members.map(m => (
                  <div key={m.id} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 bg-gray-50/50">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center uppercase shrink-0">
                        {m.user.name?.charAt(0) || m.user.email.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{m.user.name || 'Unnamed'}</p>
                        <p className="text-xs text-gray-500">{m.user.email}</p>
                        <div className="flex gap-3 mt-1">
                          {m.user.telegramId && (
                            <span className="text-xs text-blue-500 flex items-center gap-1"><Bot size={11} /> TG: {m.user.telegramId}</span>
                          )}
                          {m.user.slackId && (
                            <span className="text-xs text-purple-500 flex items-center gap-1"><MessageSquare size={11} /> Slack: {m.user.slackId}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-gray-200 text-gray-700 text-xs font-semibold rounded-full capitalize">{m.role}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
