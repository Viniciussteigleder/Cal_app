# Portal do Nutricionista — Professional Implementation Prompts

> Each prompt below is designed to be self-contained and produce production-grade output.
> Use them sequentially by block, or in parallel for independent blocks.
> All prompts assume the new navigation architecture is already in place.

---

## Block 1: Visão Geral (Dashboard Global)

### PROMPT 1.1 — Painel Principal

```
You are a senior full-stack engineer building the main dashboard ("Visão Geral") for a
clinical nutrition management platform (Next.js 16, React 19, Tailwind CSS, Prisma/PostgreSQL).

CONTEXT:
- Route: /studio/visao-geral
- This is the "Global Clinic" mode landing page
- The user is a nutritionist managing a clinic

REQUIREMENTS:
1. KPI Cards (top row):
   - Total active patients (with trend arrow vs last month)
   - Consultations this week (scheduled vs completed)
   - Pending items count (exams awaiting, unsigned docs, overdue follow-ups)
   - Revenue this month (if financeiro module is active)

2. Alerts & Pendencies Queue (main section):
   - Sortable/filterable table of pending items
   - Types: exam_awaiting, document_unsigned, followup_overdue, protocol_expiring
   - Each row: patient name (link), type badge, due date, quick action button
   - Empty state with illustration

3. AI Integration (section):
   - "Resumo do Dia" button → calls AI to summarize today's workload
   - "Detectar Padrões" button → identifies dropout risk, low adherence
   - AI outputs render inside AIDraftWrapper component (draft → apply pattern)
   - Show estimated cost label (~R$0.40) next to each AI action

4. Configurable Quick Access Cards (bottom):
   - 4-6 cards the user can customize (drag to reorder, toggle visibility)
   - Default cards: "Próxima Consulta", "Pacientes Recentes", "Materiais Favoritos"

UX STANDARDS:
- Skeleton loading states for all async data
- Responsive: 1-col mobile, 2-col tablet, 3-col desktop
- All text in PT-BR
- Accessible: proper headings hierarchy, aria-labels, keyboard navigation
- Use existing UI components from @/components/ui/*
- Follow the existing Tailwind color system (primary = emerald)

CODING STANDARDS:
- Server component for data fetching, client components only where interactivity needed
- Type all props and API responses with TypeScript interfaces
- Use Prisma for database queries with tenant isolation (WHERE tenant_id = ...)
- Error boundaries for each independent section
- No hardcoded strings — use @/i18n/pt-BR translations

Output the complete implementation: page.tsx, any sub-components, API route if needed,
and Prisma query helpers.
```

### PROMPT 1.2 — Alertas & Pendências

```
You are implementing the Alerts & Pendencies sub-page (/studio/visao-geral/alertas) for
a clinical nutrition platform.

CONTEXT:
- This page shows ALL pending items across the clinic
- Nutritionist needs to quickly triage and act on items
- Items come from: exams (pending review), documents (unsigned), follow-ups (overdue),
  protocols (phase transition needed), prescriptions (expiring)

REQUIREMENTS:
1. Filterable list with tabs: Todos | Exames | Documentos | Retornos | Protocolos | Prescrições
2. Each item shows:
   - Patient avatar + name (clickable → opens patient workspace)
   - Item type badge (color-coded)
   - Description (e.g., "Hemograma aguardando análise")
   - Due date with urgency indicator (overdue = red, due today = amber, upcoming = green)
   - Quick action button appropriate to type (e.g., "Analisar" for exams, "Assinar" for docs)
3. Bulk actions: mark as reviewed, snooze, assign to team member
4. Sort by: urgency (default), patient name, date, type
5. Pagination with infinite scroll

AI INTEGRATION:
- "Priorizar Fila (IA)" button → AI reorders by clinical urgency
- Output as AIDraftWrapper

TECHNICAL:
- Server component with search params for filters
- API route: GET /api/studio/alerts?type=&status=&page=
- Prisma query joining DailyLogEntry, AuditEvent, PatientProtocolInstance tables
- Real-time badge count in sidebar (via polling or SSE)
```

---

## Block 2: Agenda

