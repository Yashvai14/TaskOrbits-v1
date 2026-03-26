'use client'
import { useState } from 'react'
import { DragDropContext, Droppable, DropResult } from '@hello-pangea/dnd'
import { LayoutGrid, List as ListIcon } from 'lucide-react'
import { TaskCard, TaskData } from './TaskCard'

const COLUMNS = [
  { id: 'todo', label: 'To Do', color: 'bg-gray-100 text-gray-600' },
  { id: 'in_progress', label: 'In Progress', color: 'bg-blue-100 text-blue-700' },
  { id: 'done', label: 'Done', color: 'bg-green-100 text-green-700' },
]

export function TaskBoard({ 
  tasks, 
  onTaskUpdated, 
  onTaskDeleted 
}: { 
  tasks: TaskData[], 
  onTaskUpdated: (id: string, updates: Partial<TaskData>) => void,
  onTaskDeleted: (id: string) => void
}) {
  const [view, setView] = useState<'kanban' | 'list'>('kanban')

  const onDragEnd = async (result: DropResult) => {
    if (!result.destination) return
    const taskId = result.draggableId
    const newStatus = result.destination.droppableId
    
    // Optistic update
    onTaskUpdated(taskId, { status: newStatus })

    // Backend call
    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
    } catch(e) { console.error('Failed to patch', e) }
  }

  const handleDelete = async (id: string) => {
    onTaskDeleted(id)
    await fetch(`/api/tasks/${id}`, { method: 'DELETE' })
  }

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-gray-900">Task Board</h2>
        <div className="flex bg-white border border-gray-100 p-1 rounded-lg shadow-sm">
          <button 
            onClick={() => setView('kanban')} 
            className={`p-1.5 rounded-md transition-all ${view === 'kanban' ? 'bg-gray-100 text-indigo-600' : 'text-gray-500 hover:text-gray-900'}`}
          >
            <LayoutGrid size={16} />
          </button>
          <button 
            onClick={() => setView('list')} 
            className={`p-1.5 rounded-md transition-all ${view === 'list' ? 'bg-gray-100 text-indigo-600' : 'text-gray-500 hover:text-gray-900'}`}
          >
            <ListIcon size={16} />
          </button>
        </div>
      </div>

      {view === 'list' ? (
        <div className="space-y-6">
          {COLUMNS.map(col => {
            const colTasks = tasks.filter(t => t.status === col.id)
            if (colTasks.length === 0) return null
            return (
              <div key={col.id}>
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${col.color.split(' ')[0]}`}></div>
                  {col.label} <span className="text-gray-400 font-normal">({colTasks.length})</span>
                </h3>
                <div>
                  {colTasks.map((t, idx) => (
                    <TaskCard key={t.id} task={t} index={idx} viewMode="list" onDelete={handleDelete} onUpdate={onTaskUpdated} />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {COLUMNS.map(col => {
              const colTasks = tasks.filter(t => t.status === col.id)
              return (
                <div key={col.id} className="bg-gray-50/50 rounded-2xl flex flex-col min-h-[500px] border border-gray-100/50">
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-lg text-xs font-bold tracking-wide ${col.color}`}>
                        {col.label}
                      </span>
                      <span className="text-xs font-medium text-gray-400">{colTasks.length}</span>
                    </div>
                  </div>
                  <Droppable droppableId={col.id}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`flex-1 p-3 transition-colors rounded-b-2xl ${snapshot.isDraggingOver ? 'bg-indigo-50/30 ring-1 ring-inset ring-indigo-100' : ''}`}
                      >
                        {colTasks.map((task, index) => (
                          <TaskCard key={task.id} task={task} index={index} onDelete={handleDelete} onUpdate={onTaskUpdated} />
                        ))}
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
