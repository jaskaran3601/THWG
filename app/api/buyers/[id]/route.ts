import { NextRequest, NextResponse } from 'next/server'
import getDb from '@/lib/db'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const db = getDb()
  const buyer = db.prepare('SELECT * FROM buyers WHERE id = ?').get(params.id)
  if (!buyer) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const outreach = db.prepare(
    'SELECT * FROM outreach WHERE lead_type = ? AND lead_id = ? ORDER BY created_at DESC'
  ).all('buyer', params.id)

  const tasks = db.prepare(
    'SELECT * FROM tasks WHERE lead_type = ? AND lead_id = ? ORDER BY completed ASC, due_at ASC'
  ).all('buyer', params.id)

  return NextResponse.json({ buyer, outreach, tasks })
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const db = getDb()
  const body = await req.json()

  const existing = db.prepare('SELECT id FROM buyers WHERE id = ?').get(params.id)
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const fields = Object.keys(body)
    .filter(k => k !== 'id' && k !== 'created_at')
    .map(k => `${k} = ?`)
    .join(', ')

  const values = Object.keys(body)
    .filter(k => k !== 'id' && k !== 'created_at')
    .map(k => {
      if ((k === 'tags' || k === 'preferred_counties' || k === 'facility_types') && Array.isArray(body[k])) {
        return JSON.stringify(body[k])
      }
      return body[k]
    })

  db.prepare(`UPDATE buyers SET ${fields}, updated_at = datetime('now') WHERE id = ?`).run(
    ...values, params.id
  )

  const buyer = db.prepare('SELECT * FROM buyers WHERE id = ?').get(params.id)
  return NextResponse.json(buyer)
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const db = getDb()
  db.prepare('DELETE FROM outreach WHERE lead_type = ? AND lead_id = ?').run('buyer', params.id)
  db.prepare('DELETE FROM tasks WHERE lead_type = ? AND lead_id = ?').run('buyer', params.id)
  db.prepare('DELETE FROM buyers WHERE id = ?').run(params.id)
  return NextResponse.json({ success: true })
}