### PROMPT 2.1 — Calendário

```
You are building the Calendar view (/studio/agenda/calendario) for a clinical nutrition
platform using Next.js 16 + React 19 + Tailwind CSS.

REQUIREMENTS:
1. Calendar component:
   - Month, week, and day views (toggle)
   - Events color-coded: consultation (emerald), task (blue), follow-up (amber), personal (gray)
   - Click event → popover with: patient name, time, type, quick actions
   - Click empty slot → create event modal
   - Drag-and-drop to reschedule (optional, Phase 2)

2. Event creation modal:
   - Type: Consulta | Retorno | Tarefa | Pessoal
   - Patient selector (searchable dropdown) — only for Consulta/Retorno
   - Date/time picker, duration, notes, recurrence
   - "Link de Video" field (Zoom/Meet integration placeholder)

3. Sidebar mini-calendar + upcoming events list

AI INTEGRATION:
- "Preparar Consulta (IA)" button on consultation events → generates pre-consultation
  summary with patient history, pending items, suggested questions
- "Mensagem Sugerida" → generates confirmation/reminder message (does NOT send)

TECHNICAL:
- Use a lightweight calendar library or build custom with CSS Grid
- API: GET /api/studio/agenda?start=&end= (returns events in range)
- POST /api/studio/agenda (create event)
- PATCH /api/studio/agenda/:id (update event)
- Events model in Prisma with patient_id (nullable), tenant_id
```

### PROMPT 2.2 — Tarefas

```
You are implementing the Tasks view (/studio/agenda/tarefas) for a nutrition clinic platform.

REQUIREMENTS:
1. Kanban-style board with columns: A Fazer | Em Andamento | Concluído
2. Task card: title, assignee, due date, priority badge, patient link (optional)
3. Create task: title, description, assignee, due date, priority (Low/Medium/High/Urgent),
   linked patient (optional)
4. Filter by: assignee, priority, patient, date range
5. Global tasks (no patient) and patient-specific tasks in same view
6. Drag between columns to update status

TECHNICAL:
- Use PlannerTask model from Prisma schema
- API: CRUD at /api/studio/tasks
- Client component with optimistic updates
- Responsive: kanban on desktop, list on mobile
```

---

## Block 3: Pacientes

### PROMPT 3.1 — Lista de Pacientes

```
You are building the Patient List page (/studio/pacientes) — the main patient management
hub for a nutritionist.

REQUIREMENTS:
1. Search bar with real-time filtering (name, email, phone)
2. Table view (desktop) + Card view (mobile):
   - Photo/avatar, name, status badge, last consultation date, active plan, tags
   - Quick actions: Open Workspace, Send Message, Schedule Consultation
3. Filters sidebar: status (active/inactive/pending), tags, date range
4. "Novo Paciente" CTA button (top right)
5. Clicking a patient row → navigates to /studio/pacientes/[id]/resumo (Patient Workspace)

AI INTEGRATION:
- "Tags Automáticas (IA)" button → analyzes patient history and suggests tags
- "Risco de Abandono (IA)" → highlights patients with dropout risk indicators
- Both render as AIDraftWrapper

PATIENT CARD (in table row):
- Avatar with initials fallback
- Name (bold), email (muted)
- Status: Ativo (green), Inativo (gray), Pendente (amber)
- Tags: clickable badges
- Last consultation: relative date (e.g., "há 3 dias")

TECHNICAL:
- Server component with search params
- API: GET /api/studio/patients?q=&status=&tags=&page=
- Prisma: Patient with PatientProfile, PatientCondition joins
- Pagination: cursor-based for performance
- 50ms debounce on search input
```

### PROMPT 3.2 — Segmentos & Tags

