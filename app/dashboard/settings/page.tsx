'use client'
import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { Header } from '@/components/dashboard/Header'
import { Loader2, Check } from 'lucide-react'

export default function SettingsPage() {
  const router = useRouter()
  const [user, setUser] = useState<{ id: string, name: string | null, email: string } | null>(null)
  const [loading, setLoading] = useState(true)
  
  const [nameInput, setNameInput] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const fetchAll = useCallback(async () => {
    try {
      const uRes = await fetch('/api/user/me')
      if (uRes.status === 401) { router.push('/authentication'); return }
      const uData = await uRes.json()
      setUser(uData)
      setNameInput(uData.name || '')
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => { fetchAll() }, [fetchAll])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/user/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: nameInput })
      })
      if (res.ok) {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
        setUser(prev => prev ? { ...prev, name: nameInput } : null)
      }
    } catch(e) { console.error(e) }
    setSaving(false)
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50/50"><Loader2 className="animate-spin text-indigo-500" size={32} /></div>

  return (
    <div className="flex min-h-screen bg-gray-50/50">
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Header user={user ? { ...user, name: user.name || undefined } : undefined} />
        <main className="flex-1 overflow-y-auto p-8 relative">
          <div className="max-w-[800px] mx-auto space-y-8">
            <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
            
            <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4">Personal Profile</h2>
              
              <form onSubmit={handleSave} className="space-y-6">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Email Address</label>
                  <input type="email" value={user?.email || ''} disabled className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-sm text-gray-500 outline-none cursor-not-allowed" />
                  <p className="text-xs text-gray-400 mt-2">Your email address cannot be changed.</p>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Full Name</label>
                  <input 
                    type="text" 
                    value={nameInput} 
                    onChange={e => setNameInput(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-100 outline-none transition-all" 
                  />
                </div>

                <div className="pt-4 border-t border-gray-100 flex items-center gap-4">
                  <button type="submit" disabled={saving || nameInput === user?.name} className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2">
                    {saving ? <Loader2 size={18} className="animate-spin" /> : 'Save Changes'}
                  </button>
                  {saved && <span className="text-green-600 text-sm font-medium flex items-center gap-1"><Check size={16} /> Saved!</span>}
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
