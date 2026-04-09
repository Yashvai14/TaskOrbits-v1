'use client'
import { useState, useEffect } from 'react'
import { DragDropContext, Droppable, DropResult } from '@hello-pangea/dnd'
import { LayoutGrid, List as ListIcon, User, ChevronDown } from 'lucide-react'
import { TaskCard, TaskData } from './TaskCard'

const COLUMNS = [
  { id: 'todo',        label: 'To Do',       color: 'bg-gray-100 text-gray-600',   dot: 'bg-gray-400' },
  { id: 'in_progress', label: 'In Progress',  color: 'bg-blue-100 text-blue-700',   dot: 'bg-blue-500' },
  { id: 'done',        label: 'Done',         color: 'bg-green-100 text-green-700', dot: 'bg-green-500' },
]

function AssigneeInitial({ name, email }: { name?: string | null; email?: string }) {
  const display = name || email?.split('@')[0] || '?'
  const initial = display.charAt(0).toUpperCase()
  const colors = ['bg-indigo-500', 'bg-purple-500', 'bg-teal-500', 'bg-rose-500', 'bg-orange-500']
  const color = colors[(initial.charCodeAt(0) || 0) % colors.length]
  return (
    <div className={`w-5 h-5 ${color} rounded-full text-white text-[9px] font-bold flex items-center justify-center shrink-0`}>
      {initial}
    </div>
  )
}

