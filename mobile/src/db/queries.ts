import type {
  ActivityItem,
  ChangeRequest,
  Client,
  ClientInput,
  Company,
  CompanyProfileInput,
  ComplianceDoc,
  ContactPerson,
  DashboardStats,
  Invoice,
  LineItem,
  Milestone,
  PaymentRecord,
  PhaseTask,
  Project,
  ProjectDocument,
  ProjectEnvValue,
  ProjectHistory,
  ProjectInput,
  ProjectPhase,
  TemplateBlock,
} from '../types';
import { encryptValue } from '../utils/security';
import { getFinancialYear, generateInvoiceNumber } from '../utils/format';
import { getDatabase } from './database';

const now = () => new Date().toISOString();

// ─── Company ───────────────────────────────────────────────────────────────

export async function getCompany(): Promise<Company | null> {
  const db = await getDatabase();
  return db.getFirstAsync<Company>('SELECT * FROM company LIMIT 1');
}

export async function saveCompany(data: CompanyProfileInput): Promise<number> {
  const db = await getDatabase();
  const existing = await getCompany();
  const ts = now();
  const prefix = data.invoice_prefix?.toUpperCase() ?? data.short_code.toUpperCase();

  const fields = {
    name: data.name,
    short_code: data.short_code.toUpperCase(),
    owner_name: data.owner_name ?? null,
    address: data.address ?? null,
    logo_path: data.logo_path ?? existing?.logo_path ?? null,
    business_type: data.business_type ?? null,
    industry: data.industry ?? null,
    email: data.email ?? null,
    phone: data.phone ?? null,
    gstin: data.gstin ?? null,
    pan: data.pan ?? null,
    msme_number: data.msme_number ?? null,
    website: data.website ?? null,
    currency: data.currency ?? existing?.currency ?? 'INR',
    financial_year_start_month: data.financial_year_start_month ?? existing?.financial_year_start_month ?? 4,
    invoice_prefix: prefix,
    default_payment_terms: data.default_payment_terms ?? null,
    bank_account_name: data.bank_account_name ?? null,
    bank_account_number: data.bank_account_number ?? null,
    bank_ifsc: data.bank_ifsc ?? null,
    upi_id: data.upi_id ?? null,
    payment_link: data.payment_link ?? null,
    invoice_number_format: data.invoice_number_format ?? existing?.invoice_number_format ?? '{prefix}-{FY}-{seq}',
    invoice_next_number: data.invoice_next_number ?? existing?.invoice_next_number ?? 1,
    invoice_reset_frequency: data.invoice_reset_frequency ?? existing?.invoice_reset_frequency ?? 'never',
    signature_mode: data.signature_mode ?? existing?.signature_mode ?? 'computer_generated',
    signature_path:
      data.signature_path !== undefined
        ? data.signature_path
        : (existing?.signature_path ?? null),
  };

  if (existing) {
    await db.runAsync(
      `UPDATE company SET name=?, short_code=?, owner_name=?, address=?, logo_path=?, business_type=?, industry=?,
       email=?, phone=?, gstin=?, pan=?, msme_number=?, website=?, currency=?, financial_year_start_month=?,
       invoice_prefix=?, default_payment_terms=?, bank_account_name=?, bank_account_number=?, bank_ifsc=?,
       upi_id=?, payment_link=?, invoice_number_format=?, invoice_next_number=?, invoice_reset_frequency=?,
       signature_mode=?, signature_path=?, updated_at=? WHERE id=?`,
      [
        fields.name, fields.short_code, fields.owner_name, fields.address, fields.logo_path,
        fields.business_type, fields.industry, fields.email, fields.phone, fields.gstin, fields.pan,
        fields.msme_number, fields.website, fields.currency, fields.financial_year_start_month,
        fields.invoice_prefix, fields.default_payment_terms, fields.bank_account_name,
        fields.bank_account_number, fields.bank_ifsc, fields.upi_id, fields.payment_link,
        fields.invoice_number_format, fields.invoice_next_number, fields.invoice_reset_frequency,
        fields.signature_mode, fields.signature_path,
        ts, existing.id,
      ],
    );
    return existing.id;
  }

  const result = await db.runAsync(
    `INSERT INTO company (name, short_code, owner_name, address, logo_path, business_type, industry, email, phone,
     gstin, pan, msme_number, website, currency, financial_year_start_month, invoice_prefix, default_payment_terms,
     bank_account_name, bank_account_number, bank_ifsc, upi_id, payment_link, invoice_number_format,
     invoice_next_number, invoice_reset_frequency, signature_mode, signature_path, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      fields.name, fields.short_code, fields.owner_name, fields.address, fields.logo_path,
      fields.business_type, fields.industry, fields.email, fields.phone, fields.gstin, fields.pan,
      fields.msme_number, fields.website, fields.currency, fields.financial_year_start_month,
      fields.invoice_prefix, fields.default_payment_terms, fields.bank_account_name,
      fields.bank_account_number, fields.bank_ifsc, fields.upi_id, fields.payment_link,
      fields.invoice_number_format, fields.invoice_next_number, fields.invoice_reset_frequency,
      fields.signature_mode, fields.signature_path, ts, ts,
    ],
  );
  return result.lastInsertRowId;
}

export async function getComplianceDocs(companyId: number): Promise<ComplianceDoc[]> {
  const db = await getDatabase();
  return db.getAllAsync<ComplianceDoc>(
    'SELECT * FROM compliance_doc WHERE company_id = ? ORDER BY id',
    [companyId],
  );
}

export async function saveComplianceDoc(data: {
  company_id: number;
  title: string;
  file_path: string;
  doc_type?: string;
}): Promise<number> {
  const db = await getDatabase();
  const result = await db.runAsync(
    'INSERT INTO compliance_doc (company_id, title, file_path, doc_type) VALUES (?, ?, ?, ?)',
    [data.company_id, data.title, data.file_path, data.doc_type ?? null],
  );
  return result.lastInsertRowId;
}

export async function deleteComplianceDoc(id: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM compliance_doc WHERE id = ?', [id]);
}

// ─── Clients ─────────────────────────────────────────────────────────────────

export async function getClients(search = ''): Promise<Client[]> {
  const db = await getDatabase();
  const query = search
    ? `SELECT c.*, COUNT(p.id) as project_count FROM clients c
       LEFT JOIN projects p ON p.client_id = c.id
       WHERE c.name LIKE ? OR c.email LIKE ? OR c.phone LIKE ?
       GROUP BY c.id ORDER BY c.name`
    : `SELECT c.*, COUNT(p.id) as project_count FROM clients c
       LEFT JOIN projects p ON p.client_id = c.id
       GROUP BY c.id ORDER BY c.name`;
  const params = search ? [`%${search}%`, `%${search}%`, `%${search}%`] : [];
  return db.getAllAsync<Client>(query, params);
}

export async function getClient(id: number): Promise<Client | null> {
  const db = await getDatabase();
  return db.getFirstAsync<Client>('SELECT * FROM clients WHERE id = ?', [id]);
}

export async function getContactPersons(clientId: number): Promise<ContactPerson[]> {
  const db = await getDatabase();
  return db.getAllAsync<ContactPerson>(
    'SELECT * FROM contact_persons WHERE client_id = ? ORDER BY is_primary DESC, id',
    [clientId],
  );
}

async function saveContactPersons(clientId: number, contacts: ContactPerson[]): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM contact_persons WHERE client_id = ?', [clientId]);
  for (const c of contacts) {
    if (!c.name.trim()) continue;
    await db.runAsync(
      'INSERT INTO contact_persons (client_id, name, designation, phone, email, is_primary) VALUES (?, ?, ?, ?, ?, ?)',
      [clientId, c.name.trim(), c.designation ?? null, c.phone ?? null, c.email ?? null, c.is_primary ? 1 : 0],
    );
  }
}

export async function saveClient(data: ClientInput): Promise<number> {
  const db = await getDatabase();
  const ts = now();
  const tagsJson = data.tags?.length ? JSON.stringify(data.tags) : null;
  let clientId: number;

  if (data.id) {
    await db.runAsync(
      `UPDATE clients SET name=?, client_type=?, gstin=?, address=?, lead_source=?, status=?, tags=?,
       phone=?, email=?, notes=?, updated_at=? WHERE id=?`,
      [
        data.name, data.client_type ?? null, data.gstin ?? null, data.address ?? null,
        data.lead_source ?? null, data.status ?? 'active', tagsJson,
        data.phone ?? null, data.email ?? null, data.notes ?? null, ts, data.id,
      ],
    );
    clientId = data.id;
  } else {
    const result = await db.runAsync(
      `INSERT INTO clients (name, client_type, gstin, address, lead_source, status, tags, phone, email, notes, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.name, data.client_type ?? null, data.gstin ?? null, data.address ?? null,
        data.lead_source ?? null, data.status ?? 'active', tagsJson,
        data.phone ?? null, data.email ?? null, data.notes ?? null, ts, ts,
      ],
    );
    clientId = result.lastInsertRowId;
  }

  if (data.contacts) {
    await saveContactPersons(clientId, data.contacts);
  }
  return clientId;
}

