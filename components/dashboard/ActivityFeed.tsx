import { TaskData } from './TaskCard'

function timeAgo(dateStr: string) {
  const s = Math.floor((new Date().getTime() - new Date(dateStr).getTime()) / 1000)
  if (s < 60) return `${s}s ago`
  if (s < 3600) return `${Math.floor(s/60)}m ago`
  if (s < 86400) return `${Math.floor(s/3600)}h ago`
  return `${Math.floor(s/86400)}d ago`
}

export function ActivityFeed({ tasks }: { tasks: TaskData[] }) {
  // Sort tasks by updatedAt to simulate recent activity
  const recent = [...tasks].sort((a,b) => {
    return new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime()
  }).slice(0, 5)

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm mt-4 lg:flex-1">
      <h3 className="text-sm font-bold text-gray-900 mb-6">Recent Activity</h3>
      <div className="space-y-6 relative">
        <div className="absolute left-[15px] top-2 bottom-2 w-px bg-gray-100"></div>
        {recent.length === 0 && <p className="text-xs text-gray-400 pl-8">No recent activity.</p>}
        {recent.map(act => (
          <div key={act.id} className="flex gap-4 relative z-10">
            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 font-bold text-[10px] flex items-center justify-center border-2 border-white shadow-sm shrink-0 uppercase">
              {act.title.charAt(0)}
            </div>
            <div>
              <p className="text-sm text-gray-800">
                <span className="font-semibold">Task {act.status === 'done' ? 'completed' : 'updated'}</span>
              </p>
              <p className="text-xs text-gray-500 font-medium">{act.title}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">{timeAgo(act.updatedAt || act.createdAt || new Date().toISOString())}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
