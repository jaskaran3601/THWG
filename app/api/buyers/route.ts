import { NextRequest, NextResponse } from 'next/server'
import getDb from '@/lib/db'

export async function GET(req: NextRequest) {
  const db = getDb()
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const search = searchParams.get('search')

  let query = 'SELECT * FROM buyers WHERE 1=1'
  const params: (string | number)[] = []

  if (status) { query += ' AND status = ?'; params.push(status) }
  if (search) {
    query += ' AND (contact_name LIKE ? OR company LIKE ? OR email LIKE ?)'
    params.push(`%${search}%`, `%${search}%`, `%${search}%`)
  }

  query += ' ORDER BY created_at DESC'
  const buyers = db.prepare(query).all(...params)
  return NextResponse.json(buyers)
}

export async function POST(req: NextRequest) {
  const db = getDb()
  const body = await req.json()

  const stmt = db.prepare(`
    INSERT INTO buyers (
      contact_name, company, phone, email,
      budget_min, budget_max, preferred_counties, min_beds, max_beds,
      facility_types, real_estate_required,
      timeline, experience_level, financing_pre_approved, financing_type, proof_of_funds,
      status, source, notes, next_follow_up_at, tags
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  const result = stmt.run(
    body.contact_name, body.company ?? null, body.phone ?? null, body.email ?? null,
    body.budget_min ?? null, body.budget_max ?? null,
    JSON.stringify(body.preferred_counties ?? []),
    body.min_beds ?? null, body.max_beds ?? null,
    JSON.stringify(body.facility_types ?? ['RCFE']),
    body.real_estate_required ? 1 : 0,
    body.timeline ?? '6_months',
    body.experience_level ?? 'first_time',
    body.financing_pre_approved ? 1 : 0,
    body.financing_type ?? 'sba',
    body.proof_of_funds ? 1 : 0,
    body.status ?? 'new', body.source ?? 'manual',
    body.notes ?? null, body.next_follow_up_at ?? null,
    JSON.stringify(body.tags ?? [])
  )

  const buyer = db.prepare('SELECT * FROM buyers WHERE id = ?').get(result.lastInsertRowid)
  return NextResponse.json(buyer, { status: 201 })
}
