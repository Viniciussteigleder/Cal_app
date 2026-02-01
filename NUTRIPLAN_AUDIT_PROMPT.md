# NUTRIPLAN CLINICAL NUTRITION APP — COMPREHENSIVE AUDIT PROMPT

> **Purpose**: This prompt instructs an AI auditor to perform a deep, evidence-based review of NutriPlan, producing actionable improvements across UX, UI consistency, microcopy, clinical workflows, and technical implementation.

---

## 0) PRE-FILLED CONTEXT (NutriPlan-Specific)

### A) App Context

| Field | Value |
|-------|-------|
| **App Name** | NutriPlan (Cal_app) |
| **Value Proposition** | Clinical nutrition platform connecting nutritionists and patients through guilt-free food logging, symptom-meal correlation detection, and auditable protocol management for GI health (FODMAP, histamine intolerance, digestive conditions) |
| **Domain** | Clinical/Behavioral Nutrition · Digital Health · B2B/B2C SaaS |
| **Primary Users** | Patients managing GI conditions (IBS, FODMAP sensitivity, histamine intolerance) |
| **Secondary Users** | Clinical nutritionists and dietitians |
| **Tertiary Users** | Clinic owners/administrators |
| **Platform** | Web (Next.js 16 App Router) — responsive mobile-first |
| **Primary Language** | Portuguese (PT-BR) — Brazilian clinical terminology |
| **Monetization** | B2B SaaS (clinic subscriptions) + B2C (patient tiers) |
| **Tech Stack** | Next.js 16, React 19, TypeScript 5, Prisma 5.19, PostgreSQL, Supabase Auth, Radix UI, Tailwind CSS, Zod validation |

### B) Jobs-to-be-Done (JTBD)

| # | User | Job Statement |
|---|------|---------------|
| 1 | Patient | Log meals quickly with histamine risk awareness so I can track triggers without anxiety |
| 2 | Patient | Record symptoms (Bristol Scale, discomfort, GI/histamine symptoms) and link them to recent meals |
| 3 | Patient | Follow my personalized meal plan with portion guidance and substitution options |
| 4 | Patient | Track my consistency and weight progress without feeling judged |
| 5 | Nutritionist | Monitor patient food logs, symptoms, and detect meal-symptom correlations in real-time |
| 6 | Nutritionist | Manage multi-phase protocols (elimination → reintroduction → maintenance) per patient |
| 7 | Nutritionist | Create and assign meal plans with full audit trails and version control |
| 8 | Nutritionist | Access transparent, auditable calculations (TMB/TDEE/macros) with guardrails |
| 9 | Clinic Owner | Manage multi-tenant data policies, user access, and compliance requirements |
| 10 | All Users | Trust that every calculation and data point is traceable and clinically sound |

### C) Core User Flows

#### Patient Portal Flows

**Flow P1: Log a Meal (Food Diary Entry)**
1. Navigate to `/patient/log`
2. Tap "Registrar Refeição" (Log Meal)
3. Select meal type (Breakfast/Lunch/Dinner/Snack)
4. Search for food OR select from recents/favorites
5. Enter portion (grams) — see histamine risk flags (Fresco/Sobra 24h+/Fermentado)
6. Review nutrition summary (kcal, protein, carbs, fat)
7. Save entry → Toast confirmation
8. View updated daily totals

**Flow P2: Log Symptoms**
1. Navigate to `/patient/symptoms`
2. Tap "Novo Registro de Sintomas"
3. Select Bristol Scale (1-7 visual picker)
4. Set discomfort level (0-10 slider with contextual labels)
5. Select symptoms by category (GI: gas, bloating, pain... / Histamine: flushing, headache, hives...)
6. Optionally link to suspected trigger meal
7. Add notes (optional)
8. Save → If discomfort ≥8, trigger SOS WhatsApp option
9. View correlation insights (AI-detected patterns)

**Flow P3: View & Follow Meal Plan**
1. Navigate to `/patient/plan`
2. View today's meals by type
3. See recommended foods with portions
4. Check substitution options (tap food → see alternatives)
5. Mark meal as completed
6. Navigate between days

**Flow P4: Track Progress**
1. Navigate to `/patient/progress`
2. View weight evolution graph
3. See consistency streak and adherence % by meal type
4. Export data (CSV)

#### Nutritionist (Studio) Portal Flows

**Flow N1: Clinical Dashboard Monitoring**
1. Navigate to `/studio/dashboard`
2. Review priority alerts (Critical/Warning/Watch)
3. Check histamine load visualization per patient
4. Review AI-detected correlations with confidence scores
5. Click patient → View detailed logs
6. Take action (message, adjust plan, schedule consultation)

