import { NextRequest, NextResponse } from 'next/server'
import getDb from '@/lib/db'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const db = getDb()
  const seller = db.prepare('SELECT * FROM sellers WHERE id = ?').get(params.id)
  if (!seller) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const outreach = db.prepare(
    'SELECT * FROM outreach WHERE lead_type = ? AND lead_id = ? ORDER BY created_at DESC'
  ).all('seller', params.id)

  const tasks = db.prepare(
    'SELECT * FROM tasks WHERE lead_type = ? AND lead_id = ? ORDER BY completed ASC, due_at ASC'
  ).all('seller', params.id)

  return NextResponse.json({ seller, outreach, tasks })
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const db = getDb()
  const body = await req.json()

  const existing = db.prepare('SELECT id FROM sellers WHERE id = ?').get(params.id)
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const fields = Object.keys(body)
    .filter(k => k !== 'id' && k !== 'created_at')
    .map(k => `${k} = ?`)
    .join(', ')

  const values = Object.keys(body)
    .filter(k => k !== 'id' && k !== 'created_at')
    .map(k => {
      if (k === 'tags' && Array.isArray(body[k])) return JSON.stringify(body[k])
      return body[k]
    })

  db.prepare(`UPDATE sellers SET ${fields}, updated_at = datetime('now') WHERE id = ?`).run(
    ...values, params.id
  )

  const seller = db.prepare('SELECT * FROM sellers WHERE id = ?').get(params.id)
  return NextResponse.json(seller)
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const db = getDb()
  db.prepare('DELETE FROM outreach WHERE lead_type = ? AND lead_id = ?').run('seller', params.id)
  db.prepare('DELETE FROM tasks WHERE lead_type = ? AND lead_id = ?').run('seller', params.id)
  db.prepare('DELETE FROM sellers WHERE id = ?').run(params.id)
  return NextResponse.json({ success: true })
}
