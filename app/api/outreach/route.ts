import { NextRequest, NextResponse } from 'next/server'
import getDb from '@/lib/db'

export async function GET(req: NextRequest) {
  const db = getDb()
  const { searchParams } = new URL(req.url)
  const leadType = searchParams.get('lead_type')
  const leadId = searchParams.get('lead_id')
  const limit = parseInt(searchParams.get('limit') ?? '50')

  let query = 'SELECT * FROM outreach WHERE 1=1'
  const params: (string | number)[] = []

  if (leadType) { query += ' AND lead_type = ?'; params.push(leadType) }
  if (leadId) { query += ' AND lead_id = ?'; params.push(leadId) }

  query += ' ORDER BY created_at DESC LIMIT ?'
  params.push(limit)

  const records = db.prepare(query).all(...params)
  return NextResponse.json(records)
}

export async function POST(req: NextRequest) {
  const db = getDb()
  const body = await req.json()

  const stmt = db.prepare(`
    INSERT INTO outreach (lead_type, lead_id, channel, subject, message, status, sent_at, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `)

  const result = stmt.run(
    body.lead_type, body.lead_id, body.channel,
    body.subject ?? null, body.message ?? null,
    body.status ?? 'sent',
    body.sent_at ?? new Date().toISOString(),
    body.notes ?? null
  )

  // Update seller/buyer outreach count and last_contacted_at
  const table = body.lead_type === 'seller' ? 'sellers' : 'buyers'
  db.prepare(`
    UPDATE ${table}
    SET outreach_count = outreach_count + 1,
        last_contacted_at = datetime('now'),
        updated_at = datetime('now')
    WHERE id = ?
  `).run(body.lead_id)

  const record = db.prepare('SELECT * FROM outreach WHERE id = ?').get(result.lastInsertRowid)
  return NextResponse.json(record, { status: 201 })
}