**Flow N2: Manage Patient Protocol**
1. Navigate to `/studio/patients/[id]`
2. View current protocol phase
3. Review phase rules and allowed/avoid foods
4. Advance patient to next phase OR extend current phase
5. Add clinical notes

**Flow N3: Create/Edit Meal Plan**
1. Navigate to `/studio/plans/[patientId]`
2. Select template OR create from scratch
3. Add foods to each meal slot with portions
4. Set macro targets and review coverage
5. Save as draft → Submit for review → Approve → Publish
6. View version history

### D) Design System Tokens (Current)

```
SPACING SCALE: 4px base (p-1=4, p-2=8, p-3=12, p-4=16, p-6=24, p-8=32)
TYPE SCALE: text-xs(12), text-sm(14), text-base(16), text-lg(18), text-xl(20), text-2xl(24), text-3xl(30)
RADIUS: rounded-sm(2), rounded-md(6), rounded-lg(8), rounded-xl(12), rounded-2xl(16)
SHADOWS: shadow-sm, shadow-card (custom), shadow-md

SEMANTIC COLORS:
  Primary: Emerald (--primary) — positive actions, success states
  Destructive: Red (--destructive) — alerts, high-risk, deletions
  Muted: Gray (--muted, --muted-foreground) — secondary text, disabled

MACRO COLORS (domain-specific):
  Protein: Blue (--macro-protein)
  Carbs: Amber (--macro-carb)
  Fat: Green (--macro-fat)

STATUS COLORS:
  Success/Safe: Emerald
  Warning/Caution: Amber
  Error/Crisis: Red
  Info/Neutral: Blue
```

### E) Constraints & Requirements

| Constraint | Details |
|------------|---------|
| Clinical Accuracy | All nutrition calculations must be auditable with CalcAudit trail |
| Behavioral UX | Language must be reassuring, non-judgmental ("guilt-free diary") |
| Guardrails | Weight loss adjustments capped at -25% to -5%; require override_note for exceptions |
| Multi-tenant | Data isolation between clinics; region-aware food databases (TACO/USDA) |
| Accessibility | Must support screen readers, keyboard navigation (Radix UI foundation) |
| Localization | PT-BR primary; i18n structure in place for expansion |
| Simple Mode | Toggle for reduced UI complexity for less tech-savvy patients |
| Dark Mode | Full theme support with proper contrast ratios |

---

## 1) OUTPUT RULES (Strict)

- **Evidence-based only**: Every finding must reference specific screens, components, flows, or code paths
- **No generic advice**: All recommendations must be testable and implementable
- **Label assumptions**: If you cannot verify, prefix with `ASSUMPTION:`
- **Structured improvements**: Every IMPROVE item must include:
  ```
  Severity: P0 (critical) / P1 (high) / P2 (medium)
  Effort: S (≤2 days) / M (3-7 days) / L (>1 week)
  Risk: Low / Med / High
  Clinical Impact: Yes/No (affects patient health decisions)
  Acceptance Criteria: 1-3 bullet checks
  ```
- **Deduplicate**: Consolidate overlapping issues across roles
- **Portuguese microcopy**: All copy examples must be in PT-BR

---

## 2) REVIEW LENSES (Apply All)

| Lens | Focus Areas for NutriPlan |
|------|---------------------------|
| **L1 UX/Usability** | Task success for food logging, symptom entry, plan adherence; cognitive load during entry; error prevention for clinical data |
| **L2 UI Consistency** | Token adherence, macro color usage, state coverage, responsive behavior |
| **L3 Microcopy/Content** | Reassuring tone, clinical accuracy, Portuguese terminology, error messages, empty states |
| **L4 Accessibility** | Keyboard navigation, focus management, contrast (especially for status colors), screen reader labels |
| **L5 Clinical Data Logic** | Validation rules, guardrails, calculation accuracy, correlation detection |
| **L6 Performance** | Load times for food search, plan rendering, dashboard data fetching |
| **L7 Security/Privacy** | PII handling, LGPD compliance (Brazilian GDPR), multi-tenant isolation |
| **L8 Analytics** | Event coverage for key actions, funnel tracking, clinical outcome metrics |
| **L9 Delivery** | Test coverage, CI/CD, feature flags, rollback capability |

---

## 3) EXPERT PANELS (30 Roles — NutriPlan-Adapted)

For each role, provide:
- **5 benchmark voices** (short labels representing domain expertise)
- **ONE consolidated critique** with exactly: KEEP (8 items) + IMPROVE (12 items)

### Role List (Mandatory — All 30)

