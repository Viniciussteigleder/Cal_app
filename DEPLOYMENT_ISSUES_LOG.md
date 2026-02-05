# Deployment Issues Log

## Issue 1: Lockfile Synchronization Error
**Error:** `ERR_PNPM_OUTDATED_LOCKFILE Cannot install with "frozen-lockfile" because pnpm-lock.yaml is not up to date`
**Date:** 2026-02-05
**Cause:** The project had both `package-lock.json` (npm) and `pnpm-lock.yaml` (pnpm). The `pnpm-lock.yaml` was outdated regarding `react-markdown`. Vercel detected `pnpm-lock.yaml` and tried to use it, failing because it wasn't updated while `package.json` was.
**Fix:** Deleted `pnpm-lock.yaml` to enforce usage of `npm` (and `package-lock.json`), which matches the local development environment (`npm run dev`). Vercel will now auto-detect `package-lock.json` and use `npm`.

## Issue 2: Build Error (ReferenceError)
**Error:** `ReferenceError: MessageSquare is not defined` in `/owner/app-description`
**Date:** 2026-02-05
**Cause:** The component `MessageSquare` was used in `src/app/owner/app-description/page.tsx` but was not imported from `lucide-react`.
**Fix:** Added `MessageSquare` to the import statement in `src/app/owner/app-description/page.tsx`.

## Issue 3: Duplicate Package Manager Configuration (Potential)
**Observation:** Vercel was confused by the presence of multiple lockfiles.
**Prevention:** See `DEPLOYMENT_PREVENTION.md` for the strategy to avoid this in the future.

## Issue 4: Server Functions in Client Component
**Error:** `Error: Server Functions cannot be called during initial render.` in `/patient/plan`
**Date:** 2026-02-05
**Cause:** `src/app/patient/plan/page.tsx` was marked as `'use client'` but defined as an `async` component and called Server Actions (`getCurrentPatientId`) directly in its body. This is invalid for Client Components.
**Fix:** Removed `'use client'` from `src/app/patient/plan/page.tsx` to convert it into a Server Component. This allows it to fetch data asynchronously on the server and pass it as props to the client-side `PlanView`.
