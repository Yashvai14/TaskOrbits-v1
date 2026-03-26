'use client'
import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { Header } from '@/components/dashboard/Header'
import { TaskData } from '@/components/dashboard/TaskCard'
import { Loader2, Calendar as CalIcon, AlertTriangle } from 'lucide-react'

export default function CalendarPage() {
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

  // Processing tasks by date
  const now = new Date()
  now.setHours(0,0,0,0)

  const pastDue: TaskData[] = []
  const today: TaskData[] = []
  const upcoming: TaskData[] = []
  const unscheduled: TaskData[] = []

  tasks.filter(t => t.status !== 'done').forEach(t => {
    if (!t.dueDate) {
      unscheduled.push(t)
      return
    }
    const due = new Date(t.dueDate)
    due.setHours(0,0,0,0)
    
    if (due < now) pastDue.push(t)
    else if (due.getTime() === now.getTime()) today.push(t)
    else upcoming.push(t)
  })

  // Sort upcoming chronologically
  upcoming.sort((a,b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())

  const sections = [
    { title: 'Past Due', icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50', items: pastDue },
    { title: 'Due Today', icon: CalIcon, color: 'text-indigo-600', bg: 'bg-indigo-50', items: today },
    { title: 'Upcoming', icon: CalIcon, color: 'text-gray-600', bg: 'bg-gray-100', items: upcoming },
  ]

  return (
    <div className="flex min-h-screen bg-gray-50/50">
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Header user={user || undefined} />
        <main className="flex-1 overflow-y-auto p-8 relative">
          <div className="max-w-[1000px] mx-auto space-y-8">
            <h1 className="text-2xl font-bold text-gray-900">Agenda & Calendar</h1>
            
            <div className="space-y-8">
              {sections.map(section => {
                if (section.items.length === 0) return null
                const Icon = section.icon
                return (
                  <div key={section.title} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${section.bg} ${section.color}`}><Icon size={18} /></div>
                      <h2 className="text-lg font-bold text-gray-900">{section.title}</h2>
                      <span className="ml-auto bg-gray-100 text-gray-600 text-xs font-bold px-2.5 py-1 rounded-full">{section.items.length}</span>
                    </div>
                    <div className="divide-y divide-gray-50">
                      {section.items.map(t => (
                        <div key={t.id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                          <div>
                            <h4 className="text-sm font-bold text-gray-900 mb-1">{t.title}</h4>
                            <div className="flex items-center gap-3 text-xs">
                              <span className={`px-2 py-0.5 rounded uppercase font-bold tracking-wider text-[10px] ${t.priority === 'urgent' ? 'text-red-700 bg-red-50' : t.priority === 'high' ? 'text-orange-700 bg-orange-50' : 'text-gray-600 bg-gray-100'}`}>
                                {t.priority}
                              </span>
                              {t.dueDate && <span className="text-gray-500 font-medium flex items-center gap-1"><CalIcon size={12}/> {new Date(t.dueDate).toLocaleDateString()}</span>}
                            </div>
                          </div>
                          <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-full capitalize">{t.status.replace('_', ' ')}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}

              {pastDue.length === 0 && today.length === 0 && upcoming.length === 0 && (
                 <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-200">
                    <CalIcon size={48} className="mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-bold text-gray-900">Your agenda is clear</h3>
                    <p className="text-sm text-gray-500 mt-1">You have no scheduled tasks pending.</p>
                 </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