export async function deleteClient(id: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM clients WHERE id = ?', [id]);
}

// ─── Projects ────────────────────────────────────────────────────────────────

export async function getProjects(search = ''): Promise<Project[]> {
  const db = await getDatabase();
  const query = search
    ? `SELECT p.*, c.name as client_name FROM projects p
       JOIN clients c ON c.id = p.client_id
       WHERE p.name LIKE ? OR c.name LIKE ?
       ORDER BY p.updated_at DESC`
    : `SELECT p.*, c.name as client_name FROM projects p
       JOIN clients c ON c.id = p.client_id
       ORDER BY p.updated_at DESC`;
  const params = search ? [`%${search}%`, `%${search}%`] : [];
  return db.getAllAsync<Project>(query, params);
}

export async function getProjectsByClient(clientId: number): Promise<Project[]> {
  const db = await getDatabase();
  return db.getAllAsync<Project>(
    'SELECT * FROM projects WHERE client_id = ? ORDER BY updated_at DESC',
    [clientId],
  );
}

export async function getProject(id: number): Promise<Project | null> {
  const db = await getDatabase();
  return db.getFirstAsync<Project>(
    `SELECT p.*, c.name as client_name FROM projects p
     JOIN clients c ON c.id = p.client_id WHERE p.id = ?`,
    [id],
  );
}

