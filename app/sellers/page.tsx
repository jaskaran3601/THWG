'use client'
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import {
  Plus, Upload, Search, Filter, Phone, Mail,
  Building2, Flame, ChevronRight, RefreshCw, Sparkles,
} from 'lucide-react'
import StatusBadge, { PriorityBadge } from '@/components/StatusBadge'
import AddSellerModal from '@/components/AddSellerModal'
import ImportModal from '@/components/ImportModal'
import OutreachModal from '@/components/OutreachModal'
import { SELLER_STATUSES, CA_COUNTIES, type Seller } from '@/lib/types'
import { format, parseISO } from 'date-fns'

function fmt$(n: number | null | undefined) {
  if (!n) return '—'
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
}

export default function SellersPage() {
  const [sellers, setSellers] = useState<Seller[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterPriority, setFilterPriority] = useState('')
  const [filterCounty, setFilterCounty] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [showImport, setShowImport] = useState(false)
  const [outreachSeller, setOutreachSeller] = useState<Seller | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (filterStatus) params.set('status', filterStatus)
    if (filterPriority) params.set('priority', filterPriority)
    if (filterCounty) params.set('county', filterCounty)
    const res = await fetch(`/api/sellers?${params}`)
    setSellers(await res.json())
    setLoading(false)
  }, [search, filterStatus, filterPriority, filterCounty])

  useEffect(() => { load() }, [load])

  return (
    <div className="p-6 space-y-5 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Seller Leads</h1>
          <p className="text-gray-500 text-sm">RCFE facilities &amp; owners looking to sell</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowImport(true)} className="btn-secondary flex items-center gap-2">
            <Upload size={14} />Import CSV
          </button>
          <button onClick={() => setShowAdd(true)} className="btn-primary flex items-center gap-2">
            <Plus size={14} />Add Seller
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="input pl-9"
            placeholder="Search facility, owner, city, license…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select className="select w-40" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">All Statuses</option>
          {SELLER_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
        <select className="select w-36" value={filterPriority} onChange={e => setFilterPriority(e.target.value)}>
          <option value="">All Priority</option>
          <option value="hot">🔥 Hot</option>
          <option value="warm">☀️ Warm</option>
          <option value="cold">❄️ Cold</option>
        </select>
        <select className="select w-44" value={filterCounty} onChange={e => setFilterCounty(e.target.value)}>
          <option value="">All Counties</option>
          {CA_COUNTIES.map(c => <option key={c}>{c}</option>)}
        </select>
        <button onClick={load} className="btn-secondary flex items-center gap-1.5">
          <RefreshCw size={13} />Refresh
        </button>
      </div>

      {/* Summary counts */}
      <div className="flex gap-3 flex-wrap text-sm">
        <span className="text-gray-500">{sellers.length} result{sellers.length !== 1 ? 's' : ''}</span>
        {filterStatus || filterPriority || filterCounty || search ? (
          <button
            onClick={() => { setSearch(''); setFilterStatus(''); setFilterPriority(''); setFilterCounty('') }}
            className="text-blue-600 hover:text-blue-800"
          >
            Clear filters
          </button>
        ) : null}
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Facility</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Location</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Beds</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Asking</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">NOI</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Priority</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Outreach</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Follow-up</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={10} className="px-5 py-10 text-center text-gray-400">Loading…</td></tr>
              ) : sellers.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-5 py-10 text-center text-gray-400">
                    <Building2 size={32} className="mx-auto mb-2 text-gray-300" />
                    <p>No seller leads found.</p>
                    <div className="flex justify-center gap-3 mt-3">
                      <button onClick={() => setShowAdd(true)} className="text-blue-600 hover:underline text-sm">Add manually</button>
                      <span className="text-gray-300">or</span>
                      <button onClick={() => setShowImport(true)} className="text-blue-600 hover:underline text-sm">Import CSV</button>
                    </div>
                  </td>
                </tr>
              ) : (
                sellers.map(seller => (
                  <tr key={seller.id} className="table-row">
                    <td className="px-5 py-3">
                      <Link href={`/sellers/${seller.id}`} className="font-medium hover:text-blue-600 transition-colors block">
                        {seller.facility_name}
                      </Link>
                      {seller.owner_name && <p className="text-xs text-gray-400">{seller.owner_name}</p>}
                      {seller.license_number && (
                        <p className="text-xs text-gray-400">Lic# {seller.license_number}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-xs">
                      {seller.city && <p>{seller.city}</p>}
                      {seller.county && <p>{seller.county} Co.</p>}
                    </td>
                    <td className="px-4 py-3 text-gray-800 font-medium">{seller.bed_capacity ?? '—'}</td>
                    <td className="px-4 py-3 font-medium">{fmt$(seller.asking_price)}</td>
                    <td className="px-4 py-3 text-gray-600">{fmt$(seller.noi)}</td>
                    <td className="px-4 py-3"><StatusBadge status={seller.status} type="seller" /></td>
                    <td className="px-4 py-3"><PriorityBadge priority={seller.priority} /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${seller.outreach_count > 0 ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
                          {seller.outreach_count}
                        </span>
                        <button
                          onClick={() => setOutreachSeller(seller)}
                          className="ml-1 text-gray-400 hover:text-blue-600 transition-colors"
                          title="Send outreach"
                        >
                          <Sparkles size={13} />
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {seller.next_follow_up_at
                        ? format(parseISO(seller.next_follow_up_at), 'MMM d')
                        : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {seller.phone && (
                          <a href={`tel:${seller.phone}`} className="text-gray-400 hover:text-blue-600">
                            <Phone size={13} />
                          </a>
                        )}
                        {seller.email && (
                          <a href={`mailto:${seller.email}`} className="text-gray-400 hover:text-blue-600">
                            <Mail size={13} />
                          </a>
                        )}
                        <Link href={`/sellers/${seller.id}`} className="text-gray-400 hover:text-blue-600">
                          <ChevronRight size={15} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showAdd && <AddSellerModal onClose={() => setShowAdd(false)} onAdded={load} />}
      {showImport && <ImportModal onClose={() => setShowImport(false)} onImported={load} />}
      {outreachSeller && (
        <OutreachModal
          seller={outreachSeller}
          onClose={() => setOutreachSeller(null)}
          onSent={load}
        />
      )}
    </div>
  )
}