```
You are building the Segments & Tags management page (/studio/pacientes/segmentos).

REQUIREMENTS:
1. Tag management:
   - Create, rename, delete, color-code tags
   - Categories: Objetivo, Restrição, Fase, Status Clínico, Custom
   - Preview: show count of patients per tag

2. Smart segments:
   - Create segments with rules (AND/OR conditions)
   - Conditions: tag = X, last_consultation > 30d, plan_status = active, etc.
   - Name segment, save, view matching patients
   - "Aplicar Tag em Lote" — apply tag to all patients in segment

3. AI integration:
   - "Sugerir Segmentos (IA)" → analyzes patient data and proposes meaningful groupings

TECHNICAL:
- Tags stored in Patient model (JSON array or separate Tag table)
- Segments as saved queries (stored in a Segment table with rules JSON)
- API: CRUD for tags and segments
```

---

## Block 4: Materiais

### PROMPT 4.1 — Materiais Hub

```
You are building the Materials hub page (/studio/materiais) — the nutritionist's reusable
asset library.

CONTEXT: "Materiais" replaces "Conteúdo/Biblioteca" — using natural nutrition professional
language. This is where the nutritionist creates and organizes reusable assets.

REQUIREMENTS:
1. Grid/list view of all materials grouped by type:
   - Planos (Modelos), Receitas, Protocolos, Formulários, Lâminas Educativas, Modelos de Documentos
2. Each material card:
   - Title, type badge, tags (objetivo, restrição), last modified, usage count
   - Quick actions: Edit, Duplicate, Apply to Patient, Delete
3. Search + filter by type, tags, date
4. "Criar Novo" dropdown with type selection
5. CRITICAL UX: Every material has dual action buttons:
   - "Salvar nos Materiais" (saves as template)
   - "Aplicar a um Paciente..." (opens patient selector, then creates instance)

AI INTEGRATION:
- "Gerar Receita (IA)" — with restrictions + portions + substitutions
- "Gerar Plano-Modelo (IA)" — weekly variations
- "Reescrever Material (IA)" — simplify language for patients
- "Criar Protocolo (IA)" — structure + steps + contraindications
- All AI outputs render as AIDraftWrapper

GLOBAL ↔ PATIENT RULE:
- Materials in Global mode are TEMPLATES
- When applied to a patient, they become INSTANCES with version history
- The UI must always show "de onde vem" (source template) and "onde vai" (target patient)

TECHNICAL:
- Unified materials table or polymorphic model
- Tags as JSON or separate table with type discriminator
- API: GET /api/studio/materiais?type=&q=&tags=
- POST /api/studio/materiais (create)
- POST /api/studio/materiais/:id/apply (create patient instance)
```

### PROMPT 4.2 — Receitas

```
You are building the Recipes page (/studio/materiais/receitas) for a clinical nutrition platform.

REQUIREMENTS:
1. Recipe list with search, filters (tags, restrictions, meal type)
2. Recipe card: photo, title, calories/macros summary, tags, prep time
3. Recipe detail view:
   - Ingredients list with quantities and nutritional breakdown
   - Step-by-step instructions
   - Substitution suggestions (for allergens/intolerances)
   - Nutritional facts panel
   - Tags: FODMAP-safe, lactose-free, gluten-free, low-histamine, etc.
4. Create/edit recipe form:
   - Title, description, servings, prep time, cook time
   - Ingredients (searchable from FoodCanonical table) with quantities
   - Auto-calculate nutritional totals
   - Instructions (rich text)
   - Tags and restrictions
   - Photo upload

AI INTEGRATION:
- "Gerar Receita (IA)" button → input: restrictions, meal type, calorie target, preferences
  → output: complete recipe with ingredients, instructions, macros as AIDraftWrapper
- "Gerar Substituições (IA)" → suggest ingredient swaps maintaining nutritional profile
- Cost label: ~R$0.30 per generation

TECHNICAL:
- Recipe model with RecipeIngredient join to FoodCanonical
- Nutritional calculation in @/lib/calculations/
- Image upload to /api/upload
- API: CRUD at /api/studio/materiais/receitas
```

---

## Block 5: Patient Workspace — Resumo

### PROMPT 5.1 — Resumo do Paciente