export async function saveProject(data: ProjectInput): Promise<number> {
  const db = await getDatabase();
  const ts = now();
  const tagsJson = data.tags?.length ? JSON.stringify(data.tags) : null;
  const status = data.status ?? 'active';

  if (data.id) {
    const existing = await getProject(data.id);
    await db.runAsync(
      `UPDATE projects SET client_id=?, name=?, type=?, description=?, website_url=?, start_date=?, end_date=?,
       priority=?, billing_type=?, project_value=?, hourly_rate=?, tags=?, status=?, version=COALESCE(version,1)+1, updated_at=? WHERE id=?`,
      [
        data.client_id, data.name, data.type ?? null, data.description ?? null, data.website_url ?? null,
        data.start_date ?? null, data.end_date ?? null, data.priority ?? null,
        data.billing_type ?? 'fixed', data.project_value ?? 0, data.hourly_rate ?? null,
        tagsJson, status, ts, data.id,
      ],
    );
    if (existing) {
      const changes: string[] = [];
      if (existing.name !== data.name) changes.push(`name: ${existing.name} → ${data.name}`);
      if ((existing.status ?? '') !== status) {
        await addProjectHistory(data.id, 'status', 'Status changed', existing.status, status);
      }
      if ((existing.project_value ?? 0) !== (data.project_value ?? 0)) {
        changes.push(`value: ${existing.project_value ?? 0} → ${data.project_value ?? 0}`);
      }
      if ((existing.start_date ?? '') !== (data.start_date ?? '')) {
        changes.push(`start date: ${existing.start_date ?? '—'} → ${data.start_date ?? '—'}`);
      }
      if ((existing.end_date ?? '') !== (data.end_date ?? '')) {
        changes.push(`end date: ${existing.end_date ?? '—'} → ${data.end_date ?? '—'}`);
      }
      if ((existing.priority ?? '') !== (data.priority ?? '')) {
        changes.push(`priority: ${existing.priority ?? '—'} → ${data.priority ?? '—'}`);
      }
      if ((existing.billing_type ?? '') !== (data.billing_type ?? '')) {
        changes.push(`billing: ${existing.billing_type ?? '—'} → ${data.billing_type ?? '—'}`);
      }
      if (changes.length) {
        const version = ((existing as { version?: number }).version ?? 1) + 1;
        await addProjectHistory(
          data.id,
          'version',
          `Project updated to v${version}`,
          null,
          null,
          changes.join('; '),
        );
      }
    }
    return data.id;
  }

  const result = await db.runAsync(
    `INSERT INTO projects (client_id, name, type, description, website_url, start_date, end_date, priority,
     billing_type, project_value, hourly_rate, tags, credentials_encrypted, status, version, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)`,
    [
      data.client_id, data.name, data.type ?? null, data.description ?? null, data.website_url ?? null,
      data.start_date ?? null, data.end_date ?? null, data.priority ?? null,
      data.billing_type ?? 'fixed', data.project_value ?? 0, data.hourly_rate ?? null,
      tagsJson, null, status, ts, ts,
    ],
  );
  const projectId = result.lastInsertRowId;

  if (data.initial_phases?.length) {
    for (let i = 0; i < data.initial_phases.length; i++) {
      const title = data.initial_phases[i].trim();
      if (title) {
        await savePhase({ project_id: projectId, title, sort_order: i });
      }
    }
  }

  await addProjectHistory(projectId, 'created', `Project "${data.name}" created`, null, null, 'v1');
  return projectId;
}

export async function deleteProject(id: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM projects WHERE id = ?', [id]);
}

// ─── Phases ──────────────────────────────────────────────────────────────────

export async function getPhases(projectId: number): Promise<ProjectPhase[]> {
  const db = await getDatabase();
  return db.getAllAsync<ProjectPhase>(
    'SELECT * FROM project_phases WHERE project_id = ? ORDER BY sort_order',
    [projectId],
  );
}

export async function getPhase(id: number): Promise<ProjectPhase | null> {
  const db = await getDatabase();
  return db.getFirstAsync<ProjectPhase>('SELECT * FROM project_phases WHERE id = ?', [id]);
}

