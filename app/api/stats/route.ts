import { NextResponse } from 'next/server'
import getDb from '@/lib/db'

export async function GET() {
  const db = getDb()

  const sellerStats = db.prepare(`
    SELECT
      COUNT(*) as total,
      SUM(CASE WHEN status = 'new' THEN 1 ELSE 0 END) as new_leads,
      SUM(CASE WHEN status = 'contacted' THEN 1 ELSE 0 END) as contacted,
      SUM(CASE WHEN status = 'qualified' THEN 1 ELSE 0 END) as qualified,
      SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
      SUM(CASE WHEN status = 'under_contract' THEN 1 ELSE 0 END) as under_contract,
      SUM(CASE WHEN status = 'closed_won' THEN 1 ELSE 0 END) as closed_won,
      SUM(CASE WHEN priority = 'hot' THEN 1 ELSE 0 END) as hot,
      SUM(CASE WHEN priority = 'warm' THEN 1 ELSE 0 END) as warm,
      SUM(asking_price) as total_pipeline_value,
      AVG(asking_price) as avg_price,
      SUM(CASE WHEN created_at >= date('now', '-7 days') THEN 1 ELSE 0 END) as added_this_week,
      SUM(CASE WHEN created_at >= date('now', '-30 days') THEN 1 ELSE 0 END) as added_this_month
    FROM sellers
  `).get() as Record<string, number>

  const buyerStats = db.prepare(`
    SELECT
      COUNT(*) as total,
      SUM(CASE WHEN status = 'new' THEN 1 ELSE 0 END) as new_leads,
      SUM(CASE WHEN status = 'qualified' THEN 1 ELSE 0 END) as qualified,
      SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
      SUM(CASE WHEN status = 'closed_won' THEN 1 ELSE 0 END) as closed_won
    FROM buyers
  `).get() as Record<string, number>

  const outreachStats = db.prepare(`
    SELECT
      COUNT(*) as total_sent,
      SUM(CASE WHEN status = 'replied' THEN 1 ELSE 0 END) as replies,
      SUM(CASE WHEN created_at >= date('now', '-7 days') THEN 1 ELSE 0 END) as sent_this_week
    FROM outreach
  `).get() as Record<string, number>

  const tasksDue = db.prepare(`
    SELECT COUNT(*) as count FROM tasks
    WHERE completed = 0 AND due_at <= date('now', '+1 day')
  `).get() as { count: number }

  const recentSellers = db.prepare(`
    SELECT id, facility_name, owner_name, city, county, bed_capacity,
           asking_price, status, priority, created_at, outreach_count
    FROM sellers ORDER BY created_at DESC LIMIT 5
  `).all()

  const hotSellers = db.prepare(`
    SELECT id, facility_name, owner_name, city, county, bed_capacity,
           asking_price, status, priority, last_contacted_at, next_follow_up_at
    FROM sellers WHERE priority = 'hot' AND status NOT IN ('closed_won','closed_lost','not_interested')
    ORDER BY updated_at DESC LIMIT 5
  `).all()

  const countyBreakdown = db.prepare(`
    SELECT county, COUNT(*) as count
    FROM sellers WHERE county IS NOT NULL
    GROUP BY county ORDER BY count DESC LIMIT 10
  `).all()

  return NextResponse.json({
    sellers: sellerStats,
    buyers: buyerStats,
    outreach: outreachStats,
    tasks_due: tasksDue.count,
    recent_sellers: recentSellers,
    hot_sellers: hotSellers,
    county_breakdown: countyBreakdown,
  })
}