| # | Role | NutriPlan Focus |
|---|------|-----------------|
| 1 | Product Strategy | B2B/B2C balance, clinic vs patient value, competitive positioning |
| 2 | UX Research | Patient anxiety reduction, nutritionist workflow efficiency |
| 3 | UX Design (Flows + IA) | Entry flow optimization, navigation clarity, role-based IA |
| 4 | UI Design & Visual System | Macro colors, clinical status visualization, card patterns |
| 5 | Design System / Components | Radix UI usage, component state coverage, token consistency |
| 6 | Accessibility | Radix primitives, focus order, color contrast for status |
| 7 | Content Design & Microcopy | "Guilt-free" voice, clinical terms in PT-BR, error empathy |
| 8 | Onboarding & Activation | First food log, first symptom entry, plan discovery |
| 9 | Retention & Habit Loops | Consistency streaks, reminders, progress visualization |
| 10 | Analytics & Measurement | Clinical outcomes, funnel events, correlation tracking |
| 11 | Performance | Food search speed, dashboard load, SSR optimization |
| 12 | Frontend Architecture | Next.js App Router patterns, component composition |
| 13 | Backend Architecture | Prisma queries, Supabase RLS, API route design |
| 14 | Database & Data Integrity | Food snapshot immutability, audit trails, calc versioning |
| 15 | QA & Test Automation | Vitest/Playwright coverage, clinical edge cases |
| 16 | SRE / Reliability | Uptime for clinical app, data backup, failover |
| 17 | Security (AppSec) | Input validation, injection prevention, session management |
| 18 | Privacy (LGPD/GDPR) | Patient data handling, consent, data portability |
| 19 | Clinical Compliance | Nutrition calculation accuracy, guardrail enforcement |
| 20 | Notifications & Messaging | SOS alerts, WhatsApp integration, nutritionist alerts |
| 21 | Search & Filtering | Food search (typo tolerance, synonyms), patient filtering |
| 22 | Forms & Validation | Meal entry, symptom forms, plan creation |
| 23 | Error Handling & Recovery | Network failures during entry, data sync, undo patterns |
| 24 | Offline/Resilience | Patient logging without connectivity, sync strategy |
| 25 | i18n/l10n | PT-BR quality, future language expansion, number formats |
| 26 | Customer Support & Help | In-app guidance, tooltips, SOS escalation |
| 27 | Clinical Documentation | Protocol descriptions, food guidance, substitution rationale |
| 28 | DevOps/CI/CD | Build pipeline, preview deployments, database migrations |
| 29 | Observability | Error tracking, clinical action logging, performance metrics |
| 30 | Behavioral Nutrition UX | Anxiety reduction, consistency incentives, non-judgmental design |

---

## 4) REQUIRED DELIVERABLES

### A) UX Findings

1. **Top 10 Friction Points** (mapped to specific flows with evidence)
2. **Before → After Flow Diagrams** for top 5 issues
3. **Task Success Analysis** for:
   - Food logging (time-to-complete, abandonment points)
   - Symptom entry (completion rate, field skip patterns)
   - Plan adherence tracking (engagement, drop-off)

### B) UI Consistency Report

1. **Token Audit**
   - Spacing: Verify 4/8/12/16/24/32px scale adherence
   - Typography: Check text-xs through text-3xl usage
   - Radius: Audit rounded-* consistency
   - Shadows: shadow-card vs shadow-md usage

2. **Component Inventory**
   | Component | Exists | States Covered | Gap |
   |-----------|--------|----------------|-----|
   | Button | ✓ | default/hover/focus/disabled/loading | — |
   | Input | ✓ | default/focus/error/disabled | — |
   | Card | ✓ | default/hover | loading, empty |
   | Badge | ✓ | variants | — |
   | ... | | | |

3. **State Coverage Checklist**
   - [ ] Default
   - [ ] Hover
   - [ ] Focus (keyboard visible)
   - [ ] Active/Pressed
   - [ ] Disabled
   - [ ] Loading/Skeleton
   - [ ] Empty
   - [ ] Error
   - [ ] Success

4. **Responsive Rules**
   - Breakpoints: sm(640), md(768), lg(1024), xl(1280)
   - Layout behavior per breakpoint
   - Mobile nav vs sidebar transition

### C) Microcopy System

1. **Tone Rules for NutriPlan**
   - ✓ Reassuring, never judgmental ("Focamos na consistência, não na perfeição")
   - ✓ Clinically accurate but accessible
   - ✓ Action-oriented, specific outcomes
   - ✓ Empathetic during discomfort/crisis moments
   - ✓ Celebratory for achievements (without over-praising)

