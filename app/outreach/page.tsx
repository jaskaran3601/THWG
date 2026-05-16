'use client'
import { useEffect, useState } from 'react'
import { Sparkles, Mail, Phone, MessageSquare, Linkedin, Send, RefreshCw, Search } from 'lucide-react'
import Link from 'next/link'
import type { OutreachRecord } from '@/lib/types'
import { format, parseISO } from 'date-fns'
import toast from 'react-hot-toast'

const CHANNEL_ICON: Record<string, React.ReactNode> = {
  email: <Mail size={14} />,
  phone: <Phone size={14} />,
  sms: <MessageSquare size={14} />,
  linkedin: <Linkedin size={14} />,
  direct_mail: <Mail size={14} />,
  in_person: <span>🤝</span>,
}

const CHANNEL_COLOR: Record<string, string> = {
  email: 'bg-blue-100 text-blue-700',
  phone: 'bg-green-100 text-green-700',
  sms: 'bg-purple-100 text-purple-700',
  linkedin: 'bg-indigo-100 text-indigo-700',
  direct_mail: 'bg-yellow-100 text-yellow-700',
  in_person: 'bg-orange-100 text-orange-700',
}

const STATUS_COLOR: Record<string, string> = {
  sent: 'bg-gray-100 text-gray-600',
  delivered: 'bg-blue-100 text-blue-600',
  opened: 'bg-yellow-100 text-yellow-700',
  replied: 'bg-green-100 text-green-700',
  bounced: 'bg-red-100 text-red-700',
  unsubscribed: 'bg-slate-100 text-slate-600',
  draft: 'bg-gray-50 text-gray-500',
}

// AI Prompt Templates for RCFE seller outreach
const TEMPLATES = [
  {
    id: 'initial_cold',
    name: 'Initial Cold Email',
    channel: 'email',
    description: 'First touch to RCFE owner – introduce yourself and mention buyers',
    preview: `Subject: Qualified buyers looking for RCFEs in [County]

Hi [Owner Name],

I hope this message finds you well. My name is [Your Name] with [Company], and we specialize in RCFE business acquisitions in California.

I'm reaching out because I currently have several qualified buyers actively searching for RCFEs in [County] County, and your facility caught my attention...`,
  },
  {
    id: 'follow_up_1',
    name: 'Follow-up #1 (3 days)',
    channel: 'email',
    description: 'Second touch with market data and value proposition',
    preview: `Subject: RCFE Market Update – [County] County 2026

Hi [Owner Name],

I wanted to follow up on my previous note. The market for RCFE facilities in [County] County has been particularly strong...`,
  },
  {
    id: 'sms_intro',
    name: 'SMS Introduction',
    channel: 'sms',
    description: 'Short SMS to supplement email outreach',
    preview: `Hi [Owner Name], this is [Your Name] from [Company]. I sent you an email about potential RCFE buyers in your area. Mind if I ask if you've thought about your exit plan? Happy to chat!`,
  },
  {
    id: 'phone_script',
    name: 'Phone Script',
    channel: 'phone',
    description: 'Complete phone call script with objection handling',
    preview: `Opening: "Hi, may I speak with [Owner Name]? Hi [Owner Name], this is [Your Name] from [Company]. I specialize in RCFE acquisitions in California, and I'm calling because we have a few qualified buyers looking for facilities in your area..."`,
  },
  {
    id: 'retirement_angle',
    name: 'Retirement/Exit Angle',
    channel: 'email',
    description: 'For long-tenured owners who may be thinking about retirement',
    preview: `Subject: Planning your RCFE exit strategy?

Hi [Owner Name],

After [X] years operating your facility, you've built something truly valuable. Many of our clients find that having a professional evaluation of their RCFE's market value helps them plan their next chapter...`,
  },
  {
    id: 'direct_mail',
    name: 'Direct Mail Letter',
    channel: 'direct_mail',
    description: 'Physical letter to send to the facility address on record',
    preview: `[Your Name]
[Your Company]
[Your Address]

Dear [Owner Name],

As a specialist in RCFE acquisitions throughout California, I'm writing to introduce myself and share some exciting news about buyer activity in [County] County...`,
  },
]

