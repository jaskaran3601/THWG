import { NextRequest, NextResponse } from 'next/server'
import getDb from '@/lib/db'

// Bulk import sellers from CSV data
// Expected CSV columns (flexible matching):
// facility_name, owner_name, license_number, facility_type, address, city, county, zip,
// bed_capacity, phone, email, status, priority, source, notes
export async function POST(req: NextRequest) {
  const db = getDb()
  const body = await req.json()
  const { rows, source = 'csv_import' } = body as {
    rows: Record<string, string>[]
    source?: string
  }

  if (!Array.isArray(rows) || rows.length === 0) {
    return NextResponse.json({ error: 'No rows provided' }, { status: 400 })
  }

  const normalizeKey = (key: string) =>
    key.toLowerCase().trim().replace(/[\s\-]+/g, '_')

  const fieldMap: Record<string, string> = {
    facility_name: 'facility_name',
    name: 'facility_name',
    facility: 'facility_name',
    business_name: 'facility_name',
    owner_name: 'owner_name',
    owner: 'owner_name',
    contact: 'owner_name',
    contact_name: 'owner_name',
    license_number: 'license_number',
    license: 'license_number',
    license_no: 'license_number',
    lic_number: 'license_number',
    facility_type: 'facility_type',
    type: 'facility_type',
    address: 'address',
    street: 'address',
    street_address: 'address',
    city: 'city',
    county: 'county',
    zip: 'zip',
    zip_code: 'zip',
    postal_code: 'zip',
    bed_capacity: 'bed_capacity',
    beds: 'bed_capacity',
    capacity: 'bed_capacity',
    total_beds: 'bed_capacity',
    phone: 'phone',
    telephone: 'phone',
    phone_number: 'phone',
    email: 'email',
    email_address: 'email',
    asking_price: 'asking_price',
    price: 'asking_price',
    notes: 'notes',
    comments: 'notes',
  }

  const stmt = db.prepare(`
    INSERT OR IGNORE INTO sellers (
      facility_name, owner_name, license_number, facility_type, license_status,
      address, city, county, state, zip, bed_capacity,
      phone, email, status, priority, source, notes, tags
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  let imported = 0
  let skipped = 0
  const errors: string[] = []

  const importMany = db.transaction(() => {
    for (const rawRow of rows) {
      // Normalize keys
      const row: Record<string, string> = {}
      for (const [k, v] of Object.entries(rawRow)) {
        const mapped = fieldMap[normalizeKey(k)]
        if (mapped) row[mapped] = v?.trim() ?? ''
      }

      if (!row.facility_name) {
        skipped++
        errors.push(`Row skipped: missing facility_name`)
        continue
      }

      try {
        stmt.run(
          row.facility_name,
          row.owner_name || null,
          row.license_number || null,
          row.facility_type || 'RCFE',
          'Active',
          row.address || null,
          row.city || null,
          row.county || null,
          'CA',
          row.zip || null,
          row.bed_capacity ? parseInt(row.bed_capacity) : null,
          row.phone || null,
          row.email || null,
          'new',
          'cold',
          source,
          row.notes || null,
          '[]'
        )
        imported++
      } catch (e) {
        skipped++
        errors.push(`Row skipped: ${(e as Error).message}`)
      }
    }
  })

  importMany()

  return NextResponse.json({
    imported,
    skipped,
    errors: errors.slice(0, 20),
    total: rows.length,
  })
}
