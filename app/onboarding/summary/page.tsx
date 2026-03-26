'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, Loader2 } from 'lucide-react'

export default function SummaryPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState({
    orgName: '',
    orgLogo: '',
    userRole: '',
    teamName: '',
    teamMembers: [] as string[],
  })

  useEffect(() => {
    setData({
      orgName: localStorage.getItem('orgName') || 'My Organization',
      orgLogo: localStorage.getItem('orgLogo') || '',
      userRole: localStorage.getItem('userRole') || 'member',
      teamName: localStorage.getItem('teamName') || '',
      teamMembers: JSON.parse(localStorage.getItem('teamMembers') || '[]'),
    })
  }, [])

  async function handleConfirm() {
    setLoading(true)
    const res = await fetch('/api/onboarding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    const json = await res.json()
    if (json.redirect) {
      localStorage.removeItem('orgName')
      localStorage.removeItem('orgLogo')
      localStorage.removeItem('userRole')
      localStorage.removeItem('teamName')
      localStorage.removeItem('teamMembers')
      router.push(json.redirect)
    } else {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-md w-full">
        <div className="flex items-center gap-3 mb-6">
          <CheckCircle className="text-indigo-600" size={28} />
          <h1 className="text-2xl font-bold text-gray-900">Almost done!</h1>
        </div>

        <div className="space-y-1 mb-8 text-sm">
          {[
            { label: 'Organization', value: data.orgName },
            { label: 'Your role', value: data.userRole },
            { label: 'Team', value: data.teamName || '—' },
            { label: 'Members invited', value: String(data.teamMembers.length) },
          ].map(row => (
            <div key={row.label} className="flex justify-between py-3 border-b border-gray-100">
              <span className="text-gray-400">{row.label}</span>
              <span className="font-medium text-gray-800 capitalize">{row.value}</span>
            </div>
          ))}
        </div>

        <button
          onClick={handleConfirm}
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-3 rounded-xl font-medium hover:bg-indigo-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {loading
            ? <><Loader2 size={16} className="animate-spin" /> Setting up...</>
            : 'Go to dashboard'
          }
        </button>
      </div>
    </div>
  )
}
