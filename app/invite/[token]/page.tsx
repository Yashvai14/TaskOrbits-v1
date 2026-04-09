'use client'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react'

export default function InvitePage() {
  const router = useRouter()
  const params = useParams()
  const token = params?.token as string

  const [invite, setInvite] = useState<{ email: string; organizationId: string } | null>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'submitting' | 'done' | 'error'>('loading')
  const [errorMsg, setErrorMsg] = useState('')
  const [form, setForm] = useState({ name: '', password: '' })

  useEffect(() => {
    // Validate the token
    fetch(`/api/invite/${token}`)
      .then(r => r.json())
      .then(data => {
        if (data.email) {
          setInvite(data)
          setStatus('ready')
        } else {
          setErrorMsg(data.error || 'Invalid or expired invite link.')
          setStatus('error')
        }
      })
      .catch(() => { setErrorMsg('Failed to load invite.'); setStatus('error') })
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('submitting')
    try {
      const res = await fetch(`/api/invite/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, password: form.password })
      })
      const data = await res.json()
      if (res.ok) {
        setStatus('done')
        setTimeout(() => router.push('/authentication'), 2000)
      } else {
        setErrorMsg(data.error || 'Registration failed.')
        setStatus('error')
      }
    } catch {
      setErrorMsg('Network error.')
      setStatus('error')
    }
  }

  if (status === 'loading') return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900">
      <Loader2 className="animate-spin text-purple-400" size={40} />
    </div>
  )

  if (status === 'error') return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900">
      <div className="text-center space-y-4 p-8">
        <AlertCircle className="text-red-400 mx-auto" size={48} />
        <p className="text-white text-xl font-bold">Invite Error</p>
        <p className="text-gray-400">{errorMsg}</p>
      </div>
    </div>
  )

  if (status === 'done') return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900">
      <div className="text-center space-y-4 p-8">
        <CheckCircle className="text-green-400 mx-auto" size={48} />
        <p className="text-white text-xl font-bold">Account Created!</p>
        <p className="text-gray-400">Redirecting you to login...</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 p-4">
      <div className="w-full max-w-md bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 mx-auto mb-4 flex items-center justify-center">
            <span className="text-2xl">🚀</span>
          </div>
          <h1 className="text-2xl font-bold text-white">You're Invited!</h1>
          <p className="text-gray-400 mt-2 text-sm">
            Complete your account setup to join your team on TaskOrbits.
          </p>
          <div className="mt-3 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <p className="text-blue-300 text-sm font-medium">{invite?.email}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-xs text-gray-400 uppercase tracking-wider font-semibold block mb-2">Your Name</label>
            <input
              type="text"
              required
              placeholder="John Doe"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 uppercase tracking-wider font-semibold block mb-2">Set a Password</label>
            <input
              type="password"
              required
              minLength={8}
              placeholder="Minimum 8 characters"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={status === 'submitting'}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white py-3 px-6 rounded-xl font-semibold text-sm transition-all shadow-lg shadow-purple-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {status === 'submitting' ? <><Loader2 size={18} className="animate-spin" /> Creating Account...</> : 'Join Team →'}
          </button>
        </form>
      </div>
    </div>
  )
}