export async function savePhase(data: {
  id?: number;
  project_id: number;
  title: string;
  sort_order: number;
  is_completed?: number;
  description?: string;
  start_date?: string;
  end_date?: string;
  status?: string;
}): Promise<number> {
  const db = await getDatabase();
  if (data.id) {
    const existing = await getPhase(data.id);
    await db.runAsync(
      `UPDATE project_phases SET title=?, sort_order=?, is_completed=?, description=?, start_date=?, end_date=?, status=? WHERE id=?`,
      [
        data.title, data.sort_order, data.is_completed ?? 0,
        data.description ?? null, data.start_date ?? null, data.end_date ?? null,
        data.status ?? 'pending', data.id,
      ],
    );
    if (existing) {
      const notes: string[] = [];
      if (existing.title !== data.title) notes.push(`title: ${existing.title} → ${data.title}`);
      if ((existing.status ?? '') !== (data.status ?? 'pending')) {
        notes.push(`status: ${existing.status ?? 'pending'} → ${data.status ?? 'pending'}`);
      }
      if ((existing.start_date ?? '') !== (data.start_date ?? '')) {
        notes.push(`start: ${existing.start_date ?? '—'} → ${data.start_date ?? '—'}`);
      }
      if ((existing.end_date ?? '') !== (data.end_date ?? '')) {
        notes.push(`end: ${existing.end_date ?? '—'} → ${data.end_date ?? '—'}`);
      }
      await addProjectHistory(
        data.project_id,
        'phase',
        `Phase "${data.title}" updated`,
        existing.status,
        data.status ?? 'pending',
        notes.length ? notes.join('; ') : null,
      );
    }
    return data.id;
  }
  const result = await db.runAsync(
    `INSERT INTO project_phases (project_id, title, sort_order, is_completed, description, start_date, end_date, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.project_id, data.title, data.sort_order, data.is_completed ?? 0,
      data.description ?? null, data.start_date ?? null, data.end_date ?? null,
      data.status ?? 'pending',
    ],
  );
  await addProjectHistory(data.project_id, 'phase', `Phase "${data.title}" added`);
  return result.lastInsertRowId;
}

export async function togglePhaseComplete(id: number, projectId: number, title: string, completed: boolean): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    'UPDATE project_phases SET is_completed=?, status=? WHERE id=?',
    [completed ? 1 : 0, completed ? 'completed' : 'pending', id],
  );
  await addProjectHistory(
    projectId,
    'phase',
    `Phase "${title}" marked ${completed ? 'complete' : 'incomplete'}`,
  );
}

export async function deletePhase(id: number): Promise<void> {
  const db = await getDatabase();
  const phase = await getPhase(id);
  await db.runAsync('DELETE FROM project_phases WHERE id = ?', [id]);
  if (phase) {
    await addProjectHistory(phase.project_id, 'phase', `Phase "${phase.title}" deleted`);
  }
}

export async function reorderPhases(projectId: number, orderedIds: number[]): Promise<void> {
  const db = await getDatabase();
  for (let i = 0; i < orderedIds.length; i++) {
    await db.runAsync(
      'UPDATE project_phases SET sort_order = ? WHERE id = ? AND project_id = ?',
      [i, orderedIds[i], projectId],
    );
  }
  await addProjectHistory(projectId, 'phase', 'Phases reordered');
}

// ─── App Settings ──────────────────────────────────────────────────────────────

export async function getAppSetting(key: string): Promise<string | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ value: string }>(
    'SELECT value FROM app_settings WHERE key = ?',
    [key],
  );
  return row?.value ?? null;
}

export async function setAppSetting(key: string, value: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    'INSERT OR REPLACE INTO app_settings (key, value) VALUES (?, ?)',
    [key, value],
  );
}

export async function saveBackupConfig(config: {
  apiUrl: string;
  apiKey: string;
  dataSource?: string;
  database?: string;
  collection?: string;
}): Promise<void> {
  await setAppSetting('mongodb_api_url', config.apiUrl.trim());
  await setAppSetting('mongodb_api_key', config.apiKey.trim());
  if (config.dataSource) await setAppSetting('mongodb_data_source', config.dataSource.trim());
  if (config.database) await setAppSetting('mongodb_database', config.database.trim());
  if (config.collection) await setAppSetting('mongodb_collection', config.collection.trim());
}

// ─── Documents ───────────────────────────────────────────────────────────────

export async function getDocuments(projectId: number): Promise<ProjectDocument[]> {
  const db = await getDatabase();
  return db.getAllAsync<ProjectDocument>(
    'SELECT * FROM project_documents WHERE project_id = ? ORDER BY created_at DESC',
    [projectId],
  );
}

export async function saveDocument(data: {
  project_id: number;
  title: string;
  file_path: string;
  category?: string;
  notes?: string;
}): Promise<number> {
  const db = await getDatabase();
  const result = await db.runAsync(
    'INSERT INTO project_documents (project_id, title, file_path, category, notes, created_at) VALUES (?, ?, ?, ?, ?, ?)',
    [data.project_id, data.title, data.file_path, data.category ?? null, data.notes ?? null, now()],
  );
  await addProjectHistory(data.project_id, 'document', `Document "${data.title}" added`);
  return result.lastInsertRowId;
}

export async function deleteDocument(id: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM project_documents WHERE id = ?', [id]);
}

// ─── History ─────────────────────────────────────────────────────────────────

export async function getProjectHistory(projectId: number): Promise<ProjectHistory[]> {
  const db = await getDatabase();
  return db.getAllAsync<ProjectHistory>(
    'SELECT * FROM project_history WHERE project_id = ? ORDER BY created_at DESC',
    [projectId],
  );
}

export async function addManualHistoryNote(projectId: number, note: string): Promise<void> {
  await addProjectHistory(projectId, 'note', note, null, null, note);
}

async function addProjectHistory(
  projectId: number,
  eventType: string,
  description: string,
  oldValue?: string | null,
  newValue?: string | null,
  note?: string | null,
): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    'INSERT INTO project_history (project_id, event_type, description, old_value, new_value, note, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [projectId, eventType, description, oldValue ?? null, newValue ?? null, note ?? null, now()],
  );
}

// ─── Invoices ────────────────────────────────────────────────────────────────

export async function getInvoices(search = ''): Promise<Invoice[]> {
  const db = await getDatabase();
  const query = search
    ? `SELECT i.*, p.name as project_name, c.name as client_name FROM invoices i
       JOIN projects p ON p.id = i.project_id
       JOIN clients c ON c.id = p.client_id
       WHERE i.invoice_number LIKE ? OR p.name LIKE ? OR c.name LIKE ?
       ORDER BY i.date DESC`
    : `SELECT i.*, p.name as project_name, c.name as client_name FROM invoices i
       JOIN projects p ON p.id = i.project_id
       JOIN clients c ON c.id = p.client_id
       ORDER BY i.date DESC`;
  const params = search ? [`%${search}%`, `%${search}%`, `%${search}%`] : [];
  return db.getAllAsync<Invoice>(query, params);
}

export async function getInvoicesByProject(projectId: number): Promise<Invoice[]> {
  const db = await getDatabase();
  return db.getAllAsync<Invoice>(
    'SELECT * FROM invoices WHERE project_id = ? ORDER BY date DESC',
    [projectId],
  );
}

export async function getInvoice(id: number): Promise<Invoice | null> {
  const db = await getDatabase();
  return db.getFirstAsync<Invoice>(
    `SELECT i.*, p.name as project_name, c.name as client_name FROM invoices i
     JOIN projects p ON p.id = i.project_id
     JOIN clients c ON c.id = p.client_id WHERE i.id = ?`,
    [id],
  );
}

export async function previewNextInvoiceNumber(): Promise<string> {
  const db = await getDatabase();
  const company = await getCompany();
  if (!company) throw new Error('Company not configured');
  const fy = getFinancialYear(new Date(), company.financial_year_start_month);
  const seq = await db.getFirstAsync<{ last_sequence: number }>(
    'SELECT last_sequence FROM invoice_sequences WHERE financial_year = ?',
    [fy],
  );
  const nextSeq = (seq?.last_sequence ?? 0) + 1;
  return generateInvoiceNumber(company.short_code, fy, nextSeq);
}

export async function getNextInvoiceNumber(): Promise<string> {
  const db = await getDatabase();
  const company = await getCompany();
  if (!company) throw new Error('Company not configured');
  const fy = getFinancialYear(new Date(), company.financial_year_start_month);
  const seq = await db.getFirstAsync<{ last_sequence: number }>(
    'SELECT last_sequence FROM invoice_sequences WHERE financial_year = ?',
    [fy],
  );
  const nextSeq = (seq?.last_sequence ?? 0) + 1;
  if (seq) {
    await db.runAsync(
      'UPDATE invoice_sequences SET last_sequence = ? WHERE financial_year = ?',
      [nextSeq, fy],
    );
  } else {
    await db.runAsync(
      'INSERT INTO invoice_sequences (financial_year, last_sequence) VALUES (?, ?)',
      [fy, nextSeq],
    );
  }
  return generateInvoiceNumber(company.short_code, fy, nextSeq);
}

export async function saveInvoice(data: {
  id?: number;
  project_id: number;
  invoice_number: string;
  date: string;
  line_items: LineItem[];
  subtotal: number;
  discount?: number;
  discount_type?: string;
  tax?: number;
  tax_percent?: number;
  total: number;
  status?: string;
  payment_method?: string;
  notes?: string;
}): Promise<number> {
  const db = await getDatabase();
  const ts = now();
  const itemsJson = JSON.stringify(data.line_items);
  if (data.id) {
    await db.runAsync(
      `UPDATE invoices SET project_id=?, date=?, line_items=?, subtotal=?, discount=?, discount_type=?,
       tax=?, tax_percent=?, total=?, status=?, payment_method=?, notes=?, updated_at=? WHERE id=?`,
      [
        data.project_id, data.date, itemsJson, data.subtotal,
        data.discount ?? 0, data.discount_type ?? 'amount',
        data.tax ?? 0, data.tax_percent ?? 0, data.total,
        data.status ?? 'draft', data.payment_method ?? null, data.notes ?? null, ts, data.id,
      ],
    );
    return data.id;
  }
  const result = await db.runAsync(
    `INSERT INTO invoices (project_id, invoice_number, date, line_items, subtotal, discount, discount_type,
     tax, tax_percent, total, status, payment_method, notes, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.project_id, data.invoice_number, data.date, itemsJson, data.subtotal,
      data.discount ?? 0, data.discount_type ?? 'amount',
      data.tax ?? 0, data.tax_percent ?? 0, data.total,
      data.status ?? 'draft', data.payment_method ?? null, data.notes ?? null, ts, ts,
    ],
  );
  return result.lastInsertRowId;
}

