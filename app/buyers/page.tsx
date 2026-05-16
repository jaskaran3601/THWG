'use client'
import { useEffect, useState, useCallback } from 'react'
import { Plus, Search, Phone, Mail, ChevronRight, RefreshCw, UserCheck } from 'lucide-react'
import StatusBadge from '@/components/StatusBadge'
import { BUYER_STATUSES, CA_COUNTIES, type Buyer } from '@/lib/types'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { format, parseISO } from 'date-fns'

function fmt$(n: number | null | undefined) {
  if (!n) return '—'
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
}

const TIMELINES: Record<string, string> = {
  immediate: 'Immediate', '3_months': '3 Months', '6_months': '6 Months', '1_year': '1 Year', flexible: 'Flexible',
}
const EXPERIENCE: Record<string, string> = {
  first_time: 'First-Time', experienced: 'Experienced', operator: 'Current Operator',
}

export default function BuyersPage() {
  const [buyers, setBuyers] = useState<Buyer[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({
    contact_name: '', company: '', phone: '', email: '',
    budget_min: '', budget_max: '', preferred_counties: [] as string[],
    min_beds: '', max_beds: '', timeline: '6_months',
    experience_level: 'first_time', financing_type: 'sba',
    financing_pre_approved: false, proof_of_funds: false,
    source: 'manual', notes: '', next_follow_up_at: '',
  })

  const load = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (filterStatus) params.set('status', filterStatus)
    const res = await fetch(`/api/buyers?${params}`)
    setBuyers(await res.json())
    setLoading(false)
  }, [search, filterStatus])

  useEffect(() => { load() }, [load])

  async function addBuyer() {
    if (!form.contact_name.trim()) { toast.error('Contact name required'); return }
    const res = await fetch('/api/buyers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        budget_min: form.budget_min ? parseFloat(form.budget_min.replace(/,/g, '')) : null,
        budget_max: form.budget_max ? parseFloat(form.budget_max.replace(/,/g, '')) : null,
        min_beds: form.min_beds ? parseInt(form.min_beds) : null,
        max_beds: form.max_beds ? parseInt(form.max_beds) : null,
        financing_pre_approved: form.financing_pre_approved ? 1 : 0,
        proof_of_funds: form.proof_of_funds ? 1 : 0,
      }),
    })
    if (!res.ok) { toast.error('Failed to add buyer'); return }
    toast.success('Buyer added!')
    setShowAdd(false)
    setForm({ contact_name: '', company: '', phone: '', email: '', budget_min: '', budget_max: '', preferred_counties: [], min_beds: '', max_beds: '', timeline: '6_months', experience_level: 'first_time', financing_type: 'sba', financing_pre_approved: false, proof_of_funds: false, source: 'manual', notes: '', next_follow_up_at: '' })
    load()
  }

  return (
    <div className="p-6 space-y-5 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Buyer Leads</h1>
          <p className="text-gray-500 text-sm">Investors &amp; operators looking to acquire RCFEs</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary flex items-center gap-2">
          <Plus size={14} />Add Buyer
        </button>
      </div>

      <div className="flex gap-3 items-center flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input className="input pl-9" placeholder="Search name, company, email…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="select w-40" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">All Statuses</option>
          {BUYER_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
        <button onClick={load} className="btn-secondary flex items-center gap-1.5"><RefreshCw size={13} />Refresh</button>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Buyer</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Budget</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Counties</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Beds</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Timeline</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Experience</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Financing</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} className="px-5 py-10 text-center text-gray-400">Loading…</td></tr>
              ) : buyers.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-5 py-10 text-center text-gray-400">
                    <UserCheck size={32} className="mx-auto mb-2 text-gray-300" />
                    <p>No buyer leads yet.</p>
                    <button onClick={() => setShowAdd(true)} className="text-blue-600 hover:underline text-sm mt-2 block mx-auto">Add your first buyer →</button>
                  </td>
                </tr>
              ) : buyers.map(b => {
                const counties = JSON.parse(b.preferred_counties || '[]') as string[]
                return (
                  <tr key={b.id} className="table-row">
                    <td className="px-5 py-3">
                      <Link href={`/buyers/${b.id}`} className="font-medium hover:text-blue-600 transition-colors block">
                        {b.contact_name}
                      </Link>
                      {b.company && <p className="text-xs text-gray-400">{b.company}</p>}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {b.budget_min || b.budget_max
                        ? `${fmt$(b.budget_min)} – ${fmt$(b.budget_max)}`
                        : '—'}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600">
                      {counties.length > 0 ? counties.slice(0, 2).join(', ') + (counties.length > 2 ? ` +${counties.length - 2}` : '') : '—'}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {b.min_beds || b.max_beds ? `${b.min_beds ?? 'Any'} – ${b.max_beds ?? 'Any'}` : '—'}
                    </td>
                    <td className="px-4 py-3 text-xs">{TIMELINES[b.timeline] ?? b.timeline}</td>
                    <td className="px-4 py-3 text-xs">{EXPERIENCE[b.experience_level] ?? b.experience_level}</td>
                    <td className="px-4 py-3 text-xs">
                      <span className={`px-2 py-0.5 rounded-full font-medium ${b.financing_pre_approved ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {b.financing_type?.toUpperCase()} {b.financing_pre_approved ? '✓' : ''}
                      </span>
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={b.status} type="buyer" /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {b.phone && <a href={`tel:${b.phone}`} className="text-gray-400 hover:text-blue-600"><Phone size={13} /></a>}
                        {b.email && <a href={`mailto:${b.email}`} className="text-gray-400 hover:text-blue-600"><Mail size={13} /></a>}
                        <Link href={`/buyers/${b.id}`} className="text-gray-400 hover:text-blue-600"><ChevronRight size={15} /></Link>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Buyer Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="font-bold text-lg">Add Buyer Lead</h2>
              <button onClick={() => setShowAdd(false)}><ChevronRight size={20} className="text-gray-400 rotate-180" /></button>
            </div>
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="label">Contact Name *</label>
                  <input className="input" value={form.contact_name} onChange={e => setForm(f => ({...f, contact_name: e.target.value}))} placeholder="Jane Smith" />
                </div>
                <div>
                  <label className="label">Company</label>
                  <input className="input" value={form.company} onChange={e => setForm(f => ({...f, company: e.target.value}))} placeholder="Smith Investments" />
                </div>
                <div>
                  <label className="label">Source</label>
                  <select className="select" value={form.source} onChange={e => setForm(f => ({...f, source: e.target.value}))}>
                    <option value="manual">Manual</option>
                    <option value="referral">Referral</option>
                    <option value="cold_outreach">Cold Outreach</option>
                    <option value="web_form">Web Form</option>
                  </select>
                </div>
                <div>
                  <label className="label">Phone</label>
                  <input className="input" value={form.phone} onChange={e => setForm(f => ({...f, phone: e.target.value}))} placeholder="(555) 000-0000" />
                </div>
                <div>
                  <label className="label">Email</label>
                  <input className="input" value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} placeholder="jane@example.com" />
                </div>
                <div>
                  <label className="label">Budget Min ($)</label>
                  <input className="input" value={form.budget_min} onChange={e => setForm(f => ({...f, budget_min: e.target.value}))} placeholder="400,000" />
                </div>
                <div>
                  <label className="label">Budget Max ($)</label>
                  <input className="input" value={form.budget_max} onChange={e => setForm(f => ({...f, budget_max: e.target.value}))} placeholder="1,200,000" />
                </div>
                <div>
                  <label className="label">Min Beds</label>
                  <input className="input" type="number" value={form.min_beds} onChange={e => setForm(f => ({...f, min_beds: e.target.value}))} placeholder="6" />
                </div>
                <div>
                  <label className="label">Max Beds</label>
                  <input className="input" type="number" value={form.max_beds} onChange={e => setForm(f => ({...f, max_beds: e.target.value}))} placeholder="100" />
                </div>
                <div>
                  <label className="label">Timeline</label>
                  <select className="select" value={form.timeline} onChange={e => setForm(f => ({...f, timeline: e.target.value}))}>
                    <option value="immediate">Immediate</option>
                    <option value="3_months">3 Months</option>
                    <option value="6_months">6 Months</option>
                    <option value="1_year">1 Year</option>
                    <option value="flexible">Flexible</option>
                  </select>
                </div>
                <div>
                  <label className="label">Experience Level</label>
                  <select className="select" value={form.experience_level} onChange={e => setForm(f => ({...f, experience_level: e.target.value}))}>
                    <option value="first_time">First-Time Buyer</option>
                    <option value="experienced">Experienced Investor</option>
                    <option value="operator">Current Operator</option>
                  </select>
                </div>
                <div>
                  <label className="label">Financing Type</label>
                  <select className="select" value={form.financing_type} onChange={e => setForm(f => ({...f, financing_type: e.target.value}))}>
                    <option value="sba">SBA Loan</option>
                    <option value="cash">All Cash</option>
                    <option value="conventional">Conventional</option>
                    <option value="seller_financing">Seller Financing</option>
                  </select>
                </div>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" checked={form.financing_pre_approved} onChange={e => setForm(f => ({...f, financing_pre_approved: e.target.checked}))} />
                    Pre-approved
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" checked={form.proof_of_funds} onChange={e => setForm(f => ({...f, proof_of_funds: e.target.checked}))} />
                    Proof of funds
                  </label>
                </div>
                <div>
                  <label className="label">Preferred Counties</label>
                  <select
                    className="select"
                    multiple
                    size={4}
                    value={form.preferred_counties}
                    onChange={e => setForm(f => ({...f, preferred_counties: Array.from(e.target.selectedOptions, o => o.value)}))}
                  >
                    {CA_COUNTIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                  <p className="text-xs text-gray-400 mt-1">Hold Ctrl/Cmd to select multiple</p>
                </div>
                <div>
                  <label className="label">Follow-up Date</label>
                  <input type="date" className="input" value={form.next_follow_up_at} onChange={e => setForm(f => ({...f, next_follow_up_at: e.target.value}))} />
                  <div className="mt-3">
                    <label className="label">Notes</label>
                    <textarea className="input h-20 resize-none" value={form.notes} onChange={e => setForm(f => ({...f, notes: e.target.value}))} placeholder="Additional notes…" />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t bg-gray-50 rounded-b-2xl">
              <button onClick={() => setShowAdd(false)} className="btn-secondary">Cancel</button>
              <button onClick={addBuyer} className="btn-primary">Add Buyer Lead</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
