import { NextRequest, NextResponse } from 'next/server'
import getDb from '@/lib/db'

export async function GET(req: NextRequest) {
  const db = getDb()
  const { searchParams } = new URL(req.url)
  const completed = searchParams.get('completed')
  const leadType = searchParams.get('lead_type')
  const leadId = searchParams.get('lead_id')

  let query = 'SELECT * FROM tasks WHERE 1=1'
  const params: (string | number)[] = []

  if (completed !== null) { query += ' AND completed = ?'; params.push(completed === 'true' ? 1 : 0) }
  if (leadType) { query += ' AND lead_type = ?'; params.push(leadType) }
  if (leadId) { query += ' AND lead_id = ?'; params.push(leadId) }

  query += ' ORDER BY completed ASC, due_at ASC'
  const tasks = db.prepare(query).all(...params)
  return NextResponse.json(tasks)
}

export async function POST(req: NextRequest) {
  const db = getDb()
  const body = await req.json()

  const result = db.prepare(`
    INSERT INTO tasks (lead_type, lead_id, lead_name, title, notes, priority, due_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    body.lead_type ?? null, body.lead_id ?? null, body.lead_name ?? null,
    body.title, body.notes ?? null,
    body.priority ?? 'normal', body.due_at ?? null
  )

  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(result.lastInsertRowid)
  return NextResponse.json(task, { status: 201 })
}

export async function PATCH(req: NextRequest) {
  const db = getDb()
  const body = await req.json()
  const { id, completed } = body

  db.prepare(`
    UPDATE tasks SET completed = ?, completed_at = ? WHERE id = ?
  `).run(completed ? 1 : 0, completed ? new Date().toISOString() : null, id)

  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id)
  return NextResponse.json(task)
}
