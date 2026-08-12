# FCRM — Development Progress

**Last updated:** Aug 11, 2026  
**App location:** `mobile/` (Expo + React Native + SQLite)

---

## Legend

- ✅ Done — implemented and wired to local DB
- 🟡 Partial — UI/flow exists, needs polish or integration
- ⬜ Not started

---

## Foundation

| Item | Status | Notes |
|------|--------|-------|
| Expo project setup | ✅ | TypeScript, expo-router, SDK 54 (Expo Go compatible) |
| Design tokens / theme | ✅ | FreelancePro teal-green palette |
| SQLite schema + migrations | ✅ | All PRD entities, auto-migrate on launch |
| Database queries layer | ✅ | CRUD for all entities |
| 5-tab bottom navigation | ✅ | Dashboard, Clients, Projects, Invoices, Settings |
| App icon & splash | ✅ | `assets/` + splash in `app.json` |

---

## Auth & Onboarding

| Screen | Status | Notes |
|--------|--------|-------|
| Create PIN | ✅ | 4–6 digit |
| Confirm PIN | ✅ | Match validation |
| Enter PIN (unlock) | ✅ | Every cold start |
| Biometric unlock | ✅ | Toggle in settings; shortcut on enter-pin |
| Company setup | ✅ | Full PRD business profile fields |
| Business profile edit | ✅ | Settings → Business Profile + compliance uploads |
| Change PIN | ✅ | Current PIN verification required |

---

## Core Screens

| Screen | Status | Notes |
|--------|--------|-------|
| Dashboard | ✅ | Stats, activity, backup CTA |
| Clients list + search | ✅ | Live debounced search |
| Add / Edit client | ✅ | Full fields + contact persons |
| Client detail + projects | ✅ | |
| Projects list + search | ✅ | |
| New / Edit project form | ✅ | Full PRD fields + initial phases |
| Project — Overview tab | ✅ | Edit link, value summary |
| Project — Phases tab | ✅ | Add, toggle, delete, **drag reorder**, phase detail |
| Project — Documents tab | ✅ | File/image + category + notes |
| Project — Payments tab | ✅ | Summary, milestones, change requests |
| Project — Config tab | ✅ | Encrypted env key/value pairs |
| Project — History tab | ✅ | Auto timeline + manual notes |
| Phase detail screen | ✅ | Description, dates, status, tasks |
| Invoices list + search | ✅ | |
| Create invoice | ✅ | Multi line items, discount, tax %, status |
| Invoice detail | ✅ | Status, payments, **PDF preview & share** |
| Invoice template builder | ✅ | Drag reorder + toggle blocks |
| Invoice numbering settings | ✅ | Prefix, format, next number, reset |
| Backup screen | ✅ | **MongoDB Atlas upload** when configured |
| Backup API config | ✅ | Settings → Backup → Configure API |
| Settings | ✅ | Profile, PIN, biometric, backup, template |

---

## Data & Business Logic

| Feature | Status | Notes |
|---------|--------|-------|
| Invoice auto-numbering | ✅ | `INV-{CODE}-{FY}-{SEQ}` |
| Invoice PDF generation | ✅ | `expo-print` + template blocks → share |
| Financial year (Apr–Mar) | ✅ | Configurable in business profile |
| Encrypted env values | ✅ | XOR + SecureStore key; masked in UI |
| Project history log | ✅ | Auto-logged + manual notes |
| Cloud backup (MongoDB Atlas) | ✅ | Data API insertOne when configured |
| Compliance doc uploads | ✅ | MSME, GST, PAN, other |
| Phase drag-to-reorder | ✅ | Long-press handle on Phases tab |

---

## How to Run

```bash
cd mobile
npm start
```

Then press `a` for Android emulator or scan QR with Expo Go.

---

## MongoDB Atlas Setup

1. Create a Data API endpoint in MongoDB Atlas (insertOne action).
2. Open **Settings → Backup → Configure API**.
3. Paste endpoint URL, API key, data source, database, and collection name.
4. Tap **Backup Now** on Dashboard or Backup screen.

---

## Next Up (optional polish)

1. Stronger AES encryption for env values
2. Offline backup queue / retry
3. Invoice PDF saved path shown in UI
4. EAS build for production APK/IPA
