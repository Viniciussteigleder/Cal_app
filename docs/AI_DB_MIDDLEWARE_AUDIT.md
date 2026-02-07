# NutriPlan — AI, Database & Middleware Comprehensive Audit

**Date**: 2026-02-07
**Scope**: All AI features, credit logic, middleware, auth, database schema
**Branch**: `claude/nutri-view-setup-planning-DDKik`

---

## Executive Summary

| Area | Health | Critical Issues |
|------|--------|-----------------|
| **AI Service Core** | ⚠️ Partial | 11/17 agents are mock stubs |
| **AI Credits** | ❌ Broken | In-memory Map, not persisted to DB |
| **Middleware/Auth** | ✅ Solid | Proper RBAC, RLS, edge/node split |
| **Database Schema** | ⚠️ Issues | 3 PrismaClient instances, missing AIMealPlan model |
| **Subscriptions** | ✅ Working | SubscriptionPlanConfig + Stripe integration |

---

## 1. AI Features — Route-by-Route Status

### Production-Ready (4 routes)

| Route | AI Provider | Model | Credits | Status |
|-------|-------------|-------|---------|--------|
| `/api/ai/food-recognition` | OpenAI | gpt-4-vision-preview | via aiService | ✅ Uses aiService + Supabase |
| `/api/ai/meal-planner` | OpenAI | gpt-4o (configurable) | via recordAiUsage() | ✅ Vercel AI SDK + Zod schema |
| `/api/ai/patient-analyzer` | OpenAI | gpt-4-turbo-preview | via aiService | ✅ Full data gathering + analysis |
| `/api/ai/medical-record` | OpenAI | whisper-1 / gpt-4-turbo | via aiService | ⚠️ Auth optional (demo fallback) |

### Data-Driven, No AI (3 routes)

| Route | What It Does | Status |
|-------|-------------|--------|
| `/api/ai/correlations` | Symptom-meal correlation (statistical) | ✅ Real Prisma queries, FODMAP/histamine detection |
| `/api/ai/insights` | Patient dashboard analytics | ✅ Real data with mock fallback |
| `/api/ai/food-recognition/[id]` | Confirm/correct AI results | ✅ Simple PATCH |

### Mock Stubs — Hardcoded Responses (10 routes)

| Route | Hardcoded Credits | Issue |
|-------|-------------------|-------|
| `/api/ai/chatbot` | 10 | Keyword matching, no LLM |
| `/api/ai/config` | — | In-memory Map, not persisted |
| `/api/ai/credits` | 1000 starting | In-memory Map, resets on restart |
| `/api/ai/exam-analyzer-ocr` | 80 | Returns static mock data |
| `/api/ai/protocol-generator-ai` | 70 | Template-based, no AI |
| `/api/ai/report-generator` | 60 | Static mock charts |
| `/api/ai/shopping-list` | 30 | Static template |
| `/api/ai/supplement-advisor` | 75 | No real exam integration |
| `/api/ai/symptom-correlator-ai` | 90 | Hardcoded patterns |
| `/api/ai/medical-record` (mock funcs) | — | `transcribeAudio()` + `generateSOAPNote()` are mock |

### AI Libraries Used

| Library | File | Purpose |
|---------|------|---------|
| `src/lib/ai/ai-service.ts` | OpenAI + Anthropic SDKs | Central orchestrator (15 agent types) |
| `src/lib/ai/pdf-extraction.ts` | Anthropic SDK | Claude 3.5 Sonnet for exam PDFs + meal photos |
| `src/lib/ai/exams.ts` | OpenAI (via `analyzeImage`) | GPT-4V for biomarker extraction |
| `src/lib/ai/openai.ts` | OpenAI SDK | Vision analysis helper |
| `src/lib/ai/usage.ts` | Prisma | Credit transaction logging |
| `src/lib/ai-config.ts` | Prisma | DB-backed agent config with defaults |
| `src/lib/ai/prompts/clinical-mdt.ts` | — | 185-line clinical prompt (UNUSED) |

---

## 2. AI Credit System — Current State

### How It's Supposed to Work
```
Tenant has: ai_credits (Int), ai_usage_limit (Int), ai_enabled (Boolean)
  ↓
Route calls aiService.execute()
  ↓
aiService checks: tenant.ai_credits > 0
  ↓
Calls AI provider (OpenAI/Anthropic)
  ↓
Records AIExecution row (tokens, cost, status)
  ↓
Decrements tenant.ai_credits by 1
  ↓
Optionally logs AiCreditTransaction
```

### What's Actually Happening

