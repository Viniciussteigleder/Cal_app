# Full App Debug Assessment (No Code Changes)

Project: `/Users/viniciussteigleder/Documents/Web apps - vide coding/Cal_app`  
Assessment date: 2026-02-08  
Constraint: **No coding performed** (read-only repo analysis + running existing checks).

## 10 Expert Roles Used

1. **Security Engineer (AppSec)**: AuthN/AuthZ, multi-tenant isolation, secrets handling.
2. **Backend Engineer (API/Prisma)**: API correctness, database access patterns, schema alignment.
3. **Database Architect (Postgres/RLS)**: RLS policies, tenant scoping, immutability and constraints.
4. **Frontend Engineer (Next.js App Router)**: Routing, server actions, middleware behavior, UX breakpoints.
5. **DevOps / Release Engineer**: Build pipelines, Vercel behavior, env management, reproducibility.
6. **SRE / Reliability Engineer**: Timeouts, rate limits, error budgets, resilience patterns.
7. **QA Engineer**: Automated test coverage quality, determinism, failure modes.
8. **AI/ML Engineer (AI Ops)**: AI route safety, prompt/data boundaries, cost/usage tracking.
9. **Privacy/Compliance Reviewer**: PHI/PII exposure risks, logging, data minimization.
10. **Product/UX Reviewer**: Portal consistency, i18n/route duplication, user flows and edge cases.

## How I Assessed (Evidence Sources)

- Repo reads: `package.json`, `next.config.ts`, `vercel.json`, `eslint.config.mjs`, `src/middleware.ts`, auth/session code, Prisma schema, scripts.
- Command evidence (run locally):
  - `npm run typecheck` (FAILED; many TS/Prisma/SDK type errors)
  - `npm test` (FAILED; security tests + API/action tests failing)
  - `npm run build` (SUCCEEDED; explicitly skips type validation)
  - `npm run lint` (SUCCEEDED; config disables many safety rules)

## Ranked Clusters (Top To Bottom)

Rank is based on: (1) likelihood of production incident or data exposure, (2) blast radius, (3) difficulty to detect, (4) effort to fix.

1. **Multi-tenant isolation and RBAC are not enforced at the DB boundary**
2. **Build can ship with known type/runtime breakage (typecheck skipped + errors present)**
3. **Schema/code mismatch (Prisma models vs API usage)**
4. **Demo/mock mode is wired into prod config and can poison sessions**
5. **Auth architecture split-brain (Supabase + custom HMAC cookie) with inconsistent request scoping**
6. **AI routes: tenant/patient scoping gaps + resilience limits (timeouts/size caps)**
7. **Release/DevOps reproducibility issues (workspace root detection, migrations policy)**
8. **Security headers and logging hygiene insufficient for a PHI-adjacent app**
9. **Testing is failing in security-critical areas; green lint gives a false sense of safety**
10. **Routing and portal surface complexity (duplicated locales and overlapping patient portals)**

---

## Known Broken Or Unstable Flows (Direct Evidence From Tests/Checks)

These are concrete “not fully functional” indicators observed in this workspace state:

- **RBAC enforcement is not working as intended**
  - Evidence: `npm test` fails `tests/security/rbac.test.ts` (all 3 tests failing).
- **Snapshot immutability is not enforced**
  - Evidence: `npm test` fails `tests/security/immutability.test.ts` (update/delete allowed).
- **Meal planner API fails when `tenant_id` is not a UUID**
  - Evidence: `npm test` shows Prisma `P2023` (“Error creating UUID ... found `t` at 1”) from `/Users/viniciussteigleder/Documents/Web apps - vide coding/Cal_app/src/app/api/ai/meal-planner/route.ts`.
  - Interpretation: at least one caller path (demo/mock claims or tests) provides non-UUID tenant IDs.
- **Exam analyzer server action is not testable as written (request-scope dependency)**
  - Evidence: `npm test` fails `src/app/studio/ai/exam-analyzer/actions.test.ts` due to `cookies was called outside a request scope`, originating from `/Users/viniciussteigleder/Documents/Web apps - vide coding/Cal_app/src/lib/auth.ts`.
