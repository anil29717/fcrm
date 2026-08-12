import type * as SQLite from 'expo-sqlite';

async function addColumn(db: SQLite.SQLiteDatabase, table: string, column: string, definition: string) {
  try {
    await db.execAsync(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  } catch {
    // column already exists
  }
}

export async function runMigrations(db: SQLite.SQLiteDatabase): Promise<void> {
  // ─── Company ─────────────────────────────────────────────────────────────
  const companyCols: [string, string][] = [
    ['owner_name', 'TEXT'],
    ['business_type', 'TEXT'],
    ['industry', 'TEXT'],
    ['email', 'TEXT'],
    ['phone', 'TEXT'],
    ['gstin', 'TEXT'],
    ['pan', 'TEXT'],
    ['msme_number', 'TEXT'],
    ['website', 'TEXT'],
    ['invoice_prefix', 'TEXT'],
    ['default_payment_terms', 'TEXT'],
    ['bank_account_name', 'TEXT'],
    ['bank_account_number', 'TEXT'],
    ['bank_ifsc', 'TEXT'],
    ['upi_id', 'TEXT'],
    ['payment_link', 'TEXT'],
    ['invoice_number_format', "TEXT DEFAULT '{prefix}-{FY}-{seq}'"],
    ['invoice_next_number', 'INTEGER DEFAULT 1'],
    ['invoice_reset_frequency', "TEXT DEFAULT 'never'"],
  ];
  for (const [col, def] of companyCols) {
    await addColumn(db, 'company', col, def);
  }

  // ─── Clients ─────────────────────────────────────────────────────────────
  const clientCols: [string, string][] = [
    ['client_type', 'TEXT'],
    ['gstin', 'TEXT'],
    ['address', 'TEXT'],
    ['lead_source', 'TEXT'],
    ['status', "TEXT DEFAULT 'active'"],
    ['tags', 'TEXT'],
  ];
  for (const [col, def] of clientCols) {
    await addColumn(db, 'clients', col, def);
  }

  // ─── Projects ────────────────────────────────────────────────────────────
  const projectCols: [string, string][] = [
    ['start_date', 'TEXT'],
    ['end_date', 'TEXT'],
    ['priority', 'TEXT'],
    ['billing_type', "TEXT DEFAULT 'fixed'"],
    ['project_value', 'REAL DEFAULT 0'],
    ['hourly_rate', 'REAL'],
    ['tags', 'TEXT'],
    ['version', 'INTEGER DEFAULT 1'],
  ];
  for (const [col, def] of projectCols) {
    await addColumn(db, 'projects', col, def);
  }

  // ─── Phases ──────────────────────────────────────────────────────────────
  const phaseCols: [string, string][] = [
    ['description', 'TEXT'],
    ['start_date', 'TEXT'],
    ['end_date', 'TEXT'],
    ['status', "TEXT DEFAULT 'pending'"],
  ];
  for (const [col, def] of phaseCols) {
    await addColumn(db, 'project_phases', col, def);
  }

  // ─── Documents ───────────────────────────────────────────────────────────
  await addColumn(db, 'project_documents', 'category', 'TEXT');
  await addColumn(db, 'project_documents', 'notes', 'TEXT');

  // ─── Invoices ────────────────────────────────────────────────────────────
  const invoiceCols: [string, string][] = [
    ['discount', 'REAL DEFAULT 0'],
    ['discount_type', "TEXT DEFAULT 'amount'"],
    ['tax_percent', 'REAL DEFAULT 0'],
    ['payment_method', 'TEXT'],
  ];
  for (const [col, def] of invoiceCols) {
    await addColumn(db, 'invoices', col, def);
  }

  // ─── Change requests ─────────────────────────────────────────────────────
  await addColumn(db, 'change_requests', 'client_approved', 'INTEGER DEFAULT 0');
  await addColumn(db, 'change_requests', 'status', "TEXT DEFAULT 'pending'");
  await addColumn(db, 'change_requests', 'scope_hours', 'TEXT');

  // ─── History ─────────────────────────────────────────────────────────────
  await addColumn(db, 'project_history', 'old_value', 'TEXT');
  await addColumn(db, 'project_history', 'new_value', 'TEXT');
  await addColumn(db, 'project_history', 'note', 'TEXT');

  // ─── Compliance docs ───────────────────────────────────────────────────────
  await addColumn(db, 'compliance_doc', 'doc_type', 'TEXT');

  // ─── New tables ──────────────────────────────────────────────────────────
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS contact_persons (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      designation TEXT,
      phone TEXT,
      email TEXT,
      is_primary INTEGER DEFAULT 0,
      FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS project_env_values (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL,
      key_name TEXT NOT NULL,
      value_encrypted TEXT NOT NULL,
      environment TEXT,
      notes TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS phase_tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      phase_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      is_done INTEGER DEFAULT 0,
      sort_order INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (phase_id) REFERENCES project_phases(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS payment_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      invoice_id INTEGER NOT NULL,
      amount REAL NOT NULL,
      payment_date TEXT NOT NULL,
      payment_method TEXT NOT NULL,
      reference TEXT,
      notes TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
    );
  `);
}
