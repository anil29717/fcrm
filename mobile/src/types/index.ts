export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'partial' | 'overdue' | 'cancelled' | 'pending';
export type ProjectStatus = 'not_started' | 'active' | 'on_hold' | 'completed' | 'cancelled' | 'in_progress';
export type MilestoneStatus = 'pending' | 'invoiced' | 'paid' | 'overdue';
export type PhaseStatus = 'pending' | 'in_progress' | 'completed' | 'on_hold';
export type ChangeRequestStatus = 'pending_approval' | 'approved' | 'invoiced';

export interface Company {
  id: number;
  name: string;
  owner_name: string | null;
  logo_path: string | null;
  short_code: string;
  business_type: string | null;
  industry: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  gstin: string | null;
  pan: string | null;
  msme_number: string | null;
  website: string | null;
  currency: string;
  financial_year_start_month: number;
  invoice_prefix: string | null;
  default_payment_terms: string | null;
  bank_account_name: string | null;
  bank_account_number: string | null;
  bank_ifsc: string | null;
  upi_id: string | null;
  payment_link: string | null;
  invoice_number_format: string | null;
  invoice_next_number: number;
  invoice_reset_frequency: string | null;
  created_at: string;
  updated_at: string;
}

export interface ComplianceDoc {
  id: number;
  company_id: number;
  title: string;
  file_path: string;
  doc_type: string | null;
}

export interface Client {
  id: number;
  name: string;
  client_type: string | null;
  gstin: string | null;
  address: string | null;
  lead_source: string | null;
  status: string | null;
  tags: string | null;
  phone: string | null;
  email: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  project_count?: number;
}

export interface ContactPerson {
  id?: number;
  client_id?: number;
  name: string;
  designation: string | null;
  phone: string | null;
  email: string | null;
  is_primary: number;
}

export interface Project {
  id: number;
  client_id: number;
  name: string;
  type: string | null;
  description: string | null;
  website_url: string | null;
  start_date: string | null;
  end_date: string | null;
  priority: string | null;
  billing_type: string | null;
  project_value: number;
  hourly_rate: number | null;
  tags: string | null;
  credentials_encrypted: string | null;
  status: ProjectStatus;
  version?: number;
  created_at: string;
  updated_at: string;
  client_name?: string;
}

export interface ProjectPhase {
  id: number;
  project_id: number;
  title: string;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  status: PhaseStatus | string | null;
  sort_order: number;
  is_completed: number;
}

export interface PhaseTask {
  id: number;
  phase_id: number;
  title: string;
  is_done: number;
  sort_order: number;
}

export interface ProjectDocument {
  id: number;
  project_id: number;
  title: string;
  category: string | null;
  notes: string | null;
  file_path: string;
  created_at: string;
}

export interface ProjectEnvValue {
  id: number;
  project_id: number;
  key_name: string;
  value_encrypted: string;
  environment: string | null;
  notes: string | null;
  created_at: string;
}

export interface ProjectHistory {
  id: number;
  project_id: number;
  event_type: string;
  description: string;
  old_value: string | null;
  new_value: string | null;
  note: string | null;
  created_at: string;
}

export interface LineItem {
  description: string;
  qty: number;
  rate: number;
  amount: number;
}

export interface Invoice {
  id: number;
  project_id: number;
  invoice_number: string;
  date: string;
  line_items: string;
  discount: number;
  discount_type: string | null;
  tax: number;
  tax_percent: number | null;
  subtotal: number;
  total: number;
  status: InvoiceStatus;
  payment_method: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  project_name?: string;
  client_name?: string;
}

export interface PaymentRecord {
  id: number;
  invoice_id: number;
  amount: number;
  payment_date: string;
  payment_method: string;
  reference: string | null;
  notes: string | null;
  created_at: string;
}

export interface Milestone {
  id: number;
  project_id: number;
  title: string;
  amount: number;
  due_status: MilestoneStatus | string;
  created_at: string;
}

export interface ChangeRequest {
  id: number;
  project_id: number;
  description: string;
  charge: number;
  date: string;
  scope_hours: string | null;
  client_approved: number;
  status: ChangeRequestStatus | string;
  created_at: string;
}

export type TemplateBlockType =
  | 'company_details'
  | 'invoice_meta'
  | 'client_details'
  | 'payment_details'
  | 'delivery_timeline'
  | 'signature';

export interface TemplateBlock {
  id: number;
  block_type: TemplateBlockType;
  visible: number;
  sort_order: number;
}

export interface BackupLog {
  id: number;
  last_backup_at: string | null;
  status: string | null;
  message: string | null;
}

export interface DashboardStats {
  totalClients: number;
  activeProjects: number;
  totalReceived: number;
  totalPending: number;
}

export interface ActivityItem {
  id: string;
  type: 'invoice' | 'phase' | 'client' | 'project';
  description: string;
  created_at: string;
}

export interface CompanyProfileInput {
  name: string;
  short_code: string;
  owner_name?: string;
  address?: string;
  logo_path?: string;
  business_type?: string;
  industry?: string;
  email?: string;
  phone?: string;
  gstin?: string;
  pan?: string;
  msme_number?: string;
  website?: string;
  currency?: string;
  financial_year_start_month?: number;
  invoice_prefix?: string;
  default_payment_terms?: string;
  bank_account_name?: string;
  bank_account_number?: string;
  bank_ifsc?: string;
  upi_id?: string;
  payment_link?: string;
  invoice_number_format?: string;
  invoice_next_number?: number;
  invoice_reset_frequency?: string;
}

export interface ClientInput {
  id?: number;
  name: string;
  client_type?: string;
  gstin?: string;
  address?: string;
  lead_source?: string;
  status?: string;
  tags?: string[];
  phone?: string;
  email?: string;
  notes?: string;
  contacts?: ContactPerson[];
}

export interface ProjectInput {
  id?: number;
  client_id: number;
  name: string;
  type?: string;
  description?: string;
  website_url?: string;
  start_date?: string;
  end_date?: string;
  priority?: string;
  billing_type?: string;
  project_value?: number;
  hourly_rate?: number;
  tags?: string[];
  status?: string;
  initial_phases?: string[];
}