export function TaskBoard({
  tasks,
  onTaskUpdated,
  onTaskDeleted,
  currentUser
}: {
  tasks: TaskData[]
  onTaskUpdated: (id: string, updates: Partial<TaskData>) => void
  onTaskDeleted: (id: string) => void
  currentUser?: { name?: string; email?: string } | null
}) {
  const [view, setView] = useState<'kanban' | 'list'>('kanban')
  const [myTasksOnly, setMyTasksOnly] = useState(false)
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all')
  const [dropdownOpen, setDropdownOpen] = useState(false)

  // Derive unique assignees from task list
  const assignees = Array.from(
    new Map(
      tasks
        .filter(t => t.assignee)
        .map(t => [t.assignee!.email, t.assignee!])
    ).values()
  )

  const filtered = tasks.filter(t => {
    if (myTasksOnly && currentUser?.email) {
      return t.assignee?.email === currentUser.email
    }
    if (assigneeFilter !== 'all') {
      return t.assignee?.email === assigneeFilter
    }
    return true
  })

  const onDragEnd = async (result: DropResult) => {
    if (!result.destination) return
    const taskId = result.draggableId
    const newStatus = result.destination.droppableId
    onTaskUpdated(taskId, { status: newStatus })
    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
    } catch (e) { console.error('Failed to patch', e) }
  }

  const handleDelete = async (id: string) => {
    onTaskDeleted(id)
    await fetch(`/api/tasks/${id}`, { method: 'DELETE' })
  }

  return (
    <div className="mt-8">
      {/* Header + filter bar */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <h2 className="text-lg font-bold text-gray-900 mr-auto">Task Board</h2>

        {/* My Tasks toggle */}
        <button
          onClick={() => { setMyTasksOnly(!myTasksOnly); setAssigneeFilter('all') }}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
            myTasksOnly
              ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-200'
              : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300 hover:text-indigo-600'
          }`}
        >
          <User size={14} />
          My Tasks
        </button>

        {/* Assignee filter dropdown */}
        <div className="relative">
          <button
            onClick={() => { setDropdownOpen(!dropdownOpen); setMyTasksOnly(false) }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
              assigneeFilter !== 'all'
                ? 'bg-teal-600 text-white border-teal-600'
                : 'bg-white text-gray-600 border-gray-200 hover:border-teal-300 hover:text-teal-600'
            }`}
          >
            {assigneeFilter !== 'all' ? (
              <>
                <AssigneeInitial
                  name={assignees.find(a => a.email === assigneeFilter)?.name}
                  email={assigneeFilter}
                />
                {assignees.find(a => a.email === assigneeFilter)?.name || assigneeFilter.split('@')[0]}
              </>
            ) : (
              <>All Members</>
            )}
            <ChevronDown size={13} className={`transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {dropdownOpen && (
            <div
              className="absolute right-0 top-full mt-2 w-52 bg-white border border-gray-100 rounded-xl shadow-xl z-50 py-1"
              onMouseLeave={() => setDropdownOpen(false)}
            >
              <button
                onClick={() => { setAssigneeFilter('all'); setDropdownOpen(false) }}
                className={`flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-gray-50 ${assigneeFilter === 'all' ? 'font-semibold text-indigo-600' : 'text-gray-700'}`}
              >
                All Members
                <span className="ml-auto text-xs text-gray-400">{tasks.length}</span>
              </button>
              {assignees.map(a => (
                <button
                  key={a.email}
                  onClick={() => { setAssigneeFilter(a.email); setDropdownOpen(false) }}
                  className={`flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-gray-50 ${assigneeFilter === a.email ? 'font-semibold text-teal-600' : 'text-gray-700'}`}
                >
                  <AssigneeInitial name={a.name} email={a.email} />
                  {a.name || a.email.split('@')[0]}
                  <span className="ml-auto text-xs text-gray-400">
                    {tasks.filter(t => t.assignee?.email === a.email).length}
                  </span>
                </button>
              ))}
              {assignees.length === 0 && (
                <p className="text-xs text-gray-400 px-3 py-2">No assignees yet</p>
              )}
            </div>
          )}
        </div>

        {/* View toggle */}
        <div className="flex bg-white border border-gray-100 p-1 rounded-lg shadow-sm">
          <button
            onClick={() => setView('kanban')}
            className={`p-1.5 rounded-md transition-all ${view === 'kanban' ? 'bg-gray-100 text-indigo-600' : 'text-gray-400 hover:text-gray-700'}`}
          >
            <LayoutGrid size={16} />
          </button>
          <button
            onClick={() => setView('list')}
            className={`p-1.5 rounded-md transition-all ${view === 'list' ? 'bg-gray-100 text-indigo-600' : 'text-gray-400 hover:text-gray-700'}`}
          >
            <ListIcon size={16} />
          </button>
        </div>
      </div>

      {/* Active filter chip */}
      {(myTasksOnly || assigneeFilter !== 'all') && (
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs text-gray-500">Filtering:</span>
          <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs font-medium rounded-full border border-indigo-100 flex items-center gap-1.5">
            {myTasksOnly ? '👤 My Tasks' : `🔍 ${assignees.find(a => a.email === assigneeFilter)?.name || assigneeFilter.split('@')[0]}`}
            <button
              onClick={() => { setMyTasksOnly(false); setAssigneeFilter('all') }}
              className="hover:text-red-500 ml-1 font-bold"
            >×</button>
          </span>
          <span className="text-xs text-gray-400">{filtered.length} of {tasks.length} tasks</span>
        </div>
      )}

      {/* Board / List views */}
      {view === 'list' ? (
        <div className="space-y-6">
          {COLUMNS.map(col => {
            const colTasks = filtered.filter(t => t.status === col.id)
            if (colTasks.length === 0) return null
            return (
              <div key={col.id}>
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${col.dot}`} />
                  {col.label}
                  <span className="text-gray-400 font-normal">({colTasks.length})</span>
                </h3>
                {colTasks.map((t, idx) => (
                  <TaskCard key={t.id} task={t} index={idx} viewMode="list" onDelete={handleDelete} onUpdate={onTaskUpdated} />
                ))}
              </div>
            )
          })}
        </div>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {COLUMNS.map(col => {
              const colTasks = filtered.filter(t => t.status === col.id)
              return (
                <div key={col.id} className="bg-gray-50/50 rounded-2xl flex flex-col min-h-[500px] border border-gray-100/50">
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${col.dot}`} />
                      <span className={`px-3 py-1 rounded-lg text-xs font-bold tracking-wide ${col.color}`}>{col.label}</span>
                      <span className="text-xs font-medium text-gray-400">{colTasks.length}</span>
                    </div>
                  </div>
                  <Droppable droppableId={col.id}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`flex-1 p-3 transition-colors rounded-b-2xl ${snapshot.isDraggingOver ? 'bg-indigo-50/40 ring-1 ring-inset ring-indigo-100' : ''}`}
                      >
                        {colTasks.map((task, index) => (
                          <TaskCard key={task.id} task={task} index={index} onDelete={handleDelete} onUpdate={onTaskUpdated} />
                        ))}
                        {colTasks.length === 0 && !snapshot.isDraggingOver && (
                          <div className="flex items-center justify-center h-32 text-gray-300 text-xs">
                            Drop tasks here
                          </div>
                        )}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              )
            })}
          </div>
        </DragDropContext>
      )}
    </div>
  )
}