- **Typecheck is not clean and includes schema/SDK mismatches**
  - Evidence: `npm run typecheck` fails with many errors across API routes and libs.

## Cluster 1 (Rank 1): Multi-Tenant Isolation + RBAC Not Enforced At DB Boundary

### Issue 1.1: RLS policies and immutability protections appear missing (security tests fail)

- **Assessment**
  - Critical. If DB-level policies are absent, any server-side code path that forgets tenant scoping can leak cross-tenant PHI/PII.
- **Root Cause (likely)**
  - RLS policies are not defined/installed in migrations; app relies on `set_config(...)` + `row_security=on` but does not actually have matching `CREATE POLICY` rules.
- **Evidence**
  - Test failures:
    - `tests/security/rbac.test.ts` expects cross-patient reads to return null but they return records.
    - `tests/security/immutability.test.ts` expects update/delete of `FoodSnapshot` to reject but the update resolves.
  - DB session wiring exists, but policies are not found in migrations:
    - `/Users/viniciussteigleder/Documents/Web apps - vide coding/Cal_app/src/lib/db.ts` sets `app.user_id`, `app.tenant_id`, `app.role`, `app.owner_mode` and enables `row_security`.
    - Grep of `/Users/viniciussteigleder/Documents/Web apps - vide coding/Cal_app/prisma/migrations` and `/*.sql` showed no `CREATE POLICY` / `ENABLE ROW LEVEL SECURITY` statements.
  - The helper SQL scripts are for disabling/dropping policies, not creating them:
    - `/Users/viniciussteigleder/Documents/Web apps - vide coding/Cal_app/disable-rls.sql`
    - `/Users/viniciussteigleder/Documents/Web apps - vide coding/Cal_app/drop-policies.sql`
- **Impact**
  - Cross-tenant and cross-patient reads/writes become possible anywhere tenant scoping is missed.
  - “Published/immutable” objects (snapshots, plan publications) can be modified, invalidating audit and clinical integrity.

- **Solution (approaches + recommendation)**
  - Approach A: **Implement Postgres RLS policies + FORCE RLS** for all tenant-scoped tables.
    - Pros: hard boundary; prevents “forgot filter” bugs.
    - Cons: more complex migrations and local dev setup; requires careful policy design.
  - Approach B: App-only enforcement (Prisma middleware that injects `tenant_id` and patient checks).
    - Pros: simpler to implement quickly.
    - Cons: brittle; a single bypass is catastrophic; tests already indicate bypasses exist.
  - **Recommendation**: Approach A as the primary control, plus Approach B as defense-in-depth.
  - **What/How to change**
    - Add explicit RLS setup to migrations for tables with `tenant_id`.
    - Add policies for each role: `OWNER`, `TENANT_ADMIN`, `TEAM` (assigned patient), `PATIENT` (self only).
    - Add immutability policies/triggers for `FoodSnapshot` and published plan objects.
    - Update/expand `tests/security/*.test.ts` to validate the real policies end-to-end.

---

## Cluster 2 (Rank 2): Build Ships With Known Type/Runtime Breakage

### Issue 2.1: Next build ignores TypeScript build errors

- **Assessment**
  - Critical. This makes CI/build green even while the app contains type errors that correlate strongly with runtime bugs (especially Prisma model mismatches).
- **Root Cause**
  - Type errors are intentionally ignored in production builds.
- **Evidence**
  - `/Users/viniciussteigleder/Documents/Web apps - vide coding/Cal_app/next.config.ts`:
    - `typescript.ignoreBuildErrors: true`
  - `npm run build` output included: `Skipping validation of types`.
- **Impact**
  - Regressions reach production; hard-to-debug runtime failures (500s) appear after deploy.
  - Engineers lose the “typecheck as gate” safety net.

