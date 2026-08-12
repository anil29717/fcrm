# Product Requirements Document
## Offline Business & Project Manager App

**Version:** 1.0
**Platform:** Mobile (Android + iOS)
**Type:** Local-first app with optional cloud data backup

---

## 1. Product summary

A mobile app for freelancers/small agencies to manage their business locally on-device — clients, projects, payments, and invoices — without depending on internet. All data and documents live on the phone by default. The user can optionally back up structured data (not files) to the cloud with a single tap.

## 2. Goals

- Work fully offline, no signup, no server dependency for daily use
- Single owner/admin usage, protected by a PIN
- Organize clients → projects → payments → documents in one place
- Auto-generate invoices with a user-customizable layout
- Give a business-health snapshot on a dashboard
- Allow manual, on-demand backup of business data (not files) to the cloud

## 3. Target platform & tech stack

| Layer | Choice | Reason |
|---|---|---|
| App framework | React Native (Expo) | One codebase, Android + iOS |
| Local database | SQLite (expo-sqlite / WatermelonDB) | Structured, relational, offline |
| Local file storage | Expo FileSystem | Documents, logos, generated invoice PDFs |
| App lock | PIN + optional biometric (expo-local-authentication) | Fast, secure entry |
| Cloud backup | MongoDB Atlas (Data API) | Only for structured data, on-demand |
| PDF generation | On-device rendering (react-native-html-to-pdf or similar) | Invoices generated locally from template + data |

## 4. Core features

### 4.1 PIN login & security
- App requires PIN on every open (4–6 digit, set on first launch)
- Optional biometric unlock (fingerprint/Face ID) as a shortcut
- Sensitive fields (e.g. project login credentials) stored encrypted at rest

### 4.2 Company setup (first-time)
- Company name, logo, address
- Company short code (used in invoice numbering, e.g. "ABC")
- Compliance documents: MSME certificate, GST certificate, other uploads
- Editable later from Settings

### 4.3 Dashboard (home)
- Summary cards: total clients, active projects, total received, total pending
- Recent activity feed
- "Backup now" action (greyed out when offline)
- Last backup timestamp

### 4.4 Client management
- List of clients with search
- Add client: name, phone, email
- Each client can have multiple linked projects

### 4.5 Project management
- Linked to a client
- Fields: project name, type, website URL (if applicable)
- Credentials tab: login/URL for the delivered website or system (encrypted)
- Phases/status: user-defined stages (e.g. Requirement, Design, Development, Testing, Live), free to add/edit/reorder
- Documents tab: user gives a custom title + attaches a file (contract, brief, design file, etc.) — unlimited entries
- History log: timestamped changes to status/phase

### 4.6 Payments & invoicing
- Multiple invoices per project
- **Auto invoice numbering**: `INV-{company_code}-{financial_year}-{sequence}` (e.g. `INV-ABC-2526-0001`), sequence auto-increments locally per financial year, never reused
- Invoice fields: date, line items (description, qty, rate, amount), subtotal, tax, total, status (paid/pending/partial)
- Milestones: title, amount, due status (e.g. "50% advance", "Final payment")
- Change requests: description of extra/out-of-scope work + its charge, linked to the project
- Invoice PDF generated on-device at view/download time (template + live data combined)

### 4.7 Invoice template builder
- User builds their own invoice layout by turning blocks on/off and reordering them (vertical drag-to-reorder, not free-form canvas)
- Available blocks: Company details, Invoice number & date, Client/contact details, Payment details & method, Delivery timeline, Signature
- Live preview updates as blocks are toggled/reordered
- Template configuration (block list, order, visibility) is stored **locally only** — never backed up
- At invoice-generation time: template config + actual invoice data are merged to render the PDF