```
You are building the Patient Summary page (/studio/pacientes/[patientId]/resumo) — the
landing page of the Patient Workspace.

CONTEXT: When a nutritionist selects a patient, this is the first thing they see.
It must provide instant clinical context.

REQUIREMENTS:
1. Patient Profile Card:
   - Photo/avatar, name, age, contact
   - Active conditions badges
   - Goals (weight target, etc.)
   - Status: Active/Inactive

2. Quick Stats Row:
   - Current weight + trend (vs last measurement)
   - BMI + classification
   - Active plan name + adherence %
   - Days since last consultation
   - Streak (gamification)

3. Pending Items:
   - Exams awaiting review
   - Unsigned documents
   - Overdue measurements
   - Protocol phase transitions needed

4. Timeline (recent activity):
   - Last 10 entries: consultations, exams, plan changes, measurements, notes
   - Each entry: icon, date, type badge, summary, link to detail

5. Active Goals & Progress:
   - Goal cards with progress bars
   - "Adicionar Meta" button

AI INTEGRATION:
- "Resumo Clínico (IA)" → comprehensive narrative summary with sources
- "Checklist de Revisão (IA)" → what's missing, what changed since last visit
- Both render as AIDraftWrapper with "Ver fontes usadas" link

TECHNICAL:
- Mix of server and client components
- Parallel data fetching: patient profile, recent logs, active plans, pending items
- API: GET /api/studio/patients/:id/summary (aggregated endpoint)
```

---

## Block 6: Patient Workspace — Prontuário

### PROMPT 6.1 — Prontuário Principal

```
You are building the Clinical Record (Prontuário) page for a patient in a nutrition platform.
Route: /studio/pacientes/[patientId]/prontuario

REQUIREMENTS:
1. Tabs: Consultas | Evolução | Histórico | Anexos | Transcrições
2. Consultas tab:
   - List of consultations with date, duration, type, notes preview
   - Click to expand full notes (ADIME/SOAP format)
   - "Nova Consulta" links to the Consultation Wizard

3. Evolução tab:
   - Clinical evolution entries in reverse chronological order
   - Each entry: date, author, ADIME sections, attachments
   - Inline editing with version history

4. Histórico tab:
   - Full timeline combining all record types
   - Filter by type, date range

5. Anexos tab:
   - File upload (PDF, images, documents)
   - Preview thumbnails, download, delete

6. Transcrições tab:
   - Audio/video transcriptions linked to consultations
   - Transcript viewer with timestamps

AI INTEGRATION:
- "Resumir Prontuário (IA)" → generates narrative summary of entire record
- "Gerar Evolução (Rascunho) (IA)" → ADIME/SOAP draft from latest data
- "Transcrever Consulta (IA)" → if audio file attached
- "Sugerir Perguntas (IA)" → pre-consultation question suggestions
- All as AIDraftWrapper with cost labels

TECHNICAL:
- Server component with tab state in search params
- DailyLogEntry model filtered by type
- File uploads to /api/upload with patient_id association
- Rich text editor for evolução entries
```

---

## Block 7: Patient Workspace — Exames

### PROMPT 7.1 — Exames Laboratoriais

```
You are building the Lab Exams module (/studio/pacientes/[patientId]/exames) for a
clinical nutrition platform.

REQUIREMENTS:
1. Upload flow:
   - Drag-and-drop zone for PDF/photo
   - Manual entry form as fallback
   - Upload history with status badges (processing, ready, error)

2. Results view:
   - Grouped by exam date
   - Each marker: name, value, unit, reference range, status (normal/high/low)
   - Color coding: green (normal), amber (borderline), red (out of range)
   - Notes field per marker

3. Evolution charts:
   - Select markers to chart over time (multi-select)
   - Line charts with reference range bands
   - Date range selector
   - Export as image

4. AI exam suggestions:
   - Based on patient conditions, history, and existing results
   - "Recomendar Exames (IA)" → list with justifications

AI INTEGRATION:
- "Extrair Dados do PDF (IA)" → OCR + structured extraction from lab PDF
- "Interpretar e Destacar Alterações (IA)" → clinical interpretation with highlights
- "Gerar Gráficos Evolutivos (IA)" → auto-select relevant markers
- "Recomendar Exames Adicionais (IA)" → with justification → always "rascunho"
- Cost labels on each action

TECHNICAL:
- Exam results stored in structured JSON (marker_name, value, unit, reference_min, reference_max)
- Charts using Recharts library
- PDF processing via /api/ai/exam-analyzer
- File upload to /api/upload
```

