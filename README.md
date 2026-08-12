# FCRM — Freelance Client & Revenue Manager

Local-first mobile app for freelancers and small agencies to manage clients, projects, invoices, and payments — fully offline with optional cloud backup.

## Project Structure

```
FCRM/
├── doc/                              # Product requirements (PRD)
├── stitch_localfirst_business_manager/  # UI design prototypes (HTML reference)
└── mobile/                           # React Native (Expo) app — run this
```

## Quick Start

```bash
cd mobile
npm install
npm start
```

- **Android:** press `a` in the terminal or run `npm run android`
- **iOS:** press `i` (macOS only) or use Expo Go
- **Web:** `npm run web` (limited — mobile-first app)

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | React Native + Expo SDK 54 |
| Navigation | expo-router (file-based) |
| Database | expo-sqlite (local, offline) |
| Security | expo-secure-store + PIN + biometric |
| Files | expo-file-system + expo-document-picker |

## Features (v1)

- PIN-protected single-user app
- Company onboarding
- Client & project management with phases, documents, payments
- Auto-numbered invoices with customizable template builder
- Dashboard with business health snapshot
- Manual structured-data backup (MongoDB Atlas integration pending)

## Progress

See [doc/PROGRESS.md](doc/PROGRESS.md) for the full checklist of what's done and what's left.

## Design Reference

UI prototypes live in `stitch_localfirst_business_manager/`. The implemented app follows the **FreelancePro Operational** design system (teal-green, Inter typography, card-based layout).