| Component | Expected | Actual |
|-----------|----------|--------|
| Credit storage | Prisma `Tenant.ai_credits` | ✅ Works in aiService |
| Credit check | Before AI call | ✅ aiService checks first |
| Credit deduction | After successful call | ✅ Decrements by 1 |
| `/api/ai/credits` endpoint | Read/write from DB | ❌ **In-memory Map** — resets on restart |
| `/api/ai/config` endpoint | Read/write from DB | ❌ **In-memory Map** — resets on restart |
| Transaction logging | AiCreditTransaction table | ⚠️ Only in meal-planner route |
| Cost tracking | Dynamic per model | ❌ Hardcoded `(tokens/1000)*0.01` |
| BRL conversion | Exchange rate API | ❌ Hardcoded `USD * 5.5` |

### Credit Allocation by Plan

| Plan | Monthly Credits | Usage Limit | Patient Limit | Price |
|------|----------------|-------------|---------------|-------|
| BASIC | 100 | 200 | 5 | Free |
| PRO | 500 | 5,000 | 50 | R$49/mo |
| PRO_MAX | 2,000 | 20,000 | 200 | R$97/mo |
| PRO_MAX_AI | 5,000 | 100,000 | Unlimited | R$197/mo |

### Critical Credit Issues

1. **`/api/ai/credits` is completely mock** — uses `new Map()` in-memory. The frontend shows fake balances that reset on every deploy. Must be rewritten to use `Tenant.ai_credits` + `AiCreditTransaction`.

2. **Inconsistent deduction** — `aiService` always deducts 1 credit regardless of operation complexity. Mock routes hardcode different credit costs (30-90) but don't actually deduct.

3. **No credit check in mock routes** — The 10 mock routes deduct credits from an in-memory Map that starts at 1000, not from the actual tenant record.

4. **No usage_limit enforcement** — `ai_usage_limit` field exists on Tenant but is never checked. Only `ai_credits` is validated.

---

## 3. Middleware & Auth Architecture

### Middleware Flow (Edge Runtime)

```
Request → Security Headers → Rate Limiting → Session Check → Role Check → Route
```

**Rate Limiting**: 100 requests/minute per IP (Upstash Redis, falls back to in-memory)

**Session Verification (Edge)**:
- Uses Web Crypto API (`crypto.subtle.sign`)
- Reads `np_session` cookie
- Verifies HMAC-SHA256 signature
- Extracts `userId`, `tenantId`, `role`

**Role-Based Route Protection**:
| Path | Allowed Roles |
|------|---------------|
| `/owner/**` | OWNER only |
| `/studio/**` | TENANT_ADMIN, TEAM, OWNER |
| `/patient/**` | PATIENT only |
| `/api/**` | Rate-limited, auth via claims |

### Auth Chain (Node Runtime)

```
API Route → requireClaims() → getRequestClaims()
  → getSupabaseClaims()     ← checks np_session cookie FIRST
  → getSessionClaims()      ← fallback: verify signed cookie
  → Supabase Auth           ← if real Supabase URL configured
```

### RBAC Matrix

7 resource types × 7 actions. Key rules:
- **OWNER**: Full access to everything
- **TENANT_ADMIN**: Manage patients, plans, protocols, forms
- **TEAM**: Read/create patients and plans, no delete
- **PATIENT**: Read own data, update own profile, export own data

### Security Headers (Applied to All Routes)
- HSTS with 2-year max-age + preload
- X-Frame-Options: SAMEORIGIN
- X-Content-Type-Options: nosniff
- Camera, mic, geolocation disabled via Permissions-Policy

### Middleware Assessment: ✅ Solid
- Proper edge/node split for performance
- Cookie signature verification prevents tampering
- Rate limiting in place
- Security headers comprehensive
- Role isolation enforced at routing level

---

## 4. Database Schema Analysis

### AI-Related Models (5)

**AIExecution** — Tracks every AI call
```
id, tenant_id, model_id, agent_type, input_data (JSON),
output_data (JSON), status (running/completed/failed),
tokens_used, execution_time_ms, cost, error_message
Indexes: [tenant_id, agent_type], [created_at]
```

**AIModel** — Reference table for AI models and pricing
```
id, name (unique), provider (openai/anthropic/google/azure/custom),
type (llm/vision), cost_per_1k, is_active
```

**AIFeedback** — User ratings of AI outputs
```
id, execution_id, user_id, rating, feedback_text,
was_helpful, corrections (JSON)
Index: [execution_id]
```

**AiAgentConfig** — Per-tenant agent settings
```
id, tenant_id, agent_id, model_provider, model_name,
temperature, max_tokens, system_prompt, user_template, is_active
Unique: [tenant_id, agent_id]
```

