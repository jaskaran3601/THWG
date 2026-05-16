'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Phone, Mail, Edit2, Save, X, Trash2, Plus, CheckSquare, Square } from 'lucide-react'
import StatusBadge from '@/components/StatusBadge'
import { BUYER_STATUSES, CA_COUNTIES, type Buyer, type OutreachRecord, type Task } from '@/lib/types'
import { format, parseISO } from 'date-fns'
import toast from 'react-hot-toast'

function fmt$(n: number | null | undefined) {
  if (!n) return '—'
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
}

export default function BuyerDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [buyer, setBuyer] = useState<Buyer | null>(null)
  const [outreach, setOutreach] = useState<OutreachRecord[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState<Partial<Buyer & { preferred_counties_arr: string[]; facility_types_arr: string[] }>>({})
  const [saving, setSaving] = useState(false)
  const [newTask, setNewTask] = useState('')
  const [newTaskDue, setNewTaskDue] = useState('')

  async function load() {
    const res = await fetch(`/api/buyers/${params.id}`)
    if (!res.ok) { router.push('/buyers'); return }
    const data = await res.json()
    const b = data.buyer as Buyer
    setBuyer(b)
    setForm({
      ...b,
      preferred_counties_arr: JSON.parse(b.preferred_counties || '[]'),
      facility_types_arr: JSON.parse(b.facility_types || '["RCFE"]'),
    })
    setOutreach(data.outreach)
    setTasks(data.tasks)
  }

  useEffect(() => { load() }, [params.id])

  async function save() {
    setSaving(true)
    try {
      const payload = {
        ...form,
        preferred_counties: JSON.stringify(form.preferred_counties_arr ?? []),
        facility_types: JSON.stringify(form.facility_types_arr ?? ['RCFE']),
      }
      delete (payload as Record<string, unknown>).preferred_counties_arr
      delete (payload as Record<string, unknown>).facility_types_arr
      await fetch(`/api/buyers/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      await load()
      setEditing(false)
      toast.success('Saved!')
    } catch {
      toast.error('Failed to save')
    } finally {
      setSaving(false)
    }
  }

  async function addTask() {
    if (!newTask.trim()) return
    await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lead_type: 'buyer', lead_id: params.id, lead_name: buyer?.contact_name, title: newTask, due_at: newTaskDue || null }),
    })
    setNewTask(''); setNewTaskDue('')
    load()
  }

  async function toggleTask(id: number, completed: boolean) {
    await fetch('/api/tasks', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, completed }) })
    load()
  }

  async function deleteBuyer() {
    if (!confirm('Delete this buyer lead?')) return
    await fetch(`/api/buyers/${params.id}`, { method: 'DELETE' })
    router.push('/buyers')
  }

  if (!buyer) return <div className="flex items-center justify-center h-full"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>

  const counties = JSON.parse(buyer.preferred_counties || '[]') as string[]
  const types = JSON.parse(buyer.facility_types || '["RCFE"]') as string[]
  const f = form

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-5">
      <div className="flex items-center gap-4">
        <Link href="/buyers" className="text-gray-400 hover:text-gray-600"><ArrowLeft size={20} /></Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold">{buyer.contact_name}</h1>
          <p className="text-gray-500 text-sm">{buyer.company || 'Individual buyer'}</p>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={buyer.status} type="buyer" />
          {editing ? (
            <>
              <button onClick={save} disabled={saving} className="btn-primary flex items-center gap-2"><Save size={14} />{saving ? 'Saving…' : 'Save'}</button>
              <button onClick={() => { setEditing(false); setForm(buyer) }} className="btn-secondary flex items-center gap-2"><X size={14} />Cancel</button>
            </>
          ) : (
            <button onClick={() => setEditing(true)} className="btn-secondary flex items-center gap-2"><Edit2 size={14} />Edit</button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          {editing && (
            <div className="card p-5">
              <label className="label">Status</label>
              <select className="select" value={f.status} onChange={e => setForm(p => ({...p, status: e.target.value as Buyer['status']}))}>
                {BUYER_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
          )}

          {/* Buying Criteria */}
          <div className="card p-5">
            <h2 className="font-semibold mb-4">Buying Criteria</h2>
            {editing ? (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Budget Min ($)</label>
                  <input className="input" value={f.budget_min ?? ''} onChange={e => setForm(p => ({...p, budget_min: parseFloat(e.target.value) || undefined}))} />
                </div>
                <div>
                  <label className="label">Budget Max ($)</label>
                  <input className="input" value={f.budget_max ?? ''} onChange={e => setForm(p => ({...p, budget_max: parseFloat(e.target.value) || undefined}))} />
                </div>
                <div>
                  <label className="label">Min Beds</label>
                  <input type="number" className="input" value={f.min_beds ?? ''} onChange={e => setForm(p => ({...p, min_beds: parseInt(e.target.value) || undefined}))} />
                </div>
                <div>
                  <label className="label">Max Beds</label>
                  <input type="number" className="input" value={f.max_beds ?? ''} onChange={e => setForm(p => ({...p, max_beds: parseInt(e.target.value) || undefined}))} />
                </div>
                <div>
                  <label className="label">Timeline</label>
                  <select className="select" value={f.timeline ?? '6_months'} onChange={e => setForm(p => ({...p, timeline: e.target.value}))}>
                    <option value="immediate">Immediate</option><option value="3_months">3 Months</option>
                    <option value="6_months">6 Months</option><option value="1_year">1 Year</option><option value="flexible">Flexible</option>
                  </select>
                </div>
                <div>
                  <label className="label">Experience</label>
                  <select className="select" value={f.experience_level ?? 'first_time'} onChange={e => setForm(p => ({...p, experience_level: e.target.value}))}>
                    <option value="first_time">First-Time</option><option value="experienced">Experienced</option><option value="operator">Current Operator</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="label">Preferred Counties (hold Ctrl/Cmd for multiple)</label>
                  <select
                    className="select" multiple size={4}
                    value={f.preferred_counties_arr ?? []}
                    onChange={e => setForm(p => ({...p, preferred_counties_arr: Array.from(e.target.selectedOptions, o => o.value)}))}
                  >
                    {CA_COUNTIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><p className="text-xs text-gray-500">Budget Range</p><p className="font-medium">{fmt$(buyer.budget_min)} – {fmt$(buyer.budget_max)}</p></div>
                <div><p className="text-xs text-gray-500">Bed Range</p><p className="font-medium">{buyer.min_beds ?? 'Any'} – {buyer.max_beds ?? 'Any'} beds</p></div>
                <div><p className="text-xs text-gray-500">Timeline</p><p className="font-medium">{buyer.timeline?.replace('_', ' ')}</p></div>
                <div><p className="text-xs text-gray-500">Experience</p><p className="font-medium">{buyer.experience_level?.replace('_', ' ')}</p></div>
                <div className="col-span-2"><p className="text-xs text-gray-500">Preferred Counties</p><p className="font-medium">{counties.length > 0 ? counties.join(', ') : 'Any'}</p></div>
                <div className="col-span-2"><p className="text-xs text-gray-500">Facility Types</p><p className="font-medium">{types.join(', ')}</p></div>
              </div>
            )}
          </div>

          {/* Financing */}
          <div className="card p-5">
            <h2 className="font-semibold mb-4">Financing</h2>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div><p className="text-xs text-gray-500">Type</p><p className="font-medium uppercase">{buyer.financing_type}</p></div>
              <div>
                <p className="text-xs text-gray-500">Pre-approved</p>
                <p className={`font-medium ${buyer.financing_pre_approved ? 'text-green-600' : 'text-gray-500'}`}>
                  {buyer.financing_pre_approved ? 'Yes ✓' : 'No'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Proof of Funds</p>
                <p className={`font-medium ${buyer.proof_of_funds ? 'text-green-600' : 'text-gray-500'}`}>
                  {buyer.proof_of_funds ? 'Provided ✓' : 'Not yet'}
                </p>
              </div>
            </div>
          </div>

          <div className="card p-5">
            <h2 className="font-semibold mb-3">Notes</h2>
            {editing ? (
              <textarea className="input h-24 resize-none" value={f.notes ?? ''} onChange={e => setForm(p => ({...p, notes: e.target.value}))} />
            ) : (
              <p className="text-sm text-gray-600 whitespace-pre-wrap">{buyer.notes || 'No notes.'}</p>
            )}
          </div>
        </div>

        <div className="space-y-5">
          <div className="card p-5">
            <h2 className="font-semibold mb-4">Contact</h2>
            {buyer.phone && <a href={`tel:${buyer.phone}`} className="flex items-center gap-2 text-blue-600 text-sm mb-2"><Phone size={14} />{buyer.phone}</a>}
            {buyer.email && <a href={`mailto:${buyer.email}`} className="flex items-center gap-2 text-blue-600 text-sm"><Mail size={14} />{buyer.email}</a>}
            {!buyer.phone && !buyer.email && <p className="text-gray-400 text-sm">No contact info</p>}
          </div>

          <div className="card p-5 text-xs text-gray-500 space-y-1.5">
            <div className="flex justify-between"><span>Source</span><span>{buyer.source}</span></div>
            <div className="flex justify-between"><span>Added</span><span>{format(parseISO(buyer.created_at), 'MMM d, yyyy')}</span></div>
          </div>

          {/* Tasks */}
          <div className="card p-5">
            <h2 className="font-semibold mb-3">Tasks</h2>
            <div className="space-y-2 mb-3">
              {tasks.length === 0 && <p className="text-xs text-gray-400">No tasks yet.</p>}
              {tasks.map(t => (
                <div key={t.id} className={`flex items-start gap-2 text-sm ${t.completed ? 'opacity-50' : ''}`}>
                  <button onClick={() => toggleTask(t.id, !t.completed)} className="mt-0.5 flex-shrink-0">
                    {t.completed ? <CheckSquare size={15} className="text-green-500" /> : <Square size={15} className="text-gray-400" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className={t.completed ? 'line-through text-gray-400' : ''}>{t.title}</p>
                    {t.due_at && <p className="text-xs text-orange-500">{format(parseISO(t.due_at), 'MMM d')}</p>}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input className="input flex-1 text-xs" placeholder="Add task…" value={newTask} onChange={e => setNewTask(e.target.value)} onKeyDown={e => e.key === 'Enter' && addTask()} />
              <input type="date" className="input w-28 text-xs" value={newTaskDue} onChange={e => setNewTaskDue(e.target.value)} />
              <button onClick={addTask} className="btn-secondary p-2"><Plus size={14} /></button>
            </div>
          </div>

          <div className="card p-5">
            <button onClick={deleteBuyer} className="text-red-600 hover:text-red-800 text-sm flex items-center gap-2"><Trash2 size={14} />Delete buyer lead</button>
          </div>
        </div>
      </div>
    </div>
  )
}