2. **Button Label Conventions**
   | Context | Pattern | Example |
   |---------|---------|---------|
   | Primary action | Verb + object | "Registrar Refeição" |
   | Save/Submit | Specific outcome | "Salvar Registro" |
   | Cancel | "Cancelar" (not "Voltar" unless navigation) | "Cancelar" |
   | Destructive | Verb + consequence context | "Remover Alimento" |

3. **Error Message Template**
   ```
   [O que aconteceu] + [Impacto] + [Como resolver]

   Example:
   "Não foi possível salvar o registro. Suas alterações não foram perdidas.
    Verifique sua conexão e tente novamente."
   ```

4. **Empty State Template**
   ```
   [Contexto empático] + [Próxima ação clara]

   Example (no meals logged):
   "Seu diário de hoje está esperando por você.
    Registrar primeira refeição →"
   ```

5. **Confirmation & Undo Rules**
   - Reversible actions: Use undo toast (5s window), no modal
   - Irreversible actions: Confirm modal with consequence explanation
   - High-stakes clinical actions: Require explicit confirmation + note

6. **Domain Glossary (Top 25 Terms)**
   | Term (PT-BR) | Definition | Usage Context |
   |--------------|------------|---------------|
   | Escala de Bristol | 1-7 scale for stool form classification | Symptom logging |
   | Carga Histamínica | Cumulative histamine exposure level | Dashboard, alerts |
   | Sobra (24h+) | Leftover food >24hrs (higher histamine risk) | Food entry flags |
   | Protocolo FODMAP | Fermentable carbs elimination diet | Protocol management |
   | TMB/TDEE | Basal/Total daily energy expenditure | Calculations |
   | Fase de Eliminação | Protocol phase removing trigger foods | Protocol tracking |
   | Fase de Reintrodução | Protocol phase testing individual foods | Protocol tracking |
   | Fase de Manutenção | Long-term sustainable eating phase | Protocol tracking |
   | Correlação Sintoma-Refeição | AI-detected meal-symptom pattern | Insights |
   | Confiança (%) | Correlation confidence score | Insights |
   | Modo Simples | Reduced UI complexity option | Settings |
   | Diário sem Culpa | Guilt-free food diary concept | Brand messaging |
   | SOS/Crise | High discomfort emergency alert | Symptom logging |
   | Gatilho Suspeito | Suspected trigger food/meal | Correlation display |
   | Aderência | Meal plan adherence percentage | Progress |
   | Consistência | Logging consistency streak | Progress |
   | Macros | Macronutrients (protein/carbs/fat) | Nutrition display |
   | Porção | Portion size in grams | Food entry |
   | Substituição | Food substitution option | Meal plan |
   | Auditoria de Cálculo | Calculation audit trail | Clinical transparency |
   | Guardrail | Safety limit on calculations | System rules |
   | Snapshot | Immutable food data record | Data integrity |
   | Tenant | Clinic/organization in multi-tenant system | Admin |
   | Barreira Intestinal | Gut barrier (clinical concept) | Educational content |
   | Disbiose | Gut dysbiosis condition | Clinical context |

### D) Prioritized Backlog

**Top 20 Improvements** (deduplicated across roles)

| Rank | Issue | Severity | Effort | Flows Affected | Acceptance Criteria |
|------|-------|----------|--------|----------------|---------------------|
| 1 | ... | P0/P1/P2 | S/M/L | Flow IDs | Bullets |
| ... | | | | | |

**Roadmap**
- **NOW (P0)**: Critical clinical/UX issues — implement within 2 weeks
- **NEXT (P1)**: High-impact improvements — implement within 6 weeks
- **LATER (P2)**: Enhancements — backlog for future sprints

### E) Implementation Plan

1. **Screen/Module Targets**
   | Priority | Screen/Component | File Path | Changes |
   |----------|------------------|-----------|---------|
   | P0.1 | ... | src/app/... | ... |

2. **Test Plan**
   - Unit tests for calculation functions (energy.ts, nutrients.ts)
   - Integration tests for food logging flow
   - E2E tests (Playwright) for critical paths
   - Accessibility audit with axe-core

3. **Analytics Plan (15 Key Events)**
   | Event | Properties | Funnel |
   |-------|------------|--------|
   | meal_log_started | meal_type, source (search/recent/favorite) | Log funnel |
   | food_selected | food_id, search_query, position | Log funnel |
   | meal_saved | item_count, total_kcal, has_histamine_risk | Log funnel |
   | symptom_log_started | — | Symptom funnel |
   | symptom_saved | bristol_scale, discomfort_level, symptom_count | Symptom funnel |
   | sos_triggered | discomfort_level | Crisis tracking |
   | correlation_viewed | correlation_id, confidence | Engagement |
   | plan_viewed | day_offset | Adherence |
   | plan_meal_completed | meal_type | Adherence |
   | substitution_viewed | original_food, substitute_food | Plan usage |
   | progress_viewed | date_range | Engagement |
   | simple_mode_toggled | enabled | Settings |
   | protocol_phase_viewed | protocol_type, phase_type | Clinical |
   | patient_alert_clicked | alert_type, severity | Nutritionist |
   | plan_published | patient_id, version_no | Clinical |

