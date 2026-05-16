import { NextRequest, NextResponse } from 'next/server'
import getDb from '@/lib/db'

export async function GET(req: NextRequest) {
  const db = getDb()
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const priority = searchParams.get('priority')
  const county = searchParams.get('county')
  const search = searchParams.get('search')

  let query = 'SELECT * FROM sellers WHERE 1=1'
  const params: (string | number)[] = []

  if (status) { query += ' AND status = ?'; params.push(status) }
  if (priority) { query += ' AND priority = ?'; params.push(priority) }
  if (county) { query += ' AND county = ?'; params.push(county) }
  if (search) {
    query += ' AND (facility_name LIKE ? OR owner_name LIKE ? OR city LIKE ? OR license_number LIKE ?)'
    params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`)
  }

  query += ' ORDER BY created_at DESC'
  const sellers = db.prepare(query).all(...params)
  return NextResponse.json(sellers)
}

export async function POST(req: NextRequest) {
  const db = getDb()
  const body = await req.json()

  const stmt = db.prepare(`
    INSERT INTO sellers (
      facility_name, owner_name, license_number, facility_type, license_status,
      address, city, county, state, zip,
      bed_capacity, current_census, years_in_operation, reason_for_selling,
      asking_price, gross_revenue, noi, cap_rate, real_estate_included, real_estate_value,
      phone, email, website,
      status, priority, source, notes, next_follow_up_at, tags
    ) VALUES (
      ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?,
      ?, ?, ?,
      ?, ?, ?, ?, ?, ?
    )
  `)

  const result = stmt.run(
    body.facility_name, body.owner_name ?? null, body.license_number ?? null,
    body.facility_type ?? 'RCFE', body.license_status ?? 'Active',
    body.address ?? null, body.city ?? null, body.county ?? null,
    body.state ?? 'CA', body.zip ?? null,
    body.bed_capacity ?? null, body.current_census ?? null,
    body.years_in_operation ?? null, body.reason_for_selling ?? null,
    body.asking_price ?? null, body.gross_revenue ?? null,
    body.noi ?? null, body.cap_rate ?? null,
    body.real_estate_included ? 1 : 0, body.real_estate_value ?? null,
    body.phone ?? null, body.email ?? null, body.website ?? null,
    body.status ?? 'new', body.priority ?? 'warm',
    body.source ?? 'manual', body.notes ?? null,
    body.next_follow_up_at ?? null,
    JSON.stringify(body.tags ?? [])
  )

  const seller = db.prepare('SELECT * FROM sellers WHERE id = ?').get(result.lastInsertRowid)
  return NextResponse.json(seller, { status: 201 })
}
