"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, XCircle, Edit, AlertCircle } from "lucide-react";
import { Sidebar } from "@/components/dashboard/Sidebar";

interface ReviewTask {
  id: string;
  title: string;
  description: string;
  originalMessage: string;
  sourceType: string;
  confidenceScore: number;
  dueDate: string | null;
  createdAt: string;
  assignee?: { name: string | null; email: string };
}

export default function AIReviewPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<ReviewTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem("token") || "mock-token";

      // In a real app we'd fetch only pending-review Tasks either via a new GET endpoint
      // We will assume /api/tasks?status=pending or a specific review endpoint exists.
      // For this implementation, let's just make a mock call if the endpoint isn't built yet,
      // or we can build the get side of it. Let's just create a quick GET in tasks/review.
      const res = await fetch("/api/tasks/pending-review", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setTasks(data.tasks || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (taskId: string, action: 'approve' | 'reject') => {
    try {
      const token = localStorage.getItem("token") || "mock-token";
      const payload = {
        taskId,
        action,
        ...(action === 'approve' && editingId === taskId ? { editedTitle: editTitle, editedDescription: editDesc } : {})
      };

      await fetch("/api/tasks/review", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      
      setEditingId(null);
      fetchTasks(); // refresh list
    } catch (e) {
      console.error("Error acting on task", e);
    }
  };

  if (loading) return <div className="p-8 text-white">Loading review queue...</div>;

  return (
    <div className="flex min-h-screen bg-gray-50/50">
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <main className="flex-1 overflow-y-auto p-8 relative">
          <div className="max-w-6xl mx-auto space-y-8">
            <header>
              <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-500">
                AI Task Review Queue
              </h1>
              <p className="text-gray-500 mt-2">
                Tasks below were extracted with medium confidence. Review them before they enter your board.
              </p>
            </header>

            {tasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-gray-400 bg-white rounded-2xl border border-gray-100 shadow-sm">
                <AlertCircle className="w-12 h-12 mb-4 text-gray-300" />
                <p>No tasks pending review.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {tasks.map(task => (
                  <div key={task.id} className="bg-white border border-gray-100 p-6 rounded-2xl flex flex-col md:flex-row gap-8 shadow-sm hover:shadow-md transition-shadow">
                    {/* Original Context */}
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="px-2 py-1 bg-indigo-50 rounded text-xs font-semibold uppercase tracking-wider text-indigo-600">
                          {task.sourceType || "External"}
                        </span>
                        <span className="text-xs font-medium text-gray-500 bg-gray-50 px-2 py-1 rounded">Score: {task.confidenceScore?.toFixed(1) || "N/A"}%</span>
                      </div>
                      
                      <div className="flex flex-col gap-1 mt-2">
                        {task.dueDate && (
                          <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 px-2 py-1.5 rounded-md w-max">
                            <span className="font-semibold">⏰ Deadline:</span>
                            <span>{new Date(task.dueDate).toLocaleString()}</span>
                          </div>
                        )}
                        {task.assignee && (
                          <div className="flex items-center gap-2 text-xs text-blue-700 bg-blue-50 px-2 py-1.5 rounded-md w-max">
                            <span className="font-semibold">👤 Assignee:</span>
                            <span>{task.assignee.name || task.assignee.email}</span>
                          </div>
                        )}
                        <span className="text-xs text-gray-400 mt-1">Created: {new Date(task.createdAt).toLocaleString()}</span>
                      </div>
                      
                      <h3 className="text-sm font-semibold tracking-wide text-gray-400 uppercase mt-4">Original Message</h3>
                      <div className="bg-gray-50 p-4 rounded-xl text-gray-600 text-sm whitespace-pre-wrap max-h-48 overflow-y-auto font-mono border border-gray-100">
                        {task.originalMessage || "No original message provided"}
                      </div>
                    </div>

                    {/* AI Extraction & Editing */}
                    <div className="flex-1 space-y-4 flex flex-col">
                      <h3 className="text-sm font-semibold tracking-wide text-indigo-400 uppercase">AI Extraction</h3>
                      
                      {editingId === task.id ? (
                        <div className="space-y-3 flex-1">
                          <input 
                            className="w-full bg-white border border-gray-200 rounded-lg p-3 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all outline-none shadow-sm"
                            value={editTitle}
                            onChange={e => setEditTitle(e.target.value)}
                            placeholder="Task Title"
                          />
                          <textarea 
                            className="w-full h-32 bg-white border border-gray-200 rounded-lg p-3 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all outline-none resize-none shadow-sm"
                            value={editDesc}
                            onChange={e => setEditDesc(e.target.value)}
                            placeholder="Task Description"
                          />
                        </div>
                      ) : (
                        <div className="space-y-3 flex-1">
                          <div className="font-semibold text-xl text-gray-900">{task.title}</div>
                          <div className="text-gray-600 text-sm bg-indigo-50/50 border border-indigo-50/50 p-4 rounded-xl min-h-24">
                            {task.description || <span className="text-gray-400 italic">No description generated.</span>}
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center gap-3 mt-auto pt-4 border-t border-gray-100">
                        {editingId === task.id ? (
                          <>
                            <button 
                              onClick={() => handleAction(task.id, 'approve')}
                              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2 font-medium transition-all shadow-md shadow-indigo-200"
                            >
                              <CheckCircle size={18} /> Approve Edit
                            </button>
                            <button 
                              onClick={() => setEditingId(null)}
                              className="px-4 py-2 hover:bg-gray-100 border border-transparent rounded-lg text-gray-600 font-medium transition-all"
                            >
                               Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button 
                              onClick={() => handleAction(task.id, 'approve')}
                              className="flex-1 bg-green-50 hover:bg-green-100 border border-green-200 text-green-700 py-2 px-4 rounded-lg flex items-center justify-center gap-2 font-medium transition-all"
                            >
                              <CheckCircle size={18} /> Approve
                            </button>
                            <button 
                              onClick={() => {
                                setEditingId(task.id);
                                setEditTitle(task.title);
                                setEditDesc(task.description || "");
                              }}
                              className="px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg text-gray-500 transition-all shadow-sm"
                              title="Edit Task"
                            >
                              <Edit size={18} />
                            </button>
                            <button 
                              onClick={() => handleAction(task.id, 'reject')}
                              className="px-4 py-2 bg-red-50 hover:bg-red-100 border border-red-100 text-red-600 rounded-lg transition-all"
                              title="Reject Task"
                            >
                              <XCircle size={18} />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
           </div>
        </main>
      </div>
    </div>
  );
}
