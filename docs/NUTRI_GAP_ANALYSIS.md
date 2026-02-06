# NutriPlan — Complete Gap Analysis & Cross-Portal Impact Assessment

> **Date:** 2026-02-06
> **Branch:** `claude/nutri-view-setup-planning-DDKik`
> **Scope:** Full platform review across Studio, Patient, and Owner portals

---

## 1. Requirements Recap

The specification defines a redesigned **Portal do Nutricionista** with:

- **Dual-mode navigation**: Global (Clínica) vs Patient (Workspace)
- **7 Global sections**: Visão Geral, Agenda, Pacientes, Materiais, Relatórios, Financeiro, Configurações
- **9 Patient Workspace pillars**: Resumo, Prontuário, Exames, Antropometria, Cálculo Energético, Plano Alimentar, Prescrição, Documentos, Mensagens
- **Consultation Wizard**: 4-step guided flow (Pré-consulta, Durante, Plano & Prescrição, Fechamento)
- **4 Guardrails**: Patient confirmation, AI draft wrapper, safe switch, locked mode
- **AI as verbs**: Embedded action buttons (max 2-4/screen), never a chatbot
- **Quick Access**: 7 global actions generating drafts
- **80+ PT-BR routes** matching the full spec

---

## 2. What Was Delivered (This Branch)

| Category | Count | Detail |
|----------|-------|--------|
| Navigation components | 7 | AppHeader, ContextBar, GlobalSidebar, PatientWorkspaceSidebar, QuickAccessPanel, NutriLayout, PatientWorkspaceLayout |
| Guardrail components | 3 | PatientConfirmationModal, AIDraftWrapper, SafeSwitchModal |
| Wizard component | 1 | ConsultationWizard (4 steps) |
| Layout updates | 2 | studio/layout.tsx, pacientes/[patientId]/layout.tsx |
| Route stubs (Global) | 38 | All sub-pages for 7 Global sections |
| Route stubs (Workspace) | 43 | All sub-pages for 9 Patient pillars + wizard |
| i18n keys | 150+ | globalNav, workspaceNav, wizard, contextBar, guardrails, quickAccess, aiActions |
| Prompts doc | 15 blocks | docs/NUTRI_PORTAL_PROMPTS.md |
| Status doc | 1 | docs/NUTRI_VIEW_STATUS.md |
| **Total files** | **96** | **5,185 lines added** |

---

## 3. Current Platform State — Portal-by-Portal

### 3.1 Studio Portal (Nutritionist)

#### Functional (OLD routes at `/studio/patients/` + global pages)

| Feature | Route | Completeness | Notes |
|---------|-------|-------------|-------|
| Dashboard | `/studio/dashboard` | **90%** | KPIs, alerts, histamine, AI correlations. Mock fallback. |
| Patient list | `/studio/patients` | **80%** | Table + card views, search. Mock data. |
| Patient overview | `/studio/patients/[id]/overview` | **90%** | Biometrics, conditions, ClinicalCopilot, recent activity. Real DB. |
| Prontuário | `/studio/patients/[id]/prontuario` | **85%** | Timeline, filters, templates. Real DB. |
| Exames | `/studio/patients/[id]/exames` | **80%** | Upload list + consolidated history. Real DB. |
| Plano Alimentar | `/studio/patients/[id]/plano-alimentar` | **75%** | Editor + PDF export + protocol view. Real DB. |
| Protocols | `/studio/patients/[id]/protocols` | **70%** | Timeline, phase tracking. Real DB. |
| Daily Log | `/studio/patients/[id]/log` | **85%** | DailyLogTimeline. Real DB. |
| Planner | `/studio/planner` | **80%** | Kanban board. Full CRUD API. |
| Recipes | `/studio/recipes` | **70%** | List view from DB. |
| Protocols catalog | `/studio/protocols` | **70%** | List from DB. |
| Templates | `/studio/templates` | **70%** | List from DB. |
| Forms | `/studio/forms` | **60%** | 10 system templates. Mock responses. |
| Chat | `/studio/chat` | **50%** | UI done. Simulated AI responses. |
| Calculations | `/studio/calculations` | **60%** | Audit log display. Mock data. |
| AI Hub | `/studio/ai` | **75%** | 4 active tools, 8 coming soon. Credits tracking. |
| AI Food Recognition | `/studio/ai/food-recognition` | **70%** | Upload + recognition UI. API exists. |
| AI Meal Planner | `/studio/ai/meal-planner` | **70%** | Full config panel + results. API exists. |
| AI Exam Analyzer | `/studio/ai/exam-analyzer` | **70%** | Upload + analysis tabs. Mock data. |
| AI Protocol Gen | `/studio/ai/protocol-generator` | **60%** | Patient selection + generation. |
| Consultation | `/studio/consultations/[id]` | **20%** | Basic 2-step form only. |
| Settings | `/studio/settings/*` | **10%** | Stubs only. |