4. **Release Plan**
   - Feature flags for P0 changes
   - Staged rollout: 10% → 50% → 100%
   - Rollback triggers: error rate >2%, latency p95 >3s
   - Clinical sign-off required for calculation changes

---

## 5) FOOD & SYMPTOM LOGGING DEEP DIVE (Mandatory)

This section focuses on the core repeated entry flows that drive daily engagement.

### 5.1 Current Flow Diagnosis

**Flow A: Meal Logging (`/patient/log`)**

| Step | Current Implementation | Friction Point |
|------|------------------------|----------------|
| 1 | Navigate to /patient/log | Extra tap from dashboard |
| 2 | Tap "Registrar Refeição" | — |
| 3 | Select meal type | Modal? Dropdown? Verify |
| 4 | Search for food | Search speed? Typo handling? |
| 5 | Select food | Does it show portion defaults? |
| 6 | Enter grams | Numeric keyboard? Unit options? |
| 7 | See histamine flags | Clear enough? Actionable? |
| 8 | Add another food OR save | Multi-item flow unclear? |
| 9 | Confirm save | Toast? Modal? Undo option? |

**Diagnose (provide evidence for each):**
1. Time-to-complete for single food entry
2. Time-to-complete for 3-food meal
3. Search success rate (first result accuracy)
4. Portion entry errors (unit confusion?)
5. Histamine flag comprehension
6. Multi-item meal friction
7. Entry abandonment points
8. Favorite/recent food usage rate
9. Mobile vs desktop experience gaps
10. Simple mode behavior differences

**Flow B: Symptom Logging (`/patient/symptoms`)**

| Step | Current Implementation | Friction Point |
|------|------------------------|----------------|
| 1 | Navigate to /patient/symptoms | — |
| 2 | Tap "Novo Registro" | — |
| 3 | Bristol Scale selection | Visual picker? Tap accuracy? |
| 4 | Discomfort slider (0-10) | Labels clear? Thumb size? |
| 5 | Symptom category tabs | GI vs Histamine separation clear? |
| 6 | Multi-select symptoms | Scrolling? Selection feedback? |
| 7 | Link to meal (optional) | How are meals presented? |
| 8 | Add notes | Keyboard experience? |
| 9 | Save | SOS trigger logic clear? |

**Diagnose (provide evidence for each):**
1. Bristol Scale picker usability (visual clarity, tap targets)
2. Discomfort slider precision (can users hit exact values?)
3. Symptom discovery (can users find their symptom?)
4. Symptom categorization clarity (GI vs Histamine)
5. Meal linking UX (which meals shown? how far back?)
6. SOS trigger transparency (do users know threshold?)
7. Correlation insight visibility post-save
8. Entry frequency patterns (morning/evening bias?)
9. Incomplete entry rate (which fields skipped?)
10. Note field usage rate

### 5.2 Proposed Optimized Flows

#### Lane A: Quick Log (Single Screen)

**Meal Quick Log**
```
┌─────────────────────────────────────────────┐
│ [Café ▼] [Almoço] [Jantar] [Lanche]         │  ← Meal type tabs (sticky)
├─────────────────────────────────────────────┤
│ 🔍 Buscar alimento...                       │  ← Search with recent/fav toggle
├─────────────────────────────────────────────┤
│ ★ Recentes                                  │
│ ┌─────────────────────────────────────────┐ │
│ │ 🥚 Ovo cozido        │ 50g │ 78kcal │ ✕ │ │  ← Inline item row
│ │ 🍞 Pão integral      │ 40g │ 96kcal │ ✕ │ │
│ │ 🧈 Manteiga          │ 10g │ 72kcal │ ✕ │ │
│ └─────────────────────────────────────────┘ │
│ [+ Adicionar alimento]                      │
├─────────────────────────────────────────────┤
│ Total: 246 kcal │ P: 12g │ C: 18g │ G: 14g  │  ← Running totals (sticky footer)
│ ┌─────────────────────────────────────────┐ │
│ │          Salvar Refeição                │ │  ← Primary action
│ └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

**Symptom Quick Log**
```
┌─────────────────────────────────────────────┐
│ Como você está se sentindo?                 │
├─────────────────────────────────────────────┤
│ Evacuação (Bristol)                         │
│ [1] [2] [3] [4] [5] [6] [7]                │  ← Visual type picker
│      ●                                      │  ← Selected indicator
├─────────────────────────────────────────────┤
│ Nível de Desconforto                        │
│ 😊 ─────────●───────────── 😰               │  ← 0-10 slider with emoji anchors
│           6                                 │
│ "Desconforto moderado"                      │  ← Contextual label
├─────────────────────────────────────────────┤
│ Sintomas (toque para selecionar)            │
│ [Gases ✓] [Inchaço ✓] [Dor] [Náusea]       │  ← Chip multi-select
│ [Refluxo] [Diarreia] [Constipação]          │
│ [+ Ver todos]                               │  ← Expand for full list
├─────────────────────────────────────────────┤
│ 🍽️ Gatilho suspeito: [Almoço - 2h atrás ▼] │  ← Smart default to recent meal
├─────────────────────────────────────────────┤
│ 📝 Observações (opcional)                   │
│ ┌─────────────────────────────────────────┐ │
│ │                                         │ │
│ └─────────────────────────────────────────┘ │
├─────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────┐ │
│ │          Salvar Registro                │ │
│ └─────────────────────────────────────────┘ │
│ ⚠️ Desconforto ≥8 aciona alerta SOS        │  ← Transparency about threshold
└─────────────────────────────────────────────┘
```

#### Lane B: Smart Search & Suggestions

**Food Search Behavior**
```
Search Input: "frango"