- **Solution (approaches + recommendation)**
  - Approach A: Turn typecheck into a hard gate (remove ignoreBuildErrors) and fix errors.
  - Approach B: Keep ignoreBuildErrors, but add `npm run typecheck` as a CI gate and block merges.
  - **Recommendation**: Approach B short-term (unblock deploys), then Approach A once error count is driven to near-zero.
  - **What/How to change**
    - Add CI step calling `npm run typecheck`.
    - Remove `ignoreBuildErrors: true` once baseline is clean.

### Issue 2.2: ESLint config globally disables key correctness rules

- **Assessment**
  - High. “Lint passes” is currently not strong evidence of correctness.
- **Evidence**
  - `/Users/viniciussteigleder/Documents/Web apps - vide coding/Cal_app/eslint.config.mjs` disables:
    - `@typescript-eslint/no-unused-vars`, `react-hooks/exhaustive-deps`, `no-unused-vars`, `jsx-a11y/alt-text`, etc.
- **Impact**
  - Hooks bugs, unused code, and accessibility regressions are not flagged.

- **Solution**
  - Re-enable rules incrementally by directory, starting with core auth/db/tenant-scoping modules.

---

## Cluster 3 (Rank 3): Prisma Schema <> Code Mismatch (Breaks APIs + Integrity Tooling)

### Issue 3.1: `npm run typecheck` shows widespread Prisma field/relation mismatches

- **Assessment**
  - Critical. This indicates code expects relations/fields that do not exist in the current Prisma schema.
- **Root Cause (likely)**
  - Schema evolution drift: code was written for a different/older/newer schema; migrations did not keep up; or schema split across files but not merged.
- **Evidence**
  - `npm run typecheck` errors include:
    - `/Users/viniciussteigleder/Documents/Web apps - vide coding/Cal_app/src/lib/integrity.ts` using `include: { nutrients: true }` and `include: { snapshot: true }` even though those relations appear absent (Prisma disallows `include` for models without relations).
    - `/Users/viniciussteigleder/Documents/Web apps - vide coding/Cal_app/src/app/api/foods/search/route.ts` referencing `aliases` and `nutrients` fields that TS says do not exist.
    - Multiple `type 'never'` errors in patient/owner APIs when using `include`.
- **Impact**
  - Runtime will diverge from expectations:
    - Endpoints may crash when selecting/include relations.
    - Integrity tooling becomes unreliable (false positives/negatives).

- **Solution (approaches + recommendation)**
  - Approach A: Update Prisma schema to match code (add missing tables/relations/fields), then migrate.
  - Approach B: Update code to match schema (remove references or redesign joins).
  - **Recommendation**: Decide one “source of truth” by comparing intended data model vs shipped DB. Then implement A or B consistently.
  - **What/How to change**
    - Produce a schema delta report: list each TS error and map to missing schema entity.
    - Either (A) add models/relations and regenerate client, or (B) refactor endpoints to query existing tables only.
    - Re-run `npm run typecheck` until clean.

---

## Cluster 4 (Rank 4): Demo/Mock Mode Is Wired Into Deployment And Can Poison Sessions

### Issue 4.1: Demo login appears enabled at deploy config level

- **Assessment**
  - Critical if `DEMO_PASSWORD` is set in prod or leaks; High even if it’s not set, because the feature path exists and is easy to misconfigure.
- **Root Cause**
  - Production-like environment config includes demo enable flag.
- **Evidence**
  - `/Users/viniciussteigleder/Documents/Web apps - vide coding/Cal_app/vercel.json` sets:
    - `NEXT_PUBLIC_ENABLE_DEMO_LOGIN: "true"`
  - `/Users/viniciussteigleder/Documents/Web apps - vide coding/Cal_app/src/app/api/auth/login/route.ts`:
    - Falls back to mock users when `NEXT_PUBLIC_ENABLE_DEMO_LOGIN === "true"` and password matches `DEMO_PASSWORD`.
  - `/Users/viniciussteigleder/Documents/Web apps - vide coding/Cal_app/src/lib/mock-data.ts` uses non-UUID IDs like `demo-tenant-001`.
  - Test run shows Prisma UUID failure symptoms consistent with non-UUID tenant IDs:
    - `Error creating UUID ... found 't' at 1` from `prisma.aIExecution.create()` (meal planner test).
