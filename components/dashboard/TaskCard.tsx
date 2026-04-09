'use client'
import { Draggable } from '@hello-pangea/dnd'
import { Calendar, AlertCircle } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'

export type TaskData = {
  id: string
  title: string
  description?: string | null
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: string
  dueDate?: string | null
  createdAt?: string
  updatedAt?: string
  assignee?: { name: string | null; email: string } | null
}

// Priority config: border color + badge style
const PRIORITY_CONFIG: Record<string, { border: string; badge: string; label: string }> = {
  low:    { border: 'border-l-gray-300',  badge: 'bg-gray-100 text-gray-600',    label: 'Low' },
  medium: { border: 'border-l-blue-400',  badge: 'bg-blue-50 text-blue-700',     label: 'Medium' },
  high:   { border: 'border-l-amber-400', badge: 'bg-amber-50 text-amber-700',   label: 'High' },
  urgent: { border: 'border-l-red-500',   badge: 'bg-red-50 text-red-700',       label: 'Critical' },
}

const STATUS_CHIP: Record<string, string> = {
  todo:        'bg-gray-100 text-gray-600',
  in_progress: 'bg-blue-100 text-blue-700',
  done:        'bg-green-100 text-green-700',
}

function formatRelative(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = date.getTime() - now.getTime()
  const diffDays = Math.round(diffMs / 86400000)
  if (diffDays < -1) return `${Math.abs(diffDays)} days ago`
  if (diffDays === -1) return 'yesterday'
  if (diffDays === 0) return 'today'
  if (diffDays === 1) return 'tomorrow'
  if (diffDays > 0 && diffDays < 7) return `in ${diffDays} days`
  return `in ${Math.round(diffDays / 7)} wk`
}

function AssigneeAvatar({ name, email, size = 'sm' }: { name?: string | null; email?: string; size?: 'sm' | 'md' }) {
  const display = name || email?.split('@')[0] || '?'
  const initial = display.charAt(0).toUpperCase()
  const colors = ['bg-indigo-500', 'bg-purple-500', 'bg-teal-500', 'bg-rose-500', 'bg-orange-500']
  const color = colors[(initial.charCodeAt(0) || 0) % colors.length]
  const sz = size === 'md' ? 'w-7 h-7 text-xs' : 'w-6 h-6 text-[10px]'
  return (
    <div className={`${sz} ${color} rounded-full text-white font-bold flex items-center justify-center shrink-0 ring-2 ring-white shadow-sm`}>
      {initial}
    </div>
  )
}

