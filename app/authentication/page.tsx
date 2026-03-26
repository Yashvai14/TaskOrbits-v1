'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function AuthPage() {
  const router = useRouter()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register'
    const body = mode === 'login' ? { email, password } : { email, password, name }

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    let data;
    try {
      data = await res.json();
    } catch (err) {
      data = { error: 'Server error, please try again.' };
    }
    setLoading(false);

    if (!res.ok) {
      setError(data.error || 'Something went wrong');
      return;
    }

    router.push(data.redirect || '/onboarding')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50/50 to-white flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 w-full max-w-md">

        <Link href="/" className="text-xl font-bold text-indigo-600 block mb-8">
          TaskOrbits
        </Link>

        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          {mode === 'login' ? 'Welcome back' : 'Create your account'}
        </h1>
        <p className="text-sm text-gray-400 mb-6">
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button
            onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError('') }}
            className="text-indigo-600 hover:underline"
          >
            {mode === 'login' ? 'Sign up' : 'Log in'}
          </button>
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="text-sm text-gray-600 block mb-1">Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Your name"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-indigo-400 transition-colors"
              />
            </div>
          )}

          <div>
            <label className="text-sm text-gray-600 block mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@company.com"
              required
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-indigo-400 transition-colors"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600 block mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-indigo-400 transition-colors pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
          >
            {loading
              ? <><Loader2 size={14} className="animate-spin" /> Please wait...</>
              : mode === 'login' ? 'Log in' : 'Create account'
            }
          </button>
        </form>
      </div>
    </div>
  )
}
