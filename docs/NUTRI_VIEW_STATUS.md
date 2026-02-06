# Nutri View — Status Report

> Branch: `claude/nutri-view-setup-planning-DDKik`
> Date: 2026-02-06
> Commits: 4 (e6e3308 → 1d845fe)

---

## 1. Requirements Summary

The specification defines a **complete redesign** of the Nutritionist Portal (studio) around two core modes:

| Mode | Purpose | Scope |
|------|---------|-------|
| **Global (Clínica)** | Clinic management, scheduling, reusable assets, reports, financials, settings | 7 top-level sections, 38 sub-pages |
| **Patient (Workspace)** | Clinical execution per patient: record, exams, anthropometry, energy calc, meal plan, prescription, documents | 9 clinical pillars, 43 sub-pages |

### Key Architectural Changes Required

1. **Dual navigation** — sidebar changes completely when a patient is active
2. **Context Bar** — persistent strip showing Global or Patient mode with switch/exit controls
3. **App Header** — global search (Cmd+K), quick access panel, notifications, profile
4. **Consultation Wizard** — guided 4-step flow (skippable steps, links to workspace tabs)
5. **Guardrails** — patient confirmation on critical actions, AI always generates drafts, safe patient switch, locked mode during signing
6. **AI as verbs** — no chatbot; embedded action buttons (max 2-4 per screen) with cost labels
7. **Materiais** — renamed from "Conteúdo/Biblioteca", dual save/apply pattern (template → instance)
8. **Route restructure** — from `/studio/patients/` to `/studio/pacientes/` with PT-BR route segments

---

## 2. What Was Done (This Branch)

### 2.1 Navigation Architecture Components (9 new files)

| File | Component | Status |
|------|-----------|--------|
| `src/components/layout/AppHeader.tsx` | Global header with search, quick access, notifications, profile | **Created** — fully functional |
| `src/components/layout/ContextBar.tsx` | Context bar (Global/Patient mode), breadcrumbs, patient switch | **Created** — fully functional |
| `src/components/layout/GlobalSidebar.tsx` | 7-section collapsible sidebar for Global mode | **Created** — fully functional |
| `src/components/layout/PatientWorkspaceSidebar.tsx` | 9-pillar sidebar for Patient Workspace | **Created** — fully functional |
| `src/components/layout/QuickAccessPanel.tsx` | 7-action quick access dropdown | **Created** — fully functional |
| `src/components/layout/NutriLayout.tsx` | Composed layout for Global mode | **Created** — fully functional |
| `src/components/layout/PatientWorkspaceLayout.tsx` | Composed layout for Patient Workspace | **Created** — fully functional |
| `src/components/studio/PatientConfirmationModal.tsx` | Guardrails 1-3 (confirmation, AI draft wrapper, safe switch) | **Created** — UI complete, not yet wired |
| `src/components/studio/ConsultationWizard.tsx` | 4-step consultation wizard | **Created** — UI complete, data integration pending |

### 2.2 Layout Updates (2 files modified)

| File | Change |
|------|--------|
| `src/app/studio/layout.tsx` | Replaced `PortalShell` with `NutriLayout` |
| `src/app/studio/pacientes/[patientId]/layout.tsx` | New layout using `PatientWorkspaceLayout` components |

### 2.3 Route Stubs (82 new page files)

**Global Routes (38 pages):**
- `/studio/visao-geral` + alertas, indicadores
- `/studio/agenda` + calendario, tarefas, retornos, historico, link
- `/studio/pacientes` + novo, segmentos, onboarding, easy-patient
- `/studio/materiais` + planos, receitas, protocolos, formularios, laminas, documentos
- `/studio/relatorios` + clinica, programas, exportacoes, auditoria
- `/studio/financeiro` + faturamento, pagamentos, assinaturas, custos
- `/studio/configuracoes` + perfil, equipe, integracoes, assinatura-digital, politicas-logs, ia-governanca