#### Stubs (NEW routes — all 81 pages at `/studio/pacientes/`, `/studio/visao-geral/`, etc.)

All new route pages contain only a Card with "em desenvolvimento" placeholder. Zero functionality.

#### Dual Route Conflict

Two parallel systems exist:

| Old (functional) | New (stub) | Status |
|---|---|---|
| `/studio/patients` | `/studio/pacientes` | Both exist, old works |
| `/studio/patients/[id]/overview` | `/studio/pacientes/[id]/resumo` | Old works, new is stub |
| `/studio/patients/[id]/prontuario` | `/studio/pacientes/[id]/prontuario` | Old works, new is stub |
| `/studio/patients/[id]/exames` | `/studio/pacientes/[id]/exames` | Old works, new is stub |
| `/studio/patients/[id]/plano-alimentar` | `/studio/pacientes/[id]/plano-alimentar` | Old works, new is stub |
| `/studio/dashboard` | `/studio/visao-geral` | Old works, new is stub |
| N/A | `/studio/agenda` | No equivalent, stub |
| N/A | `/studio/materiais` | Recipes/protocols/templates exist separately |
| N/A | `/studio/relatorios` | No equivalent, stub |
| N/A | `/studio/financeiro` | No equivalent, stub |
| `/studio/settings/*` | `/studio/configuracoes` | Both stubs |

---

### 3.2 Patient Portal

| Feature | Route | Completeness | Notes |
|---------|-------|-------------|-------|
| Dashboard | `/patient/dashboard` | **85%** | Calorie/macro tracking, meal logging, food search. Real API. |
| Meal Capture | `/patient/capture` | **80%** | 5-step flow, voice, photo, check-in. Multilingual. |
| Symptoms | `/patient/symptoms` | **80%** | Bristol scale, slider, SOS WhatsApp. Real API. |
| Chat | `/patient/chat` | **50%** | UI complete. Simulated responses. |
| AI Coach | `/patient/coach` | **30%** | Hardcoded Q&A only. |
| My Plan | `/patient/plan` | **50%** | Fetches protocol. Week nav broken. |
| Progress | `/patient/progress` | **60%** | SVG chart. All mock data. |
| Water | `/patient/water` | **70%** | Functional tracker. Client state only. |
| Exercise | `/patient/exercise` | **70%** | Calorie calc. Client state only. |
| Exams | `/patient/exams` | **40%** | Upload works. AI extraction TODO. History empty. |
| Today | `/patient/today` | **40%** | Timeline UI. All mock data. |
| Diary | `/patient/diary` | **30%** | Photo gallery. Mostly mock. |
| Log | `/patient/log` | **60%** | Reuses studio DailyLogTimeline. |
| Settings | `/patient/settings` | **60%** | Export, preferences. No goal setting. |

**Overall: ~60% functional.** Core flows (meal logging, symptoms, dashboard) work. Secondary features rely heavily on mocks.

---

### 3.3 Owner Portal

