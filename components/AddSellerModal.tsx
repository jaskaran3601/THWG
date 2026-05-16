'use client'
import { useState } from 'react'
import { X } from 'lucide-react'
import toast from 'react-hot-toast'
import { CA_COUNTIES } from '@/lib/types'

interface Props {
  onClose: () => void
  onAdded: () => void
}

export default function AddSellerModal({ onClose, onAdded }: Props) {
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    facility_name: '', owner_name: '', license_number: '',
    facility_type: 'RCFE', license_status: 'Active',
    address: '', city: '', county: '', zip: '',
    bed_capacity: '', current_census: '', years_in_operation: '',
    asking_price: '', gross_revenue: '', noi: '',
    phone: '', email: '',
    priority: 'warm', source: 'manual',
    reason_for_selling: '', notes: '', next_follow_up_at: '',
  })

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  async function save() {
    if (!form.facility_name.trim()) { toast.error('Facility name is required'); return }
    setSaving(true)
    try {
      const payload = {
        ...form,
        bed_capacity: form.bed_capacity ? parseInt(form.bed_capacity) : null,
        current_census: form.current_census ? parseInt(form.current_census) : null,
        years_in_operation: form.years_in_operation ? parseInt(form.years_in_operation) : null,
        asking_price: form.asking_price ? parseFloat(form.asking_price.replace(/,/g, '')) : null,
        gross_revenue: form.gross_revenue ? parseFloat(form.gross_revenue.replace(/,/g, '')) : null,
        noi: form.noi ? parseFloat(form.noi.replace(/,/g, '')) : null,
      }
      const res = await fetch('/api/sellers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error()
      toast.success('Seller lead added!')
      onAdded()
      onClose()
    } catch {
      toast.error('Failed to save seller')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="font-bold text-lg">Add Seller Lead</h2>
          <button onClick={onClose}><X size={20} className="text-gray-400 hover:text-gray-600" /></button>
        </div>

        <div className="p-6 space-y-5">
          {/* Facility Info */}
          <section>
            <h3 className="font-semibold text-sm text-gray-500 uppercase tracking-wide mb-3">Facility Info</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="label">Facility Name *</label>
                <input className="input" value={form.facility_name} onChange={e => set('facility_name', e.target.value)} placeholder="Sunrise Manor RCFE" />
              </div>
              <div>
                <label className="label">Owner Name</label>
                <input className="input" value={form.owner_name} onChange={e => set('owner_name', e.target.value)} placeholder="John Smith" />
              </div>
              <div>
                <label className="label">License Number</label>
                <input className="input" value={form.license_number} onChange={e => set('license_number', e.target.value)} placeholder="123456789" />
              </div>
              <div>
                <label className="label">Facility Type</label>
                <select className="select" value={form.facility_type} onChange={e => set('facility_type', e.target.value)}>
                  <option>RCFE</option>
                  <option>ARF</option>
                  <option>GH</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="label">License Status</label>
                <select className="select" value={form.license_status} onChange={e => set('license_status', e.target.value)}>
                  <option>Active</option>
                  <option>Expired</option>
                  <option>Pending</option>
                  <option>Revoked</option>
                </select>
              </div>
            </div>
          </section>

          {/* Location */}
          <section>
            <h3 className="font-semibold text-sm text-gray-500 uppercase tracking-wide mb-3">Location</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="label">Address</label>
                <input className="input" value={form.address} onChange={e => set('address', e.target.value)} placeholder="123 Main St" />
              </div>
              <div>
                <label className="label">City</label>
                <input className="input" value={form.city} onChange={e => set('city', e.target.value)} placeholder="Los Angeles" />
              </div>
              <div>
                <label className="label">County</label>
                <select className="select" value={form.county} onChange={e => set('county', e.target.value)}>
                  <option value="">Select county…</option>
                  {CA_COUNTIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="label">ZIP Code</label>
                <input className="input" value={form.zip} onChange={e => set('zip', e.target.value)} placeholder="90001" />
              </div>
            </div>
          </section>

          {/* Operations */}
          <section>
            <h3 className="font-semibold text-sm text-gray-500 uppercase tracking-wide mb-3">Operations</h3>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="label">Bed Capacity</label>
                <input className="input" type="number" value={form.bed_capacity} onChange={e => set('bed_capacity', e.target.value)} placeholder="6" />
              </div>
              <div>
                <label className="label">Current Census</label>
                <input className="input" type="number" value={form.current_census} onChange={e => set('current_census', e.target.value)} placeholder="5" />
              </div>
              <div>
                <label className="label">Years Operating</label>
                <input className="input" type="number" value={form.years_in_operation} onChange={e => set('years_in_operation', e.target.value)} placeholder="8" />
              </div>
            </div>
          </section>

          {/* Financials */}
          <section>
            <h3 className="font-semibold text-sm text-gray-500 uppercase tracking-wide mb-3">Financials</h3>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="label">Asking Price ($)</label>
                <input className="input" value={form.asking_price} onChange={e => set('asking_price', e.target.value)} placeholder="650,000" />
              </div>
              <div>
                <label className="label">Gross Revenue ($)</label>
                <input className="input" value={form.gross_revenue} onChange={e => set('gross_revenue', e.target.value)} placeholder="180,000" />
              </div>
              <div>
                <label className="label">NOI ($)</label>
                <input className="input" value={form.noi} onChange={e => set('noi', e.target.value)} placeholder="90,000" />
              </div>
            </div>
          </section>

          {/* Contact */}
          <section>
            <h3 className="font-semibold text-sm text-gray-500 uppercase tracking-wide mb-3">Contact</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Phone</label>
                <input className="input" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="(555) 000-0000" />
              </div>
              <div>
                <label className="label">Email</label>
                <input className="input" type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="owner@example.com" />
              </div>
            </div>
          </section>

          {/* CRM */}
          <section>
            <h3 className="font-semibold text-sm text-gray-500 uppercase tracking-wide mb-3">CRM</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Priority</label>
                <select className="select" value={form.priority} onChange={e => set('priority', e.target.value)}>
                  <option value="hot">Hot</option>
                  <option value="warm">Warm</option>
                  <option value="cold">Cold</option>
                </select>
              </div>
              <div>
                <label className="label">Source</label>
                <select className="select" value={form.source} onChange={e => set('source', e.target.value)}>
                  <option value="manual">Manual Entry</option>
                  <option value="referral">Referral</option>
                  <option value="cold_outreach">Cold Outreach</option>
                  <option value="dss_database">DSS Database</option>
                  <option value="web_form">Web Form</option>
                </select>
              </div>
              <div>
                <label className="label">Follow-up Date</label>
                <input className="input" type="date" value={form.next_follow_up_at} onChange={e => set('next_follow_up_at', e.target.value)} />
              </div>
              <div>
                <label className="label">Reason for Selling</label>
                <input className="input" value={form.reason_for_selling} onChange={e => set('reason_for_selling', e.target.value)} placeholder="Retirement, health, etc." />
              </div>
              <div className="col-span-2">
                <label className="label">Notes</label>
                <textarea className="input h-20 resize-none" value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Additional notes…" />
              </div>
            </div>
          </section>
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 border-t bg-gray-50 rounded-b-2xl">
          <button onClick={onClose} className="btn-secondary">Cancel</button>
          <button onClick={save} disabled={saving} className="btn-primary">
            {saving ? 'Saving…' : 'Add Seller Lead'}
          </button>
        </div>
      </div>
    </div>
  )
}