export default function OutreachPage() {
  const [records, setRecords] = useState<OutreachRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterChannel, setFilterChannel] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [aiSeller, setAiSeller] = useState('')
  const [aiChannel, setAiChannel] = useState('email')
  const [aiYourName, setAiYourName] = useState('')
  const [aiYourCompany, setAiYourCompany] = useState('')
  const [aiYourPhone, setAiYourPhone] = useState('')
  const [aiResult, setAiResult] = useState('')
  const [aiLoading, setAiLoading] = useState(false)

  async function load() {
    setLoading(true)
    const res = await fetch('/api/outreach?limit=100')
    setRecords(await res.json())
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function generateBulk() {
    if (!aiSeller.trim()) { toast.error('Describe the target seller or facility'); return }
    setAiLoading(true)
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'initial_outreach',
          seller: { facility_name: aiSeller, county: 'Los Angeles', facility_type: 'RCFE' },
          channel: aiChannel,
          yourName: aiYourName,
          yourCompany: aiYourCompany,
          yourPhone: aiYourPhone,
        }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error || 'Generation failed'); return }
      setAiResult(data.message)
      toast.success('Message generated!')
    } catch {
      toast.error('Failed to generate')
    } finally {
      setAiLoading(false)
    }
  }

  const filtered = records.filter(r => {
    if (filterChannel && r.channel !== filterChannel) return false
    if (filterStatus && r.status !== filterStatus) return false
    if (search && !r.subject?.toLowerCase().includes(search.toLowerCase()) &&
        !r.message?.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const stats = {
    total: records.length,
    replied: records.filter(r => r.status === 'replied').length,
    opened: records.filter(r => r.status === 'opened').length,
    thisWeek: records.filter(r => {
      const d = new Date(r.created_at)
      const week = new Date(); week.setDate(week.getDate() - 7)
      return d > week
    }).length,
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">Outreach Center</h1>
        <p className="text-gray-500 text-sm">AI-powered outreach for RCFE sellers · log, track, generate messages</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Sent', val: stats.total, color: 'text-gray-800' },
          { label: 'This Week', val: stats.thisWeek, color: 'text-blue-600' },
          { label: 'Opened', val: stats.opened, color: 'text-yellow-600' },
          { label: 'Replies', val: stats.replied, color: 'text-green-600' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{s.label}</p>
            <p className={`text-3xl font-bold mt-1 ${s.color}`}>{s.val}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* AI Generator */}
        <div className="lg:col-span-2 space-y-4">
          <div className="card p-5">
            <h2 className="font-semibold mb-1 flex items-center gap-2">
              <Sparkles size={16} className="text-blue-500" />
              AI Outreach Generator
            </h2>
            <p className="text-xs text-gray-500 mb-4">Generate personalized messages for any RCFE seller. Uses Claude AI.</p>

            <div className="space-y-3">
              <div>
                <label className="label">Your Name</label>
                <input className="input" value={aiYourName} onChange={e => setAiYourName(e.target.value)} placeholder="Jane Doe" />
              </div>
              <div>
                <label className="label">Your Company</label>
                <input className="input" value={aiYourCompany} onChange={e => setAiYourCompany(e.target.value)} placeholder="THWG Advisors" />
              </div>
              <div>
                <label className="label">Your Phone</label>
                <input className="input" value={aiYourPhone} onChange={e => setAiYourPhone(e.target.value)} placeholder="(555) 000-0000" />
              </div>
              <div>
                <label className="label">Target Seller / Facility</label>
                <textarea
                  className="input h-20 resize-none"
                  value={aiSeller}
                  onChange={e => setAiSeller(e.target.value)}
                  placeholder="e.g. Sunrise Manor RCFE, Los Angeles County, 6-bed facility, owner John Smith, 10 years operating"
                />
              </div>
              <div>
                <label className="label">Channel</label>
                <div className="flex flex-wrap gap-2">
                  {['email','sms','phone','linkedin','direct_mail'].map(c => (
                    <button
                      key={c}
                      onClick={() => setAiChannel(c)}
                      className={`px-3 py-1.5 text-xs rounded-lg border font-medium transition-colors ${aiChannel === c ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 hover:border-blue-400'}`}
                    >
                      {c.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>
              <button
                onClick={generateBulk}
                disabled={aiLoading}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                <Sparkles size={14} />{aiLoading ? 'Generating…' : 'Generate Message'}
              </button>
            </div>

            {aiResult && (
              <div className="mt-4">
                <div className="flex items-center justify-between mb-1">
                  <label className="label mb-0">Generated Message</label>
                  <button
                    onClick={() => { navigator.clipboard.writeText(aiResult); toast.success('Copied!') }}
                    className="text-xs text-blue-600 hover:text-blue-800"
                  >Copy</button>
                </div>
                <textarea
                  className="input h-48 resize-none font-mono text-xs"
                  value={aiResult}
                  onChange={e => setAiResult(e.target.value)}
                />
              </div>
            )}
          </div>

          {/* Templates */}
          <div className="card p-5">
            <h2 className="font-semibold mb-3">Outreach Templates</h2>
            <div className="space-y-2">
              {TEMPLATES.map(t => (
                <div key={t.id} className="border border-gray-200 rounded-xl p-3 hover:border-blue-300 transition-colors cursor-pointer group"
                  onClick={() => { setAiChannel(t.channel); toast(`Template "${t.name}" selected – fill in seller details above and generate`, { icon: '📋' }) }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1 ${CHANNEL_COLOR[t.channel]}`}>
                      {CHANNEL_ICON[t.channel]}{t.channel}
                    </span>
                    <span className="font-medium text-sm">{t.name}</span>
                  </div>
                  <p className="text-xs text-gray-500">{t.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Outreach Log */}
        <div className="lg:col-span-3">
          <div className="card">
            <div className="px-5 py-4 border-b">
              <h2 className="font-semibold mb-3">Outreach Log</h2>
              <div className="flex gap-2 flex-wrap">
                <div className="relative flex-1 min-w-36">
                  <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input className="input pl-8 text-xs" placeholder="Search messages…" value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <select className="select w-32 text-xs" value={filterChannel} onChange={e => setFilterChannel(e.target.value)}>
                  <option value="">All Channels</option>
                  {['email','phone','sms','linkedin','direct_mail','in_person'].map(c => <option key={c}>{c}</option>)}
                </select>
                <select className="select w-32 text-xs" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                  <option value="">All Statuses</option>
                  {['sent','opened','replied','bounced'].map(s => <option key={s}>{s}</option>)}
                </select>
                <button onClick={load} className="btn-secondary p-2"><RefreshCw size={13} /></button>
              </div>
            </div>

            <div className="divide-y divide-gray-100 max-h-[600px] overflow-auto">
              {loading ? (
                <div className="px-5 py-10 text-center text-gray-400">Loading…</div>
              ) : filtered.length === 0 ? (
                <div className="px-5 py-10 text-center text-gray-400">
                  <Send size={28} className="mx-auto mb-2 text-gray-300" />
                  <p>No outreach logged yet.</p>
                  <p className="text-xs mt-1">Log outreach from a seller&#39;s profile page.</p>
                </div>
              ) : (
                filtered.map(r => (
                  <div key={r.id} className="px-5 py-3">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1 ${CHANNEL_COLOR[r.channel]}`}>
                          {CHANNEL_ICON[r.channel]}{r.channel}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLOR[r.status]}`}>{r.status}</span>
                        <span className="text-xs text-gray-500 capitalize">{r.lead_type} #{r.lead_id}</span>
                      </div>
                      <span className="text-xs text-gray-400 flex-shrink-0">
                        {format(parseISO(r.created_at), 'MMM d, h:mm a')}
                      </span>
                    </div>
                    {r.subject && <p className="text-sm font-medium text-gray-800">{r.subject}</p>}
                    {r.message && (
                      <p className="text-xs text-gray-500 line-clamp-2 mt-0.5 font-mono">{r.message}</p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Strategy Guide */}
      <div className="card p-5">
        <h2 className="font-semibold mb-4 flex items-center gap-2">
          <Sparkles size={16} className="text-yellow-500" />
          RCFE Seller Outreach Strategy Guide
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="bg-blue-50 rounded-xl p-4">
            <p className="font-semibold text-blue-800 mb-2">Step 1: Build Your List</p>
            <ul className="text-blue-700 space-y-1 text-xs">
              <li>• Download CA DSS RCFE facility list</li>
              <li>• Filter by target county &amp; bed count</li>
              <li>• Import via CSV on the Sellers page</li>
              <li>• Cross-reference with county assessor records</li>
            </ul>
          </div>
          <div className="bg-purple-50 rounded-xl p-4">
            <p className="font-semibold text-purple-800 mb-2">Step 2: Multi-Touch Sequence</p>
            <ul className="text-purple-700 space-y-1 text-xs">
              <li>• Day 0: Cold email (buyer interest angle)</li>
              <li>• Day 3: Follow-up phone call</li>
              <li>• Day 7: Second email (market data)</li>
              <li>• Day 14: SMS check-in</li>
              <li>• Day 21: Final email (last chance)</li>
            </ul>
          </div>
          <div className="bg-green-50 rounded-xl p-4">
            <p className="font-semibold text-green-800 mb-2">Step 3: Convert to Seller</p>
            <ul className="text-green-700 space-y-1 text-xs">
              <li>• Offer free facility valuation</li>
              <li>• Share recent comparable sales</li>
              <li>• Present qualified buyer profiles</li>
              <li>• Discuss timeline flexibility</li>
              <li>• Get signed listing agreement</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