| Feature | Route | Completeness | Notes |
|---------|-------|-------------|-------|
| Admin Login | `/admin/login` | **90%** | Email whitelist + DB auth. Working. |
| Tenants | `/owner/tenants` | **50%** | List + AI toggle. No create/edit/delete. |
| Users | `/owner/users` | **5%** | 2 hardcoded rows. No functionality. |
| AI Config | `/owner/ai-config` | **80%** | Full CRUD for 4 agents. Working. |
| AI Hub | `/owner/ai` | **10%** | All mock, nothing saves. |
| Datasets | `/owner/datasets` | **10%** | 3 hardcoded datasets. No upload API. |
| Integrity | `/owner/integrity` | **40%** | Can trigger runs. Checks are mock. |
| App Description | `/owner/app-description` | **80%** | Educational docs page. |
| Stats API | `/api/owner/stats` | **80%** | Cross-tenant aggregation. Working. |

**Overall: ~35% functional.** Login and basic oversight work. CRUD for tenants/users missing. AI and datasets are mock.

---

## 4. Gap Analysis

### 4.1 Critical Gaps (Must Fix Before New Routes Are Useful)

| # | Gap | Impact | Effort |
|---|-----|--------|--------|
| G1 | **New routes are empty stubs** — 81 pages show "em desenvolvimento" | Users see broken navigation | HIGH — each page needs real UI + data |
| G2 | **Dual route conflict** — old functional routes coexist with new stubs | Confusion, duplicated concepts | MEDIUM — needs migration plan with redirects |
| G3 | **No Prisma models for new features** — Prescription, Invoice, Payment, Event, Tag, Segment, Material, ConsultationRecord | Can't store new feature data | HIGH — 10+ new models needed |
| G4 | **Guardrails not wired** — components exist but aren't integrated into any action flow | Safety features inactive | MEDIUM — hooks + integration at action points |
| G5 | **AI actions aren't real** — buttons exist in wizard but don't call actual AI | Core value prop broken | HIGH — requires prompt templates + API wiring |
| G6 | **No financial system** — no models, no API, no UI | Missing entire section | HIGH — new domain from scratch |
| G7 | **No agenda/calendar system** — no event model, no calendar UI | Missing entire section | HIGH — new domain from scratch |

### 4.2 Structural Gaps (Architecture Issues)

| # | Gap | Detail |
|---|-----|--------|
| S1 | **Layout uses `NutriLayout` which wraps `PatientContextProvider`** at root | Every studio page initializes patient context even when no patient is selected — wasted fetch + potential errors |
| S2 | **Old `PortalShell` still used by patient and owner portals** | Inconsistent UX between portals. Patient/owner won't benefit from new navigation patterns. |
| S3 | **No shared AI execution layer** | AI calls scattered across different API routes with no unified logging, cost tracking, or rate limiting |
| S4 | **No real-time features** | No WebSocket/SSE for notifications, live updates, or collaboration |
| S5 | **Mock data scattered everywhere** | ~40% of pages rely on inline mock data rather than DB. Hard to know what's real vs fake. |
| S6 | **No mobile nav for nutritionist** | `MobileNav` returns `null` for `role="nutritionist"`. Desktop-only. |
| S7 | **i18n keys not consumed by components** | 150+ new translation keys added but the new components hardcode strings instead of using `ptBR.*` |

### 4.3 Feature Gaps Per Section

#### Global Mode