- **Impact**
  - If demo session is used while DB is connected, requests that write using `tenant_id` UUID columns will fail (500s) or, worse, create inconsistent records if any columns are text.
  - Inconsistent authorization assumptions (demo user bypassing normal provisioning).

- **Solution (approaches + recommendation)**
  - Approach A: Keep demo login but only on non-production deployments, gated by `VERCEL_ENV !== 'production'`.
  - Approach B: Remove demo login entirely and replace with seed-based demo tenants/users.
  - **Recommendation**: Approach A short-term, Approach B long-term.
  - **What/How to change**
    - Stop setting `NEXT_PUBLIC_ENABLE_DEMO_LOGIN` to true in `/Users/viniciussteigleder/Documents/Web apps - vide coding/Cal_app/vercel.json` for production.
    - Ensure any “demo” IDs conform to DB types (UUIDs) if demo must touch DB.

---

## Cluster 5 (Rank 5): Auth Architecture Split-Brain (Supabase + Custom Cookie) + Request Scope Issues

### Issue 5.1: Mixed claim sources create inconsistent authZ behavior and test brittleness

- **Assessment**
  - High. Multiple sources of truth for identity/claims cause subtle authorization bugs.
- **Root Cause**
  - The app uses:
    - Custom stateless HMAC cookie (`np_session`) for role/tenant/patient
    - Supabase Auth session for “real auth”
    - Fallback parsing of cookie to avoid “Supabase init crash if envs are missing”
- **Evidence**
  - `/Users/viniciussteigleder/Documents/Web apps - vide coding/Cal_app/src/lib/auth.ts` tries cookie first, then Supabase.
  - `/Users/viniciussteigleder/Documents/Web apps - vide coding/Cal_app/src/lib/session.ts` and `/Users/viniciussteigleder/Documents/Web apps - vide coding/Cal_app/src/lib/session-edge.ts` implement separate verifiers.
  - `npm test` failures show `cookies` called “outside a request scope” for server actions:
    - `src/app/studio/ai/exam-analyzer/actions.test.ts` fails with Next request-scope error originating from `/Users/viniciussteigleder/Documents/Web apps - vide coding/Cal_app/src/lib/auth.ts`.
- **Impact**
  - Hard-to-reason authorization; certain calls succeed/fail depending on runtime context (request vs action vs test).
  - Server actions become difficult to test deterministically.

- **Solution**
  - Consolidate into a single identity/claims provider per runtime (server, edge) with clear fallback rules.
  - For server actions: pass claims explicitly from the page/request layer instead of calling `cookies()` deep inside helpers, or provide a test harness that sets Next request context.

---

## Cluster 6 (Rank 6): AI Routes Safety, Tenant Scoping, and Resilience

This overlaps heavily with the existing dedicated report:
- `/Users/viniciussteigleder/Documents/Web apps - vide coding/Cal_app/AI_ROUTE_INVENTORY.md`

### Issue 6.1: Multiple AI endpoints accept `patientId` but do not validate tenant ownership

- **Assessment**
  - Critical. This is the most direct cross-tenant PHI data exposure vector.
- **Evidence**
  - See rows marked ❌ in `/Users/viniciussteigleder/Documents/Web apps - vide coding/Cal_app/AI_ROUTE_INVENTORY.md` (food recognition, meal planner GET, patient analyzer, report generator, supplement advisor, symptom correlator, shopping list, insights, correlations, etc.).
- **Impact**
  - A user from Tenant A can request analysis/reporting on Tenant B patients by guessing/obtaining IDs.

- **Solution**
  - Add a reusable “patient belongs to tenant” guard and enforce it in every AI route and patient-scoped query.
  - Add DB-level protections (Cluster 1) so missing guards do not leak data.

### Issue 6.2: Missing consistent timeouts, payload size caps, and bounded retries for AI calls

- **Assessment**
  - High. AI calls are expensive and can hang or be abused, impacting availability and costs.
