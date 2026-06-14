"use client";

import { useState } from "react";
import { CheckSquare, Plus, Check, Circle, ChevronDown, ChevronUp, Trash2 } from "lucide-react";

interface Task {
  id: number;
  text: string;
  done: boolean;
}

const templates: Record<string, string[]> = {
  "New Listing Checklist": [
    "Sign listing agreement with sellers",
    "Order professional photography",
    "Create MLS listing with all details",
    "Set up lockbox and showing instructions",
    "Schedule open house for first weekend",
    "Post to all social media channels",
    "Send 'Just Listed' postcards to neighborhood",
    "Set up email alerts for comparable sales",
    "Create property flyer and brochures",
    "Add to featured listings on personal website",
  ],
  "Buyer Consultation Prep": [
    "Pull recent comps in their target area",
    "Prepare current market statistics",
    "Review their pre-approval letter",
    "Set up MLS auto-search alerts",
    "Prepare buyer's guide packet",
    "Research school district ratings",
    "Note any off-market opportunities",
    "Prepare questions to understand needs",
  ],
  "Closing Day Checklist": [
    "Confirm closing time and location with all parties",
    "Notify sellers/buyers of what to bring",
    "Arrange final walk-through 24 hours before",
    "Confirm wire transfer of funds",
    "Collect all keys, garage openers, and codes",
    "Ensure all contingencies are cleared",
    "Confirm title company has all documents",
    "Review HUD-1 settlement statement",
    "Arrange for utility transfers",
    "Set reminder for 30-day check-in call",
    "Request Google/Zillow review from client",
    "Send closing gift",
  ],
  "Weekly Lead Review": [
    "Review all new leads from past 7 days",
    "Follow up with leads not contacted in 3+ days",
    "Update pipeline stages for active deals",
    "Schedule showings for interested buyers",
    "Send market update to warm leads",
    "Review expired listings for opportunity",
  ],
};

let taskIdCounter = 100;

export default function TasksPage() {
  const [myTasks, setMyTasks] = useState<Task[]>([
    { id: 1, text: "Follow up with Sarah Johnson re: showing feedback", done: false },
    { id: 2, text: "Submit offer for Emily Rodriguez on 42 Oak Street", done: false },
    { id: 3, text: "Schedule professional photos for Maple Ave listing", done: true },
    { id: 4, text: "Send market report to Jennifer Lee", done: false },
  ]);
  const [newTaskText, setNewTaskText] = useState("");
  const [openTemplate, setOpenTemplate] = useState<string | null>(null);

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;
    setMyTasks((prev) => [...prev, { id: ++taskIdCounter, text: newTaskText.trim(), done: false }]);
    setNewTaskText("");
  };

  const toggleTask = (id: number) => {
    setMyTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  };

  const deleteTask = (id: number) => {
    setMyTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const useTemplate = (templateName: string) => {
    const tasks = templates[templateName].map((text) => ({
      id: ++taskIdCounter,
      text,
      done: false,
    }));
    setMyTasks((prev) => [...prev, ...tasks]);
  };

  const completed = myTasks.filter((t) => t.done).length;
  const total = myTasks.length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Admin Tasks & Templates</h1>
        <p className="page-subtitle">Manage your daily tasks and use reusable checklists</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Tasks */}
        <div className="space-y-4">
          <div className="card">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-base font-semibold text-slate-800 flex items-center gap-2">
                  <CheckSquare size={18} className="text-blue-500" /> My Tasks
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">{completed} of {total} completed</p>
              </div>
              {total > 0 && (
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-slate-100 rounded-full h-1.5">
                    <div
                      className="bg-blue-500 h-1.5 rounded-full transition-all duration-500"
                      style={{ width: `${total > 0 ? (completed / total) * 100 : 0}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium text-slate-500">
                    {total > 0 ? Math.round((completed / total) * 100) : 0}%
                  </span>
                </div>
              )}
            </div>

            {/* Add task */}
            <form onSubmit={addTask} className="flex gap-2 mb-5">
              <input
                className="form-input flex-1"
                placeholder="Add a new task..."
                value={newTaskText}
                onChange={(e) => setNewTaskText(e.target.value)}
              />
              <button type="submit" className="btn-primary py-2 px-3">
                <Plus size={16} />
              </button>
            </form>

            {/* Pending tasks */}
            <div className="space-y-1.5 mb-4">
              {myTasks.filter((t) => !t.done).map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 group transition-colors"
                >
                  <button
                    onClick={() => toggleTask(task.id)}
                    className="flex-shrink-0 text-slate-300 hover:text-blue-500 transition-colors"
                  >
                    <Circle size={20} />
                  </button>
                  <p className="text-sm text-slate-700 flex-1">{task.text}</p>
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="text-slate-200 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>

            {/* Completed tasks */}
            {myTasks.some((t) => t.done) && (
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Completed
                </p>
                <div className="space-y-1.5">
                  {myTasks.filter((t) => t.done).map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center gap-3 p-3 rounded-lg opacity-50 group"
                    >
                      <button
                        onClick={() => toggleTask(task.id)}
                        className="flex-shrink-0"
                      >
                        <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                          <Check size={11} className="text-white" strokeWidth={3} />
                        </div>
                      </button>
                      <p className="text-sm text-slate-500 line-through flex-1">{task.text}</p>
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="text-slate-200 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {myTasks.length === 0 && (
              <div className="text-center py-8">
                <CheckSquare size={32} className="text-slate-200 mx-auto mb-2" />
                <p className="text-slate-400 text-sm">No tasks yet. Add one above or use a template!</p>
              </div>
            )}
          </div>
        </div>

        {/* Templates */}
        <div className="space-y-4">
          <div className="card">
            <h2 className="text-base font-semibold text-slate-800 mb-1">Task Templates</h2>
            <p className="text-xs text-slate-400 mb-5">Click &ldquo;Use Template&rdquo; to load tasks into your list</p>

            <div className="space-y-3">
              {Object.entries(templates).map(([name, tasks]) => (
                <div key={name} className="border border-slate-100 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setOpenTemplate(openTemplate === name ? null : name)}
                    className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <CheckSquare size={15} className="text-blue-500" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{name}</p>
                        <p className="text-xs text-slate-400">{tasks.length} tasks</p>
                      </div>
                    </div>
                    {openTemplate === name ? (
                      <ChevronUp size={16} className="text-slate-400 flex-shrink-0" />
                    ) : (
                      <ChevronDown size={16} className="text-slate-400 flex-shrink-0" />
                    )}
                  </button>

                  {openTemplate === name && (
                    <div className="px-4 pb-4 fade-in">
                      <ul className="space-y-1.5 mb-4">
                        {tasks.map((task, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                            <span className="text-slate-300 mt-0.5 flex-shrink-0">
                              <Circle size={14} />
                            </span>
                            {task}
                          </li>
                        ))}
                      </ul>
                      <button
                        onClick={() => {
                          useTemplate(name);
                          setOpenTemplate(null);
                        }}
                        className="btn-primary w-full justify-center text-sm py-2"
                      >
                        <Plus size={14} /> Use This Template
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