### 4.8 Backup (data only)
- Manual trigger via "Backup now" button
- Checks for internet; if unavailable, shows status and retries later
- Sends only structured data (clients, projects, payments, invoice records, template config metadata) as JSON to MongoDB Atlas
- **Does not** upload documents, logos, or generated invoice PDFs — these remain device-only
- Shows last successful backup date/time
- Dashboard displays a short reminder that files/documents are not covered by backup

## 5. Data model (entities)

**Company** — name, logo, short_code, address, compliance_docs[]

**Client** — id, name, phone, email, notes

**Project** — id, client_id (FK), name, type, website_url, credentials (encrypted), phases[], status, documents[] (title + file path), created_at

**Invoice** — id, project_id (FK), invoice_number (auto), date, line_items[], subtotal, tax, total, status

**Milestone** — id, project_id (FK), title, amount, due_status

**ChangeRequest** — id, project_id (FK), description, charge, date

**InvoiceTemplateConfig** — blocks[] (type, visible, order) — local only, not backed up

**BackupLog** — last_backup_at, status

## 6. Screen flow

1. PIN login → (first time) Company setup → Dashboard
2. Dashboard → Clients list → Add/View client → Add/View project
3. Project detail → tabs: Overview, Phases/Status, Documents, Payments
4. Payments tab → Invoices, Milestones, Change requests → Invoice template builder (accessible from Settings or from an invoice's "Edit template" option)
5. Dashboard → Backup screen (single action + status)
6. Settings → Company profile edit, PIN change, template builder, backup history

## 7. Theme & design direction

- Clean, minimal, business-utility feel — not flashy
- Light background, one accent color (suggest a professional blue or teal) for primary actions and status highlights
- Status colors: green = paid/completed, amber = pending/in-progress, red = overdue
- Card-based layout for dashboard and lists; simple forms for data entry
- Typography: one clear sans-serif, sentence case labels throughout
- Icons over decoration — every screen should feel fast and functional, since it's a daily-use offline tool

## 8. Non-functional requirements

- App must be fully usable with no network connection at any time except backup
- All local data persists across app restarts (SQLite on device storage)
- PIN/biometric gate on every cold start
- Backup is opt-in per action, never automatic/background
- Encrypted storage for credentials fields

## 9. Out of scope (v1)

- Multi-user/team accounts
- Automatic/scheduled cloud backup
- File/document backup to cloud
- Web or desktop version
- Payment gateway integration (manual status marking only)

## 10. Screen checklist

> **Live implementation progress:** see [PROGRESS.md](./PROGRESS.md) in this folder.

**Done (in `mobile/` app)**
- [x] PIN creation screen
- [x] PIN confirm screen
- [x] PIN entry screen
- [x] Company setup / onboarding screen (full PRD fields)
- [x] Dashboard (home)
- [x] Clients list
- [x] Add / Edit client (with contact persons)
- [x] Client detail (linked projects)
- [x] New / Edit Project form
- [x] Project detail — Overview tab
- [x] Project detail — Phases & Status tab (drag reorder)
- [x] Project detail — Documents tab
- [x] Project detail — Payments tab
- [x] Project detail — Config / Env tab
- [x] Project detail — History tab
- [x] Phase detail screen
- [x] Invoices list
- [x] Create invoice (multi line items)
- [x] Invoice detail — PDF preview & share
- [x] Invoice template builder (drag/reorder blocks)
- [x] Invoice numbering settings
- [x] Backup screen (MongoDB Atlas upload)
- [x] Settings screen
- [x] Empty states (no clients / no projects / no invoices)
- [x] Bottom nav finalized — Dashboard, Clients, Projects, Invoices, Settings
- [x] App icon & splash screen

**Optional polish (post-v1)**
- [ ] EAS production builds (APK/IPA)
- [ ] Offline backup retry queue
- [ ] Full AES credential encryption

## 11. Open assumptions

- Single-user app (one PIN, one business owner) for v1
- Financial year boundary assumed April–March unless configured otherwise in Company setup
- Currency assumed single/default (configurable in Company setup)