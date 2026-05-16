import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'

const DB_PATH = process.env.DATABASE_PATH || './data/rcfe_crm.db'
const resolvedPath = path.resolve(process.cwd(), DB_PATH)

// Ensure data directory exists
const dir = path.dirname(resolvedPath)
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true })
}

let db: Database.Database

function getDb(): Database.Database {
  if (!db) {
    db = new Database(resolvedPath)
    db.pragma('journal_mode = WAL')
    db.pragma('foreign_keys = ON')
    initSchema(db)
  }
  return db
}

function initSchema(database: Database.Database) {
  database.exec(`
    CREATE TABLE IF NOT EXISTS sellers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),

      -- Facility Info
      facility_name TEXT NOT NULL,
      owner_name TEXT,
      license_number TEXT,
      facility_type TEXT DEFAULT 'RCFE',
      license_status TEXT DEFAULT 'Active',

      -- Location
      address TEXT,
      city TEXT,
      county TEXT,
      state TEXT DEFAULT 'CA',
      zip TEXT,

      -- Business Details
      bed_capacity INTEGER,
      current_census INTEGER,
      years_in_operation INTEGER,
      reason_for_selling TEXT,

      -- Financials
      asking_price REAL,
      gross_revenue REAL,
      noi REAL,
      cap_rate REAL,
      real_estate_included INTEGER DEFAULT 0,
      real_estate_value REAL,

      -- Contact
      phone TEXT,
      email TEXT,
      website TEXT,

      -- CRM
      status TEXT DEFAULT 'new',
      priority TEXT DEFAULT 'warm',
      source TEXT DEFAULT 'manual',
      notes TEXT,
      outreach_count INTEGER DEFAULT 0,
      last_contacted_at TEXT,
      next_follow_up_at TEXT,

      -- Metadata
      tags TEXT DEFAULT '[]'
    );

    CREATE TABLE IF NOT EXISTS buyers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),

      -- Contact
      contact_name TEXT NOT NULL,
      company TEXT,
      phone TEXT,
      email TEXT,

      -- Buying Criteria
      budget_min REAL,
      budget_max REAL,
      preferred_counties TEXT DEFAULT '[]',
      min_beds INTEGER,
      max_beds INTEGER,
      facility_types TEXT DEFAULT '["RCFE"]',
      real_estate_required INTEGER DEFAULT 0,

      -- Qualification
      timeline TEXT DEFAULT '6_months',
      experience_level TEXT DEFAULT 'first_time',
      financing_pre_approved INTEGER DEFAULT 0,
      financing_type TEXT DEFAULT 'sba',
      proof_of_funds INTEGER DEFAULT 0,

      -- CRM
      status TEXT DEFAULT 'new',
      source TEXT DEFAULT 'manual',
      notes TEXT,
      last_contacted_at TEXT,
      next_follow_up_at TEXT,

      -- Metadata
      tags TEXT DEFAULT '[]'
    );

    CREATE TABLE IF NOT EXISTS outreach (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),

      lead_type TEXT NOT NULL CHECK(lead_type IN ('seller', 'buyer')),
      lead_id INTEGER NOT NULL,

      channel TEXT NOT NULL CHECK(channel IN ('email', 'phone', 'sms', 'linkedin', 'direct_mail', 'in_person')),
      subject TEXT,
      message TEXT,
      status TEXT DEFAULT 'sent' CHECK(status IN ('draft', 'sent', 'delivered', 'opened', 'replied', 'bounced', 'unsubscribed')),

      sent_at TEXT,
      replied_at TEXT,
      notes TEXT
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      due_at TEXT,
      completed_at TEXT,

      lead_type TEXT CHECK(lead_type IN ('seller', 'buyer')),
      lead_id INTEGER,
      lead_name TEXT,

      title TEXT NOT NULL,
      notes TEXT,
      priority TEXT DEFAULT 'normal' CHECK(priority IN ('low', 'normal', 'high', 'urgent')),
      completed INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS sequences (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      name TEXT NOT NULL,
      description TEXT,
      lead_type TEXT DEFAULT 'seller',
      steps TEXT DEFAULT '[]',
      active INTEGER DEFAULT 1
    );

    -- Indexes
    CREATE INDEX IF NOT EXISTS idx_sellers_status ON sellers(status);
    CREATE INDEX IF NOT EXISTS idx_sellers_county ON sellers(county);
    CREATE INDEX IF NOT EXISTS idx_sellers_priority ON sellers(priority);
    CREATE INDEX IF NOT EXISTS idx_buyers_status ON buyers(status);
    CREATE INDEX IF NOT EXISTS idx_outreach_lead ON outreach(lead_type, lead_id);
    CREATE INDEX IF NOT EXISTS idx_tasks_lead ON tasks(lead_type, lead_id);
    CREATE INDEX IF NOT EXISTS idx_tasks_due ON tasks(due_at, completed);
  `)

  // Seed default outreach sequences
  const seqCount = database.prepare('SELECT COUNT(*) as c FROM sequences').get() as { c: number }
  if (seqCount.c === 0) {
    database.prepare(`
      INSERT INTO sequences (name, description, lead_type, steps) VALUES (?, ?, ?, ?)
    `).run(
      'RCFE Seller Cold Outreach',
      'Multi-touch cold outreach sequence targeting RCFE facility owners',
      'seller',
      JSON.stringify([
        {
          day: 0,
          channel: 'email',
          subject: 'Interested buyers looking for RCFEs in {{county}}',
          template: 'seller_cold_email_1',
        },
        {
          day: 3,
          channel: 'phone',
          subject: 'Follow-up call',
          template: 'seller_follow_up_call',
        },
        {
          day: 7,
          channel: 'email',
          subject: 'RCFE Market Update – {{county}} {{current_year}}',
          template: 'seller_cold_email_2',
        },
        {
          day: 14,
          channel: 'sms',
          subject: 'Quick check-in',
          template: 'seller_sms_1',
        },
        {
          day: 21,
          channel: 'email',
          subject: 'Final note – Recent RCFE sales near you',
          template: 'seller_cold_email_3',
        },
      ])
    )
  }
}

export default getDb
