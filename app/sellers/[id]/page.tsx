'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Phone, Mail, Globe, MapPin, Building2,
  DollarSign, Users, Calendar, Edit2, Save, X,
  Sparkles, Plus, CheckSquare, Square, Trash2,
} from 'lucide-react'
import StatusBadge, { PriorityBadge } from '@/components/StatusBadge'
import OutreachModal from '@/components/OutreachModal'
import { SELLER_STATUSES, CA_COUNTIES, type Seller, type OutreachRecord, type Task } from '@/lib/types'
import { format, parseISO } from 'date-fns'
import toast from 'react-hot-toast'

function fmt$(n: number | null | undefined) {
  if (!n) return '—'
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
}

const CHANNEL_ICONS: Record<string, string> = {
  email: '📧', phone: '📞', sms: '💬', linkedin: '💼', direct_mail: '📬', in_person: '🤝',
}

export default function SellerDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [seller, setSeller] = useState<Seller | null>(null)
  const [outreach, setOutreach] = useState<OutreachRecord[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState<Partial<Seller>>({})
  const [saving, setSaving] = useState(false)
  const [showOutreach, setShowOutreach] = useState(false)
  const [newTask, setNewTask] = useState('')
  const [newTaskDue, setNewTaskDue] = useState('')

  async function load() {
    const res = await fetch(`/api/sellers/${params.id}`)
    if (!res.ok) { router.push('/sellers'); return }
    const data = await res.json()
    setSeller(data.seller)
    setForm(data.seller)
    setOutreach(data.outreach)
    setTasks(data.tasks)
  }

  useEffect(() => { load() }, [params.id])

  async function save() {
    setSaving(true)
    try {
      await fetch(`/api/sellers/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
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
      body: JSON.stringify({
        lead_type: 'seller', lead_id: params.id,
        lead_name: seller?.facility_name,
        title: newTask, due_at: newTaskDue || null,
      }),
    })
    setNewTask(''); setNewTaskDue('')
    load()
  }

  async function toggleTask(id: number, completed: boolean) {
    await fetch('/api/tasks', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, completed }),
    })
    load()
  }

  async function deleteSeller() {
    if (!confirm('Delete this seller lead? This cannot be undone.')) return
    await fetch(`/api/sellers/${params.id}`, { method: 'DELETE' })
    router.push('/sellers')
  }

  if (!seller) return (
    <div className="flex items-center justify-center h-full">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
    </div>
  )

  const f = editing ? form : seller
  const set = (k: keyof Seller, v: unknown) => setForm(prev => ({ ...prev, [k]: v }))

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/sellers" className="text-gray-400 hover:text-gray-600">
          <ArrowLeft size={20} />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold truncate">{seller.facility_name}</h1>
          <p className="text-gray-500 text-sm">{seller.owner_name || 'Owner unknown'} · Lic# {seller.license_number || 'N/A'}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <PriorityBadge priority={seller.priority} />
          <StatusBadge status={seller.status} type="seller" />
          <button onClick={() => setShowOutreach(true)} className="btn-primary flex items-center gap-2">
            <Sparkles size={14} />Outreach
          </button>
          {editing ? (
            <>
              <button onClick={save} disabled={saving} className="btn-primary flex items-center gap-2">
                <Save size={14} />{saving ? 'Saving…' : 'Save'}
              </button>
              <button onClick={() => { setEditing(false); setForm(seller) }} className="btn-secondary flex items-center gap-2">
                <X size={14} />Cancel
              </button>
            </>
          ) : (
            <button onClick={() => setEditing(true)} className="btn-secondary flex items-center gap-2">
              <Edit2 size={14} />Edit
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: Details */}
        <div className="lg:col-span-2 space-y-5">
          {/* Status & Priority row */}
          {editing && (
            <div className="card p-5 grid grid-cols-2 gap-4">
              <div>
                <label className="label">Status</label>
                <select className="select" value={f.status} onChange={e => set('status', e.target.value)}>
                  {SELLER_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Priority</label>
                <select className="select" value={f.priority} onChange={e => set('priority', e.target.value)}>
                  <option value="hot">Hot</option>
                  <option value="warm">Warm</option>
                  <option value="cold">Cold</option>
                </select>
              </div>
            </div>
          )}

          {/* Facility Info */}
          <div className="card p-5">
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <Building2 size={16} className="text-gray-500" />Facility Info
            </h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              {editing ? (
                <>
                  <Field label="Facility Name" value={f.facility_name ?? ''} onChange={v => set('facility_name', v)} />
                  <Field label="Owner Name" value={f.owner_name ?? ''} onChange={v => set('owner_name', v)} />
                  <Field label="License #" value={f.license_number ?? ''} onChange={v => set('license_number', v)} />
                  <FieldSelect label="Facility Type" value={f.facility_type ?? 'RCFE'} onChange={v => set('facility_type', v)} options={['RCFE','ARF','GH','Other']} />
                  <FieldSelect label="License Status" value={f.license_status ?? 'Active'} onChange={v => set('license_status', v)} options={['Active','Expired','Pending','Revoked']} />
                  <Field label="Reason for Selling" value={f.reason_for_selling ?? ''} onChange={v => set('reason_for_selling', v)} />
                </>
              ) : (
                <>
                  <InfoRow label="Facility Type" value={seller.facility_type} />
                  <InfoRow label="License Status" value={seller.license_status} />
                  <InfoRow label="Reason for Selling" value={seller.reason_for_selling} />
                </>
              )}
            </div>
          </div>

          {/* Location */}
          <div className="card p-5">
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <MapPin size={16} className="text-gray-500" />Location
            </h2>
            {editing ? (
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2"><Field label="Address" value={f.address ?? ''} onChange={v => set('address', v)} /></div>
                <Field label="City" value={f.city ?? ''} onChange={v => set('city', v)} />
                <div>
                  <label className="label">County</label>
                  <select className="select" value={f.county ?? ''} onChange={e => set('county', e.target.value)}>
                    <option value="">Select…</option>
                    {CA_COUNTIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <Field label="ZIP" value={f.zip ?? ''} onChange={v => set('zip', v)} />
              </div>
            ) : (
              <p className="text-sm text-gray-700">
                {[seller.address, seller.city, seller.county ? `${seller.county} County` : null, seller.state, seller.zip]
                  .filter(Boolean).join(', ') || 'No address on file'}
              </p>
            )}
          </div>

          {/* Operations & Financials */}
          <div className="card p-5">
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <DollarSign size={16} className="text-gray-500" />Operations & Financials
            </h2>
            {editing ? (
              <div className="grid grid-cols-3 gap-4">
                <FieldNumber label="Bed Capacity" value={f.bed_capacity ?? ''} onChange={v => set('bed_capacity', v)} />
                <FieldNumber label="Current Census" value={f.current_census ?? ''} onChange={v => set('current_census', v)} />
                <FieldNumber label="Years Operating" value={f.years_in_operation ?? ''} onChange={v => set('years_in_operation', v)} />
                <Field label="Asking Price ($)" value={f.asking_price?.toString() ?? ''} onChange={v => set('asking_price', parseFloat(v) || null)} />
                <Field label="Gross Revenue ($)" value={f.gross_revenue?.toString() ?? ''} onChange={v => set('gross_revenue', parseFloat(v) || null)} />
                <Field label="NOI ($)" value={f.noi?.toString() ?? ''} onChange={v => set('noi', parseFloat(v) || null)} />
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-4 text-sm">
                <InfoRow label="Bed Capacity" value={seller.bed_capacity?.toString()} />
                <InfoRow label="Current Census" value={seller.current_census?.toString()} />
                <InfoRow label="Occupancy" value={
                  seller.bed_capacity && seller.current_census
                    ? `${Math.round((seller.current_census / seller.bed_capacity) * 100)}%`
                    : undefined
                } />
                <InfoRow label="Asking Price" value={fmt$(seller.asking_price)} />
                <InfoRow label="Gross Revenue" value={fmt$(seller.gross_revenue)} />
                <InfoRow label="NOI" value={fmt$(seller.noi)} />
                {seller.asking_price && seller.noi && (
                  <InfoRow label="Cap Rate" value={`${((seller.noi / seller.asking_price) * 100).toFixed(1)}%`} />
                )}
                <InfoRow label="Years Operating" value={seller.years_in_operation?.toString()} />
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="card p-5">
            <h2 className="font-semibold mb-3">Notes</h2>
            {editing ? (
              <textarea
                className="input h-28 resize-none"
                value={f.notes ?? ''}
                onChange={e => set('notes', e.target.value)}
                placeholder="Add notes about this lead…"
              />
            ) : (
              <p className="text-sm text-gray-600 whitespace-pre-wrap">{seller.notes || 'No notes.'}</p>
            )}
          </div>
        </div>

        {/* Right: Contact, Tasks, Outreach */}
        <div className="space-y-5">
          {/* Contact */}
          <div className="card p-5">
            <h2 className="font-semibold mb-4">Contact</h2>
            {editing ? (
              <div className="space-y-3">
                <Field label="Phone" value={f.phone ?? ''} onChange={v => set('phone', v)} />
                <Field label="Email" value={f.email ?? ''} onChange={v => set('email', v)} />
                <Field label="Website" value={f.website ?? ''} onChange={v => set('website', v)} />
                <div>
                  <label className="label">Follow-up Date</label>
                  <input type="date" className="input" value={f.next_follow_up_at ?? ''} onChange={e => set('next_follow_up_at', e.target.value)} />
                </div>
              </div>
            ) : (
              <div className="space-y-2 text-sm">
                {seller.phone && (
                  <a href={`tel:${seller.phone}`} className="flex items-center gap-2 text-blue-600 hover:text-blue-800">
                    <Phone size={14} />{seller.phone}
                  </a>
                )}
                {seller.email && (
                  <a href={`mailto:${seller.email}`} className="flex items-center gap-2 text-blue-600 hover:text-blue-800">
                    <Mail size={14} />{seller.email}
                  </a>
                )}
                {seller.website && (
                  <a href={seller.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-600 hover:text-blue-800">
                    <Globe size={14} />{seller.website}
                  </a>
                )}
                {!seller.phone && !seller.email && <p className="text-gray-400">No contact info</p>}
                {seller.next_follow_up_at && (
                  <div className="flex items-center gap-2 text-orange-600 mt-3 border-t pt-3">
                    <Calendar size={14} />
                    <span>Follow up: {format(parseISO(seller.next_follow_up_at), 'MMM d, yyyy')}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* CRM Metadata */}
          <div className="card p-5 text-xs text-gray-500 space-y-1.5">
            <div className="flex justify-between"><span>Outreach count</span><span className="font-semibold text-gray-800">{seller.outreach_count}</span></div>
            <div className="flex justify-between"><span>Last contacted</span><span>{seller.last_contacted_at ? format(parseISO(seller.last_contacted_at), 'MMM d') : '—'}</span></div>
            <div className="flex justify-between"><span>Source</span><span>{seller.source}</span></div>
            <div className="flex justify-between"><span>Added</span><span>{format(parseISO(seller.created_at), 'MMM d, yyyy')}</span></div>
          </div>

          {/* Tasks */}
          <div className="card p-5">
            <h2 className="font-semibold mb-3 flex items-center gap-2">
              <CheckSquare size={15} className="text-gray-500" />Tasks
            </h2>
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
              <input
                className="input flex-1 text-xs"
                placeholder="Add task…"
                value={newTask}
                onChange={e => setNewTask(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addTask()}
              />
              <input type="date" className="input w-28 text-xs" value={newTaskDue} onChange={e => setNewTaskDue(e.target.value)} />
              <button onClick={addTask} className="btn-secondary p-2"><Plus size={14} /></button>
            </div>
          </div>

          {/* Danger zone */}
          <div className="card p-5 border-red-200">
            <button onClick={deleteSeller} className="text-red-600 hover:text-red-800 text-sm flex items-center gap-2">
              <Trash2 size={14} />Delete seller lead
            </button>
          </div>
        </div>
      </div>

      {/* Outreach History */}
      <div className="card">
        <div className="px-5 py-4 border-b flex items-center justify-between">
          <h2 className="font-semibold">Outreach History</h2>
          <button onClick={() => setShowOutreach(true)} className="btn-primary flex items-center gap-2 text-xs py-1.5">
            <Sparkles size={12} />New Outreach
          </button>
        </div>
        <div className="divide-y divide-gray-100">
          {outreach.length === 0 ? (
            <div className="px-5 py-6 text-center text-gray-400 text-sm">No outreach logged yet.</div>
          ) : (
            outreach.map(o => (
              <div key={o.id} className="px-5 py-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm">
                    {CHANNEL_ICONS[o.channel]} {o.channel.charAt(0).toUpperCase() + o.channel.slice(1)}
                    {o.subject && ` – ${o.subject}`}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      o.status === 'replied' ? 'bg-green-100 text-green-700' :
                      o.status === 'bounced' ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>{o.status}</span>
                    <span className="text-xs text-gray-400">
                      {o.sent_at ? format(parseISO(o.sent_at), 'MMM d, yyyy') : format(parseISO(o.created_at), 'MMM d, yyyy')}
                    </span>
                  </div>
                </div>
                {o.message && (
                  <p className="text-xs text-gray-500 line-clamp-2 font-mono">{o.message}</p>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {showOutreach && (
        <OutreachModal seller={seller} onClose={() => setShowOutreach(false)} onSent={load} />
      )}
    </div>
  )
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="label">{label}</label>
      <input className="input" value={value} onChange={e => onChange(e.target.value)} />
    </div>
  )
}

function FieldNumber({ label, value, onChange }: { label: string; value: string | number; onChange: (v: number | null) => void }) {
  return (
    <div>
      <label className="label">{label}</label>
      <input className="input" type="number" value={value} onChange={e => onChange(e.target.value ? parseInt(e.target.value) : null)} />
    </div>
  )
}

function FieldSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <div>
      <label className="label">{label}</label>
      <select className="select" value={value} onChange={e => onChange(e.target.value)}>
        {options.map(o => <option key={o}>{o}</option>)}
      </select>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="font-medium text-gray-800">{value || '—'}</p>
    </div>
  )
}
