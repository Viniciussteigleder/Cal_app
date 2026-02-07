# AI Route Inventory & Multi‑Tenant Risk Assessment (2026-02-07)

> Note: Attempted to review `https://nutri-app-cal.vercel.app/owner/app-description` but the endpoint returned an internal fetch error (likely auth/cache protected) via the browsing tool, so findings below rely on repository state only. citeturn1view0

## Inventory — AI Routes
| Path | Agent / Feature | Backend Execution | Mock/Stubs | Tenant Safety | Gaps & Impact | Recommended Fix (no code applied) |
| --- | --- | --- | --- | --- | --- | --- |
| `POST /api/ai/food-recognition` | food_recognition | `aiService.execute` (GPT‑4o vision) | None seen | ❌ Patient not tenant-validated | Any tenant user can pass another tenant’s `patientId` and persist results; no timeout/backoff around OpenAI. | Add `prisma.patient.findUnique({ where: { id: patientId, tenant_id: tenantId } })` gate; reject on mismatch; wrap OpenAI call with timeout/retry budget. |
| `PATCH /api/ai/food-recognition/[id]` | confirm recognition | Supabase update only | None | ❌ No tenant check on record | Cross-tenant edits possible by guessing ID. | Fetch by `id` + `tenant_id` and verify ownership before update. |
| `POST /api/ai/meal-planner` | meal_planner | `generateObject` with OpenAI; Prisma + Supabase writes | None | ⚠️ Tenant on execution, but patient unverified | Meal plans could be written for another tenant’s patient; no timeout/ circuit breaker. | Validate patient belongs to tenant; add global timeout + bounded retries; sanitize prefs/restrictions size. |
| `GET /api/ai/meal-planner` | meal plan history | Supabase query by `patient_id` only | None | ❌ No tenant filter | Data leak of meal plans across tenants. | Filter by `tenant_id` and require auth role. |
| `POST/GET /api/ai/patient-analyzer` | patient_analyzer | `aiService.execute`; Prisma fetch of meals/consults/symptoms | None | ❌ No tenant scoping on Prisma queries or Supabase history fetch | Cross-tenant access to meals/symptoms; analysis stored under tenant but source data may leak. | Join patient->tenant check; scope all queries by `tenant_id`; guard GET with tenant filter. |
| `POST /api/ai/exam-analyzer-ocr` | exam_analyzer | `executeAIRoute` → `aiService.execute` | None | ⚠️ Tenant from claims, but patient optional/unverified | Users can analyze images for other tenants’ patients; potential PHI exposure. | Require patient validation when provided; or drop patientId from API if unused. |
| `POST /api/ai/medical-record` | medical_record_creator | `aiService.execute` (Whisper + GPT) | None | ✅ Tenant from claims; no patient data pulled | Main gaps: no timeout; file fetch from arbitrary URL without size limit. | Enforce max audio size; add timeout on fetch and transcription. |
| `POST /api/ai/protocol-generator-ai` | protocol_generator | `executeAIRoute` | None | ⚠️ Tenant via claims, patient optional | If patientId logged, no tenant validation. | Validate patient ownership or remove patientId logging. |
| `POST /api/ai/report-generator` | report_generator | `executeAIRoute`; Prisma pulls patient, logs, anthropometry | None | ❌ Patient + data fetched without tenant filter | Full clinical report of other tenants’ patients possible. | Scope every query by `tenant_id`; verify patient belongs to tenant before generation. |
| `POST /api/ai/supplement-advisor` | supplement_advisor | `executeAIRoute`; Prisma `examResultExtracted` | None | ❌ No tenant filter on exams | Lab data leakage across tenants. | Enforce `(patient_id, tenant_id)` lookup; block when mismatch. |
| `POST /api/ai/symptom-correlator-ai` | symptom_correlator | `executeAIRoute`; Prisma logs/photos | None | ❌ No tenant filters | Shares logs/photos across tenants. | Scope queries by `tenant_id`; limit payload size to avoid prompt stuffing. |
| `POST /api/ai/shopping-list` | shopping_list_generator | `executeAIRoute`; reads `planTemplate` | None | ❌ planTemplate unscoped; patient unvalidated | Tenant A can read Tenant B templates. | Add tenant column filter; validate patient ownership. |
| `POST /api/ai/chatbot` | nutrition_coach | `executeAIRoute` | None | ⚠️ Tenant from claims; patient optional | If patientId stored, not validated; no rate-limit. | Add optional patient validation; rate-limit per user/tenant. |
| `POST /api/ai/coach` (stream) | nutrition_coach (streaming) | `streamText` | None | ⚠️ Tenant from claims; messages unbounded | No guard on message size/history; risk prompt injection/PII echo. | Cap history length/size; add PII scrub + tenant-scoped rate-limit. |
| `GET /api/ai/insights` | analytics (non-AI) | Prisma aggregations | None | ❌ No tenant filter on patient lookup | Cross-tenant read of insights. | Scope by tenant; ensure session role covers patient. |
| `GET /api/ai/correlations` | symptom-meal correlations | Prisma aggregations | None | ❌ No tenant scope for non-patient roles | Data leak when staff from Tenant A queries patientId of Tenant B. | Require tenant match or limit to session.patientId. |
| `GET/POST /api/ai/config` | agent config | Prisma | None | ✅ Tenant-scoped | Add optimistic concurrency/versioning to avoid config races. |
| `GET/POST /api/ai/credits` | credits balance/transactions | Prisma | None | ✅ Tenant-scoped | Add rate-limit; mask metadata containing IDs in responses. |

