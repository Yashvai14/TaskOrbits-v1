import { Draggable } from '@hello-pangea/dnd'
import { Calendar, MoreHorizontal, X } from 'lucide-react'

export type TaskData = {
  id: string
  title: string
  description?: string | null
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: string
  dueDate?: string | null
  createdAt?: string
  updatedAt?: string
}

const PRIORITY_STYLES: Record<string, string> = {
  low: 'bg-gray-100 text-gray-600',
  medium: 'bg-indigo-50 text-indigo-700',
  high: 'bg-orange-50 text-orange-700',
  urgent: 'bg-red-50 text-red-700'
}

export function TaskCard({ 
  task, 
  index, 
  viewMode = 'kanban', 
  onDelete,
  onUpdate 
}: { 
  task: TaskData, 
  index: number, 
  viewMode?: 'kanban' | 'list', 
  onDelete?: (id: string) => void,
  onUpdate?: (id: string, updates: Partial<TaskData>) => void
}) {
  const displayDate = task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No date'
  
  const handlePriorityChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newPri = e.target.value as 'low' | 'medium' | 'high' | 'urgent';
    onUpdate?.(task.id, { priority: newPri })
    try {
      await fetch(`/api/tasks/${task.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priority: newPri })
      })
    } catch(err) { console.error('Failed to change priority', err) }
  }

  const deleteBtn = (
    <button onClick={(e) => { e.stopPropagation(); onDelete?.(task.id); }} className="text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100" title="Delete Task">
      <X size={16} />
    </button>
  )

  const prioritySelect = (
    <select 
      value={task.priority} 
      onChange={handlePriorityChange}
      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider appearance-none cursor-pointer outline-none border-none ${PRIORITY_STYLES[task.priority] || PRIORITY_STYLES.medium}`}
    >
      <option value="low">LOW</option>
      <option value="medium">MEDIUM</option>
      <option value="high">HIGH</option>
      <option value="urgent">URGENT</option>
    </select>
  )

  if (viewMode === 'list') {
    return (
      <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all group mb-2">
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-gray-900">{task.title}</h4>
          {task.description && <p className="text-xs text-gray-500 mt-1 line-clamp-1">{task.description}</p>}
        </div>
        <div className="flex items-center gap-4 shrink-0">
          {prioritySelect}
          <div className="flex items-center gap-1.5 text-xs text-gray-400 w-24">
            <Calendar size={12} /> {displayDate}
          </div>
          {deleteBtn}
        </div>
      </div>
    )
  }

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`bg-white border border-gray-100 rounded-xl p-4 group transition-shadow mb-3 ${snapshot.isDragging ? 'shadow-xl rotate-2 ring-1 ring-indigo-500 z-50' : 'shadow-sm hover:shadow-md'}`}
        >
          <div className="flex items-start justify-between gap-2 mb-2">
            {prioritySelect}
            {deleteBtn}
          </div>
          <h4 className="text-sm font-semibold text-gray-900 leading-snug mb-1.5">{task.title}</h4>
          {task.description && <p className="text-xs text-gray-500 line-clamp-2 mb-3">{task.description}</p>}
          
          <div className="flex items-center justify-between pt-3 border-t border-gray-50 mt-2">
             <div className="flex items-center gap-1.5 text-xs font-medium text-gray-400">
               <Calendar size={12} /> {displayDate}
             </div>
             {/* Fake Assignee Avatars */}
             <div className="flex -space-x-1.5">
               <div className="w-5 h-5 rounded-full bg-indigo-100 border border-white"></div>
               <div className="w-5 h-5 rounded-full bg-purple-100 border border-white"></div>
             </div>
          </div>
        </div>
      )}
    </Draggable>
  )
}
