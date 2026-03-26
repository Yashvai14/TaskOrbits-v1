import { Bell, Search, Zap } from 'lucide-react'

export function Header({ user }: { user?: { name?: string, email?: string, orgName?: string } }) {
  return (
    <header className="flex flex-col border-b border-gray-100 bg-white/50 backdrop-blur-md sticky top-0 z-30 shrink-0">
      <div className="h-16 px-8 flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative w-96 hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input type="text" placeholder="Search tasks, docs..." className="w-full bg-gray-50 border-none rounded-full py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-indigo-100 outline-none transition-all" />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
            <Bell size={20} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
          <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-indigo-600 to-blue-400 flex items-center justify-center text-white text-sm font-bold shadow-sm cursor-pointer">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
        </div>
      </div>
      {/* AI Insights Banner */}
      <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-blue-50 px-8 py-3 border-t border-indigo-100/50 flex items-center gap-3">
        <div className="bg-white p-1.5 rounded-lg shadow-sm">
          <Zap size={16} className="text-purple-600" fill="currentColor" />
        </div>
        <p className="text-sm font-medium text-gray-700">
          <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">AI Insight:</span> You have 3 high-priority tasks due today. Consider tackling 'Design System' first to stay on track.
        </p>
      </div>
    </header>
  )
}