**Patient Workspace Routes (43 pages):**
- `/studio/pacientes/[patientId]/resumo`
- `/studio/pacientes/[patientId]/prontuario` + consultas, evolucao, historico, anexos, transcricoes
- `/studio/pacientes/[patientId]/exames` + adicionar, resultados, evolucao, notas, sugestoes
- `/studio/pacientes/[patientId]/antropometria` + medidas, bioimpedancia, evolucao, metas
- `/studio/pacientes/[patientId]/calculo-energetico` + parametros, cenarios, macros, historico
- `/studio/pacientes/[patientId]/plano-alimentar` + atual, montar, aplicar-modelo, lista-compras, publicar, versoes
- `/studio/pacientes/[patientId]/prescricao` + itens, dosagens, alertas, documento, assinar-enviar
- `/studio/pacientes/[patientId]/documentos` + gerar, assinar, enviar, historico
- `/studio/pacientes/[patientId]/mensagens`
- `/studio/pacientes/[patientId]/consulta/iniciar` (wizard with `?etapa=` query param)

**Redirect page:**
- `/studio/pacientes/[patientId]` → redirects to `/resumo`

### 2.4 i18n Updates (src/i18n/pt-BR.ts)

Added 150+ translation keys across 7 new sections:
- `globalNav` — 38 Global navigation labels
- `workspaceNav` — 40 Patient Workspace labels
- `wizard` — 9 consultation wizard labels
- `contextBar` — 7 context bar labels
- `guardrails` — 13 guardrail modal labels
- `quickAccess` — 8 quick access labels
- `aiActions` — 22 verb-based AI action labels

### 2.5 Documentation

| File | Content |
|------|---------|
| `docs/NUTRI_PORTAL_PROMPTS.md` | 15 professional implementation prompts (detailed below) |

### 2.6 Stats

- **96 files changed** across 4 commits
- **5,185 lines added**, 20 lines removed
- **0 existing functionality broken** — old routes at `/studio/patients/` remain untouched

---

## 3. What Is Open (Not Yet Implemented)

### 3.1 Data Integration (Priority: HIGH)

All route stubs currently show placeholder content. Each needs real data:

| Page | Data Source | API Needed |
|------|------------|------------|
| Visão Geral / Painel | Aggregated KPIs | `GET /api/studio/dashboard/kpis` |
| Visão Geral / Alertas | Pending items across patients | `GET /api/studio/alerts` |
| Agenda / Calendário | Events model | `CRUD /api/studio/events` |
| Agenda / Tarefas | PlannerTask model | Existing, needs enhancement |
| Pacientes / Lista | Patient model | Existing at `/api/studio/patients` |
| Materiais (all sub-pages) | Unified materials model | `CRUD /api/studio/materiais` |
| Relatórios | Aggregation queries | `GET /api/studio/reports/*` |
| Financeiro (all sub-pages) | New Invoice/Payment models | New Prisma models needed |
| Configurações | Tenant settings | `PATCH /api/studio/settings` |
| Patient Resumo | Patient summary aggregate | `GET /api/studio/patients/:id/summary` |
| Prontuário | DailyLogEntry + custom types | Existing, needs enhancement |
| Exames | Exam results model | Existing, needs structured results |
| Antropometria | PatientProfile measurements | Existing, needs time-series |
| Cálculo Energético | Calculation engine | Existing at `/lib/calculations/` |
| Plano Alimentar | Plan + PlanDay + PlanMeal | Existing, needs versioning |
| Prescrição | New Prescription model | New Prisma model needed |
| Documentos | Document generation | Existing PDF system, needs enhancement |
| Mensagens | WhatsApp/messaging integration | New integration needed |

### 3.2 Prisma Schema Changes (Priority: HIGH)

New models needed:

```
- Event (for Agenda): id, tenant_id, patient_id?, type, title, start, end, notes
- Invoice: id, tenant_id, patient_id, amount, status, due_date, items
- Payment: id, invoice_id, amount, method, date, status
- ServicePackage: id, tenant_id, name, price, consultations_included
- Prescription: id, patient_id, tenant_id, status, items (JSON or relation)
- PrescriptionItem: id, prescription_id, name, dosage, frequency, duration, notes
- Tag: id, tenant_id, name, color, category
- PatientTag: patient_id, tag_id (junction)
- Segment: id, tenant_id, name, rules (JSON)
- Material: id, tenant_id, type, title, content, tags, metadata
- ConsultationRecord: id, patient_id, wizard_state, steps_completed, notes
```

### 3.3 Guardrails Wiring (Priority: HIGH)

Components exist but are not yet integrated:

| Guardrail | Component | Wiring Needed |
|-----------|-----------|---------------|
| Patient Confirmation | `PatientConfirmationModal` | Wrap all critical action handlers in workspace pages |
| AI Draft | `AIDraftWrapper` | Wrap all AI outputs across 16+ pages |
| Safe Switch | `SafeSwitchModal` | Create `useUnsavedChanges()` hook, integrate with `PatientContext` |
| Locked Mode | ContextBar `locked` prop | Create `useLockedMode()` hook, integrate during sign/send flows |

### 3.4 AI Action Integration (Priority: MEDIUM)

The AI button patterns exist in the Wizard but need to be replicated across all workspace pages:

| Page | AI Actions to Wire |
|------|-------------------|
| Visão Geral | Resumo do Dia, Detectar Padrões |
| Agenda | Preparar Consulta, Mensagem Sugerida |
| Pacientes | Tags Automáticas, Risco de Abandono |
| Materiais | Gerar Receita, Gerar Plano-Modelo, Reescrever, Criar Protocolo |
| Resumo | Resumo Clínico, Checklist de Revisão |
| Prontuário | Resumir, Gerar Evolução, Transcrever, Sugerir Perguntas |
| Exames | Extrair PDF, Interpretar, Gráficos, Recomendar |
| Antropometria | Extrair Bioimpedância, Inconsistências, Tendências |
| Cálculo | Sugerir Fatores, Gerar Cenários, Validar Coerência |
| Plano Alimentar | Gerar Plano, Variações, Substituições, Ajuste por Aderência |
| Prescrição | Sugerir, Dosagens, Conflitos, Gerar Documento |
| Documentos | Gerar Orientações, Reescrever, Pré-preencher |

Each AI action requires:
1. API endpoint (most at `/api/ai/execute` with action_id)
2. Prompt template (in `/lib/ai/prompts/`)
3. AIDraftWrapper integration
4. Cost estimation and audit logging

### 3.5 Legacy Route Migration (Priority: LOW)

Old routes at `/studio/patients/` still exist and function. Migration plan:

1. Old patient list: `/studio/patients` → `/studio/pacientes`
2. Old patient detail: `/studio/patients/[patientId]/*` → `/studio/pacientes/[patientId]/*`
3. Old sidebar component: `StudioSidebar` → `PatientWorkspaceSidebar`
4. Old header: `PatientContextHeader` → `ContextBar`

Recommended: keep old routes working with redirects during transition.

### 3.6 Mobile Navigation (Priority: MEDIUM)

Current `MobileNav` component returns `null` for nutritionists. Needs:
- Mobile hamburger menu for GlobalSidebar
- Mobile bottom nav for Patient Workspace (key pillars)
- Mobile-optimized ConsultationWizard
- Responsive ContextBar (already partially handled)

### 3.7 Testing (Priority: MEDIUM)

No tests exist for new components. Needed:
- Unit tests (Vitest) for: guardrail hooks, breadcrumb generation, wizard state machine
- Component tests for: PatientConfirmationModal, AIDraftWrapper, SafeSwitchModal
- E2E tests (Playwright) for: navigation flow, wizard flow, patient switch flow

---

## 4. How It Should Be Implemented

### 4.1 Recommended Implementation Order

Follow the priority order from `docs/NUTRI_PORTAL_PROMPTS.md`:

| Phase | Blocks | Rationale |
|-------|--------|-----------|
| **Phase 1** | Block 5 (Resumo), Block 6 (Prontuário), Block 7 (Exames) | Core patient workspace — most used daily |
| **Phase 2** | Block 8 (Plano Alimentar), Block 10 (Wizard), Block 9 (Prescrição) | Clinical workflow completion |
| **Phase 3** | Block 11 (Guardrails), Block 12 (AI System) | Safety and AI infrastructure |
| **Phase 4** | Block 1 (Visão Geral), Block 4 (Materiais) | Global mode enhancement |
| **Phase 5** | Block 2 (Agenda), Block 3 (Pacientes) | Scheduling and patient management |
| **Phase 6** | Block 13 (Relatórios), Block 14 (Financeiro), Block 15 (Configurações) | Operations and administration |

### 4.2 Implementation Pattern Per Block

For each block, follow this order:

```
1. Prisma schema (if new models needed)
   → npx prisma migrate dev --name add_[model]

2. API routes
   → src/app/api/studio/[section]/route.ts
   → Include tenant isolation, auth checks, validation (Zod)

3. Server actions (if applicable)
   → src/app/studio/[section]/actions.ts

4. Page implementation
   → Replace stub with real page component
   → Server component for data fetching
   → Client sub-components for interactivity

5. AI integration
   → Prompt template in src/lib/ai/prompts/
   → AI action button on page
   → AIDraftWrapper for output
   → Audit logging

6. Guardrail integration
   → PatientConfirmationModal on critical actions
   → useUnsavedChanges() on forms

7. Tests
   → Unit test for business logic
   → Component test for UI interactions
```

### 4.3 Key Technical Decisions

| Decision | Recommendation |
|----------|---------------|
| **Routing prefix** | Keep `/studio/` (not `/app/` from spec) to avoid breaking existing routes |
| **Patient ID in URL** | Use `/studio/pacientes/[patientId]/` — clean and explicit |
| **Wizard state** | `localStorage` keyed by consultation ID, with server sync on step completion |
| **AI execution** | Unified `/api/ai/execute` endpoint with action registry in `/lib/ai/actions.ts` |
| **Material instances** | When template is applied to patient, create a copy with `source_material_id` reference |
| **Versioning** | Plans and prescriptions use snapshot-on-publish pattern (JSON column) |
| **Audit** | Use existing `AuditEvent` model — add `ai_action` type for AI operations |
| **Feature flags** | Use existing `simple-mode` localStorage pattern; add per-feature flags in Tenant settings |

### 4.4 Using the Prompts Document

`docs/NUTRI_PORTAL_PROMPTS.md` contains **15 self-contained prompts** — one per block. Each prompt can be used directly with an AI coding assistant to implement that block. They include:

- Full requirements specification
- AI integration points
- UX/accessibility standards
- Technical implementation details (Prisma models, API routes, component structure)
- Edge cases and error handling

Use them as input prompts for focused implementation sessions.

---

## 5. File Inventory

### New Files Created (96 total)

**Layout Components (7):**
```
src/components/layout/AppHeader.tsx
src/components/layout/ContextBar.tsx
src/components/layout/GlobalSidebar.tsx
src/components/layout/NutriLayout.tsx
src/components/layout/PatientWorkspaceLayout.tsx
src/components/layout/PatientWorkspaceSidebar.tsx
src/components/layout/QuickAccessPanel.tsx
```

**Studio Components (2):**
```
src/components/studio/ConsultationWizard.tsx
src/components/studio/PatientConfirmationModal.tsx
```

**Route Pages — Global (38):**
```
src/app/studio/visao-geral/page.tsx
src/app/studio/visao-geral/alertas/page.tsx
src/app/studio/visao-geral/indicadores/page.tsx
src/app/studio/agenda/page.tsx
src/app/studio/agenda/calendario/page.tsx
src/app/studio/agenda/tarefas/page.tsx
src/app/studio/agenda/retornos/page.tsx
src/app/studio/agenda/historico/page.tsx
src/app/studio/agenda/link/page.tsx
src/app/studio/pacientes/page.tsx
src/app/studio/pacientes/novo/page.tsx
src/app/studio/pacientes/segmentos/page.tsx
src/app/studio/pacientes/onboarding/page.tsx
src/app/studio/pacientes/easy-patient/page.tsx
src/app/studio/materiais/page.tsx
src/app/studio/materiais/planos/page.tsx
src/app/studio/materiais/receitas/page.tsx
src/app/studio/materiais/protocolos/page.tsx
src/app/studio/materiais/formularios/page.tsx
src/app/studio/materiais/laminas/page.tsx
src/app/studio/materiais/documentos/page.tsx
src/app/studio/relatorios/page.tsx
src/app/studio/relatorios/clinica/page.tsx
src/app/studio/relatorios/programas/page.tsx
src/app/studio/relatorios/exportacoes/page.tsx
src/app/studio/relatorios/auditoria/page.tsx
src/app/studio/financeiro/page.tsx
src/app/studio/financeiro/faturamento/page.tsx
src/app/studio/financeiro/pagamentos/page.tsx
src/app/studio/financeiro/assinaturas/page.tsx
src/app/studio/financeiro/custos/page.tsx
src/app/studio/configuracoes/page.tsx
src/app/studio/configuracoes/perfil/page.tsx
src/app/studio/configuracoes/equipe/page.tsx
src/app/studio/configuracoes/integracoes/page.tsx
src/app/studio/configuracoes/assinatura-digital/page.tsx
src/app/studio/configuracoes/politicas-logs/page.tsx
src/app/studio/configuracoes/ia-governanca/page.tsx
```