- **Evidence**
  - Many routes call OpenAI/Anthropic without a visible centralized timeout/retry budget (see `/Users/viniciussteigleder/Documents/Web apps - vide coding/Cal_app/src/lib/ai/*` and AI route handlers).
- **Impact**
  - Latency spikes, cost blowups, and DoS surface.

- **Solution**
  - Standardize a request budget: max input size, max history length, timeout (per provider), retries (bounded), and rate-limit keyed by tenant+user.

---

## Cluster 7 (Rank 7): Release/DevOps Reproducibility Issues

### Issue 7.1: Next.js workspace root is mis-inferred due to multiple lockfiles

- **Assessment**
  - High. Tooling may treat the wrong directory as project root, impacting caching and builds.
- **Evidence**
  - `npm run build` warning:
    - “Detected multiple lockfiles and selected the directory of `/Users/viniciussteigleder/package-lock.json` as the root directory.”
- **Impact**
  - Non-deterministic builds; confusing cache behavior; potential deployment mismatches.

- **Solution**
  - Remove the stray lockfile outside the repo or set `turbopack.root` in `/Users/viniciussteigleder/Documents/Web apps - vide coding/Cal_app/next.config.ts`.

### Issue 7.2: `.env` is present locally and is being loaded by tests/build tooling

- **Assessment**
  - Medium. This is a common source of “works on my machine” behavior and can accidentally introduce secrets into local artifacts/logs.
- **Evidence**
  - `npm run build` output: “Environments: .env.local, .env” and “Environment variables loaded from .env”.
  - `npm test` output shows `dotenv` loading `.env` (even when it reports injecting `0` vars).
  - `.env` is present at `/Users/viniciussteigleder/Documents/Web apps - vide coding/Cal_app/.env` (gitignored via `/Users/viniciussteigleder/Documents/Web apps - vide coding/Cal_app/.gitignore`).
- **Impact**
  - Behavior differences between local, CI, and Vercel depending on which env files exist.
- **Solution**
  - Keep `.env` for local-only if desired, but document the required env set and ensure CI uses explicit env injection (no reliance on `.env`).

### Issue 7.2: Vercel build script can hide DB migration failures

- **Assessment**
  - Medium to High depending on environment. Builds can succeed while runtime schema is incompatible.
- **Evidence**
  - `/Users/viniciussteigleder/Documents/Web apps - vide coding/Cal_app/scripts/vercel-build.js`:
    - Uses placeholder `DATABASE_URL` when missing.
    - Allows `prisma migrate deploy` to fail (non-fatal) and continues building.
- **Impact**
  - Deploy succeeds but app 500s on runtime DB mismatches.

- **Solution**
  - Treat migration failure as fatal in production; in preview, optionally allow failure but disable DB-dependent features explicitly.

---

## Cluster 8 (Rank 8): Security Headers + Logging Hygiene

### Issue 8.1: No CSP; legacy headers; potential sensitive logs

- **Assessment**
  - Medium. Not the primary tenant leak vector, but important in a PHI/PII context.
- **Evidence**
  - `/Users/viniciussteigleder/Documents/Web apps - vide coding/Cal_app/src/middleware.ts` sets some headers but no `Content-Security-Policy`.
  - `/Users/viniciussteigleder/Documents/Web apps - vide coding/Cal_app/src/app/api/auth/login/route.ts` logs login attempts with `console.log`.
- **Impact**
  - XSS mitigation is weaker; logs may leak user identifiers and operational signals.

- **Solution**
  - Add a CSP aligned with Next.js needs.
  - Remove or sanitize auth logs; use structured logs with redaction.

### Issue 8.2: Middleware rate limiting fallback is ineffective in serverless and may leak memory

- **Assessment**
  - Medium. It helps little against real abuse in Vercel/serverless and can create confusing “sometimes rate-limited” behavior.
- **Root Cause**
  - Uses an in-memory `Map` when Upstash env vars are missing, which is per-instance and ephemeral.