function TaskTooltip({ task, visible, anchor }: { task: TaskData; visible: boolean; anchor: DOMRect | null }) {
  const [pos, setPos] = useState({ top: 0, left: 0, flipUp: false })
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!anchor || !ref.current) return
    const tt = ref.current.getBoundingClientRect()
    const vw = window.innerWidth
    const vh = window.innerHeight
    let left = anchor.right + 12
    if (left + tt.width > vw - 12) left = anchor.left - tt.width - 12
    let top = anchor.top
    const flipUp = top + tt.height > vh - 12
    if (flipUp) top = anchor.bottom - tt.height
    setPos({ top, left, flipUp })
  }, [anchor, visible])

  if (!visible) return null
  const pc = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium
  const sc = STATUS_CHIP[task.status] || STATUS_CHIP.todo

  return (
    <div
      ref={ref}
      className="fixed z-[9999] w-72 bg-white border border-gray-200 rounded-2xl shadow-2xl p-4 pointer-events-none"
      style={{ top: pos.top, left: pos.left }}
    >
      <p className="font-bold text-gray-900 text-sm leading-snug mb-3">{task.title}</p>
      <div className="space-y-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-gray-400 w-20 shrink-0">Assigned to</span>
          {task.assignee ? (
            <span className="flex items-center gap-1.5 font-medium text-gray-700">
              <AssigneeAvatar name={task.assignee.name} email={task.assignee.email} />
              {task.assignee.name || task.assignee.email}
            </span>
          ) : (
            <span className="text-amber-500 font-medium">Unassigned</span>
          )}
        </div>
        {task.dueDate && (
          <div className="flex items-center gap-2">
            <span className="text-gray-400 w-20 shrink-0">Deadline</span>
            <span className="font-medium text-gray-700">
              {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              {' · '}
              <span className="text-indigo-500">{formatRelative(task.dueDate)}</span>
            </span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <span className="text-gray-400 w-20 shrink-0">Priority</span>
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${pc.badge}`}>{pc.label}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-400 w-20 shrink-0">Status</span>
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${sc}`}>{task.status.replace('_', ' ')}</span>
        </div>
      </div>
    </div>
  )
}

export function TaskCard({
  task,
  index,
  viewMode = 'kanban',
  onDelete,
  onUpdate
}: {
  task: TaskData
  index: number
  viewMode?: 'kanban' | 'list'
  onDelete?: (id: string) => void
  onUpdate?: (id: string, updates: Partial<TaskData>) => void
}) {
  const [tooltip, setTooltip] = useState(false)
  const [anchor, setAnchor] = useState<DOMRect | null>(null)
  const hoverTimer = useRef<NodeJS.Timeout | null>(null)
  const cardRef = useRef<HTMLDivElement>(null)

  const pc = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium
  const assigneeName = task.assignee?.name || task.assignee?.email?.split('@')[0] || null
  const displayDate = task.dueDate
    ? `${new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · ${formatRelative(task.dueDate)}`
    : null

  const handleMouseEnter = () => {
    hoverTimer.current = setTimeout(() => {
      setAnchor(cardRef.current?.getBoundingClientRect() ?? null)
      setTooltip(true)
    }, 300)
  }

  const handleMouseLeave = () => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current)
    setTooltip(false)
    setAnchor(null)
  }

  const handlePriorityChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newPri = e.target.value as TaskData['priority']
    onUpdate?.(task.id, { priority: newPri })
    await fetch(`/api/tasks/${task.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ priority: newPri })
    }).catch(console.error)
  }

  const prioritySelect = (
    <select
      value={task.priority}
      onChange={handlePriorityChange}
      onClick={e => e.stopPropagation()}
      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider appearance-none cursor-pointer outline-none border-none ${pc.badge}`}
    >
      <option value="low">Low</option>
      <option value="medium">Medium</option>
      <option value="high">High</option>
      <option value="urgent">Critical</option>
    </select>
  )

  if (viewMode === 'list') {
    return (
      <div
        ref={cardRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`relative flex items-center gap-4 bg-white p-4 rounded-xl border border-gray-100 border-l-4 ${pc.border} shadow-sm hover:shadow-md transition-all group mb-2`}
      >
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-gray-900 truncate">{task.title}</h4>
          {assigneeName
            ? <p className="text-xs text-gray-400 mt-0.5">{assigneeName}</p>
            : <p className="text-xs text-amber-500 mt-0.5 flex items-center gap-1"><AlertCircle size={10} />Unassigned</p>
          }
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {prioritySelect}
          {displayDate && (
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <Calendar size={11} />{displayDate}
            </div>
          )}
          {task.assignee
            ? <AssigneeAvatar name={task.assignee.name} email={task.assignee.email} />
            : <div className="w-6 h-6 rounded-full border-2 border-dashed border-amber-300 bg-amber-50" />
          }
          <button
            onClick={e => { e.stopPropagation(); onDelete?.(task.id) }}
            className="text-gray-300 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 ml-1"
          >✕</button>
        </div>
        <TaskTooltip task={task} visible={tooltip} anchor={anchor} />
      </div>
    )
  }

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={el => {
            provided.innerRef(el);
            (cardRef as any).current = el
          }}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className={`relative bg-white border border-gray-100 border-l-4 ${pc.border} rounded-xl p-4 group transition-all mb-3 ${
            snapshot.isDragging ? 'shadow-2xl rotate-1 ring-2 ring-indigo-300 z-50' : 'shadow-sm hover:shadow-lg'
          }`}
        >
          {/* Top row: priority selector + delete */}
          <div className="flex items-center justify-between gap-2 mb-2">
            {prioritySelect}
            <button
              onClick={e => { e.stopPropagation(); onDelete?.(task.id) }}
              className="text-gray-200 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 text-xs"
            >✕</button>
          </div>

          {/* Task title */}
          <h4 className="text-sm font-semibold text-gray-900 leading-snug mb-1">{task.title}</h4>

          {/* Assignee name under title */}
          {assigneeName
            ? <p className="text-[11px] text-gray-400 mb-2">{assigneeName}</p>
            : <p className="text-[11px] text-amber-500 mb-2 flex items-center gap-1"><AlertCircle size={10} />Unassigned</p>
          }

          {task.description && (
            <p className="text-xs text-gray-400 line-clamp-2 mb-3">{task.description}</p>
          )}

          {/* Bottom row: date + assignee avatar */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-50 mt-1">
            <div className="flex items-center gap-1 text-[11px] text-gray-400">
              {displayDate ? (
                <><Calendar size={10} />{displayDate}</>
              ) : (
                <span className="text-gray-300">No deadline</span>
              )}
            </div>
            {task.assignee
              ? <AssigneeAvatar name={task.assignee.name} email={task.assignee.email} />
              : <div className="w-6 h-6 rounded-full border-2 border-dashed border-amber-300 bg-amber-50 flex items-center justify-center">
                  <AlertCircle size={10} className="text-amber-400" />
                </div>
            }
          </div>

          {/* Viewport-aware tooltip */}
          <TaskTooltip task={task} visible={tooltip} anchor={anchor} />
        </div>
      )}
    </Draggable>
  )
}