┌─────────────────────────────────────────────┐
│ 🔍 frango                              [✕]  │
├─────────────────────────────────────────────┤
│ ★ Seus favoritos                            │
│   Frango grelhado (peito)           120g ▸  │
├─────────────────────────────────────────────┤
│ 🕐 Recentes                                 │
│   Frango desfiado                    80g ▸  │
│   Frango assado (coxa)              100g ▸  │
├─────────────────────────────────────────────┤
│ 🔎 Resultados                               │
│   Frango grelhado (peito)                ▸  │
│   Frango frito (empanado)       ⚠️ Alto ▸  │  ← Histamine/protocol warning
│   Frango cozido                          ▸  │
│   Frango à milanesa            ⚠️ Alto ▸   │
├─────────────────────────────────────────────┤
│ Não encontrou? [Criar alimento custom]      │
└─────────────────────────────────────────────┘
```

**Search Requirements**
- Typo tolerance: "framgo" → "frango"
- Synonyms: "peito de frango" = "frango grelhado (peito)"
- Accent handling: "açucar" = "açúcar"
- Partial matching: "ban" → "banana", "batata"
- Protocol-aware badges: Show FODMAP/histamine warnings inline

#### Lane C: Fast Reuse Patterns

**Templates & Shortcuts**
```
┌─────────────────────────────────────────────┐
│ ⚡ Atalhos                                  │
├─────────────────────────────────────────────┤
│ 📋 Meus templates                           │
│   "Café da manhã padrão"    [Usar]          │
│   "Almoço low FODMAP"       [Usar]          │
│   [+ Salvar refeição atual como template]   │
├─────────────────────────────────────────────┤
│ 🔄 Repetir                                  │
│   [Repetir última refeição]                 │
│   [Copiar refeições de ontem]               │
├─────────────────────────────────────────────┤
│ 🕐 Frequentes neste horário                 │
│   Seg-Sex ~7h: Ovo + Pão + Café (85%)       │
│   [Adicionar automaticamente?]              │
└─────────────────────────────────────────────┘
```

### 5.3 Microcopy for Entry Flows

#### Meal Logging Copy

| Element | Copy (PT-BR) |
|---------|--------------|
| Screen title | "Registrar Refeição" |
| Subtitle | "O que você comeu?" |
| Search placeholder | "Buscar alimento (ex: arroz, frango...)" |
| Empty search | "Nenhum resultado para '[query]'. Tente outro termo ou crie um alimento personalizado." |
| Create custom CTA | "+ Criar alimento personalizado" |
| Histamine warning (fresh) | "🟢 Fresco" |
| Histamine warning (24h) | "🟡 Sobra (12-24h)" |
| Histamine warning (old) | "🔴 Sobra (24h+) — histamina elevada" |
| Portion label | "Porção (g)" |
| Portion helper | "Dica: 1 colher de sopa ≈ 15g" |
| Running total | "Total da refeição" |
| Save button | "Salvar Refeição" |
| Success toast | "Refeição salva ✓" |
| Undo action | "Desfazer" |
| Network error | "Não foi possível salvar. Suas alterações estão seguras. Tentando novamente..." |

#### Symptom Logging Copy

| Element | Copy (PT-BR) |
|---------|--------------|
| Screen title | "Registro de Sintomas" |
| Subtitle | "Como você está se sentindo agora?" |
| Bristol label | "Evacuação (Escala de Bristol)" |
| Bristol helper | "Toque no tipo que melhor descreve" |
| Discomfort label | "Nível de Desconforto Geral" |
| Discomfort anchors | "0 = Bem" ... "10 = Emergência" |
| Discomfort levels | 0-2: "Sem desconforto", 3-4: "Leve", 5-6: "Moderado", 7-8: "Intenso", 9-10: "Crise" |
| Symptoms label | "Sintomas (selecione todos que se aplicam)" |
| GI category | "Gastrointestinais" |
| Histamine category | "Relacionados à Histamina" |
| Meal link label | "Gatilho suspeito (opcional)" |
| Meal link placeholder | "Selecionar refeição" |
| Notes label | "Observações" |
| Notes placeholder | "Contexto adicional (estresse, sono, etc.)" |
| Save button | "Salvar Registro" |
| SOS warning | "⚠️ Desconforto ≥8 oferece opção de contato SOS" |
| SOS prompt | "Seu desconforto está alto. Deseja enviar um alerta para seu nutricionista?" |
| SOS confirm | "Enviar Alerta SOS" |
| SOS cancel | "Agora não" |
| Success toast | "Sintomas registrados ✓" |
| Correlation teaser | "Detectamos um padrão possível. Ver correlações →" |

### 5.4 UI Consistency Rules for Entry Flows

#### Input Controls

| Control | Specification |
|---------|---------------|
| Numeric input (grams) | Numeric keypad, right-aligned, "g" suffix label |
| Unit selector | Dropdown: g, ml, unidade, colher, xícara |
| Default units | Per-food-category defaults (líquidos → ml, sólidos → g) |
| Slider (discomfort) | Min 0, Max 10, step 1, thumb 32px, track 8px |
| Multi-select chips | Toggle selection, filled when active, checkmark icon |
| Bristol picker | Visual icons, 48px touch targets, single-select |

#### Validation Rules

| Field | Validation | Error/Warning |
|-------|------------|---------------|
| Portion (grams) | 1-5000g | Soft warning at >500g: "Porção grande — confirmar?" |
| Discomfort | 0-10 | SOS prompt at ≥8 |
| Symptom count | 0-20 | Soft warning at >10: "Muitos sintomas — todos corretos?" |
| Meal link | Optional | Auto-suggest most recent meal if symptoms logged within 3h |

#### States

| State | Visual Treatment |
|-------|------------------|
| Default | border-border, bg-card |
| Focus | ring-2 ring-primary, border-primary |
| Error | border-destructive, text-destructive helper |
| Disabled | opacity-50, cursor-not-allowed |
| Loading | Skeleton pulse, disabled interactions |
| Empty | Muted text, illustration, CTA |
| Success | Green checkmark, brief highlight |

#### Accessibility

| Requirement | Implementation |
|-------------|----------------|
| Focus order | Top-to-bottom, left-to-right logical flow |
| Labels | All inputs have associated <label> or aria-label |
| Error announce | aria-live="polite" for validation messages |
| Slider | aria-valuemin, aria-valuemax, aria-valuenow, aria-valuetext |
| Touch targets | Minimum 44px × 44px for all interactive elements |

### 5.5 Analytics Instrumentation

#### Events (12 for Entry Flows)

| Event Name | Trigger | Properties |
|------------|---------|------------|
| `meal_log_started` | Tap "Registrar Refeição" | `meal_type`, `source` (dashboard/nav/quick) |
| `food_search_performed` | Submit search query | `query`, `result_count`, `latency_ms` |
| `food_selected` | Tap food result | `food_id`, `search_query`, `result_position`, `is_favorite`, `is_recent` |
| `food_portion_edited` | Change portion value | `food_id`, `old_value`, `new_value`, `unit` |
| `food_removed` | Remove food from meal | `food_id`, `meal_item_count` |
| `meal_saved` | Tap "Salvar Refeição" | `item_count`, `total_kcal`, `histamine_flags[]`, `duration_sec` |
| `meal_save_undone` | Tap "Desfazer" | `meal_id`, `undo_latency_sec` |
| `symptom_log_started` | Open symptom form | `source` (nav/prompt/sos) |
| `symptom_bristol_selected` | Select Bristol type | `bristol_type` (1-7) |
| `symptom_discomfort_set` | Set discomfort level | `level` (0-10), `change_count` |
| `symptom_saved` | Tap "Salvar Registro" | `bristol_type`, `discomfort_level`, `symptom_count`, `has_meal_link`, `duration_sec` |
| `sos_triggered` | Confirm SOS alert | `discomfort_level`, `symptom_count` |

#### Funnels (4 Key Funnels)

| Funnel | Steps | Target Conversion |
|--------|-------|-------------------|
| Meal Log Completion | `meal_log_started` → `food_selected` → `meal_saved` | >85% |
| Search Success | `food_search_performed` → `food_selected` (within 3 results) | >70% |
| Symptom Log Completion | `symptom_log_started` → `symptom_saved` | >90% |
| SOS Escalation | `symptom_saved` (discomfort ≥8) → `sos_triggered` | Track (no target) |

#### Metrics (6 Key Metrics)

| Metric | Definition | Target |
|--------|------------|--------|
| Time-to-log (meal) | `meal_saved.timestamp` - `meal_log_started.timestamp` | <60s for single item, <120s for 3 items |
| Time-to-log (symptom) | `symptom_saved.timestamp` - `symptom_log_started.timestamp` | <45s |
| Search success rate | `food_selected` within top 3 / `food_search_performed` | >70% |
| Meal completion rate | `meal_saved` / `meal_log_started` | >85% |
| Symptom completion rate | `symptom_saved` / `symptom_log_started` | >90% |
| Undo rate | `meal_save_undone` / `meal_saved` | <5% (higher suggests errors) |

---

## 6) OUTPUT FORMAT (Fixed Structure)

Your response MUST follow this exact structure:

```
═══════════════════════════════════════════════════════════════
I) ASSUMPTIONS & NEED DATA
═══════════════════════════════════════════════════════════════