---

## Block 8: Patient Workspace — Plano Alimentar

### PROMPT 8.1 — Plano Alimentar

```
You are building the Meal Plan module (/studio/pacientes/[patientId]/plano-alimentar) for
a clinical nutrition platform.

REQUIREMENTS:
1. Current Plan view:
   - Daily view with meal slots (Café, Lanche AM, Almoço, Lanche PM, Jantar, Ceia)
   - Each meal: food items with portions and macros
   - Daily totals: kcal, protein, carbs, fat, fiber
   - Weekly view toggle (Mon-Sun)

2. Plan Builder:
   - Drag-and-drop foods from search panel
   - Search foods from FoodCanonical database
   - Portion adjustment with instant macro recalculation
   - Copy day → paste to other days
   - Apply template from Materiais

3. Versioning:
   - Version history with diff view
   - "Publicar" freezes current version
   - "Rascunho" flag for in-progress edits

4. Shopping List:
   - Auto-generated from current plan
   - Grouped by food category
   - Quantities aggregated for the week
   - Print/export/send to patient

5. Publish to Easy Patient:
   - Preview what patient will see
   - Confirm and publish

AI INTEGRATION:
- "Gerar Plano (IA)" → input: energy target, macros, restrictions, preferences
  → output: complete weekly plan as AIDraftWrapper
- "Gerar Variações (IA)" → alternative meals maintaining nutritional profile
- "Substituições Inteligentes (IA)" → swap foods respecting restrictions
- "Ajuste por Aderência (IA)" → if patient feedback exists, adjust plan

TECHNICAL:
- Plan model with PlanDay, PlanMeal, PlanItem relations
- FoodCanonical for nutrition data
- Real-time macro calculation in client
- Versioning with Plan.version field and snapshot storage
```

---

## Block 9: Patient Workspace — Prescrição

### PROMPT 9.1 — Prescrição

```
You are building the Prescription module (/studio/pacientes/[patientId]/prescricao) for
a clinical nutrition platform.

REQUIREMENTS:
1. Items list:
   - Supplements/items with: name, dosage, frequency, duration, notes
   - Add from catalog or free-text
   - Reorder via drag-and-drop

2. Dosage calculator:
   - Input: patient weight, condition
   - Suggest dosage range based on clinical guidelines
   - Override with custom dosage

3. Alerts panel:
   - Interaction warnings between supplements
   - Contraindication alerts based on patient conditions
   - Visual indicators: red (contraindicated), amber (caution), green (safe)

4. Document generation:
   - Generate prescription PDF with letterhead
   - Include: patient data, items, dosages, instructions, date, signature area
   - Digital signature integration

5. Sign & Send:
   - Digital signature flow
   - Send via email or link
   - Patient confirmation modal (Guardrail 1) before signing

AI INTEGRATION:
- "Sugerir Prescrição (Rascunho) (IA)" → based on patient data, conditions, exams
  → output with justification for each item → AIDraftWrapper
- "Analisador de Dosagens (IA)" → validate dosages against guidelines
- "Checagem de Conflitos (IA)" → check for interactions/contraindications
- "Gerar Documento Pronto (IA)" → format prescription as professional document

CRITICAL UX:
- PatientConfirmationModal REQUIRED before: saving final prescription, signing, sending
- PatientBanner visible on this page
- ContextBar in "locked" mode during sign & send flow

TECHNICAL:
- Prescription model with PrescriptionItem relations
- PDF generation via /api/pdf/generate with LetterheadWrapper
- Digital signature integration placeholder
- Audit logging for all prescription actions
```

---

## Block 10: Consultation Wizard

### PROMPT 10.1 — Wizard Completo

