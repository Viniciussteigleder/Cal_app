# Deployment Prevention Strategy

To prevent future deployment blocks, follow this strategy:

## 1. Single Package Manager Policy
**Rule:** Use **npm** exclusively.
- Do not run `pnpm install` or `yarn install`.
- Ensure only `package-lock.json` exists in the root.
- If `pnpm-lock.yaml` or `yarn.lock` appear, delete them immediately.

## 2. Pre-Deployment Verification Script
We have created a script `scripts/verify-deployment.js` that you can run before pushing code.

**run:** `node scripts/verify-deployment.js`

This script validates:
1.  **Lockfile Integrity:** Ensures only `package-lock.json` exists.
2.  **Type Safety (Quick):** (Optional extended check)
3.  **Build Readiness:** Recommends running a local build if significant changes were made.

## 3. Best Practices
- **Local Build:** Before pushing significant features, run `npm run build` locally. If it fails locally, it will fail on Vercel.
- **Imports:** Ensure all components (especially icons) are imported. The editor usually catches these, but they can slip through if you suppress errors.

## 4. Vercel Configuration
- The `vercel.json` is configured for Next.js.
- By deleting `pnpm-lock.yaml`, Vercel will switch to `npm install`, which aligns with your local `npm run dev` workflow.
