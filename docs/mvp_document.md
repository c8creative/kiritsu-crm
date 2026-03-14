# MVP Document: Kiritsu CRM

## Overview
Kiritsu CRM is a single-user commercial Customer Relationship Management (CRM) tool specifically designed for Squeegee Samurai / Kiritsu Clean. The application serves to track leads, convert them to accounts, manage sales pipelines, and handle recurring jobs and visits.

## Target Audience
- **Internal Use Only:** Single-user owner/operator managing commercial cleaning operations, sales outreach, and scheduling.

## Core Features (MVP)
The MVP currently encompasses the following functional modules:

1. **Authentication**
   - Single-user login system.
   - Originally built with Supabase Auth, currently migrated to **Firebase Authentication** to ensure stable hosting without free-tier platform pausing.

2. **Lead Management (Inbox)**
   - Capture new leads (via CSV import or manual entry).
   - Track lead status, source, phone, email, and location.
   - Lead conversion to "Account" and "Opportunity" pipelines.

3. **Account & Contact Management**
   - Track converted accounts and their status.
   - Store related contacts, locations, historical activities, and files for a single business entity.

4. **Sales Pipeline (Opportunities)**
   - Drag-and-drop Kanban board (using `@dnd-kit`) to visually track deal stages.
   - Stages: *New, Contacted, Walkthrough Scheduled, Quote Sent, Negotiation, Won (Recurring), Lost / Not Now*.
   - Track expected monthly value, probabilities, and follow-up dates.

5. **Jobs & Visits**
   - **Jobs:** Define recurring service agreements for winning accounts (e.g., frequency, day of week, price per visit).
   - **Visits:** Tracking individual physical site visits linked to a master job, allowing the owner to mark services as "scheduled" or "completed."

## Technical Architecture & Infrastructure

- **Frontend:** React + Vite, built as a single-page application (SPA).
- **Branding**: Squeegee Samurai Brand Guide (Typography: Nunito/Inter, Colors: Aka/Sumi/Washi).
- **Styling:** Tailwind CSS + TailAdmin React template.
- **Backend / Database:** 
  - *Current:* **Firebase Firestore** for database, capturing all relational patterns (Leads, Accounts, Jobs) through NoSQL document collections.
  - *Historical Context:* Originally designed with a Postgres schema on Supabase (with complex Triggers and Row Level Security). It was migrated to Firebase to avoid the Supabase free-tier database sleep cycle which disrupted usability.
- **Hosting / Deployments:** Fully static capable, ready for deployment on Vercel or Firebase Hosting.

## Roadmap & Next Steps
Based on the historical context and the recent migration to Firebase, the core backend logic is complete. The immediate next steps for Post-MVP iterations are:

### 1. PWA Support (Progressive Web App)
- Add `manifest.json` and icons to allow "Install to Home Screen" on iOS/Android.
- Ensure the app provides a full-screen, app-like experience for field operations.

### 2. Website Integration & Automation
- Standardize the website form payload to insert directly into the `leads` collection.
- **Firebase Automation:** Implement the equivalent of the old Postgres `auto_convert_website_lead` trigger (e.g., via a Firebase Cloud Function or Firestore Trigger). When a lead with `source: 'website'` is created, it should automatically generate the associated Account, Contact, Opportunity, Activity, and tomorrow's Follow-up task.