[List any assumptions made and any data/evidence that would improve analysis]

═══════════════════════════════════════════════════════════════
II) ROLE CRITIQUES (30 Roles)
═══════════════════════════════════════════════════════════════

### Role 1: Product Strategy
**Benchmark voices:** [5 labels]
**KEEP (8):**
1. ...
8. ...

**IMPROVE (12):**
1. [P0][M][Med][Clinical: No] **Issue:** ...
   **Change:** ...
   **Acceptance Criteria:**
   - [ ] ...
   - [ ] ...
...
12. ...

[Repeat for all 30 roles]

═══════════════════════════════════════════════════════════════
III) DELIVERABLES
═══════════════════════════════════════════════════════════════

### A) UX Findings
[Top 10 friction points with evidence]
[Before → After for top 5]

### B) UI Consistency Report
[Token audit, component inventory, state checklist, responsive rules]

### C) Microcopy System
[Tone rules, templates, glossary — all in PT-BR]

### D) Prioritized Backlog
[Top 20 improvements, roadmap: NOW/NEXT/LATER]

### E) Implementation Plan
[Files, tests, analytics, release plan]

═══════════════════════════════════════════════════════════════
IV) FOOD & SYMPTOM LOGGING DEEP DIVE
═══════════════════════════════════════════════════════════════