| Section | Exists (old) | Exists (new stub) | What's Missing |
|---------|---|---|---|
| Visão Geral | Dashboard at /studio/dashboard | /studio/visao-geral (stub) | Unified KPI view, configurable cards, AI "Resumo do Dia" |
| Agenda | Planner (kanban) only | /studio/agenda (stub) | Calendar view, events model, follow-up queue, booking link |
| Pacientes | List at /studio/patients | /studio/pacientes (stub) | Segments & tags, onboarding flow, Easy Patient app config |
| Materiais | Recipes, protocols, templates as separate pages | /studio/materiais (stub) | Unified hub with dual save/apply, lâminas, document models |
| Relatórios | None | /studio/relatorios (stub) | Everything — charts, exports, audit, narrative AI |
| Financeiro | None | /studio/financeiro (stub) | Everything — invoices, payments, packages, cost tracking |
| Configurações | Stubs at /studio/settings/* | /studio/configuracoes (stub) | Everything — profile, team, integrations, signature, AI governance |

#### Patient Workspace

| Pillar | Exists (old) | Exists (new stub) | What's Missing |
|--------|---|---|---|
| Resumo | /patients/[id]/overview | /pacientes/[id]/resumo (stub) | Quick stats, goals UI, pending items, AI resumo |
| Prontuário | /patients/[id]/prontuario | /pacientes/[id]/prontuario (stub) | Sub-tab separation (consultas, evolução, transcrições) |
| Exames | /patients/[id]/exames | /pacientes/[id]/exames (stub) | Sub-pages (adicionar, resultados, evolução charts, AI suggestions) |
| Antropometria | Partial in PatientProfile | /pacientes/[id]/antropometria (stub) | Dedicated UI, time-series charts, bioimpedância extraction |
| Cálc. Energético | /studio/calculations exists | /pacientes/[id]/calculo-energetico (stub) | Patient-specific calc, scenarios, macro distribution |
| Plano Alimentar | /patients/[id]/plano-alimentar | /pacientes/[id]/plano-alimentar (stub) | Builder, versioning, shopping list, publish to Easy Patient |
| Prescrição | None | /pacientes/[id]/prescricao (stub) | Everything — Prescription model, items, dosages, alerts, sign |
| Documentos | PDF export exists | /pacientes/[id]/documentos (stub) | Generation, signing, sending, history, AI rewrite |
| Mensagens | None | /pacientes/[id]/mensagens (stub) | Everything — WhatsApp integration, templates, history |

---

## 5. How Nutri View Changes Impact the Patient Portal

### 5.1 Direct Impacts (Must Change)

| # | Change | Patient Portal Impact | Priority |
|---|--------|----------------------|----------|
| P1 | **Plano Alimentar versioning** | Patient sees published version at `/patient/plan`. When nutri publishes via "Publicar no Easy Patient", patient plan auto-updates. Need version-aware plan fetch. | HIGH |
| P2 | **Prescrição module** | New patient page needed: `/patient/prescricao` — view active prescriptions, dosages, reminders | HIGH |
| P3 | **Documentos system** | New patient page needed: `/patient/documentos` — view/download received documents, orientation PDFs | HIGH |
| P4 | **Mensagens (WhatsApp)** | If nutri sends via workspace, patient should see message history. May need `/patient/mensagens` or integrate with chat. | MEDIUM |
| P5 | **Consulta Wizard output** | After nutri closes consultation (step 4), patient should see: new plan, new prescription, orientation document, follow-up date — all automatically. | HIGH |
| P6 | **Exam suggestions** | When nutri uses "Recomendar Exames (IA)", patient could receive notification to schedule those exams. | LOW |
| P7 | **Goals from workspace** | Nutri sets goals in patient Resumo → patient sees them in progress tracking. Need shared goals model. | MEDIUM |
| P8 | **Anthropometry data** | Nutri records measurements → patient sees in progress. Already partially works but needs dedicated UI. | MEDIUM |

### 5.2 UX Alignment Opportunities

| # | Opportunity | Detail |
|---|------------|--------|
| PU1 | **Shared design language** | Patient portal still uses `PortalShell` + old sidebar. Should adopt same `AppHeader` pattern (search, notifications) for consistency. |
| PU2 | **Patient-side ContextBar** | Simplified version: show active plan name, next consultation date, unread messages count. |
| PU3 | **AI Coach upgrade** | Replace hardcoded Q&A with real AI using the same `/api/ai/execute` infrastructure being built for the studio. |
| PU4 | **Notification center** | Both portals need one. Nutri actions (plan published, document sent) → patient notification. |
| PU5 | **Progress data from nutri** | Patient progress page should show nutri-recorded data (anthropometry, exam results) alongside self-reported data (meals, symptoms, water). |

### 5.3 New Patient Pages Needed

```
/patient/prescricao         — View active prescriptions + reminders
/patient/documentos         — View received documents + orientations
/patient/metas              — View goals set by nutritionist + self-progress
/patient/proxima-consulta   — Next consultation details + pre-consultation tasks
```

---

## 6. How Nutri View Changes Impact the Owner Portal

### 6.1 Direct Impacts (Must Change)

| # | Change | Owner Portal Impact | Priority |
|---|--------|---------------------|----------|
| O1 | **AI Governance** | `/studio/configuracoes/ia-governanca` defines per-tenant AI limits, model selection, cost budgets. Owner needs **cross-tenant AI dashboard**: total AI spend, per-tenant breakdown, action-type heatmap. | HIGH |
| O2 | **Financeiro module** | Owner needs aggregate financial view: total revenue across tenants, subscription status, payment health. New page: `/owner/financeiro`. | MEDIUM |
| O3 | **New Prisma models** | 10+ new models (Prescription, Invoice, Event, etc.) need integrity checks added to the existing integrity system. | MEDIUM |
| O4 | **Materials library** | If materials (recipes, protocols) can be shared system-wide (not just per-tenant), owner needs a materials governance page. | LOW |
| O5 | **Consultation metrics** | Owner needs visibility into consultation wizard usage, completion rates, average durations across tenants. | LOW |

### 6.2 Owner Portal Structural Changes

| # | Change | Detail |
|---|--------|--------|
| OU1 | **Adopt new navigation** | Owner portal should use a similar `AppHeader` + sidebar pattern (not `PortalShell` pills). Sections: Tenants, Users, AI Governance, Datasets, Integrity, Reports, Settings. |
| OU2 | **User management CRUD** | Currently 2 hardcoded rows. Must become real: list users across tenants, invite, deactivate, role assignment. |
| OU3 | **Tenant CRUD** | Currently read-only + toggle. Must support: create tenant, edit details, deactivate, manage subscription. |
| OU4 | **Dataset management** | Currently mock. Must support: upload CSV, validate, publish, version datasets (TACO, TBCA, BLS). |
| OU5 | **Audit log viewer** | Stats API exists but no UI. Add filterable audit log page with export. |
| OU6 | **Cross-tenant reports** | Aggregate reports: active patients, consultation frequency, AI usage, plan adherence, revenue. |

---

## 7. Next-Level Improvements

### 7.1 Architecture

| # | Improvement | Rationale |
|---|------------|-----------|
| A1 | **Unified AI execution layer** | Single `/api/ai/execute` endpoint with action registry, prompt templates, cost tracking, rate limiting, audit logging. Replaces scattered AI API routes. |
| A2 | **Event-driven notifications** | After nutri actions (plan published, doc sent, consultation closed) → trigger notifications to patient via server-sent events or polling. |
| A3 | **Migrate old routes → new routes** | Add `redirect()` in old route pages pointing to new equivalents. Migrate functionality page-by-page. Remove old routes when all migrated. |
| A4 | **Shared component library** | Extract common patterns (data tables, empty states, loading skeletons, AI action buttons) into reusable components used across all 3 portals. |
| A5 | **Real-time collaboration** | Multiple nutritionists working on same patient should see each other's changes. WebSocket or Supabase Realtime. |
| A6 | **Offline-first patient app** | Patient portal should work offline (meal logging, symptom tracking) with sync when back online. Service worker + IndexedDB. |

### 7.2 Data Model

| # | Improvement | Detail |
|---|------------|--------|
| D1 | **Unified Material model** | Replace separate Recipe, Protocol, PlanTemplate with polymorphic Material model. type discriminator, shared tags, dual save/apply. |
| D2 | **Consultation lifecycle** | New ConsultationRecord model tracking wizard state, linked notes, plan changes, prescriptions — all from one consultation. |
| D3 | **Goals system** | Shared goals model: set by nutri, tracked by patient. Types: weight, measurement, adherence, habit, custom. |
| D4 | **Notification model** | Notification table: recipient_id, type, title, body, read, action_url, created_at. Supports both in-app and push. |
| D5 | **Message model** | For the messaging feature. Supports templates, scheduled sending, read receipts, linked to patient. |

### 7.3 UX

| # | Improvement | Detail |
|---|------------|--------|
| U1 | **Consistent navigation across portals** | All 3 portals should use AppHeader + sidebar (adapted per role). Pill navigation in PortalShell feels dated. |
| U2 | **Mobile nutritionist experience** | Mobile nav currently returns null for nutritionists. Build responsive sidebar + bottom nav for on-the-go use. |
| U3 | **Keyboard shortcuts** | Beyond Cmd+K search: Cmd+N (new patient), Cmd+P (quick access), Cmd+1-9 (sidebar sections). |
| U4 | **Onboarding wizard** | First-time nutritionist setup: clinic name, logo, letterhead, import patients, connect calendar. |
| U5 | **Patient-facing AI** | Upgrade hardcoded coach to real AI. Use same prompt infrastructure. Patient asks questions → AI answers based on their plan/restrictions. |
| U6 | **Dark mode consistency** | Dark mode toggle exists but many pages don't fully support it. Audit all pages for dark mode compliance. |

### 7.4 Quality & Testing

| # | Improvement | Detail |
|---|------------|--------|
| Q1 | **Replace mock data with seed script** | Create `prisma/seed.ts` that populates demo data for all models. Remove inline mock data from pages. |
| Q2 | **E2E test suite** | Playwright tests for: login flow, meal logging, symptom tracking, patient workspace navigation, consultation wizard, plan publishing. |
| Q3 | **Component tests** | Vitest tests for: guardrail hooks, breadcrumb generation, wizard state machine, AI draft wrapper interactions. |
| Q4 | **Accessibility audit** | WCAG 2.1 AA compliance check. Many new components need aria attributes, focus management, screen reader testing. |
| Q5 | **Performance monitoring** | Core Web Vitals tracking. Lazy load heavy components (charts, AI panels). Optimize bundle size. |

---

## 8. Recommended Execution Roadmap

### Phase 1: Foundation (Weeks 1-2)
- Prisma schema: add Prescription, Event, Tag, Segment, ConsultationRecord models
- Migrate /studio/patients/[id]/overview → /studio/pacientes/[id]/resumo (real content)
- Migrate /studio/patients/[id]/prontuario → /studio/pacientes/[id]/prontuario
- Wire guardrails (useUnsavedChanges, useLockedMode hooks)
- Seed script replacing top 10 mock data instances

### Phase 2: Core Workspace (Weeks 3-4)
- Implement exames sub-pages with real data + AI extraction
- Implement plano-alimentar builder + versioning
- Implement calculo-energetico with scenarios
- Implement prescricao module (new model + full CRUD)
- Enhance ConsultationWizard with real data integration

### Phase 3: Global Mode (Weeks 5-6)
- Build visao-geral dashboard with KPIs
- Build agenda/calendario with events model
- Build materiais hub (unify recipes/protocols/templates)
- Wire AI actions across all pages via unified execute endpoint

### Phase 4: Cross-Portal (Weeks 7-8)
- Patient portal: add prescricao, documentos, metas pages
- Patient portal: upgrade to AppHeader pattern
- Owner portal: real user/tenant CRUD
- Owner portal: AI governance dashboard
- Notification system (model + UI for both portals)

### Phase 5: Polish (Weeks 9-10)
- Legacy route migration (redirects from old → new)
- Mobile nutritionist nav
- Dark mode audit
- E2E test suite
- Performance optimization

---

## 9. File Reference

| Document | Path | Purpose |
|----------|------|---------|
| Implementation prompts | `docs/NUTRI_PORTAL_PROMPTS.md` | 15 block-specific prompts for building each section |
| Status report | `docs/NUTRI_VIEW_STATUS.md` | Detailed inventory of what was built in this branch |
| This document | `docs/NUTRI_GAP_ANALYSIS.md` | Full gap analysis + cross-portal impact + roadmap |
| i18n | `src/i18n/pt-BR.ts` | All translation keys (existing + 150 new) |
| Prisma schema | `prisma/schema.prisma` | 50 current models (10+ new ones needed) |