**AiCreditTransaction** — Usage billing records
```
id, tenant_id, nutritionist_id, patient_id, agent_type,
credits_used, cost_usd, cost_brl, metadata
Indexes: [tenant_id, created_at], [patient_id, created_at], [nutritionist_id, created_at]
```

### Tenant Fields for AI/Subscriptions
```
ai_enabled      Boolean  @default(true)
ai_credits      Int      @default(100)
ai_usage_limit  Int      @default(1000)
plan            SubscriptionPlan @default(BASIC)
stripe_customer_id      String?
stripe_subscription_id  String?
subscription_status     String?
```

### RLS (Row-Level Security)
- **28 tables** have RLS FORCE enabled
- Application role: `nutriplan_app`
- Session variables: `app.user_id`, `app.tenant_id`, `app.role`, `app.owner_mode`
- ⚠️ **Missing from RLS**: ExamResultExtracted, AnthropometryRecord, AiCreditTransaction, SubscriptionPlanConfig

### PrismaClient Duplication Issue

| File | Pattern | Problem |
|------|---------|---------|
| `src/lib/prisma.ts` | Singleton with global cache | ✅ Correct |
| `src/lib/db.ts` | `new PrismaClient()` (raw) | ❌ Creates extra connection |
| `src/lib/ai/ai-service.ts` | `new PrismaClient()` (raw) | ❌ Creates extra connection |

**Impact**: 3 connection pools instead of 1. On Vercel Serverless (max 10 connections), this quickly exhausts the pool. All code should import from `prisma.ts`.

### Missing Model: AIMealPlan
The meal-planner route (`src/app/api/ai/meal-planner/route.ts` line 121) saves to `supabase.from('AIMealPlan')`, but **no AIMealPlan model exists in the Prisma schema**. This will silently fail or crash at runtime.

---

## 5. Critical Issues — Priority Ranked

### P0 — Build/Runtime Breakers

| # | Issue | File | Fix |
|---|-------|------|-----|
| 1 | **3 PrismaClient instances** cause connection pool exhaustion | `db.ts`, `ai-service.ts` | Replace with `import { prisma } from '@/lib/prisma'` |
| 2 | **AIMealPlan model missing** from Prisma schema | `schema.prisma` | Add model or change to Prisma insert |
| 3 | **Credits API is in-memory** — resets on every deploy | `api/ai/credits/route.ts` | Rewrite to use Tenant.ai_credits + AiCreditTransaction |

### P1 — Security & Data Integrity

| # | Issue | File | Fix |
|---|-------|------|-----|
| 4 | **AI tables missing from RLS** | `schema.prisma` / migrations | Add RLS policies for ExamResultExtracted, AnthropometryRecord, AiCreditTransaction |
| 5 | **Medical record auth is optional** | `api/ai/medical-record/route.ts` | Remove demo fallback, enforce auth |
| 6 | **No API key validation** — silent failure | `ai-service.ts`, `pdf-extraction.ts` | Throw explicit error if no keys configured |
| 7 | **aiService bypasses RLS** — doesn't use `withSession()` | `ai-service.ts` | Wrap DB calls with `withSession()` |

### P2 — Functionality Gaps

| # | Issue | Impact | Fix |
|---|-------|--------|-----|
| 8 | **10 mock AI routes** with hardcoded data | Users see fake AI results | Implement with aiService or mark as "coming soon" |
| 9 | **Config API is in-memory** | Agent configs reset on deploy | Rewrite to use AiAgentConfig table |
| 10 | **Cost calculation hardcoded** | Billing inaccurate | Use AIModel.cost_per_1k for dynamic pricing |
| 11 | **ai_usage_limit never enforced** | No spending cap | Add check in aiService.execute() |
| 12 | **Clinical MDT prompt unused** | 185 lines of dead code | Integrate or remove |

### P3 — Quality & Robustness

| # | Issue | Fix |
|---|-------|-----|
| 13 | No rate limiting on AI routes specifically | Add per-tenant AI rate limit |
| 14 | No input sanitization before AI prompts | Sanitize user data in prompts |
| 15 | BRL conversion hardcoded at 5.5 | Use exchange rate API or config |
| 16 | Inconsistent credit deduction (1 vs 30-90) | Standardize per-agent credit cost |
| 17 | Only 1 test file for AI (meal-planner, happy path only) | Add error/edge case tests |
| 18 | No Stripe customer_id uniqueness constraint | Add unique index |

---

## 6. Recommended Improvements

### Phase 1 — Fix Critical (1-2 days)

