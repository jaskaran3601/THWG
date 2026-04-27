'use client'
import { useState } from 'react'
import { X, Sparkles, Send, Copy, Check } from 'lucide-react'
import toast from 'react-hot-toast'
import type { Seller } from '@/lib/types'

interface Props {
  seller: Seller | null
  onClose: () => void
  onSent?: () => void
}

const CHANNELS = [
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone Script' },
  { value: 'sms', label: 'SMS' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'direct_mail', label: 'Direct Mail' },
]

export default function OutreachModal({ seller, onClose, onSent }: Props) {
  const [channel, setChannel] = useState('email')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [generating, setGenerating] = useState(false)
  const [logging, setLogging] = useState(false)
  const [copied, setCopied] = useState(false)
  const [yourName, setYourName] = useState('')
  const [yourCompany, setYourCompany] = useState('')
  const [yourPhone, setYourPhone] = useState('')

  async function generateMessage() {
    setGenerating(true)
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'initial_outreach', seller, channel, yourName, yourCompany, yourPhone }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Generation failed')
        return
      }

      // Parse subject from email format
      if (channel === 'email' && data.message.startsWith('SUBJECT:')) {
        const lines = data.message.split('\n')
        setSubject(lines[0].replace('SUBJECT:', '').trim())
        setMessage(lines.slice(2).join('\n').trim())
      } else {
        setMessage(data.message)
      }
      toast.success('Message generated!')
    } catch {
      toast.error('Failed to generate message')
    } finally {
      setGenerating(false)
    }
  }

  async function logOutreach() {
    if (!seller || !message.trim()) return
    setLogging(true)
    try {
      await fetch('/api/outreach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lead_type: 'seller',
          lead_id: seller.id,
          channel,
          subject: subject || null,
          message,
          status: 'sent',
        }),
      })
      toast.success('Outreach logged!')
      onSent?.()
      onClose()
    } catch {
      toast.error('Failed to log outreach')
    } finally {
      setLogging(false)
    }
  }

  function copyToClipboard() {
    const text = subject ? `Subject: ${subject}\n\n${message}` : message
    navigator.clipboard.writeText(text)
    setCopied(true)
    toast.success('Copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  if (!seller) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div>
            <h2 className="font-bold text-lg">Outreach</h2>
            <p className="text-sm text-gray-500">{seller.facility_name} – {seller.owner_name || 'Owner'}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Your Info */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="label">Your Name</label>
              <input className="input" value={yourName} onChange={e => setYourName(e.target.value)} placeholder="Jane Doe" />
            </div>
            <div>
              <label className="label">Your Company</label>
              <input className="input" value={yourCompany} onChange={e => setYourCompany(e.target.value)} placeholder="THWG Advisors" />
            </div>
            <div>
              <label className="label">Your Phone</label>
              <input className="input" value={yourPhone} onChange={e => setYourPhone(e.target.value)} placeholder="(555) 000-0000" />
            </div>
          </div>

          {/* Channel */}
          <div>
            <label className="label">Channel</label>
            <div className="flex gap-2 flex-wrap">
              {CHANNELS.map(c => (
                <button
                  key={c.value}
                  onClick={() => setChannel(c.value)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                    channel === c.value
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Subject (email only) */}
          {channel === 'email' && (
            <div>
              <label className="label">Subject</label>
              <input
                className="input"
                value={subject}
                onChange={e => setSubject(e.target.value)}
                placeholder="e.g. Interested buyers looking for RCFEs in Los Angeles County"
              />
            </div>
          )}

          {/* Message */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="label mb-0">Message</label>
              <button
                onClick={generateMessage}
                disabled={generating}
                className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 font-medium disabled:opacity-50"
              >
                <Sparkles size={13} />
                {generating ? 'Generating…' : 'AI Generate'}
              </button>
            </div>
            <textarea
              className="input h-52 resize-none font-mono text-sm"
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Write your message or click AI Generate above…"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-2">
            <button onClick={copyToClipboard} disabled={!message} className="btn-secondary flex items-center gap-2">
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
            <div className="flex gap-2">
              <button onClick={onClose} className="btn-secondary">Cancel</button>
              <button
                onClick={logOutreach}
                disabled={!message.trim() || logging}
                className="btn-primary flex items-center gap-2"
              >
                <Send size={14} />
                {logging ? 'Logging…' : 'Log Outreach'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
