'use client'
import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { Header } from '@/components/dashboard/Header'
import { Loader2, Plus, Mail } from 'lucide-react'

type MemberData = { id: string, role: string, user: { name: string | null, email: string } }
type InviteData = { id: string, email: string, status: string, createdAt: string }

export default function TeamPage() {
  const router = useRouter()
  const [user, setUser] = useState<{ name?: string, email?: string } | null>(null)
  const [members, setMembers] = useState<MemberData[]>([])
  const [invites, setInvites] = useState<InviteData[]>([])
  const [loading, setLoading] = useState(true)
  const [emailToInvite, setEmailToInvite] = useState('')
  const [inviting, setInviting] = useState(false)

  const fetchAll = useCallback(async () => {
    try {
      const [uRes, tRes] = await Promise.all([
        fetch('/api/user/me'),
        fetch('/api/team')
      ])
      if (uRes.status === 401) { router.push('/authentication'); return }
      setUser(await uRes.json())
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

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50/50"><Loader2 className="animate-spin text-indigo-500" size={32} /></div>

  return (
    <div className="flex min-h-screen bg-gray-50/50">
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Header user={user || undefined} />
        <main className="flex-1 overflow-y-auto p-8 relative">
          <div className="max-w-[1000px] mx-auto space-y-8">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">Organization Members</h1>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
              <form onSubmit={handleInvite} className="flex gap-4 mb-8 pb-8 border-b border-gray-100">
                <div className="flex-1">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Invite new member</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-3 text-gray-400" size={18} />
                    <input 
                      type="email" 
                      value={emailToInvite}
                      onChange={e => setEmailToInvite(e.target.value)}
                      placeholder="colleague@company.com" 
                      className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-100 outline-none transition-all" 
                    />
                  </div>
                </div>
                <div className="flex items-end">
                  <button type="submit" disabled={inviting || !emailToInvite} className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2">
                    {inviting ? <Loader2 size={18} className="animate-spin" /> : <><Plus size={18} /> Send Invite</>}
                  </button>
                </div>
              </form>

              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-gray-900 mb-4">Active Members ({members.length})</h3>
                  <div className="space-y-3">
                    {members.map(m => (
                      <div key={m.id} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 bg-gray-50/50">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center uppercase shrink-0">
                            {m.user.name?.charAt(0) || m.user.email.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 text-sm">{m.user.name || 'Unnamed User'}</p>
                            <p className="text-xs text-gray-500">{m.user.email}</p>
                          </div>
                        </div>
                        <span className="px-3 py-1 bg-gray-200 text-gray-700 text-xs font-semibold rounded-full capitalize">{m.role}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {invites.length > 0 && (
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 mb-4 mt-8">Pending Invitations ({invites.length})</h3>
                    <div className="space-y-3">
                      {invites.map(inv => (
                        <div key={inv.id} className="flex items-center justify-between p-4 rounded-xl border border-orange-100 bg-orange-50/30">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-700 font-bold flex items-center justify-center shrink-0">
                              <Mail size={18} />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 text-sm">{inv.email}</p>
                              <p className="text-xs text-gray-400">Invited on {new Date(inv.createdAt).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <span className="px-3 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded-full capitalize">{inv.status}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
