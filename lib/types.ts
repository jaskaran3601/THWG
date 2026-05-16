export type SellerStatus =
  | 'new'
  | 'contacted'
  | 'qualified'
  | 'active'
  | 'under_contract'
  | 'closed_won'
  | 'closed_lost'
  | 'not_interested'

export type BuyerStatus =
  | 'new'
  | 'qualified'
  | 'matched'
  | 'active'
  | 'under_contract'
  | 'closed_won'
  | 'closed_lost'

export type Priority = 'hot' | 'warm' | 'cold'
export type LeadSource = 'manual' | 'csv_import' | 'referral' | 'cold_outreach' | 'web_form' | 'dss_database'
export type OutreachChannel = 'email' | 'phone' | 'sms' | 'linkedin' | 'direct_mail' | 'in_person'
export type OutreachStatus = 'draft' | 'sent' | 'delivered' | 'opened' | 'replied' | 'bounced' | 'unsubscribed'

export interface Seller {
  id: number
  created_at: string
  updated_at: string
  facility_name: string
  owner_name?: string
  license_number?: string
  facility_type: string
  license_status: string
  address?: string
  city?: string
  county?: string
  state: string
  zip?: string
  bed_capacity?: number
  current_census?: number
  years_in_operation?: number
  reason_for_selling?: string
  asking_price?: number
  gross_revenue?: number
  noi?: number
  cap_rate?: number
  real_estate_included: number
  real_estate_value?: number
  phone?: string
  email?: string
  website?: string
  status: SellerStatus
  priority: Priority
  source: LeadSource
  notes?: string
  outreach_count: number
  last_contacted_at?: string
  next_follow_up_at?: string
  tags: string
}

export interface Buyer {
  id: number
  created_at: string
  updated_at: string
  contact_name: string
  company?: string
  phone?: string
  email?: string
  budget_min?: number
  budget_max?: number
  preferred_counties: string
  min_beds?: number
  max_beds?: number
  facility_types: string
  real_estate_required: number
  timeline: string
  experience_level: string
  financing_pre_approved: number
  financing_type: string
  proof_of_funds: number
  status: BuyerStatus
  source: LeadSource
  notes?: string
  last_contacted_at?: string
  next_follow_up_at?: string
  tags: string
}

export interface OutreachRecord {
  id: number
  created_at: string
  lead_type: 'seller' | 'buyer'
  lead_id: number
  channel: OutreachChannel
  subject?: string
  message?: string
  status: OutreachStatus
  sent_at?: string
  replied_at?: string
  notes?: string
}

export interface Task {
  id: number
  created_at: string
  due_at?: string
  completed_at?: string
  lead_type?: 'seller' | 'buyer'
  lead_id?: number
  lead_name?: string
  title: string
  notes?: string
  priority: 'low' | 'normal' | 'high' | 'urgent'
  completed: number
}

export const SELLER_STATUSES: { value: SellerStatus; label: string; color: string }[] = [
  { value: 'new',            label: 'New Lead',        color: 'bg-gray-100 text-gray-700' },
  { value: 'contacted',      label: 'Contacted',       color: 'bg-blue-100 text-blue-700' },
  { value: 'qualified',      label: 'Qualified',       color: 'bg-purple-100 text-purple-700' },
  { value: 'active',         label: 'Active',          color: 'bg-yellow-100 text-yellow-700' },
  { value: 'under_contract', label: 'Under Contract',  color: 'bg-orange-100 text-orange-700' },
  { value: 'closed_won',     label: 'Closed',          color: 'bg-green-100 text-green-700' },
  { value: 'closed_lost',    label: 'Lost',            color: 'bg-red-100 text-red-700' },
  { value: 'not_interested', label: 'Not Interested',  color: 'bg-slate-100 text-slate-600' },
]

export const BUYER_STATUSES: { value: BuyerStatus; label: string; color: string }[] = [
  { value: 'new',            label: 'New Lead',        color: 'bg-gray-100 text-gray-700' },
  { value: 'qualified',      label: 'Qualified',       color: 'bg-purple-100 text-purple-700' },
  { value: 'matched',        label: 'Matched',         color: 'bg-blue-100 text-blue-700' },
  { value: 'active',         label: 'Active',          color: 'bg-yellow-100 text-yellow-700' },
  { value: 'under_contract', label: 'Under Contract',  color: 'bg-orange-100 text-orange-700' },
  { value: 'closed_won',     label: 'Closed',          color: 'bg-green-100 text-green-700' },
  { value: 'closed_lost',    label: 'Lost',            color: 'bg-red-100 text-red-700' },
]

export const CA_COUNTIES = [
  'Alameda','Alpine','Amador','Butte','Calaveras','Colusa','Contra Costa',
  'Del Norte','El Dorado','Fresno','Glenn','Humboldt','Imperial','Inyo',
  'Kern','Kings','Lake','Lassen','Los Angeles','Madera','Marin','Mariposa',
  'Mendocino','Merced','Modoc','Mono','Monterey','Napa','Nevada','Orange',
  'Placer','Plumas','Riverside','Sacramento','San Benito','San Bernardino',
  'San Diego','San Francisco','San Joaquin','San Luis Obispo','San Mateo',
  'Santa Barbara','Santa Clara','Santa Cruz','Shasta','Sierra','Siskiyou',
  'Solano','Sonoma','Stanislaus','Sutter','Tehama','Trinity','Tulare',
  'Tuolumne','Ventura','Yolo','Yuba',
]
