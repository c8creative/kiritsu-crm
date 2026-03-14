# Firebase Hosting Deployment Plan

This document outlines the deployment strategy for the Kiritsu CRM Lite application utilizing Firebase Hosting. The application is a Single-Page Application (SPA) built with Vite and React.

## 1. Local Build & Deployment

To deploy the application manually from your local development environment:

### Prerequisites:
Make sure you have authenticated with the Firebase CLI:
```bash
firebase login
```

### Steps:
1. **Compile the application**: This runs TypeScript checks and uses Vite to generate the optimized static assets into the `dist/` folder.
   ```bash
   npm run build
   ```
2. **Deploy to Firebase Hosting**: This uploads the contents of the `dist/` directory to the `kiritsu-crm-lite` Firebase project.
   ```bash
   firebase deploy --only hosting
   ```

## 2. CI/CD Integration (GitHub Actions)

For automated deployments whenever code is pushed to the repository, you can set up Firebase App Hosting or GitHub Actions. 

To initialize the GitHub Actions pipeline, you can run the following Firebase CLI command inside the project root:
```bash
firebase init hosting:github
```
This wizard will automatically:
- Prompt you to select your GitHub repository.
- Generate a `FIREBASE_SERVICE_ACCOUNT` secret in your repository.
- Create two workflow files in `.github/workflows/`:
  - `firebase-hosting-pull-request.yml`: Automatically generates a temporary preview URL when a pull request is opened.
  - `firebase-hosting-merge.yml`: Automatically deploys the site to the live production URL whenever a branch is merged into `main`.

## 3. Configuration Details

- **Hosting Configuration**: The `firebase.json` has been configured to treat the application as a Single-Page App (SPA).
  - `"public": "dist"` specifies the output folder.
  - The `"rewrites"` section routes all unknown URLs (like `/auth` or `/followups`) to `/index.html`, allowing React Router to handle the navigation.
- **Environment Variables**: Remember that VITE_FIREBASE_* environment variables are embedded into the client code during the `npm run build` step. Any changes to the `.env` configuration requires a complete rebuild before deploying.

## Rollbacks

If a bad deployment occurs, you can rollback to a previous version instantaneously from the [Firebase Console Hosting Page](https://console.firebase.google.com/project/kiritsu-crm-lite/hosting/sites). Click the three dots next to any previous release and select "Rollback".