```
You are enhancing the Consultation Wizard (/studio/pacientes/[patientId]/consulta/iniciar)
— a guided 4-step flow for conducting a clinical nutrition consultation.

CONTEXT: The wizard already has a basic structure with 4 steps (PreConsulta, Durante,
Plano & Prescrição, Fechamento). Now implement the full interactive version.

REQUIREMENTS PER STEP:

Step 1 — Pré-consulta:
- Auto-load patient summary from /resumo data
- Show pending items (exams, measurements, documents)
- Show last consultation key points
- AI: "Gerar Pré-resumo", "Sugerir Perguntas", "Sinalizar Riscos"
- "Ir para aba" buttons linking to relevant workspace tabs

Step 2 — Durante:
- Structured note fields (ADIME/SOAP) with auto-save (debounced)
- Voice recording button → audio file attached to consultation
- Timer showing consultation duration
- AI: "Transcrever" (from audio), "Organizar Notas", "Gerar Evolução (Rascunho)"
- Quick-access to Prontuário tab

Step 3 — Plano & Prescrição:
- Side-by-side: previous plan vs new plan
- Quick-add foods from search
- Prescription items panel
- AI: "Gerar Plano (Rascunho)", "Variações", "Sugerir Prescrição", "Checagem de Conflitos"

Step 4 — Fechamento:
- Interactive checklist (document generated, signed, sent, follow-up scheduled)
- One-click actions: Generate PDF, Sign & Send, Schedule Follow-up
- AI: "Gerar Orientações", "Resumo Final", "Mensagem Sugerida (WhatsApp)"
- "Encerrar Consulta" button → saves all data, updates timeline

WIZARD UX:
- Progress bar at top showing completed/in-progress/pending steps
- Steps are SKIPPABLE (user can jump to any step)
- Each step shows "Ir para aba" buttons to open the relevant workspace tab
- State persists if user navigates away and returns
- Auto-save every 30 seconds during active step

TECHNICAL:
- Client component with local state (useReducer)
- Persist wizard state to localStorage keyed by consultation ID
- Create Consultation record on wizard start
- Update via PATCH /api/studio/consultations/:id on each step completion
- ConsultationWizard component already exists — enhance it
```

---

## Block 11: Guardrails & Safety

### PROMPT 11.1 — Guardrails System

```
You are implementing the complete guardrails safety system for a clinical nutrition platform.

GUARDRAIL 1 — Patient Confirmation Modal:
- Component: PatientConfirmationModal (already created)
- TRIGGER on: apply content to prontuário, sign document, send WhatsApp/document,
  publish plan to Easy Patient, save final prescription
- Shows: patient mini-card (name, photo, age, last consultation)
- Text: "Esta ação será registrada no prontuário de [Patient Name]"
- Buttons: Confirmar | Trocar Paciente | Cancelar
- MUST be integrated at every critical action point across the workspace

GUARDRAIL 2 — AI Draft Wrapper:
- Component: AIDraftWrapper (already created)
- ALL AI outputs MUST be wrapped in this component
- Shows: "Rascunho gerado por IA" label, draft badge, cost estimate
- Buttons: Aplicar | Editar
- Link: "Ver fontes usadas" → expandable section showing which data was used
- AI output NEVER auto-applies — always requires explicit user action

GUARDRAIL 3 — Safe Patient Switch:
- Component: SafeSwitchModal (already created)
- TRIGGER when user attempts to switch patient while having:
  - Unsaved draft in any form
  - Pending signature/send flow
  - Edited fields not saved
- Options: Salvar Rascunho | Descartar | Cancelar
- IMPLEMENT: useUnsavedChanges() hook that tracks form dirty state

GUARDRAIL 4 — Locked Mode:
- During signature/send flows, ContextBar enters "locked" state
- Patient switch buttons are disabled
- Visual indicator: amber background, lock icon
- Exit locked mode only by completing or canceling the flow
- IMPLEMENT: useLockedMode() hook with context provider

INTEGRATION REQUIREMENTS:
- Create useGuardrails() hook that combines all guardrail checks
- Wrap all critical action handlers with guardrail checks
- Add guardrail state to PatientContext
- Audit log entry for every guardrail-triggered action

TECHNICAL:
- Hooks in @/hooks/useGuardrails.ts
- State in PatientContext (add: isDirty, isLocked, pendingAction fields)
- Integration points documented as constants in @/lib/guardrails.ts
```

