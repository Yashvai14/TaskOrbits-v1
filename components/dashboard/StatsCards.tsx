import { CheckCircle2, Clock, ListTodo, AlertCircle } from 'lucide-react'
import { TaskData } from './TaskCard'

export function StatsCards({ tasks }: { tasks: TaskData[] }) {
  const total = tasks.length
  const completed = tasks.filter(t => t.status === 'done').length
  const pending = tasks.filter(t => t.status !== 'done').length
  
  const now = new Date()
  now.setHours(0,0,0,0) // Today midnight
  const overdue = tasks.filter(t => {
    if (!t.dueDate || t.status === 'done') return false
    return new Date(t.dueDate) < now
  }).length

  const stats = [
    { label: 'Total Tasks', value: total, icon: ListTodo, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Completed', value: completed, icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Pending', value: pending, icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { label: 'Overdue', value: overdue, icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50', warn: overdue > 0 }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {stats.map(s => {
        const Icon = s.icon
        return (
          <div key={s.label} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2.5 rounded-xl ${s.bg} ${s.color} transition-transform group-hover:scale-110`}> 
                <Icon size={20} />
              </div>
              {s.warn && <span className="text-xs font-semibold px-2 py-1 rounded-full bg-red-50 text-red-700 animate-pulse">Action req</span>}
            </div>
            <p className="text-gray-500 text-sm font-medium mb-1">{s.label}</p>
            <h3 className="text-3xl font-bold text-gray-900">{s.value}</h3>
          </div>
        )
      })}
    </div>
  )
}