export async function createInvoice(data: {
  project_id: number;
  date: string;
  line_items: LineItem[];
  subtotal: number;
  discount?: number;
  discount_type?: string;
  tax?: number;
  tax_percent?: number;
  total: number;
  status?: string;
  payment_method?: string;
  notes?: string;
}): Promise<number> {
  const invoice_number = await getNextInvoiceNumber();
  const id = await saveInvoice({ ...data, invoice_number });
  await addProjectHistory(
    data.project_id,
    'payment',
    `Invoice ${invoice_number} created`,
    null,
    `₹${data.total.toFixed(2)}`,
    data.status ?? 'draft',
  );
  return id;
}

// ─── Milestones & Change Requests ────────────────────────────────────────────

export async function getMilestones(projectId: number): Promise<Milestone[]> {
  const db = await getDatabase();
  return db.getAllAsync<Milestone>(
    'SELECT * FROM milestones WHERE project_id = ? ORDER BY created_at',
    [projectId],
  );
}

export async function saveMilestone(data: {
  project_id: number;
  title: string;
  amount: number;
  due_status?: string;
}): Promise<number> {
  if (!data.title.trim()) throw new Error('Milestone title is required');
  if (!Number.isFinite(data.amount) || data.amount < 0) throw new Error('Invalid milestone amount');
  const db = await getDatabase();
  const result = await db.runAsync(
    'INSERT INTO milestones (project_id, title, amount, due_status, created_at) VALUES (?, ?, ?, ?, ?)',
    [data.project_id, data.title, data.amount, data.due_status ?? 'pending', now()],
  );
  await addProjectHistory(
    data.project_id,
    'payment',
    `Milestone added: ${data.title}`,
    null,
    `₹${data.amount.toFixed(2)}`,
  );
  return result.lastInsertRowId;
}

export async function getChangeRequests(projectId: number): Promise<ChangeRequest[]> {
  const db = await getDatabase();
  return db.getAllAsync<ChangeRequest>(
    'SELECT * FROM change_requests WHERE project_id = ? ORDER BY date DESC',
    [projectId],
  );
}

