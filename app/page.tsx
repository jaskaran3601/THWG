'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Building2, UserCheck, TrendingUp, AlertCircle,
  DollarSign, Phone, Mail, Clock, Flame, ChevronRight,
  BarChart3,
} from 'lucide-react'
import StatusBadge, { PriorityBadge } from '@/components/StatusBadge'
import { format, parseISO } from 'date-fns'

interface Stats {
  sellers: Record<string, number>
  buyers: Record<string, number>
  outreach: Record<string, number>
  tasks_due: number
  recent_sellers: Array<Record<string, unknown>>
  hot_sellers: Array<Record<string, unknown>>
  county_breakdown: Array<{ county: string; count: number }>
}

function fmt$(n: number | null | undefined) {
  if (!n) return '—'
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null)

  useEffect(() => {
    fetch('/api/stats').then(r => r.json()).then(setStats)
  }, [])

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  const s = stats.sellers

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-0.5">RCFE Buyer & Seller Lead System – California</p>
        </div>
        <div className="flex gap-3">
          <Link href="/sellers" className="btn-primary flex items-center gap-2">
            <Building2 size={16} />
            Find Sellers
          </Link>
        </div>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Seller Leads"
          value={s.total ?? 0}
          sub={`+${s.added_this_week ?? 0} this week`}
          icon={<Building2 size={20} className="text-blue-600" />}
          bg="bg-blue-50"
        />
        <StatCard
          label="Hot Leads"
          value={s.hot ?? 0}
          sub="Ready to engage"
          icon={<Flame size={20} className="text-red-500" />}
          bg="bg-red-50"
        />
        <StatCard
          label="Pipeline Value"
          value={fmt$(s.total_pipeline_value)}
          sub={`Avg: ${fmt$(s.avg_price)}`}
          icon={<DollarSign size={20} className="text-green-600" />}
          bg="bg-green-50"
        />
        <StatCard
          label="Deals Closed"
          value={s.closed_won ?? 0}
          sub={`${stats.buyers.total ?? 0} active buyers`}
          icon={<TrendingUp size={20} className="text-purple-600" />}
          bg="bg-purple-50"
        />
      </div>

      {/* Pipeline Stage Summary */}
      <div className="card p-5">
        <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <BarChart3 size={16} className="text-gray-500" />
          Seller Pipeline
        </h2>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {[
            { label: 'New', val: s.new_leads ?? 0, color: 'bg-gray-100 text-gray-700' },
            { label: 'Contacted', val: s.contacted ?? 0, color: 'bg-blue-100 text-blue-700' },
            { label: 'Qualified', val: s.qualified ?? 0, color: 'bg-purple-100 text-purple-700' },
            { label: 'Active', val: s.active ?? 0, color: 'bg-yellow-100 text-yellow-700' },
            { label: 'Under Contract', val: s.under_contract ?? 0, color: 'bg-orange-100 text-orange-700' },
            { label: 'Closed', val: s.closed_won ?? 0, color: 'bg-green-100 text-green-700' },
          ].map(stage => (
            <div key={stage.label} className={`rounded-xl p-3 text-center ${stage.color}`}>
              <p className="text-2xl font-bold">{stage.val}</p>
              <p className="text-xs font-medium mt-0.5">{stage.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hot Sellers */}
        <div className="lg:col-span-2 card">
          <div className="px-5 py-4 border-b flex items-center justify-between">
            <h2 className="font-semibold flex items-center gap-2">
              <Flame size={16} className="text-red-500" />
              Hot Seller Leads
            </h2>
            <Link href="/sellers?priority=hot" className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1">
              View all <ChevronRight size={14} />
            </Link>
          </div>
          <div className="divide-y divide-gray-100">
            {stats.hot_sellers.length === 0 ? (
              <div className="px-5 py-8 text-center text-gray-400 text-sm">
                No hot leads yet. Add sellers and mark them as hot priority.
              </div>
            ) : (
              stats.hot_sellers.map((s: Record<string, unknown>) => (
                <Link key={s.id as number} href={`/sellers/${s.id}`} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{s.facility_name as string}</p>
                    <p className="text-xs text-gray-500">{[s.city, s.county ? `${s.county} Co.` : null].filter(Boolean).join(', ')} · {s.bed_capacity as number} beds</p>
                  </div>
                  <div className="flex items-center gap-3 ml-3 flex-shrink-0">
                    {s.asking_price ? <span className="text-sm font-semibold text-gray-800">{fmt$(s.asking_price as number)}</span> : null}
                    <StatusBadge status={s.status as string} type="seller" />
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Tasks Due */}
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-3">
              <Clock size={16} className="text-orange-500" />
              <h3 className="font-semibold text-sm">Tasks Due</h3>
            </div>
            <p className="text-3xl font-bold text-orange-600">{stats.tasks_due}</p>
            <p className="text-xs text-gray-500 mt-1">Follow-ups due today / overdue</p>
            <Link href="/pipeline" className="text-xs text-blue-600 hover:text-blue-800 mt-2 inline-flex items-center gap-1">
              View tasks <ChevronRight size={12} />
            </Link>
          </div>

          {/* Outreach */}
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-3">
              <Mail size={16} className="text-blue-500" />
              <h3 className="font-semibold text-sm">Outreach</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Total sent</span>
                <span className="font-semibold">{stats.outreach.total_sent ?? 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Replies</span>
                <span className="font-semibold text-green-600">{stats.outreach.replies ?? 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">This week</span>
                <span className="font-semibold">{stats.outreach.sent_this_week ?? 0}</span>
              </div>
            </div>
            <Link href="/outreach" className="text-xs text-blue-600 hover:text-blue-800 mt-3 inline-flex items-center gap-1">
              Go to outreach <ChevronRight size={12} />
            </Link>
          </div>

          {/* County Breakdown */}
          {stats.county_breakdown.length > 0 && (
            <div className="card p-5">
              <h3 className="font-semibold text-sm mb-3">Top Counties</h3>
              <div className="space-y-2">
                {stats.county_breakdown.slice(0, 5).map(c => (
                  <div key={c.county} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{c.county}</span>
                    <span className="font-semibold bg-gray-100 px-2 py-0.5 rounded-full text-xs">{c.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recent Sellers */}
      <div className="card">
        <div className="px-5 py-4 border-b flex items-center justify-between">
          <h2 className="font-semibold">Recently Added Sellers</h2>
          <Link href="/sellers" className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1">
            View all <ChevronRight size={14} />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Facility</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Location</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Beds</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Asking</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Priority</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Added</th>
              </tr>
            </thead>
            <tbody>
              {stats.recent_sellers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-gray-400">
                    No sellers yet. <Link href="/sellers" className="text-blue-600 hover:underline">Add your first seller lead →</Link>
                  </td>
                </tr>
              ) : (
                stats.recent_sellers.map((s: Record<string, unknown>) => (
                  <tr key={s.id as number} className="table-row">
                    <td className="px-5 py-3">
                      <Link href={`/sellers/${s.id}`} className="font-medium hover:text-blue-600 transition-colors">
                        {s.facility_name as string}
                      </Link>
                      {s.owner_name ? <p className="text-xs text-gray-400">{s.owner_name as string}</p> : null}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{[s.city, s.county].filter(Boolean).join(', ')}</td>
                    <td className="px-4 py-3 text-gray-600">{s.bed_capacity as number ?? '—'}</td>
                    <td className="px-4 py-3 font-medium">{fmt$(s.asking_price as number)}</td>
                    <td className="px-4 py-3"><StatusBadge status={s.status as string} type="seller" /></td>
                    <td className="px-4 py-3"><PriorityBadge priority={s.priority as string} /></td>
                    <td className="px-4 py-3 text-gray-400 text-xs">
                      {s.created_at ? format(parseISO(s.created_at as string), 'MMM d') : '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, sub, icon, bg }: {
  label: string; value: string | number; sub: string; icon: React.ReactNode; bg: string
}) {
  return (
    <div className="stat-card">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          <p className="text-xs text-gray-500 mt-1">{sub}</p>
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bg}`}>
          {icon}
        </div>
      </div>
    </div>
  )
}