---

## Block 12: AI Integration Pattern

### PROMPT 12.1 — AI Action System

```
You are designing and implementing the AI action system for a clinical nutrition platform.

PRINCIPLES (from spec):
1. AI as VERBS (actions), not chatbot
2. 1-click action → draft → apply pattern
3. Optional refinement panel for adjustments
4. Cost and audit visible
5. Max 2-4 AI actions per screen

ARCHITECTURE:

1. AIActionButton component:
   - Props: label (verb), icon, onExecute, estimatedCost, estimatedTime
   - Styling: violet border, sparkle icon indicator
   - Loading state with progress
   - Disabled state when no patient context (for patient-specific actions)

2. AIActionPanel component (optional refinement):
   - Slides in from right when user wants to customize
   - Fields: restrictions (checkboxes), preferences (text), parameters (selectors)
   - "Gerar" button to execute with custom params
   - History of recent generations

3. AIDraftWrapper (already created — enhance):
   - Status: generating | draft | applied | rejected
   - Source attribution: "Baseado em: Exames (15/Jan), Medidas (10/Jan), Prontuário"
   - Edit inline or open in full editor
   - Apply → triggers PatientConfirmationModal if critical
   - Version: keep last 3 drafts accessible

4. AI Cost & Audit:
   - Each action shows: "~R$0.40 · ~12s"
   - On execution: log to AuditEvent table
   - Fields: action_type, patient_id, user_id, model_used, tokens_in, tokens_out, cost, duration
   - Dashboard in /studio/configuracoes/ia-governanca

5. AI Service Layer:
   - @/lib/ai/actions.ts — registry of all AI actions with metadata
   - Each action: id, label, endpoint, requiredContext, estimatedCost
   - @/lib/ai/execute.ts — unified execution with logging
   - @/lib/ai/prompts/ — prompt templates per action

IMPLEMENTATION MAP (which AI actions go where):

| Page | AI Actions (max 4) |
|------|-------------------|
| Visão Geral | Resumo do Dia, Detectar Padrões |
| Agenda | Preparar Consulta, Mensagem Sugerida |
| Pacientes | Tags Automáticas, Risco de Abandono |
| Materiais | Gerar Receita, Gerar Plano-Modelo, Reescrever, Criar Protocolo |
| Resumo Paciente | Resumo Clínico, Checklist de Revisão |
| Prontuário | Resumir Prontuário, Gerar Evolução, Transcrever, Sugerir Perguntas |
| Exames | Extrair PDF, Interpretar, Gráficos Evolutivos, Recomendar Exames |
| Antropometria | Extrair Bioimpedância, Inconsistências, Tendências |
| Cálculo | Sugerir Fatores, Gerar Cenários, Validar Coerência |
| Plano Alimentar | Gerar Plano, Variações, Substituições, Ajuste por Aderência |
| Prescrição | Sugerir Prescrição, Dosagens, Conflitos, Gerar Documento |
| Documentos | Gerar Orientações, Reescrever Linguagem, Pré-preencher |
| Wizard Pre | Pré-resumo, Perguntas, Riscos |
| Wizard Durante | Transcrever, Organizar Notas, Gerar Evolução |
| Wizard Plano | Gerar Plano, Variações, Prescrição, Conflitos |
| Wizard Fechamento | Orientações, Resumo Final, Mensagem Sugerida |

TECHNICAL:
- All AI calls go through /api/ai/execute with action_id
- Rate limiting: configurable per action, per user
- Fallback: if AI fails, show error + retry button (never silent failure)
- Model selection: configurable in /studio/configuracoes/ia-governanca
```

---

## Block 13: Relatórios

### PROMPT 13.1 — Relatórios da Clínica