## Multi‑Tenant Risk Checklist (aligned to current code)
- **Patient ownership checks**: Add a reusable guard (e.g., `assertPatientBelongsToTenant(patientId, tenantId)`) and apply to every AI route that accepts `patientId` (meal planner, analyzer, report, supplement, symptom correlator, shopping list, protocol generator, chatbot/coach when patient-scoped).
- **Query scoping**: Every Prisma/Supabase query should include `tenant_id` filters; patch existing lookups (`examResultExtracted`, `meal`, `symptomLog`, `planTemplate`, `patient`, `foodRecognition`, etc.).
- **Cache/state isolation**: If any caching is added later, prefix keys with tenant and patient; purge on tenant switch.
- **Logging & telemetry**: Log both `tenant_id` and `patient_id`; add anomaly detection for cross-tenant access attempts; ensure logs omit PII content from prompts/responses.
- **Indices & constraints**: Add composite uniques and foreign keys `(tenant_id, patient_id)` on AI tables (`FoodRecognition`, `AIMealPlan`, `PatientAnalysis`, `AIExecution`, `aiCreditTransaction`, exam result tables) to enforce isolation at DB level.
- **Rate limits**: Per-tenant and per-user rate limits on AI routes (especially streaming coach/chatbot) to reduce abuse and prompt-injection surface.
- **Input/output sanitization**: Strip/escape markdown/HTML from AI responses before render; constrain request payload sizes (images/audio/prompts) to prevent DoS.
- **Timeouts & retries**: Standardize OpenAI/Anthropic timeouts (e.g., 8–12s) with bounded retries + circuit breaker; return 504-style errors instead of hanging.
- **Audit trail**: Ensure `AIExecution` records always include `patient_id` when relevant and tenant-scoped; add integrity checks comparing execution input to tenant.

## Proposed Approach (per gap)
- **Enforcement first**: Implement the patient/tenant guard as a shared helper and retrofit across routes; fail fast with 403 when mismatch.
- **Schema hardening**: Add composite keys and foreign keys to prevent accidental cross-tenant writes/reads; migrate with backfill + validation script.
- **Observability**: Add structured logging middleware for AI routes capturing tenant/patient/agent/latency/size; wire to existing tracing if available.
- **Resilience & limits**: Wrap AI calls with timeout/retry; cap request bodies (image/audio/history) and response sizes; enable streaming backpressure where applicable.
- **Security**: Add authZ middleware to AI routes consistent with non-AI routes; ensure role checks (nutritionist vs patient) and block owner-only endpoints appropriately.
