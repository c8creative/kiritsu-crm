# Kiritsu CRM - Post-MVP Enhancements

Based on the conversation history, we need to bring the mobile UX and automation features that were planned for Supabase over to our new Firebase architecture. 

**Recent Progress:** We have successfully integrated the TailAdmin React template and Tailwind CSS, replacing the legacy vanilla CSS. The layout is now fully responsive, and the mobile pipeline incorporates a native select dropdown to prevent drag-and-drop thumb friction.

## Proposed Changes (Remaining)

### 1. PWA Capabilities
- **`public/manifest.json`**: Create a standard web app manifest with `name`, `short_name`, and `standalone` display properties.
- **`index.html`**: Link the manifest and define theme colors (`<meta name="theme-color">`) to enable "Add to Home Screen" functionality.
- **Icons**: Generate or add placeholder 192x192 and 512x512 icons to the `public/` directory.

### 2. Firebase Automation (Website Lead Conversion)
- **`functions/index.js`**: Initialize Firebase Functions and create a Firestore Trigger (`onDocumentCreated`) that listens to the `leads` collection.
- If `lead.source === 'website'`, automatically perform a batched write to:
  - `accounts` (status: 'prospect')
  - `contacts` (role: 'Website Lead')
  - `opportunities` (stage: 'new', next_follow_up_date: tomorrow)
  - `activities` (log the website quote request)
  - `leads` (update status to 'converted')

## Verification Plan

### Automated Tests
- Run `npm run build` to ensure no Typescript or Vite compilation errors exist after modifying React components.
- Run the web app using `npm run dev` and ensure no console errors appear.
- Once Firebase Functions are initialized, ensure `firebase deploy --only functions` successfully compiles and deploys the automation triggers.

### Manual Verification
1. **PWA Check**: Open the Application tab of Chrome DevTools and verify the `manifest.json` loads correctly without warnings.
2. **Automation Check**: Using the Firebase Console or the CRM frontend, manually add a lead with `source: "website"`. Confirm the Cloud Function executes successfully, automatically generating and linking the account, contact, opportunity, and activity records in the database.