export async function saveChangeRequest(data: {
  project_id: number;
  description: string;
  charge: number;
  date: string;
  scope_hours?: string;
  client_approved?: boolean;
  status?: string;
}): Promise<number> {
  if (!data.description.trim()) throw new Error('Description is required');
  if (!Number.isFinite(data.charge) || data.charge < 0) throw new Error('Invalid charge amount');
  const db = await getDatabase();
  const result = await db.runAsync(
    `INSERT INTO change_requests (project_id, description, charge, date, scope_hours, client_approved, status, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.project_id, data.description, data.charge, data.date,
      data.scope_hours ?? null, data.client_approved ? 1 : 0,
      data.status ?? 'pending_approval', now(),
    ],
  );
  await addProjectHistory(data.project_id, 'change_request', `Change request added: ${data.description.slice(0, 50)}`);
  return result.lastInsertRowId;
}

// ─── Template ────────────────────────────────────────────────────────────────

export async function getTemplateBlocks(): Promise<TemplateBlock[]> {
  const db = await getDatabase();
  return db.getAllAsync<TemplateBlock>(
    'SELECT * FROM invoice_template_blocks ORDER BY sort_order',
  );
}

export async function updateTemplateBlocks(blocks: TemplateBlock[]): Promise<void> {
  const db = await getDatabase();
  for (const block of blocks) {
    await db.runAsync(
      'UPDATE invoice_template_blocks SET visible=?, sort_order=? WHERE id=?',
      [block.visible, block.sort_order, block.id],
    );
  }
}

// ─── Dashboard ───────────────────────────────────────────────────────────────

export async function getDashboardStats(): Promise<DashboardStats> {
  const db = await getDatabase();
  const clients = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM clients');
  const activeProjects = await db.getFirstAsync<{ count: number }>(
    "SELECT COUNT(*) as count FROM projects WHERE status IN ('active', 'in_progress', 'not_started', 'on_hold')",
  );
  const allProjects = await db.getFirstAsync<{ count: number }>(
    "SELECT COUNT(*) as count FROM projects WHERE status != 'cancelled'",
  );
  const valuation = await db.getFirstAsync<{ total: number }>(
    "SELECT COALESCE(SUM(project_value), 0) as total FROM projects WHERE status != 'cancelled'",
  );

  // Prefer actual payment records when present; fall back to paid invoices.
  const payments = await db.getFirstAsync<{ total: number; count: number }>(
    'SELECT COALESCE(SUM(amount), 0) as total, COUNT(*) as count FROM payment_records',
  );
  const paidInvoices = await db.getFirstAsync<{ total: number }>(
    "SELECT COALESCE(SUM(total), 0) as total FROM invoices WHERE status = 'paid'",
  );
  const paidMilestones = await db.getFirstAsync<{ total: number }>(
    "SELECT COALESCE(SUM(amount), 0) as total FROM milestones WHERE due_status = 'paid'",
  );

  const receivedFromPayments = payments?.count ? (payments.total ?? 0) : 0;
  const receivedFromInvoices = paidInvoices?.total ?? 0;
  const receivedFromMilestones = paidMilestones?.total ?? 0;
  // Use the strongest available signal without double-counting when possible.
  const totalReceived = receivedFromPayments > 0
    ? receivedFromPayments
    : Math.max(receivedFromInvoices, receivedFromMilestones);

  const pending = await db.getFirstAsync<{ total: number }>(
    "SELECT COALESCE(SUM(total), 0) as total FROM invoices WHERE status IN ('pending', 'partial', 'sent', 'draft', 'overdue')",
  );
  const invoiced = await db.getFirstAsync<{ total: number }>(
    "SELECT COALESCE(SUM(total), 0) as total FROM invoices WHERE status != 'cancelled'",
  );

  const totalValuation = valuation?.total ?? 0;
  const totalPending = pending?.total ?? 0;
  const totalInvoiced = invoiced?.total ?? 0;
  const amountRemaining = Math.max(0, totalValuation - totalReceived);
  const collectionRate = totalValuation > 0
    ? Math.min(100, (totalReceived / totalValuation) * 100)
    : 0;

  return {
    totalClients: clients?.count ?? 0,
    activeProjects: activeProjects?.count ?? 0,
    totalProjects: allProjects?.count ?? 0,
    totalValuation,
    totalReceived,
    totalPending,
    totalInvoiced,
    amountRemaining,
    collectionRate,
  };
}

export async function getRecentActivity(): Promise<ActivityItem[]> {
  const db = await getDatabase();
  const items: ActivityItem[] = [];

  const invoices = await db.getAllAsync<{ id: number; invoice_number: string; client_name: string; updated_at: string }>(
    `SELECT i.id, i.invoice_number, c.name as client_name, i.updated_at
     FROM invoices i JOIN projects p ON p.id = i.project_id JOIN clients c ON c.id = p.client_id
     ORDER BY i.updated_at DESC LIMIT 5`,
  );
  for (const inv of invoices) {
    items.push({
      id: `inv-${inv.id}`,
      type: 'invoice',
      description: `Invoice ${inv.invoice_number} — ${inv.client_name}`,
      created_at: inv.updated_at,
    });
  }

  const history = await db.getAllAsync<ProjectHistory>(
    'SELECT * FROM project_history ORDER BY created_at DESC LIMIT 5',
  );
  for (const h of history) {
    items.push({
      id: `hist-${h.id}`,
      type: h.event_type === 'phase' ? 'phase' : 'project',
      description: h.description,
      created_at: h.created_at,
    });
  }

  return items.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 8);
}

// ─── Backup ──────────────────────────────────────────────────────────────────

export async function getBackupLog() {
  const db = await getDatabase();
  return db.getFirstAsync('SELECT * FROM backup_log ORDER BY id DESC LIMIT 1');
}

export async function saveBackupLog(status: string, message?: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    'INSERT INTO backup_log (last_backup_at, status, message) VALUES (?, ?, ?)',
    [now(), status, message ?? null],
  );
}

export async function exportBackupData(): Promise<object> {
  const db = await getDatabase();
  const company = await getCompany();
  const clients = await db.getAllAsync('SELECT * FROM clients');
  const projects = await db.getAllAsync('SELECT * FROM projects');
  const invoices = await db.getAllAsync('SELECT * FROM invoices');
  const milestones = await db.getAllAsync('SELECT * FROM milestones');
  const changeRequests = await db.getAllAsync('SELECT * FROM change_requests');
  const phases = await db.getAllAsync('SELECT * FROM project_phases');

  let phaseTasks: object[] = [];
  let paymentRecords: object[] = [];
  let projectHistory: object[] = [];
  let invoiceSequences: object[] = [];
  let templateBlocks: object[] = [];
  try { phaseTasks = await db.getAllAsync('SELECT * FROM phase_tasks'); } catch { /* */ }
  try { paymentRecords = await db.getAllAsync('SELECT * FROM payment_records'); } catch { /* */ }
  try { projectHistory = await db.getAllAsync('SELECT * FROM project_history'); } catch { /* */ }
  try { invoiceSequences = await db.getAllAsync('SELECT * FROM invoice_sequences'); } catch { /* */ }
  try { templateBlocks = await db.getAllAsync('SELECT * FROM invoice_template_blocks'); } catch { /* */ }

  return {
    exported_at: now(),
    company,
    clients,
    projects,
    invoices,
    milestones,
    change_requests: changeRequests,
    phases,
    contact_persons: await db.getAllAsync('SELECT * FROM contact_persons'),
    env_values: await db.getAllAsync('SELECT id, project_id, key_name, environment, notes, created_at FROM project_env_values'),
    phase_tasks: phaseTasks,
    payment_records: paymentRecords,
    project_history: projectHistory,
    invoice_sequences: invoiceSequences,
    invoice_template_blocks: templateBlocks,
  };
}

type Row = Record<string, unknown>;

const MONGO_META = new Set(['_id', '__v']);

function sanitizeRow(row: Row): Row {
  const out: Row = {};
  for (const [k, v] of Object.entries(row)) {
    if (MONGO_META.has(k)) continue;
    // Atlas may nest ObjectId-like values; keep primitives only
    if (v !== null && typeof v === 'object' && !Array.isArray(v)) continue;
    out[k] = v;
  }
  return out;
}

function cols(row: Row, keys: string[]): (string | number | null)[] {
  return keys.map((k) => {
    const v = row[k];
    if (v === undefined || v === null) return null;
    if (typeof v === 'string' || typeof v === 'number') return v;
    if (typeof v === 'boolean') return v ? 1 : 0;
    return String(v);
  });
}

async function insertRows(
  db: Awaited<ReturnType<typeof getDatabase>>,
  table: string,
  rows: Row[],
  required: string[],
  ensureTimestamps: boolean,
): Promise<number> {
  let count = 0;
  for (const raw of rows) {
    const row = sanitizeRow(raw);
    if (!required.every((k) => row[k] != null && String(row[k]).length > 0)) continue;
    if (ensureTimestamps) {
      if (row.created_at == null) row.created_at = now();
      if (table === 'clients' || table === 'projects' || table === 'invoices') {
        if (row.updated_at == null) row.updated_at = now();
      }
    }
    const keys = Object.keys(row);
    if (!keys.length) continue;
    await db.runAsync(
      `INSERT OR REPLACE INTO ${table} (${keys.join(',')}) VALUES (${keys.map(() => '?').join(',')})`,
      cols(row, keys),
    );
    count += 1;
  }
  return count;
}

/** Import a backup payload into the local DB (file or cloud restore). */
export async function importBackupData(payload: {
  company?: Row | null;
  clients?: Row[];
  projects?: Row[];
  invoices?: Row[];
  milestones?: Row[];
  change_requests?: Row[];
  phases?: Row[];
  contact_persons?: Row[];
  phase_tasks?: Row[];
  payment_records?: Row[];
  project_history?: Row[];
  invoice_sequences?: Row[];
  invoice_template_blocks?: Row[];
  env_values?: Row[];
}): Promise<{ clients: number; projects: number; invoices: number }> {
  const db = await getDatabase();
  let clients = 0;
  let projects = 0;
  let invoices = 0;

  await db.execAsync('PRAGMA foreign_keys = OFF;');
  try {
    await db.withTransactionAsync(async () => {
      // Clear business data (keep PIN / app_settings).
      const tables = [
        'payment_records',
        'phase_tasks',
        'project_env_values',
        'project_history',
        'project_documents',
        'project_phases',
        'change_requests',
        'milestones',
        'invoices',
        'projects',
        'contact_persons',
        'clients',
        'compliance_doc',
        'company',
        'invoice_sequences',
      ];
      for (const table of tables) {
        try {
          await db.runAsync(`DELETE FROM ${table}`);
        } catch {
          // table may not exist yet
        }
      }

      if (payload.company && typeof payload.company === 'object') {
        const company = sanitizeRow(payload.company);
        company.name = String(company.name ?? 'Restored Business');
        company.short_code = String(company.short_code ?? 'RST').toUpperCase();
        if (company.signature_mode == null) company.signature_mode = 'computer_generated';
        if (company.created_at == null) company.created_at = now();
        if (company.updated_at == null) company.updated_at = now();
        const keys = Object.keys(company);
        await db.runAsync(
          `INSERT OR REPLACE INTO company (${keys.join(',')}) VALUES (${keys.map(() => '?').join(',')})`,
          cols(company, keys),
        );
      }

      clients = await insertRows(db, 'clients', payload.clients ?? [], ['name'], true);
      await insertRows(db, 'contact_persons', payload.contact_persons ?? [], ['client_id', 'name'], false);
      projects = await insertRows(db, 'projects', payload.projects ?? [], ['name', 'client_id'], true);
      await insertRows(db, 'project_phases', payload.phases ?? [], ['project_id', 'title'], false);
      await insertRows(db, 'phase_tasks', payload.phase_tasks ?? [], ['phase_id', 'title'], false);
      invoices = await insertRows(db, 'invoices', payload.invoices ?? [], ['project_id', 'invoice_number'], true);
      await insertRows(db, 'milestones', payload.milestones ?? [], ['project_id', 'title'], true);
      await insertRows(db, 'change_requests', payload.change_requests ?? [], ['project_id', 'description'], true);
      await insertRows(db, 'payment_records', payload.payment_records ?? [], ['invoice_id', 'amount'], true);
      await insertRows(db, 'project_history', payload.project_history ?? [], ['project_id', 'event_type', 'description'], true);
      await insertRows(db, 'invoice_sequences', payload.invoice_sequences ?? [], ['financial_year'], false);
      // Keep existing template if backup has none.
      if ((payload.invoice_template_blocks ?? []).length > 0) {
        try { await db.runAsync('DELETE FROM invoice_template_blocks'); } catch { /* */ }
        await insertRows(db, 'invoice_template_blocks', payload.invoice_template_blocks ?? [], ['block_type'], false);
      }
      await insertRows(
        db,
        'project_env_values',
        (payload.env_values ?? []).map((row) => ({
          ...row,
          value_encrypted: row.value_encrypted ?? '',
          created_at: row.created_at ?? now(),
        })),
        ['project_id', 'key_name'],
        true,
      );
    });
  } finally {
    await db.execAsync('PRAGMA foreign_keys = ON;');
  }

  await saveBackupLog('success', 'Data restored from backup file.');
  return { clients, projects, invoices };
}

// ─── Env Values ──────────────────────────────────────────────────────────────

export async function getEnvValues(projectId: number): Promise<ProjectEnvValue[]> {
  const db = await getDatabase();
  return db.getAllAsync<ProjectEnvValue>(
    'SELECT * FROM project_env_values WHERE project_id = ? ORDER BY created_at',
    [projectId],
  );
}

export async function saveEnvValue(data: {
  id?: number;
  project_id: number;
  key_name: string;
  value: string;
  environment?: string;
  notes?: string;
}): Promise<number> {
  if (!data.key_name.trim()) throw new Error('Key name is required');
  if (!data.value.trim()) throw new Error('Value is required');
  const db = await getDatabase();
  const encrypted = await encryptValue(data.value);
  if (data.id) {
    await db.runAsync(
      'UPDATE project_env_values SET key_name=?, value_encrypted=?, environment=?, notes=? WHERE id=?',
      [data.key_name.trim(), encrypted, data.environment ?? null, data.notes ?? null, data.id],
    );
    return data.id;
  }
  const result = await db.runAsync(
    'INSERT INTO project_env_values (project_id, key_name, value_encrypted, environment, notes, created_at) VALUES (?, ?, ?, ?, ?, ?)',
    [data.project_id, data.key_name.trim(), encrypted, data.environment ?? null, data.notes ?? null, now()],
  );
  await addProjectHistory(data.project_id, 'env', `Config "${data.key_name}" added`);
  return result.lastInsertRowId;
}

export async function deleteEnvValue(id: number, projectId: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM project_env_values WHERE id = ?', [id]);
  await addProjectHistory(projectId, 'env', 'Config value removed');
}

// ─── Phase Tasks ───────────────────────────────────────────────────────────────

export async function getPhaseTasks(phaseId: number): Promise<PhaseTask[]> {
  const db = await getDatabase();
  return db.getAllAsync<PhaseTask>(
    'SELECT * FROM phase_tasks WHERE phase_id = ? ORDER BY sort_order',
    [phaseId],
  );
}

export async function savePhaseTask(data: {
  id?: number;
  phase_id: number;
  title: string;
  is_done?: number;
  sort_order: number;
}): Promise<number> {
  const db = await getDatabase();
  if (data.id) {
    await db.runAsync(
      'UPDATE phase_tasks SET title=?, is_done=?, sort_order=? WHERE id=?',
      [data.title, data.is_done ?? 0, data.sort_order, data.id],
    );
    return data.id;
  }
  const result = await db.runAsync(
    'INSERT INTO phase_tasks (phase_id, title, is_done, sort_order) VALUES (?, ?, ?, ?)',
    [data.phase_id, data.title, data.is_done ?? 0, data.sort_order],
  );
  return result.lastInsertRowId;
}

export async function deletePhaseTask(id: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM phase_tasks WHERE id = ?', [id]);
}

// ─── Payment Records ───────────────────────────────────────────────────────────

export async function getPaymentRecords(invoiceId: number): Promise<PaymentRecord[]> {
  const db = await getDatabase();
  return db.getAllAsync<PaymentRecord>(
    'SELECT * FROM payment_records WHERE invoice_id = ? ORDER BY payment_date DESC',
    [invoiceId],
  );
}

export async function savePaymentRecord(data: {
  invoice_id: number;
  amount: number;
  payment_date: string;
  payment_method: string;
  reference?: string;
  notes?: string;
}): Promise<number> {
  if (!Number.isFinite(data.amount) || data.amount <= 0) throw new Error('Invalid payment amount');
  const db = await getDatabase();
  const result = await db.runAsync(
    'INSERT INTO payment_records (invoice_id, amount, payment_date, payment_method, reference, notes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [data.invoice_id, data.amount, data.payment_date, data.payment_method, data.reference ?? null, data.notes ?? null, now()],
  );
  return result.lastInsertRowId;
}

export async function getProjectPaymentSummary(projectId: number): Promise<{
  projectValue: number;
  totalReceived: number;
  amountRemaining: number;
}> {
  const db = await getDatabase();
  const project = await getProject(projectId);
  const milestones = await getMilestones(projectId);
  const paidMilestones = milestones
    .filter((m) => m.due_status === 'paid')
    .reduce((sum, m) => sum + m.amount, 0);
  const projectValue = project?.project_value ?? 0;
  return {
    projectValue,
    totalReceived: paidMilestones,
    amountRemaining: Math.max(0, projectValue - paidMilestones),
  };
}
