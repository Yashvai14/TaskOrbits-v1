'use client'
import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { Header } from '@/components/dashboard/Header'
import { TaskData } from '@/components/dashboard/TaskCard'
import { Loader2, PieChart, TrendingUp, CircleAlert, CheckCircle2 } from 'lucide-react'

export default function AnalyticsPage() {
  const router = useRouter()
  const [user, setUser] = useState<{ name?: string, email?: string } | null>(null)
  const [tasks, setTasks] = useState<TaskData[]>([])
  const [loading, setLoading] = useState(true)

  const fetchAll = useCallback(async () => {
    try {
      const [uRes, tRes] = await Promise.all([
        fetch('/api/user/me'),
        fetch('/api/tasks')
      ])
      if (uRes.status === 401) { router.push('/authentication'); return }
      setUser(await uRes.json())
      setTasks(await tRes.json())
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => { fetchAll() }, [fetchAll])

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50/50"><Loader2 className="animate-spin text-indigo-500" size={32} /></div>

  // Metrics Logic
  const total = tasks.length
  const completed = tasks.filter(t => t.status === 'done').length
  const pending = tasks.filter(t => t.status !== 'done').length
  const urgent = tasks.filter(t => t.priority === 'urgent').length
  
  const priorities = {
    low: tasks.filter(t => t.priority === 'low').length,
    medium: tasks.filter(t => t.priority === 'medium').length,
    high: tasks.filter(t => t.priority === 'high').length,
    urgent: tasks.filter(t => t.priority === 'urgent').length,
  }

  const completionRate = total === 0 ? 0 : Math.round((completed / total) * 100)

  return (
    <div className="flex min-h-screen bg-gray-50/50">
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Header user={user || undefined} />
        <main className="flex-1 overflow-y-auto p-8 relative">
          <div className="max-w-[1200px] mx-auto space-y-8">
            <h1 className="text-2xl font-bold text-gray-900">Task Analytics</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Overall Completion */}
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center items-center">
                <PieChart size={32} className="text-indigo-500 mb-4" />
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Completion Rate</h3>
                <div className="text-5xl font-extrabold text-gray-900 mb-2">{completionRate}%</div>
                <p className="text-sm text-gray-400 font-medium">{completed} of {total} tasks completed</p>
                <div className="w-full bg-gray-100 h-2 rounded-full mt-6 overflow-hidden">
                   <div className="bg-gradient-to-r from-indigo-500 to-blue-500 h-full rounded-full transition-all duration-1000" style={{ width: `${completionRate}%` }}></div>
                </div>
              </div>

              {/* Status Breakdown */}
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <h3 className="text-sm font-semibold text-gray-900 mb-6 flex items-center gap-2"><TrendingUp size={18} className="text-gray-400" /> Pipeline Status</h3>
                <div className="space-y-6">
                   <div>
                     <div className="flex justify-between text-sm mb-2"><span className="text-gray-600 font-medium flex items-center gap-2"><CheckCircle2 size={16} className="text-green-500" /> Done</span> <span className="font-bold text-gray-900">{completed}</span></div>
                     <div className="w-full bg-gray-50 h-2.5 rounded-full overflow-hidden"><div className="bg-green-500 h-full transition-all" style={{ width: `${total ? (completed/total)*100 : 0}%` }}></div></div>
                   </div>
                   <div>
                     <div className="flex justify-between text-sm mb-2"><span className="text-gray-600 font-medium flex items-center gap-2"><CircleAlert size={16} className="text-yellow-500" /> Pending</span> <span className="font-bold text-gray-900">{pending}</span></div>
                     <div className="w-full bg-gray-50 h-2.5 rounded-full overflow-hidden"><div className="bg-yellow-400 h-full transition-all" style={{ width: `${total ? (pending/total)*100 : 0}%` }}></div></div>
                   </div>
                </div>
              </div>

              {/* Priority Distribution */}
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <h3 className="text-sm font-semibold text-gray-900 mb-6">Priority Distribution</h3>
                <div className="space-y-4">
                  {Object.entries(priorities).reverse().map(([key, val]) => {
                    const colors: Record<string, string> = { urgent: 'bg-red-500', high: 'bg-orange-400', medium: 'bg-indigo-400', low: 'bg-gray-400' }
                    return (
                      <div key={key} className="flex items-center gap-4">
                        <span className="w-16 text-xs font-semibold text-gray-500 uppercase">{key}</span>
                        <div className="flex-1 bg-gray-50 h-3 rounded-full overflow-hidden flex">
                           <div className={`${colors[key]} h-full rounded-full transition-all`} style={{ width: `${total ? (val/total)*100 : 0}%` }}></div>
                        </div>
                        <span className="w-6 text-right text-sm font-bold text-gray-900">{val}</span>
                      </div>
                    )
                  })}
                </div>
              </div>

            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
