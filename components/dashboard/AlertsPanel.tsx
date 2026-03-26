import { AlertTriangle, Clock } from 'lucide-react'
import { TaskData } from './TaskCard'

export function AlertsPanel({ tasks }: { tasks: TaskData[] }) {
  const now = new Date()
  now.setHours(0,0,0,0)

  const alerts = tasks.filter(t => t.dueDate && t.status !== 'done').map(t => {
    const due = new Date(t.dueDate!)
    const isOverdue = due < now
    const isToday = due.getTime() === now.getTime()
    
    if (isOverdue) return { id: t.id, type: 'overdue', message: t.title, time: 'Overdue' }
    if (isToday) return { id: t.id, type: 'today', message: t.title, time: 'Due today' }
    return null
  }).filter(Boolean) as { id: string, type: 'overdue' | 'today', message: string, time: string }[]

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm mt-4">
      <h3 className="text-sm font-bold text-gray-900 mb-4">Urgent Alerts</h3>
      <div className="space-y-3">
        {alerts.length === 0 ? (
          <p className="text-xs text-gray-400">No urgent alerts at this time.</p>
        ) : alerts.slice(0, 4).map(alert => (
          <div key={alert.id} className="flex gap-3 p-3 rounded-xl border border-gray-50 bg-gray-50/50 hover:bg-gray-50 transition-colors">
            <div className={`mt-0.5 ${alert.type === 'overdue' ? 'text-red-500' : 'text-yellow-500'}`}>
               {alert.type === 'overdue' ? <AlertTriangle size={16} /> : <Clock size={16} />}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800 leading-snug">{alert.message}</p>
              <p className="text-xs text-gray-400 mt-1">{alert.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