### 5.1 Current Flow Diagnosis
[Evidence-based friction analysis]

### 5.2 Proposed Optimized Flows
[Lane A/B/C with wireframe descriptions]

### 5.3 Microcopy Tables
[All copy in PT-BR]

### 5.4 UI Consistency Rules
[Controls, validation, states, a11y]

### 5.5 Analytics Instrumentation
[Events, funnels, metrics]

═══════════════════════════════════════════════════════════════
V) IMPLEMENT FIRST (Top 7 Actions)
═══════════════════════════════════════════════════════════════

| Priority | Action | Rationale | Owner | Acceptance Criteria |
|----------|--------|-----------|-------|---------------------|
| 1 | ... | ... | ... | ... |
| 2 | ... | ... | ... | ... |
| 3 | ... | ... | ... | ... |
| 4 | ... | ... | ... | ... |
| 5 | ... | ... | ... | ... |
| 6 | ... | ... | ... | ... |
| 7 | ... | ... | ... | ... |
```

---

## 7) EXECUTION INSTRUCTIONS

1. **Read the codebase** — Analyze all files in `/src/app/`, `/src/components/`, `/prisma/schema.prisma`, and configuration files
2. **Map current state** — Document exactly what exists before suggesting changes
3. **Apply all 9 lenses** — Systematically evaluate against each lens
4. **Consult all 30 roles** — Produce consolidated critiques with clinical nutrition domain expertise
5. **Produce all deliverables** — Complete sections A through E with concrete, implementable recommendations
6. **Deep dive on entry flows** — Food logging and symptom logging are the core daily interactions; optimize ruthlessly
7. **Prioritize clinically** — Any change affecting patient health decisions or nutritionist clinical workflow is higher priority
8. **Output in PT-BR** — All user-facing copy must be in Brazilian Portuguese

**START NOW.** Analyze the evidence, produce the structured output, and deliver actionable improvements for NutriPlan.
