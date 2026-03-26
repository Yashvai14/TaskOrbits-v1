'use client'
import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { Header } from '@/components/dashboard/Header'
import { TaskBoard } from '@/components/dashboard/TaskBoard'
import { TaskData } from '@/components/dashboard/TaskCard'
import { QuickActionModal } from '@/components/dashboard/QuickActionModal'
import { Loader2 } from 'lucide-react'

export default function TasksPage() {
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

  const handleTaskAdded = (newTask: TaskData) => setTasks(prev => [newTask, ...prev])
  const handleTaskUpdated = (taskId: string, updates: Partial<TaskData>) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t))
  }
  const handleTaskDeleted = (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId))
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50/50"><Loader2 className="animate-spin text-indigo-500" size={32} /></div>

  return (
    <div className="flex min-h-screen bg-gray-50/50">
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Header user={user || undefined} />
        <main className="flex-1 overflow-y-auto p-8 relative">
          <div className="max-w-[1200px] mx-auto space-y-8">
            <h1 className="text-2xl font-bold text-gray-900">My Tasks</h1>
            <TaskBoard tasks={tasks} onTaskUpdated={handleTaskUpdated} onTaskDeleted={handleTaskDeleted} />
          </div>
        </main>
      </div>
      <QuickActionModal onTaskAdded={handleTaskAdded} />
    </div>
  )
}