**Route Pages — Patient Workspace (44):**
```
src/app/studio/pacientes/[patientId]/page.tsx (redirect)
src/app/studio/pacientes/[patientId]/layout.tsx
src/app/studio/pacientes/[patientId]/resumo/page.tsx
src/app/studio/pacientes/[patientId]/prontuario/page.tsx
src/app/studio/pacientes/[patientId]/prontuario/consultas/page.tsx
src/app/studio/pacientes/[patientId]/prontuario/evolucao/page.tsx
src/app/studio/pacientes/[patientId]/prontuario/historico/page.tsx
src/app/studio/pacientes/[patientId]/prontuario/anexos/page.tsx
src/app/studio/pacientes/[patientId]/prontuario/transcricoes/page.tsx
src/app/studio/pacientes/[patientId]/exames/page.tsx
src/app/studio/pacientes/[patientId]/exames/adicionar/page.tsx
src/app/studio/pacientes/[patientId]/exames/resultados/page.tsx
src/app/studio/pacientes/[patientId]/exames/evolucao/page.tsx
src/app/studio/pacientes/[patientId]/exames/notas/page.tsx
src/app/studio/pacientes/[patientId]/exames/sugestoes/page.tsx
src/app/studio/pacientes/[patientId]/antropometria/page.tsx
src/app/studio/pacientes/[patientId]/antropometria/medidas/page.tsx
src/app/studio/pacientes/[patientId]/antropometria/bioimpedancia/page.tsx
src/app/studio/pacientes/[patientId]/antropometria/evolucao/page.tsx
src/app/studio/pacientes/[patientId]/antropometria/metas/page.tsx
src/app/studio/pacientes/[patientId]/calculo-energetico/page.tsx
src/app/studio/pacientes/[patientId]/calculo-energetico/parametros/page.tsx
src/app/studio/pacientes/[patientId]/calculo-energetico/cenarios/page.tsx
src/app/studio/pacientes/[patientId]/calculo-energetico/macros/page.tsx
src/app/studio/pacientes/[patientId]/calculo-energetico/historico/page.tsx
src/app/studio/pacientes/[patientId]/plano-alimentar/page.tsx
src/app/studio/pacientes/[patientId]/plano-alimentar/atual/page.tsx
src/app/studio/pacientes/[patientId]/plano-alimentar/montar/page.tsx
src/app/studio/pacientes/[patientId]/plano-alimentar/aplicar-modelo/page.tsx
src/app/studio/pacientes/[patientId]/plano-alimentar/lista-compras/page.tsx
src/app/studio/pacientes/[patientId]/plano-alimentar/publicar/page.tsx
src/app/studio/pacientes/[patientId]/plano-alimentar/versoes/page.tsx
src/app/studio/pacientes/[patientId]/prescricao/page.tsx
src/app/studio/pacientes/[patientId]/prescricao/itens/page.tsx
src/app/studio/pacientes/[patientId]/prescricao/dosagens/page.tsx
src/app/studio/pacientes/[patientId]/prescricao/alertas/page.tsx
src/app/studio/pacientes/[patientId]/prescricao/documento/page.tsx
src/app/studio/pacientes/[patientId]/prescricao/assinar-enviar/page.tsx
src/app/studio/pacientes/[patientId]/documentos/page.tsx
src/app/studio/pacientes/[patientId]/documentos/gerar/page.tsx
src/app/studio/pacientes/[patientId]/documentos/assinar/page.tsx
src/app/studio/pacientes/[patientId]/documentos/enviar/page.tsx
src/app/studio/pacientes/[patientId]/documentos/historico/page.tsx
src/app/studio/pacientes/[patientId]/mensagens/page.tsx
src/app/studio/pacientes/[patientId]/consulta/iniciar/page.tsx
```

**Documentation & Scripts (2):**
```
docs/NUTRI_PORTAL_PROMPTS.md
scripts/generate-stubs.js
```

**Modified Files (2):**
```
src/app/studio/layout.tsx (PortalShell → NutriLayout)
src/i18n/pt-BR.ts (+150 translation keys)
```
