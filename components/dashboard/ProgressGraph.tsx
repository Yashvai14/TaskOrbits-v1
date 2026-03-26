import { TaskData } from './TaskCard'

export function ProgressGraph({ tasks }: { tasks: TaskData[] }) {
  // Generate last 7 days metrics
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const data = []
  
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    d.setHours(0,0,0,0)
    
    const nextD = new Date(d)
    nextD.setDate(d.getDate() + 1)

    // Using updatedAt as a proxy for completedAt (real apps should track completedAt)
    const completedCount = tasks.filter(t => {
      if (t.status !== 'done' || !t.updatedAt) return false
      const updated = new Date(t.updatedAt)
      return updated >= d && updated < nextD
    }).length

    data.push({ day: days[d.getDay()], value: completedCount })
  }

  const max = Math.max(...data.map(d => d.value), 1)

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
      <h3 className="text-sm font-bold text-gray-900 mb-6 flex items-center justify-between">
        Weekly Productivity
        <span className="text-xs font-medium text-gray-400 font-normal">Tasks Done</span>
      </h3>
      <div className="h-40 flex items-end justify-between gap-2">
        {data.map((d, i) => {
          const height = Math.max((d.value / max) * 100, 5) // At least 5% so bar is visible
          return (
            <div key={i} className="flex flex-col items-center gap-2 flex-1 group">
              <div className="w-full relative bg-gray-50 rounded-t-md h-full flex items-end overflow-hidden group-hover:bg-indigo-50/50 transition-colors">
                <div 
                  className="w-full bg-gradient-to-t from-indigo-600 to-blue-400 rounded-t-md transition-all duration-500 group-hover:opacity-90"
                  style={{ height: `${d.value === 0 ? 0 : height}%` }}
                ></div>
              </div>
              <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">{d.day}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