```
You are building the Clinic Reports module (/studio/relatorios) for a clinical nutrition platform.

REQUIREMENTS:
1. Dashboard-style reports page with:
   - Patient count trends (line chart, 12 months)
   - Consultation frequency (bar chart, weekly)
   - Revenue trends (if financeiro active)
   - Protocol completion rates (pie chart)
   - Top conditions treated (horizontal bar)

2. Report builder:
   - Select metrics, date range, patient segments
   - Preview report
   - Export as PDF, CSV, or Excel

3. Audit & Quality:
   - Compliance metrics: signed documents %, complete records %
   - AI usage statistics: actions per type, cost breakdown
   - Data completeness scores per patient

AI INTEGRATION:
- "Narrativa do Relatório (IA)" → generate human-readable summary of trends
- "Anomalias (IA)" → detect outliers and inconsistencies
- "Sugestões de Melhoria (IA)" → actionable recommendations

TECHNICAL:
- Aggregation queries via Prisma (groupBy, count, avg)
- Charts with Recharts
- PDF export with html2pdf.js
- Cache expensive queries (revalidate every 15 min)
```

---

## Block 14: Financeiro

### PROMPT 14.1 — Financeiro

```
You are building the Financial module (/studio/financeiro) for a clinical nutrition platform.

REQUIREMENTS:
1. Faturamento:
   - Invoice list with status (paid, pending, overdue)
   - Create invoice linked to consultation or package
   - PDF invoice generation with clinic letterhead

2. Pagamentos:
   - Payment tracking: date, amount, method, status
   - Reconciliation with invoices
   - Receipt generation

3. Planos & Assinaturas:
   - Define service packages (e.g., "Plano Trimestral", "Consulta Avulsa")
   - Assign packages to patients
   - Track usage vs allocation

4. Custos (incl. IA):
   - AI cost breakdown by action type and month
   - Operational costs tracking
   - Margin analysis per patient/package

AI INTEGRATION (optional):
- Simple revenue forecasting
- Inadimplência alerts

TECHNICAL:
- New Prisma models: Invoice, Payment, ServicePackage
- API: CRUD endpoints under /api/studio/financeiro/
- Number formatting: BRL currency (R$ X.XXX,XX)
```

---

## Block 15: Configurações

### PROMPT 15.1 — Configurações & IA Governança

```
You are building the Settings module (/studio/configuracoes) with special focus on
AI Governance (/studio/configuracoes/ia-governanca).

REQUIREMENTS:

Perfil & Preferências:
- Name, email, phone, photo upload
- Display preferences: language, date format, simple mode toggle
- Notification preferences

Equipe & Permissões:
- Team member list with roles
- Invite member flow
- Permission matrix: read/write/admin per module
- Activity log per member

Integrações:
- Connection status cards for: Zoom, Google Calendar, WhatsApp Business
- API key management
- Webhook configuration

Assinatura Digital:
- Certificate upload
- Signature preview
- Auto-sign settings

Políticas & Logs:
- Data retention policies
- Audit log viewer (filterable)
- Export compliance reports

IA (Governança):
- AI model selection (GPT-4, Claude, etc.) per action type
- Usage limits: per day, per user, per action
- Cost budget with alerts
- Prompt template editor (advanced users)
- AI audit log: every action with model, tokens, cost, duration, user
- Enable/disable specific AI actions
- Data sharing settings: what patient data can AI access

TECHNICAL:
- Settings stored in Tenant model (JSON preferences) or separate Settings table
- API: PATCH /api/studio/settings/:section
- AI governance: dedicated table for AI action configs
- Audit log: use existing AuditEvent model
```

---

## Implementation Priority Order

1. **Block 5** (Resumo) — Patient Workspace landing page
2. **Block 6** (Prontuário) — Core clinical record
3. **Block 7** (Exames) — Lab exams with AI
4. **Block 8** (Plano Alimentar) — Meal plans
5. **Block 10** (Wizard) — Consultation flow
6. **Block 1** (Visão Geral) — Dashboard
7. **Block 4** (Materiais) — Reusable assets
8. **Block 9** (Prescrição) — Prescriptions
9. **Block 11** (Guardrails) — Safety system
10. **Block 12** (AI System) — AI integration layer
11. **Block 2** (Agenda) — Calendar & tasks
12. **Block 3** (Pacientes) — Patient list enhancements
13. **Block 13** (Relatórios) — Reports
14. **Block 14** (Financeiro) — Financial
15. **Block 15** (Configurações) — Settings
