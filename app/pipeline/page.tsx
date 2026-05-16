'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { CheckSquare, Square, Clock, Building2, ArrowRight, RefreshCw } from 'lucide-react'
import { SELLER_STATUSES, type Seller, type Task } from '@/lib/types'
import { format, parseISO, isPast, isToday } from 'date-fns'
import toast from 'react-hot-toast'

function fmt$(n: number | null | undefined) {
  if (!n) return '—'
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
}

const PIPELINE_STAGES = SELLER_STATUSES.filter(s =>
  !['closed_won', 'closed_lost', 'not_interested'].includes(s.value)
)

export default function PipelinePage() {
  const [sellers, setSellers] = useState<Seller[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<'kanban' | 'tasks'>('kanban')

  async function load() {
    setLoading(true)
    const [sellersRes, tasksRes] = await Promise.all([
      fetch('/api/sellers'),
      fetch('/api/tasks?completed=false'),
    ])
    setSellers(await sellersRes.json())
    setTasks(await tasksRes.json())
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function moveSeller(sellerId: number, newStatus: string) {
    await fetch(`/api/sellers/${sellerId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })
    setSellers(prev => prev.map(s => s.id === sellerId ? { ...s, status: newStatus as Seller['status'] } : s))
    toast.success('Status updated')
  }

  async function toggleTask(id: number, completed: boolean) {
    await fetch('/api/tasks', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, completed }),
    })
    setTasks(prev => prev.filter(t => t.id !== id))
    toast.success(completed ? 'Task completed!' : 'Task reopened')
  }

  const activeStages = PIPELINE_STAGES

  const groupedByStage = activeStages.map(stage => ({
    ...stage,
    sellers: sellers.filter(s => s.status === stage.value),
  }))

  const overdueTasks = tasks.filter(t => t.due_at && isPast(parseISO(t.due_at)) && !isToday(parseISO(t.due_at)))
  const todayTasks = tasks.filter(t => t.due_at && isToday(parseISO(t.due_at)))
  const upcomingTasks = tasks.filter(t => t.due_at && !isPast(parseISO(t.due_at)) && !isToday(parseISO(t.due_at)))
  const noDateTasks = tasks.filter(t => !t.due_at)

  return (
    <div className="p-6 space-y-5 h-full flex flex-col max-w-full">
      {/* Header */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-2xl font-bold">Pipeline</h1>
          <p className="text-gray-500 text-sm">{sellers.filter(s => !['closed_won','closed_lost','not_interested'].includes(s.status)).length} active deals · {tasks.length} open tasks</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-gray-300 overflow-hidden">
            {(['kanban', 'tasks'] as const).map(v => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-4 py-2 text-sm font-medium transition-colors ${view === v ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
              >
                {v === 'kanban' ? 'Kanban' : 'Tasks'}
              </button>
            ))}
          </div>
          <button onClick={load} className="btn-secondary flex items-center gap-1.5">
            <RefreshCw size={13} />Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      ) : view === 'kanban' ? (
        // Kanban Board
        <div className="flex gap-4 overflow-x-auto pb-4 flex-1">
          {groupedByStage.map(stage => (
            <div key={stage.value} className="flex-shrink-0 w-64 flex flex-col">
              {/* Stage header */}
              <div className={`px-3 py-2 rounded-t-xl text-xs font-semibold uppercase tracking-wide flex items-center justify-between ${stage.color}`}>
                <span>{stage.label}</span>
                <span className="bg-white/60 px-1.5 py-0.5 rounded-full">{stage.sellers.length}</span>
              </div>
              {/* Cards */}
              <div className="flex-1 space-y-2 bg-gray-100 rounded-b-xl p-2 min-h-[200px]">
                {stage.sellers.length === 0 && (
                  <div className="text-xs text-gray-400 text-center py-6">No leads</div>
                )}
                {stage.sellers.map(seller => (
                  <div key={seller.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 group">
                    <div className="flex items-start justify-between mb-1.5">
                      <Link href={`/sellers/${seller.id}`} className="font-medium text-sm hover:text-blue-600 leading-tight">
                        {seller.facility_name}
                      </Link>
                      <span className={`text-xs px-1.5 py-0.5 rounded-full flex-shrink-0 ml-1 ${
                        seller.priority === 'hot' ? 'bg-red-100 text-red-600' :
                        seller.priority === 'warm' ? 'bg-orange-100 text-orange-600' :
                        'bg-blue-100 text-blue-600'
                      }`}>
                        {seller.priority === 'hot' ? '🔥' : seller.priority === 'warm' ? '☀️' : '❄️'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">{seller.city}{seller.county ? `, ${seller.county}` : ''}</p>
                    {(seller.bed_capacity || seller.asking_price) && (
                      <div className="flex items-center gap-2 mt-1.5 text-xs text-gray-600">
                        {seller.bed_capacity && <span><Building2 size={10} className="inline mr-0.5" />{seller.bed_capacity} beds</span>}
                        {seller.asking_price && <span className="font-semibold text-gray-800">{fmt$(seller.asking_price)}</span>}
                      </div>
                    )}
                    {/* Move buttons */}
                    <div className="flex gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {activeStages.filter(s => s.value !== stage.value).map(s => (
                        <button
                          key={s.value}
                          onClick={() => moveSeller(seller.id, s.value)}
                          className="flex-1 text-xs py-1 rounded bg-gray-100 hover:bg-blue-100 hover:text-blue-700 transition-colors truncate px-1"
                          title={`Move to ${s.label}`}
                        >
                          <ArrowRight size={10} className="inline mr-0.5" />{s.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Closed Column */}
          <div className="flex-shrink-0 w-64 flex flex-col">
            <div className="px-3 py-2 rounded-t-xl text-xs font-semibold uppercase tracking-wide bg-green-100 text-green-700 flex items-center justify-between">
              <span>Closed Won</span>
              <span className="bg-white/60 px-1.5 py-0.5 rounded-full">{sellers.filter(s => s.status === 'closed_won').length}</span>
            </div>
            <div className="flex-1 space-y-2 bg-gray-100 rounded-b-xl p-2 min-h-[200px]">
              {sellers.filter(s => s.status === 'closed_won').map(seller => (
                <div key={seller.id} className="bg-white rounded-xl shadow-sm border border-green-200 p-3">
                  <Link href={`/sellers/${seller.id}`} className="font-medium text-sm hover:text-blue-600 block">
                    {seller.facility_name}
                  </Link>
                  <p className="text-xs text-gray-500">{seller.city}</p>
                  {seller.asking_price && <p className="text-xs font-semibold text-green-600 mt-1">{fmt$(seller.asking_price)}</p>}
                </div>
              ))}
              {sellers.filter(s => s.status === 'closed_won').length === 0 && (
                <div className="text-xs text-gray-400 text-center py-6">No closed deals yet</div>
              )}
            </div>
          </div>
        </div>
      ) : (
        // Tasks View
        <div className="space-y-5 flex-1 overflow-auto">
          {overdueTasks.length > 0 && (
            <TaskSection title="Overdue" tasks={overdueTasks} color="text-red-600" onToggle={toggleTask} />
          )}
          {todayTasks.length > 0 && (
            <TaskSection title="Due Today" tasks={todayTasks} color="text-orange-600" onToggle={toggleTask} />
          )}
          {upcomingTasks.length > 0 && (
            <TaskSection title="Upcoming" tasks={upcomingTasks} color="text-blue-600" onToggle={toggleTask} />
          )}
          {noDateTasks.length > 0 && (
            <TaskSection title="No Due Date" tasks={noDateTasks} color="text-gray-500" onToggle={toggleTask} />
          )}
          {tasks.length === 0 && (
            <div className="card p-10 text-center text-gray-400">
              <CheckSquare size={32} className="mx-auto mb-2 text-gray-300" />
              <p>No open tasks. Add tasks from individual seller or buyer profiles.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function TaskSection({
  title, tasks, color, onToggle,
}: {
  title: string
  tasks: Task[]
  color: string
  onToggle: (id: number, completed: boolean) => void
}) {
  return (
    <div className="card">
      <div className={`px-5 py-3 border-b font-semibold text-sm flex items-center gap-2 ${color}`}>
        <Clock size={14} />{title} ({tasks.length})
      </div>
      <div className="divide-y divide-gray-100">
        {tasks.map(task => (
          <div key={task.id} className="flex items-center gap-3 px-5 py-3">
            <button onClick={() => onToggle(task.id, true)} className="flex-shrink-0 text-gray-400 hover:text-green-500 transition-colors">
              <Square size={16} />
            </button>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{task.title}</p>
              {task.lead_name && (
                <Link
                  href={`/${task.lead_type === 'seller' ? 'sellers' : 'buyers'}/${task.lead_id}`}
                  className="text-xs text-blue-500 hover:text-blue-700"
                >
                  {task.lead_name}
                </Link>
              )}
            </div>
            <div className="flex-shrink-0 text-right">
              <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${
                task.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                task.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                'bg-gray-100 text-gray-600'
              }`}>{task.priority}</span>
              {task.due_at && (
                <p className="text-xs text-gray-400 mt-0.5">{format(parseISO(task.due_at), 'MMM d')}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
