'use client'
import { Home, Calendar, Users, Settings, PieChart, Activity } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function Sidebar() {
  const pathname = usePathname()

  const links = [
    { label: 'Dashboard', icon: Home, href: '/dashboard' },
    { label: 'My Tasks', icon: Activity, href: '/dashboard/tasks' },
    { label: 'Calendar', icon: Calendar, href: '/dashboard/calendar' },
    { label: 'Analytics', icon: PieChart, href: '/dashboard/analytics' },
    { label: 'Team', icon: Users, href: '/dashboard/team' },
    { label: 'Settings', icon: Settings, href: '/dashboard/settings' },
  ]

  return (
    <aside className="w-64 bg-white border-r border-gray-100 flex flex-col h-screen sticky top-0 shrink-0">
      <div className="h-16 flex items-center px-6 border-b border-gray-100">
        <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-blue-500 bg-clip-text text-transparent">TaskOrbits</span>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {links.map((link) => {
          const Icon = link.icon
          const active = pathname === link.href || pathname?.startsWith(link.href + '/')
          return (
            <Link key={link.label} href={link.href} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${active ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}> 
              <Icon size={18} />
              {link.label}
            </Link>
          )
        })}
      </nav>
      {/* Footer link or user mini profile */}
      <div className="p-4 border-t border-gray-100">
        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-4 rounded-xl border border-indigo-100/50">
          <p className="text-xs font-semibold text-indigo-900 mb-1">Upgrade to Pro</p>
          <p className="text-xs text-indigo-600/80 mb-3">Get advanced AI features</p>
          <button className="w-full bg-indigo-600 text-white text-xs font-medium py-2 rounded-lg hover:bg-indigo-700 transition">Upgrade</button>
        </div>
      </div>
    </aside>
  )
}