1. **Consolidate PrismaClient** — Replace all `new PrismaClient()` with singleton from `@/lib/prisma`
2. **Add AIMealPlan model** to Prisma schema with migration
3. **Rewrite credits API** to use actual DB (Tenant.ai_credits + AiCreditTransaction)
4. **Rewrite config API** to use AiAgentConfig table
5. **Enforce auth** on medical-record route
6. **Add RLS** for new tables (ExamResultExtracted, AnthropometryRecord, AiCreditTransaction)

### Phase 2 — Strengthen (3-5 days)

7. **Implement ai_usage_limit check** in aiService alongside ai_credits
8. **Dynamic pricing** — use AIModel.cost_per_1k instead of hardcoded formula
9. **Standardize credit costs** per agent type (store in AiAgentConfig or AIModel)
10. **Add API key validation** with explicit errors on startup
11. **Wrap AI DB calls with withSession()** for proper RLS
12. **Convert mock routes** to real implementations (prioritize: exam-analyzer, protocol-generator, chatbot)

### Phase 3 — Production Hardening (1 week)

13. **Per-tenant AI rate limiting** (separate from global rate limit)
14. **Async job queue** for long-running AI operations (Inngest, BullMQ, or Vercel Cron)
15. **Input sanitization** layer before all AI prompts
16. **Comprehensive test suite** — error cases, credit depletion, concurrent access
17. **Monitoring/alerting** for AI failures, credit exhaustion, cost spikes
18. **Audit trail** — log all AI interactions for compliance (LGPD)

### Phase 4 — Advanced (ongoing)

19. **Multi-model routing** — route to cheapest model that meets quality threshold
20. **Prompt versioning** — track prompt changes and their impact on output quality
21. **A/B testing** for AI outputs — compare model performance
22. **Credit purchase flow** — integrate with Stripe for pay-as-you-go credits
23. **AI output caching** — cache identical requests to save credits
24. **Streaming responses** — use Server-Sent Events for long AI operations

---

## 7. Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     MIDDLEWARE (Edge)                         │
│  Security Headers → Rate Limit → Session Verify → Role Check │
└──────────────────────────┬──────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
   ┌────▼────┐      ┌─────▼─────┐     ┌─────▼─────┐
   │ /studio │      │ /patient  │     │  /owner   │
   │ ADMIN   │      │ PATIENT   │     │  OWNER    │
   └────┬────┘      └─────┬─────┘     └─────┬─────┘
        │                  │                  │
        └──────────────────┼──────────────────┘
                           │
                    ┌──────▼──────┐
                    │  /api/ai/*  │
                    └──────┬──────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
        ┌─────▼────┐ ┌────▼────┐ ┌────▼─────┐
        │ aiService│ │ Vercel  │ │  Mock    │
        │ (4 real) │ │ AI SDK  │ │ (10 stub)│
        └─────┬────┘ └────┬────┘ └──────────┘
              │            │
       ┌──────┼──────┐    │
       │      │      │    │
   ┌───▼──┐┌──▼──┐┌──▼──┐│
   │OpenAI││Anth.││Whis.││
   │GPT-4V││3.5S ││ STT ││
   └───┬──┘└──┬──┘└──┬──┘│
       │      │      │   │
       └──────┼──────┘   │
              │           │
       ┌──────▼───────────▼──┐
       │    PostgreSQL        │
       │  (Prisma + RLS)     │
       │                      │
       │  AIExecution         │
       │  AiCreditTransaction │
       │  Tenant.ai_credits   │
       └──────────────────────┘
```

---

## 8. Files Referenced

| Category | Key Files |
|----------|-----------|
| **AI Service** | `src/lib/ai/ai-service.ts`, `src/lib/ai/usage.ts`, `src/lib/ai-config.ts` |
| **AI Providers** | `src/lib/ai/pdf-extraction.ts`, `src/lib/ai/exams.ts`, `src/lib/ai/openai.ts` |
| **AI Prompts** | `src/lib/ai/prompts/clinical-mdt.ts` |
| **AI Routes** | `src/app/api/ai/*/route.ts` (17 files) |
| **Auth/Middleware** | `src/middleware.ts`, `src/lib/session.ts`, `src/lib/session-edge.ts`, `src/lib/auth.ts`, `src/lib/claims.ts` |
| **RBAC** | `src/lib/rbac.ts`, `src/lib/api-helpers.ts` |
| **Database** | `prisma/schema.prisma`, `src/lib/db.ts`, `src/lib/prisma.ts` |
| **Plans** | `src/lib/plans.ts`, `src/app/api/owner/plans/route.ts` |
| **Stripe** | `src/lib/stripe.ts`, `src/app/api/stripe/checkout/route.ts`, `src/app/api/webhooks/stripe/route.ts` |