- **Evidence**
  - `/Users/viniciussteigleder/Documents/Web apps - vide coding/Cal_app/src/middleware.ts`:
    - `const rateLimit = new Map<string, { count: number; resetTime: number }>();`
    - Fallback branch executes if Upstash env not present.
- **Impact**
  - Inconsistent throttling; limited protection; potential unbounded growth if cleanup doesn’t keep up (cleanup is probabilistic at 1%).
- **Solution**
  - Use a shared store in any environment where rate limiting matters (Upstash/Redis), or disable the fallback to avoid false confidence.

---

## Cluster 9 (Rank 9): Testing and Tooling Signals Are Misleading

### Issue 9.1: Security tests exist but are currently failing (gap between intent and reality)

- **Assessment**
  - High. This is a “good news / bad news” scenario: tests are pointing at real missing controls.
- **Evidence**
  - `npm test` shows failures in:
    - `/Users/viniciussteigleder/Documents/Web apps - vide coding/Cal_app/tests/security/rbac.test.ts`
    - `/Users/viniciussteigleder/Documents/Web apps - vide coding/Cal_app/tests/security/immutability.test.ts`
- **Impact**
  - The app’s stated security posture is not currently enforced.

- **Solution**
  - Make security tests a merge gate only after fixes land; until then, track failures explicitly as known risks.

---

## Cluster 10 (Rank 10): Route/Portal Surface Complexity and Duplication

### Issue 10.1: Parallel route trees in English and Portuguese likely duplicate functionality

- **Assessment**
  - Medium. This is not a data leak by itself but increases maintenance cost and risk of inconsistent behavior.
- **Evidence**
  - Both exist under `/Users/viniciussteigleder/Documents/Web apps - vide coding/Cal_app/src/app/studio/`:
    - `patients/...` and `pacientes/...`
    - finance/material/report sections in Portuguese mixed with English paths
  - Build output shows both route sets are active (e.g. `/studio/pacientes/...` and `/studio/patients/...`).
- **Impact**
  - Double the testing matrix; higher chance of “one path secured, other path not”.

- **Solution**
  - Decide on a routing/i18n strategy (localized routes vs single canonical route with translations) and consolidate.

---

## Additional Notable Typecheck Findings (Quick Index)

These are not exhaustive, but are high-signal examples from `npm run typecheck`:

- Missing required Prisma fields:
  - `/Users/viniciussteigleder/Documents/Web apps - vide coding/Cal_app/src/app/api/ai/config/route.ts` missing `system_prompt`.
  - `/Users/viniciussteigleder/Documents/Web apps - vide coding/Cal_app/src/app/api/ai/credits/route.ts` missing `cost_usd`.
- Stripe API version mismatch:
  - `/Users/viniciussteigleder/Documents/Web apps - vide coding/Cal_app/src/lib/stripe.ts` uses `apiVersion: '2025-01-27.acacia'` but installed Stripe types expect a different version (`"2026-01-28.clover"` per TS error).
- Next cookies API mismatch in actions helper:
  - `/Users/viniciussteigleder/Documents/Web apps - vide coding/Cal_app/src/lib/safe-action.ts` uses `const cookieStore = cookies();` and then `cookieStore.getAll()` / `cookieStore.set(...)`, but TS error indicates `cookies()` is async in this Next version and must be awaited.
- AI PDF extraction with OpenAI SDK type mismatch:
  - `/Users/viniciussteigleder/Documents/Web apps - vide coding/Cal_app/src/lib/ai/pdf-extraction.ts` passes non-image content types where SDK expects images.

---

## Proposed Execution Order (No Code, Just a Fix Roadmap)

1. **Implement DB RLS + immutability** (make `tests/security/*` pass).
2. **Resolve Prisma schema drift** (make `npm run typecheck` pass).
3. **Disable demo login in production configs**; validate UUID invariants for any demo data.
4. **Make typecheck a hard gate** (CI), then remove `ignoreBuildErrors`.
5. **Normalize auth claims source** and fix request-scope usage for server actions.
6. **Harden AI routes** (tenant/patient guards + budgets).
7. **Fix build root mis-detection** (Turbopack root / remove stray lockfile).
