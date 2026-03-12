
# Kiritsu CRM Lite (single-user)

Barebones lead + customer + recurring job tracker for Kiritsu Clean / Squeegee Samurai.

## 1) Prereqs
- Node 18+ (recommended)
- A Supabase project (free tier is fine)

## 2) Setup
1. Create a Supabase project.
2. In Supabase SQL Editor, run the migration in `supabase/migrations/001_init.sql`.
3. Create a Storage bucket named `attachments` (public or private; private recommended).
4. Create a user in Supabase Auth (Email/Password).

## 3) Configure env
Copy `.env.example` to `.env.local` and fill in values.

## 4) Run
```bash
npm install
npm run dev
```

## 5) What you get
- Inbox (Leads)
- Pipeline (Opportunities Kanban)
- Accounts (Customers) + Contacts + Locations
- Follow-ups (due today/overdue)
- Jobs & Visits (recurring)
- CSV Import (Leads)

## 6) Notes
This is intentionally minimal. Once proven on laptop, you can add PWA support later.
