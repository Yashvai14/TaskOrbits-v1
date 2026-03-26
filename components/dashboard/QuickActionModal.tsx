'use client'
import { useState } from 'react'
import { Plus, X, Loader2 } from 'lucide-react'
import { TaskData } from './TaskCard'

export function QuickActionModal({ onTaskAdded }: { onTaskAdded: (t: TaskData) => void }) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [priority, setPriority] = useState('medium')
  const [date, setDate] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!title.trim()) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title, 
          priority, 
          status: 'todo', 
          dueDate: date ? new Date(date).toISOString() : null 
        }),
      })
      if (res.ok) {
        onTaskAdded(await res.json())
        setOpen(false)
        setTitle('')
        setPriority('medium')
        setDate('')
      }
    } catch(e) { console.error(e) }
    setSubmitting(false)
  }

  return (
    <>
      <button 
        onClick={() => setOpen(true)}
        className="fixed bottom-8 right-8 w-14 h-14 bg-indigo-600 text-white rounded-full shadow-lg shadow-indigo-600/30 flex items-center justify-center hover:bg-indigo-700 hover:scale-105 active:scale-95 transition-all z-50"
      >
        <Plus size={24} />
      </button>

      {open && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl scale-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900">Quick Task</h2>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-700 transition">
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Task Title</label>
                <input 
                  type="text" 
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="What needs to be done?" 
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-100 outline-none transition-all" autoFocus 
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Priority</label>
                  <select value={priority} onChange={e => setPriority(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all appearance-none cursor-pointer">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Due Date</label>
                  <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all text-gray-500" />
                </div>
              </div>
              <button 
                onClick={handleSubmit}
                disabled={submitting || !title.trim()}
                className="w-full bg-gradient-to-r from-indigo-600 to-blue-500 text-white font-semibold py-3 rounded-xl mt-4 hover:shadow-lg hover:shadow-indigo-500/30 transition-all flex justify-center gap-2 items-center disabled:opacity-50"
              >
                {submitting ? <Loader2 size={18} className="animate-spin" /> : 'Create Task'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
