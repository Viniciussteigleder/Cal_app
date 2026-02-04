# 🏥 NutriPlan Clinical Platform - Implementation Guide V2 (IMPROVED)

## 📄 EXECUTIVE SUMMARY

### **Problem Statement**
Nutritionists in Brazil and Germany lack a comprehensive digital platform to manage patient care, clinical records, lab results, and meal planning. Current solutions are fragmented, lack AI capabilities, and don't support multilingual nutritional databases.

### **Solution**
A **multi-tenant SaaS platform** combining traditional nutrition practice management with AI-powered tools for exam analysis, meal planning, and clinical documentation. Built on Next.js 16, PostgreSQL, and GPT-4.

### **Top 5 Features (MVP)**
1. **Prontuário Digital** - Searchable medical records with AI transcription
2. **Exam Analyzer** - OCR + AI extraction of lab results (PT/DE/EN)
3. **Meal Planner** - Multi-source food databases (TACO, TBCA, BLS)
4. **Patient Context** - Persistent patient selection across all modules
5. **Prescription Generator** - AI-assisted prescriptions on letterhead

### **Success Metrics**
- **User Adoption**: 50+ nutritionists, 500+ patients (3 months)
- **AI Accuracy**: 75%+ OCR accuracy (with human validation)
- **Engagement**: 80% daily active nutritionists
- **Performance**: \< 2s page load, \< 10s AI response

### **Timeline**
- **Phase 1 (MVP)**: 4 weeks - Prontuário + Exames
- **Phase 2**: 4 weeks - Antropometria + Cálculo Energético
- **Phase 3**: 4 weeks - Plano Alimentar + Prescrição
- **Total**: 12 weeks to full launch

---

## 🎯 MVP SCOPE (PHASE 1 - 4 WEEKS)

### **P0 Features (Critical)**
- ✅ Prontuário (Medical Record) with timeline view
- ✅ Exames (Lab Results) with AI extraction + validation
- ✅ Patient context persistence
- ✅ Sidebar navigation (Studio view)
- ✅ Basic authentication (Supabase)

### **Out of Scope (Phase 2+)**
- ❌ Meal Planner (complex multi-source integration)
- ❌ Prescription Generator (requires product catalog)
- ❌ Advanced AI agents (Protocol Generator, Recipe Creator)
- ❌ Full German localization (PT-BR only for MVP)

---

## 🏗️ SYSTEM ARCHITECTURE

### **High-Level Diagram**

```
┌─────────────────────────────────────────────────────────────┐
│                     VERCEL EDGE NETWORK                     │
│                  (CDN + Serverless Functions)               │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    NEXT.JS 16 APP ROUTER                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Patient    │  │    Studio    │  │    Owner     │      │
│  │   Portal     │  │  (Nutritionist)│  │   Portal     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────┴─────────┐
                    ▼                   ▼
        ┌───────────────────┐   ┌──────────────────┐
        │  SUPABASE AUTH    │   │  OPENAI API      │
        │  (JWT Tokens)     │   │  (GPT-4 Vision)  │
        └───────────────────┘   └──────────────────┘
                    │
                    ▼
        ┌───────────────────────────────────┐
        │   POSTGRESQL (SUPABASE)           │
        │   ┌─────────────────────────┐     │
        │   │  Multi-Tenant Tables    │     │
        │   │  - Tenant (RLS)         │     │
        │   │  - Patient              │     │
        │   │  - ExamResults          │     │
        │   │  - PatientLogEntries    │     │
        │   └─────────────────────────┘     │
        └───────────────────────────────────┘
                    │
                    ▼
        ┌───────────────────────────────────┐
        │   SUPABASE STORAGE                │
        │   - Exam PDFs                     │
        │   - Patient Photos                │
        │   - Prescription PDFs             │
        └───────────────────────────────────┘
```

### **Data Flow: Exam Upload → AI Extraction → Validation**

```
[Nutritionist] → Upload PDF
       │
       ▼
[Supabase Storage] → Store file, return URL
       │
       ▼
[Next.js Server Action] → Call OpenAI GPT-4 Vision
       │
       ▼
[OpenAI API] → Extract biomarkers (JSON)
       │
       ▼
[Validation Screen] → Nutritionist reviews
       │
       ├─ Approve → [Database] → Save as validated
       │
       └─ Reject → [Manual Entry] → Save as manual
```

---

## 👥 EXPERT PANEL (ROLES & RESPONSIBILITIES)

### **Dr. Sofia Mendes - Lead System Architect**
- **Expertise**: Healthcare SaaS, LGPD compliance, PostgreSQL
- **Deliverables**:
  - Database schema (normalized, indexed)
  - API endpoint specifications (OpenAPI)
  - Multi-tenant RLS policies
  - Security audit checklist

### **Dr. Ana Paula Costa - AI/ML Specialist**
- **Expertise**: GPT-4 integration, prompt engineering
- **Deliverables**:
  - AI agent configurations (prompts, models, costs)
  - OCR extraction pipeline (GPT-4 Vision)
  - Validation UI for AI outputs
  - Cost monitoring dashboard

### **Marina Oliveira - Clinical Data Architect**
- **Expertise**: Nutritional databases, healthcare data modeling
- **Deliverables**:
  - Food table integration strategy (TACO → TBCA → BLS)
  - Exam canonical list (biomarkers + synonyms)
  - Data migration scripts
  - Temporal data models (exam trends, weight tracking)

### **Lucas Ferreira - UX/UI Director**
- **Expertise**: Healthcare UX, WCAG 2.1 AA, mobile-first
- **Deliverables**:
  - User journey maps (5 key workflows)
  - Wireframes (low-fidelity, Figma)
  - Design system (Tailwind + Radix UI)
  - Accessibility audit

### **Roberto Silva - Localization Expert**
- **Expertise**: Brazilian Portuguese, healthcare terminology
- **Deliverables**:
  - PT-BR translation file (complete)
  - Cultural adaptation guide (meal times, food names)
  - German translation (Phase 3)

### **Gabriel Santos - Frontend Engineer**
- **Expertise**: Next.js 16, React 19, TypeScript
- **Deliverables**:
  - Component library (reusable, typed)
  - State management (React Context + Server Actions)
  - Performance optimization (Lighthouse 90+)
  - E2E tests (Playwright)

---

## 📋 REQUIREMENTS (DETAILED)

---

## 🌐 GLOBAL REQUIREMENTS

### **REQ-GLOBAL-01 | Sidebar Navigation (Studio View)**

**Priority**: P0 (Critical)  
**Effort**: 2 days  
**Owner**: Gabriel Santos

**Requirement**: Add persistent sidebar navigation visible only in Nutritionist (Studio) view.

**Modules**:
1. Prontuário (Medical Record)
2. Exames (Lab Results)
3. Antropometria (Anthropometry) - Phase 2
4. Cálculo Energético (Energy Calculation) - Phase 2
5. Plano Alimentar (Meal Plan) - Phase 3
6. Prescrição (Prescription) - Phase 3
7. Extras (Recipes, Protocols, etc.) - Phase 3

**Behavior**:
- Each sidebar item opens screen **in context of selected patient**
- URL pattern: `/studio/patients/[patientId]/[module]`
- Active state highlighting
- Collapsible on mobile (hamburger menu)

**Technical Implementation**:
```typescript
// src/components/layout/StudioSidebar.tsx
interface StudioSidebarProps {
  patientId: string;
  currentModule: string;
}

const modules = [
  { id: 'prontuario', label: 'Prontuário', icon: FileText, phase: 1 },
  { id: 'exames', label: 'Exames', icon: TestTube, phase: 1 },
  { id: 'antropometria', label: 'Antropometria', icon: Ruler, phase: 2 },
  // ...
];

export function StudioSidebar({ patientId, currentModule }: StudioSidebarProps) {
  const enabledModules = modules.filter(m => m.phase <= currentPhase);
  
  return (
    <aside className="w-64 bg-card border-r">
      {enabledModules.map(module => (
        <Link
          key={module.id}
          href={`/studio/patients/${patientId}/${module.id}`}
          className={cn(
            "flex items-center gap-3 px-4 py-3",
            currentModule === module.id && "bg-accent"
          )}
        >
          <module.icon className="w-5 h-5" />
          <span>{module.label}</span>
        </Link>
      ))}
    </aside>
  );
}
```

**Acceptance Criteria**:
- ✅ Sidebar visible on all `/studio/patients/[patientId]/*` routes
- ✅ Active module highlighted
- ✅ Mobile: Collapsible, accessible via hamburger menu
- ✅ Keyboard navigable (Tab, Enter)

---

### **REQ-GLOBAL-02 | Patient Context (Mandatory)**

**Priority**: P0 (Critical)  
**Effort**: 1 day  
**Owner**: Gabriel Santos

**Requirement**: All Studio screens must display and maintain patient context.

**Display Elements**:
```typescript
interface PatientContextHeader {
  patientId: string;
  patientName: string;
  lastUpdate: Date; // Last data modification
  lastInteraction: Date; // Last consultation/contact
}
```

**UI Mockup**:
```
┌────────────────────────────────────────────────┐
│ 👤 Maria Silva (ID: 12345)                    │
│ Última atualização: 03/02/2026 14:30          │
│ Última interação: 01/02/2026 (Consulta)       │
└────────────────────────────────────────────────┘
```

**Technical Implementation**:
```typescript
// src/contexts/PatientContext.tsx
export const PatientContext = createContext<{
  patient: Patient | null;
  setPatient: (patient: Patient) => void;
}>({ patient: null, setPatient: () => {} });

// Persist in URL and localStorage
export function usePatientContext() {
  const params = useParams();
  const patientId = params.patientId as string;
  
  const { data: patient } = useQuery({
    queryKey: ['patient', patientId],
    queryFn: () => fetchPatient(patientId),
  });
  
  return { patient };
}
```

**Acceptance Criteria**:
- ✅ Patient header visible on all module pages
- ✅ Context persists when navigating between modules
- ✅ Breadcrumb: `Pacientes > [Patient Name] > [Module]`
- ✅ Quick switch to another patient (dropdown)

---

### **REQ-GLOBAL-03 | Standard Actions Pattern**

**Priority**: P1 (High)  
**Effort**: 3 days  
**Owner**: Gabriel Santos

**Requirement**: Consistent action buttons across all screens.

**Actions** (where applicable):
- **Add**: Create new entry (exam, measurement, note)
- **Edit**: Modify existing entry
- **Delete**: Soft delete (with confirmation)
- **Upload**: Files (PDFs, images)
- **Export PDF**: Generate downloadable PDF
- **Share to Patient**: Send via email/app notification
- **Audit Trail**: View change history (for clinical data)

**Component Design**:
```typescript
// src/components/actions/ActionBar.tsx
interface ActionBarProps {
  actions: {
    type: 'add' | 'edit' | 'delete' | 'upload' | 'export' | 'share' | 'audit';
    label: string;
    onClick: () => void;
    disabled?: boolean;
    requiresConfirmation?: boolean;
  }[];
}

export function ActionBar({ actions }: ActionBarProps) {
  return (
    <div className="flex gap-2 justify-end">
      {actions.map(action => (
        <Button
          key={action.type}
          variant={action.type === 'delete' ? 'destructive' : 'default'}
          onClick={action.onClick}
          disabled={action.disabled}
        >
          <ActionIcon type={action.type} />
          {action.label}
        </Button>
      ))}
    </div>
  );
}
```

**Acceptance Criteria**:
- ✅ Consistent button styling (Radix UI + Tailwind)
- ✅ Delete requires confirmation dialog
- ✅ Audit trail shows: who, what, when
- ✅ Role-based permissions (TEAM can edit, PATIENT can view)

---

## 🏥 MODULE 1: PRONTUÁRIO (MEDICAL RECORD)

### **Objective**
Centralize all patient annotations and interactions in a searchable, timeline-based medical record.

---

### **REQ-PR-01 | Single Cumulative Record**

**Priority**: P0 (Critical)  
**Effort**: 2 days  
**Owner**: Marina Oliveira (DB), Gabriel Santos (UI)

**Requirement**: One medical record per patient, cumulative and continuous.

**Database Schema**:
```sql
CREATE TABLE patient_log_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES "Tenant"(id),
  patient_id UUID NOT NULL REFERENCES "Patient"(id),
  entry_type VARCHAR(50) NOT NULL, -- 'consultation', 'call', 'question', 'note'
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Content (flexible JSONB)
  content JSONB NOT NULL,
  -- Example: { "text": "Patient reports...", "transcription": "...", "summary": [...] }
  
  -- Authorship
  created_by UUID NOT NULL REFERENCES "User"(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ, -- Soft delete
  
  -- Search
  search_vector tsvector GENERATED ALWAYS AS (
    to_tsvector('portuguese', content::text)
  ) STORED
);

-- Indexes
CREATE INDEX idx_log_patient_time ON patient_log_entries(patient_id, timestamp DESC);
CREATE INDEX idx_log_type ON patient_log_entries(entry_type);
CREATE INDEX idx_log_search ON patient_log_entries USING GIN(search_vector);
```

**Acceptance Criteria**:
- ✅ No entry limit (scalable to 10,000+ entries per patient)
- ✅ Chronological timeline (newest first)
- ✅ Soft delete (never hard delete)

---

### **REQ-PR-02 | Entry Types**

**Priority**: P0 (Critical)  
**Effort**: 1 day  
**Owner**: Gabriel Santos

**Requirement**: Support multiple entry types with distinct UI.

**Types**:
```typescript
enum EntryType {
  CONSULTATION = 'consultation', // Consulta
  CALL = 'call', // Ligação
  QUESTION = 'question', // Pergunta do paciente
  NOTE = 'note', // Nota livre
}
```

**UI Differentiation**:
- **Consultation**: 🩺 Blue badge, shows transcription + summary
- **Call**: 📞 Green badge, shows duration + notes
- **Question**: ❓ Yellow badge, shows question + answer
- **Note**: 📝 Gray badge, free-form text

**Acceptance Criteria**:
- ✅ Entry type is mandatory (dropdown)
- ✅ Color-coded badges in timeline
- ✅ Filter by type (multi-select)

---

### **REQ-PR-05 | AI: Transcription + Structured Summary**

**Priority**: P1 (High)  
**Effort**: 5 days  
**Owner**: Dr. Ana Paula Costa (AI), Gabriel Santos (UI)

**Requirement**: For "Consultation" entries, AI transcribes and summarizes.

**Workflow**:
1. Nutritionist uploads audio file (MP3, WAV) or types notes
2. AI transcribes (Whisper API) → full text
3. AI summarizes (GPT-4) → structured bullets
4. Nutritionist reviews and edits
5. Save to database

**AI Prompt (GPT-4)**:
```typescript
const CONSULTATION_SUMMARY_PROMPT = `
Você é um nutricionista experiente com 20 anos de prática clínica.

Analise a transcrição da consulta abaixo e gere um resumo estruturado com os seguintes pontos:

1. **Queixa Principal**: O que trouxe o paciente à consulta?
2. **Histórico Relevante**: Informações importantes do histórico médico/nutricional
3. **Exame Físico/Antropometria**: Medidas, observações visuais
4. **Avaliação**: Sua interpretação clínica
5. **Plano**: Próximos passos, orientações, prescrições
6. **Próxima Consulta**: Data sugerida, objetivos

Transcrição:
"""
{{transcription}}
"""

Forneça a resposta em JSON:
{
  "chief_complaint": "...",
  "history": "...",
  "physical_exam": "...",
  "assessment": "...",
  "plan": ["...", "..."],
  "next_appointment": "..."
}
`;
```

**Storage**:
```typescript
interface ConsultationContent {
  transcription: string; // Full text from Whisper
  summary: {
    chief_complaint: string;
    history: string;
    physical_exam: string;
    assessment: string;
    plan: string[];
    next_appointment: string;
  };
  ai_generated: boolean; // true if AI-generated
  edited_by_human: boolean; // true if nutritionist edited
}
```

**Validation UI**:
```
┌────────────────────────────────────────────────┐
│ 🤖 Resumo gerado por IA (revisar antes de salvar) │
├────────────────────────────────────────────────┤
│ Queixa Principal: [editable]                   │
│ Histórico: [editable]                          │
│ ...                                            │
├────────────────────────────────────────────────┤
│ [Aprovar e Salvar] [Editar Manualmente]       │
└────────────────────────────────────────────────┘
```

**Acceptance Criteria**:
- ✅ Whisper API transcribes audio (95%+ accuracy for PT-BR)
- ✅ GPT-4 generates structured summary
- ✅ Nutritionist can edit before saving
- ✅ Audit trail: AI-generated vs. human-edited

**Realistic Expectations**:
- **Transcription accuracy**: 90-95% (Whisper is excellent for PT-BR)
- **Summary quality**: 80-85% (requires human review)
- **Cost**: ~$0.10 per 30-minute consultation (Whisper + GPT-4)

---

### **REQ-PR-06 | Filters, Search, and Actions**

**Priority**: P1 (High)  
**Effort**: 3 days  
**Owner**: Gabriel Santos

**Requirement**: Advanced filtering and full-text search.

**Filters**:
```typescript
interface LogFilters {
  dateRange: { from: Date; to: Date };
  entryTypes: EntryType[]; // Multi-select
  keywords: string; // Full-text search
  tags: string[]; // Custom tags (e.g., "diabetes", "weight loss")
  hasOpenTasks: boolean; // Show only entries with open tasks
}
```

**UI Mockup**:
```
┌────────────────────────────────────────────────┐
│ Filtros                                        │
├────────────────────────────────────────────────┤
│ Data: [01/01/2026] - [04/02/2026]             │
│ Tipo: [x] Consulta [ ] Ligação [ ] Pergunta   │
│ Busca: [diabetes]                              │
│ Tags: [x] Perda de peso [ ] Hipertensão       │
│ [ ] Apenas com tarefas abertas                 │
├────────────────────────────────────────────────┤
│ [Aplicar Filtros] [Limpar]                    │
└────────────────────────────────────────────────┘
```

**Search Implementation**:
```typescript
// PostgreSQL full-text search
const searchQuery = `
  SELECT * FROM patient_log_entries
  WHERE patient_id = $1
    AND search_vector @@ to_tsquery('portuguese', $2)
    AND entry_type = ANY($3)
    AND timestamp BETWEEN $4 AND $5
  ORDER BY timestamp DESC
  LIMIT 50;
`;
```

**Acceptance Criteria**:
- ✅ Real-time filter updates (debounced search)
- ✅ Full-text search in Portuguese (stemming, accents)
- ✅ Results update \< 500ms
- ✅ Pagination (50 entries per page)

---

### **REQ-PR-07 | Tasks / Next Steps (Checklist)**

**Priority**: P1 (High)  
**Effort**: 2 days  
**Owner**: Gabriel Santos

**Requirement**: Each entry can contain actionable tasks.

**Data Model**:
```typescript
interface Task {
  id: string;
  text: string;
  status: 'open' | 'completed';
  created_at: Date;
  completed_at?: Date;
  completed_by?: string; // User ID
}

// Stored in JSONB field of patient_log_entries
interface EntryContent {
  text: string;
  tasks?: Task[];
}
```

**UI**:
```
┌────────────────────────────────────────────────┐
│ Tarefas / Próximos Passos                     │
├────────────────────────────────────────────────┤
│ [ ] Solicitar exame de colesterol             │
│ [x] Enviar plano alimentar                    │
│ [ ] Agendar retorno em 30 dias                │
├────────────────────────────────────────────────┤
│ [+ Adicionar Tarefa]                          │
└────────────────────────────────────────────────┘
```

**Aggregated View**:
```typescript
// Count open tasks per patient
const openTasksCount = await prisma.$queryRaw`
  SELECT COUNT(*) FROM patient_log_entries
  WHERE patient_id = ${patientId}
    AND content->'tasks' @> '[{"status": "open"}]'::jsonb;
`;
```

**Acceptance Criteria**:
- ✅ Checkbox UI (toggle status)
- ✅ Timestamp when completed
- ✅ Aggregated "Open Tasks" counter in patient header
- ✅ Filter: "Show only entries with open tasks"

---

## 🧪 MODULE 2: EXAMES LABORATORIAIS (LAB RESULTS)

### **Objective**
Convert uploaded lab results (PDFs) into structured database records with AI extraction and human validation.

---

### **REQ-EX-01 | Upload**

**Priority**: P0 (Critical)  
**Effort**: 2 days  
**Owner**: Gabriel Santos

**Requirement**: Allow PDF/image upload of lab results.

**UI Flow**:
1. Click "Upload Exam"
2. Select file (PDF, JPG, PNG, max 10MB)
3. Fill metadata:
   - Exam date (date picker)
   - Laboratory name (optional text)
   - Observations (optional textarea)
4. Upload → Supabase Storage
5. Trigger AI extraction

**Technical Implementation**:
```typescript
// src/app/studio/patients/[patientId]/exames/actions.ts
export async function uploadExam(formData: FormData) {
  const file = formData.get('file') as File;
  const examDate = formData.get('examDate') as string;
  const labName = formData.get('labName') as string;
  
  // 1. Upload to Supabase Storage
  const { data: upload, error } = await supabase.storage
    .from('exam-uploads')
    .upload(`${tenantId}/${patientId}/${file.name}`, file);
  
  if (error) throw error;
  
  // 2. Save metadata to database
  const examUpload = await prisma.examUpload.create({
    data: {
      tenantId,
      patientId,
      fileUrl: upload.path,
      fileName: file.name,
      fileSize: file.size,
      examDate: new Date(examDate),
      labName,
      uploadedBy: userId,
    },
  });
  
  // 3. Trigger AI extraction (async job)
  await queueAIExtraction(examUpload.id);
  
  return examUpload;
}
```

**Acceptance Criteria**:
- ✅ File upload \< 5 seconds (10MB PDF)
- ✅ Supported formats: PDF, JPG, PNG
- ✅ File stored in Supabase Storage (encrypted)
- ✅ Metadata saved to database

---

### **REQ-EX-02 | AI: Multilingual Extraction**

**Priority**: P0 (Critical)  
**Effort**: 7 days  
**Owner**: Dr. Ana Paula Costa

**Requirement**: AI extracts biomarkers from exams in PT, DE, or EN.

**AI Prompt (GPT-4 Vision)**:
```typescript
const EXAM_EXTRACTION_PROMPT = `
Você é um especialista em análise de exames laboratoriais.

Analise a imagem do exame e extraia TODOS os biomarcadores encontrados.

Para cada biomarcador, forneça:
1. Nome (como aparece no documento)
2. Valor numérico
3. Unidade (mg/dL, mmol/L, etc.)
4. Faixa de referência (se disponível)
5. Indicador de normalidade (normal, alto, baixo)

O exame pode estar em **Português, Alemão ou Inglês**. Detecte o idioma automaticamente.

Forneça a resposta em JSON:
{
  "detected_language": "pt" | "de" | "en",
  "lab_name": "...",
  "exam_date": "YYYY-MM-DD",
  "biomarkers": [
    {
      "raw_name": "Colesterol Total",
      "value": 200,
      "unit": "mg/dL",
      "reference_range": "< 200",
      "status": "normal" | "high" | "low",
      "confidence": 0.95
    }
  ]
}
`;
```

**Mapping to Canonical Names**:
```typescript
// Fuzzy matching to canonical exam list
const canonicalExams = [
  {
    id: '1',
    commonName: 'Colesterol Total',
    technicalName: 'Colesterol Total Sérico',
    synonyms: {
      pt: ['Colesterol', 'Col. Total'],
      de: ['Cholesterin', 'Gesamtcholesterin'],
      en: ['Total Cholesterol', 'Cholesterol'],
    },
  },
  // ...
];

function mapToCanonical(rawName: string, language: string): string | null {
  // Use fuzzy matching (Levenshtein distance)
  const matches = canonicalExams.filter(exam =>
    exam.synonyms[language].some(syn =>
      similarity(syn.toLowerCase(), rawName.toLowerCase()) > 0.8
    )
  );
  
  return matches[0]?.id || null;
}
```

**Acceptance Criteria**:
- ✅ Detects language (PT/DE/EN) with 95%+ accuracy
- ✅ Extracts biomarkers with 75%+ accuracy (realistic)
- ✅ Maps to canonical exams (fuzzy matching)
- ✅ Confidence score per biomarker

**Realistic Expectations**:
- **OCR accuracy**: 75-85% (depends on PDF quality)
- **Mapping accuracy**: 80-90% (with canonical list)
- **Cost**: ~$0.05 per exam (GPT-4 Vision)

---

### **REQ-EX-07 | Quality Control (Mandatory)**

**Priority**: P0 (Critical)  
**Effort**: 4 days  
**Owner**: Gabriel Santos

**Requirement**: Human validation of all AI extractions.

**Validation UI**:
```
┌────────────────────────────────────────────────────────────┐
│ Validação de Exame - Lab XYZ (03/02/2026)                 │
├────────────────────────────────────────────────────────────┤
│ 🤖 Extração automática (revisar antes de confirmar)       │
├────────────────────────────────────────────────────────────┤
│ Biomarcador       │ Valor │ Unidade │ Ref.   │ Confiança │
├───────────────────┼───────┼─────────┼────────┼───────────┤
│ Colesterol Total  │ 200   │ mg/dL   │ <200   │ 🟢 95%   │
│ [Editar] [Mapear para: Colesterol Total ▼]               │
├───────────────────┼───────┼─────────┼────────┼───────────┤
│ HDL               │ 50    │ mg/dL   │ >40    │ 🟡 75%   │
│ [Editar] [Mapear para: HDL Colesterol ▼]                 │
├───────────────────┼───────┼─────────┼────────┼───────────┤
│ Glicose           │ ???   │ ???     │ ???    │ 🔴 30%   │
│ [Entrada Manual]                                          │
├────────────────────────────────────────────────────────────┤
│ [Confirmar Tudo] [Rejeitar e Inserir Manualmente]        │
└────────────────────────────────────────────────────────────┘
```

**Confidence Indicators**:
- 🟢 **High (90-100%)**: Auto-approve option
- 🟡 **Medium (70-89%)**: Review recommended
- 🔴 **Low (\< 70%)**: Manual entry required

**Workflow**:
1. AI extracts → Status: `pending`
2. Nutritionist reviews → Edits if needed
3. Click "Confirm" → Status: `validated`
4. Audit trail: `validated_by`, `validated_at`

**Acceptance Criteria**:
- ✅ All extractions require human confirmation
- ✅ Inline editing (value, unit, mapping)
- ✅ Confidence color-coding (green/yellow/red)
- ✅ Audit trail: who validated, when

---

### **REQ-EX-09 | Charts**

**Priority**: P1 (High)  
**Effort**: 3 days  
**Owner**: Gabriel Santos

**Requirement**: Time-series charts per biomarker.

**UI**:
```
┌────────────────────────────────────────────────┐
│ Gráfico de Tendência                           │
├────────────────────────────────────────────────┤
│ Selecione o exame: [Colesterol Total ▼]       │
├────────────────────────────────────────────────┤
│     250 ┤                                      │
│         │         ●                            │
│     200 ┤   ●           ●                      │
│         │                     ●                │
│     150 ┤                                      │
│         └─────────────────────────────────     │
│          Jan  Fev  Mar  Abr  Mai              │
├────────────────────────────────────────────────┤
│ Faixa de referência: < 200 mg/dL              │
│ Tendência: ↓ Redução de 15% em 4 meses        │
└────────────────────────────────────────────────┘
```

**Technical Implementation**:
```typescript
// Use Recharts
import { LineChart, Line, XAxis, YAxis, Tooltip, ReferenceLine } from 'recharts';

const data = [
  { date: '2026-01-01', value: 220 },
  { date: '2026-02-01', value: 210 },
  { date: '2026-03-01', value: 200 },
  { date: '2026-04-01', value: 187 },
];

<LineChart data={data}>
  <XAxis dataKey="date" />
  <YAxis />
  <Tooltip />
  <ReferenceLine y={200} stroke="red" label="Limite" />
  <Line type="monotone" dataKey="value" stroke="#10b981" />
</LineChart>
```

**Acceptance Criteria**:
- ✅ Exam selector (dropdown with search)
- ✅ Time-series chart (Recharts)
- ✅ Reference range line (if available)
- ✅ Trend indicator (↑ increase, ↓ decrease, → stable)

---

## 📏 MODULE 3: ANTROPOMETRIA (ANTHROPOMETRY)

**Priority**: P1 (Phase 2)  
**Effort**: 3 days  
**Owner**: Gabriel Santos

**Requirement**: Record body measurements and auto-calculate BMI.

**Database Schema**:
```sql
CREATE TABLE anthropometry_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES "Tenant"(id),
  patient_id UUID NOT NULL REFERENCES "Patient"(id),
  measured_at TIMESTAMPTZ NOT NULL,
  
  -- Core measurements
  weight_kg DECIMAL(5,2),
  height_cm DECIMAL(5,2),
  
  -- Calculated
  bmi DECIMAL(4,2) GENERATED ALWAYS AS (
    weight_kg / ((height_cm / 100) ^ 2)
  ) STORED,
  
  -- Additional measurements (JSONB for flexibility)
  measurements JSONB,
  -- Example: { "waist_cm": 85, "hip_cm": 95, "body_fat_pct": 25 }
  
  -- Metadata
  source VARCHAR(20) DEFAULT 'measured', -- 'measured' | 'patient_reported'
  notes TEXT,
  created_by UUID NOT NULL REFERENCES "User"(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_anthropometry_patient ON anthropometry_records(patient_id, measured_at DESC);
```

**UI**:
```
┌────────────────────────────────────────────────┐
│ Nova Medição - 04/02/2026                      │
├────────────────────────────────────────────────┤
│ Peso (kg): [75.5]                              │
│ Altura (cm): [170]                             │
│ IMC: 26.1 (calculado automaticamente)          │
├────────────────────────────────────────────────┤
│ Circunferências (opcional)                     │
│ Cintura (cm): [85]                             │
│ Quadril (cm): [95]                             │
│ Braço (cm): [30]                               │
├────────────────────────────────────────────────┤
│ Composição Corporal (opcional)                 │
│ Gordura (%): [25]                              │
│ Massa magra (kg): [56.3]                       │
├────────────────────────────────────────────────┤
│ Fonte: (•) Medido ( ) Informado pelo paciente │
│ Observações: [...]                             │
├────────────────────────────────────────────────┤
│ [Salvar] [Cancelar]                            │
└────────────────────────────────────────────────┘
```

**Chart**:
```typescript
// Dual-axis chart: Weight + BMI over time
<ComposedChart data={records}>
  <XAxis dataKey="date" />
  <YAxis yAxisId="left" label="Peso (kg)" />
  <YAxis yAxisId="right" orientation="right" label="IMC" />
  <Line yAxisId="left" dataKey="weight_kg" stroke="#10b981" />
  <Line yAxisId="right" dataKey="bmi" stroke="#f59e0b" />
</ComposedChart>
```

**Acceptance Criteria**:
- ✅ Auto-calculate BMI on save
- ✅ Chart: Weight and BMI trends (dual-axis)
- ✅ Mobile-friendly input (numeric keyboards)
- ✅ Source tracking (measured vs. patient-reported)

---

## ⚡ MODULE 4: CÁLCULO ENERGÉTICO (ENERGY CALCULATION)

**Priority**: P1 (Phase 2)  
**Effort**: 4 days  
**Owner**: Marina Oliveira (formulas), Gabriel Santos (UI)

**Requirement**: Calculate energy needs with multiple formulas and full transparency.

**Formulas**:
```typescript
enum EnergyFormula {
  HARRIS_BENEDICT_1984 = 'harris_benedict_1984',
  HARRIS_BENEDICT_2019 = 'harris_benedict_2019',
  MIFFLIN_OBESITY = 'mifflin_obesity',
  MIFFLIN_OVERWEIGHT = 'mifflin_overweight',
  GET_POCKET = 'get_pocket',
}

// Harris-Benedict 1984 (Men)
function harrisBenedict1984Male(weight_kg: number, height_cm: number, age: number): number {
  return 66.5 + (13.75 * weight_kg) + (5.003 * height_cm) - (6.75 * age);
}

// Harris-Benedict 1984 (Women)
function harrisBenedict1984Female(weight_kg: number, height_cm: number, age: number): number {
  return 655.1 + (9.563 * weight_kg) + (1.850 * height_cm) - (4.676 * age);
}

// ... (implement other formulas)
```

**Transparency UI**:
```
┌────────────────────────────────────────────────┐
│ Cálculo de Gasto Energético                   │
├────────────────────────────────────────────────┤
│ Fórmula: [Harris-Benedict 1984 ▼]             │
├────────────────────────────────────────────────┤
│ Dados do Paciente:                             │
│ Peso: 75 kg                                    │
│ Altura: 170 cm                                 │
│ Idade: 35 anos                                 │
│ Sexo: Feminino                                 │
│ Nível de atividade: Moderado (1.55)           │
├────────────────────────────────────────────────┤
│ Cálculo:                                       │
│ TMB = 655.1 + (9.563 × 75) + (1.850 × 170)    │
│       - (4.676 × 35)                           │
│ TMB = 1,487 kcal/dia                           │
│                                                │
│ GET = TMB × Fator de atividade                 │
│ GET = 1,487 × 1.55                             │
│ GET = 2,305 kcal/dia                           │
├────────────────────────────────────────────────┤
│ Referência: Harris JA, Benedict FG (1918)     │
│ DOI: 10.1073/pnas.4.12.370                     │
├────────────────────────────────────────────────┤
│ [Salvar Cálculo] [Comparar Fórmulas]          │
└────────────────────────────────────────────────┘
```

**Comparison View**:
```
┌────────────────────────────────────────────────┐
│ Comparação de Fórmulas (04/02/2026)            │
├────────────────────────────────────────────────┤
│ Fórmula                  │ TMB    │ GET        │
├──────────────────────────┼────────┼────────────┤
│ Harris-Benedict 1984     │ 1,487  │ 2,305      │
│ Harris-Benedict 2019     │ 1,502  │ 2,328      │
│ Mifflin (sobrepeso)      │ 1,465  │ 2,271      │
├────────────────────────────────────────────────┤
│ Média: 2,301 kcal/dia                          │
│ Desvio padrão: ±29 kcal                        │
└────────────────────────────────────────────────┘
```

**Acceptance Criteria**:
- ✅ 5 formulas implemented (accurate to literature)
- ✅ Step-by-step calculation display
- ✅ Side-by-side comparison
- ✅ Save to audit trail (`CalcAudit` table)

---

## 🍽️ MODULE 5: PLANO ALIMENTAR (MEAL PLAN)

**Priority**: P0 (Phase 3)  
**Effort**: 10 days (complex multi-source integration)  
**Owner**: Marina Oliveira (DB), Dr. Ana Paula Costa (AI), Gabriel Santos (UI)

**Requirement**: Build meal plans using multi-source nutritional databases.

**Phased Rollout**:
- **Phase 3.1 (Week 9)**: TACO only (public, well-documented)
- **Phase 3.2 (Week 10)**: Add TBCA (requires data import)
- **Phase 4 (Month 4)**: Add BLS (German market)
- **Phase 5 (Month 6)**: Add Tucunduva (if accessible)

**Database Schema** (see earlier section for full schema)

**Food Search UI**:
```
┌────────────────────────────────────────────────┐
│ Buscar Alimento                                │
├────────────────────────────────────────────────┤
│ [arroz integral]                               │
├────────────────────────────────────────────────┤
│ Resultados (TACO):                             │
│ • Arroz integral cozido (100g)                 │
│   Energia: 124 kcal | Proteína: 2.6g          │
│   [Adicionar]                                  │
│                                                │
│ • Arroz integral parboilizado (100g)           │
│   Energia: 123 kcal | Proteína: 2.5g          │
│   [Adicionar]                                  │
└────────────────────────────────────────────────┘
```

**Portion Calculation**:
```
┌────────────────────────────────────────────────┐
│ Arroz integral cozido                          │
├────────────────────────────────────────────────┤
│ Porção: [150] g                                │
├────────────────────────────────────────────────┤
│ Cálculo:                                       │
│ Valor base (100g): 124 kcal                    │
│ Fator: 150 / 100 = 1.5                         │
│ Resultado: 124 × 1.5 = 186 kcal                │
├────────────────────────────────────────────────┤
│ Macros (150g):                                 │
│ Energia: 186 kcal                              │
│ Proteína: 3.9g                                 │
│ Carboidratos: 25.8g                            │
│ Gordura: 0.9g                                  │
├────────────────────────────────────────────────┤
│ Fonte: TACO 4ª edição (2011)                   │
│ [Adicionar ao Plano]                           │
└────────────────────────────────────────────────┘
```

**Acceptance Criteria**:
- ✅ TACO database imported (500+ foods)
- ✅ Food search with autocomplete
- ✅ Portion calculation (100g → custom portion)
- ✅ Source traceability (TACO/TBCA/BLS)
- ✅ Export PDF with references

---

## 💊 MODULE 6: PRESCRIÇÃO (PRESCRIPTION)

**Priority**: P1 (Phase 3)  
**Effort**: 5 days  
**Owner**: Gabriel Santos

**Requirement**: Generate prescriptions on letterhead with AI assistance.

**Letterhead Configuration**:
```sql
CREATE TABLE letterhead_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES "Tenant"(id),
  name TEXT NOT NULL,
  logo_url TEXT,
  professional_name TEXT NOT NULL,
  license_number TEXT, -- CRN
  phone TEXT,
  email TEXT,
  address TEXT,
  layout_template VARCHAR(50) DEFAULT 'default',
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Prescription Workflow**:
1. Click "New Prescription"
2. AI suggests products based on patient conditions
3. Nutritionist reviews and edits
4. Generate PDF on letterhead
5. Send to patient (email/app)

**AI Prompt**:
```typescript
const PRESCRIPTION_PROMPT = `
Você é um nutricionista experiente.

Paciente: {{patient_name}}
Condições: {{conditions}}
Deficiências identificadas: {{deficiencies}}

Sugira uma prescrição de suplementos/fitoterápicos com:
1. Nome do produto
2. Dosagem
3. Instruções de uso
4. Duração do tratamento

Forneça em JSON:
{
  "items": [
    {
      "product_name": "Vitamina D3",
      "dosage": "2000 UI",
      "instructions": "1 cápsula ao dia, com refeição",
      "duration": "3 meses"
    }
  ]
}
`;
```

**PDF Generation**:
```typescript
// Use @react-pdf/renderer or similar
import { Document, Page, Text, Image, View } from '@react-pdf/renderer';

const PrescriptionPDF = ({ letterhead, items }) => (
  <Document>
    <Page size="A4">
      <View style={styles.header}>
        <Image src={letterhead.logo_url} />
        <Text>{letterhead.professional_name}</Text>
        <Text>CRN: {letterhead.license_number}</Text>
      </View>
      <View style={styles.body}>
        <Text style={styles.title}>PRESCRIÇÃO NUTRICIONAL</Text>
        {items.map(item => (
          <View key={item.id}>
            <Text>{item.product_name}</Text>
            <Text>Dosagem: {item.dosage}</Text>
            <Text>Instruções: {item.instructions}</Text>
          </View>
        ))}
      </View>
      <View style={styles.footer}>
        <Text>Data: {new Date().toLocaleDateString('pt-BR')}</Text>
        <Text>_______________________________</Text>
        <Text>{letterhead.professional_name}</Text>
      </View>
    </Page>
  </Document>
);
```

**Acceptance Criteria**:
- ✅ Letterhead configuration (logo, name, CRN)
- ✅ AI-suggested prescriptions (editable)
- ✅ PDF generation on letterhead
- ✅ Send to patient (email + app notification)

---

## 🧪 TESTING STRATEGY

### **Unit Tests (70%)**
- **Framework**: Vitest
- **Coverage**: 80% minimum
- **Focus**: Business logic, calculations, data transformations

```typescript
// Example: BMI calculation
describe('calculateBMI', () => {
  it('should calculate BMI correctly', () => {
    expect(calculateBMI(75, 170)).toBeCloseTo(25.95, 2);
  });
  
  it('should handle edge cases', () => {
    expect(calculateBMI(0, 170)).toBe(0);
    expect(calculateBMI(75, 0)).toBe(Infinity);
  });
});
```

### **Integration Tests (20%)**
- **Framework**: Vitest + Supertest
- **Focus**: API endpoints, database queries

```typescript
// Example: Exam upload
describe('POST /api/exams/upload', () => {
  it('should upload exam and trigger AI extraction', async () => {
    const response = await request(app)
      .post('/api/exams/upload')
      .attach('file', 'test-exam.pdf')
      .field('examDate', '2026-02-04')
      .expect(200);
    
    expect(response.body.id).toBeDefined();
    expect(response.body.status).toBe('processing');
  });
});
```

### **E2E Tests (10%)**
- **Framework**: Playwright
- **Focus**: Critical user workflows

```typescript
// Example: Add patient → Upload exam → Validate results
test('Nutritionist can upload and validate exam', async ({ page }) => {
  await page.goto('/studio/patients');
  await page.click('text=Maria Silva');
  await page.click('text=Exames');
  await page.click('text=Upload Exam');
  await page.setInputFiles('input[type="file"]', 'test-exam.pdf');
  await page.fill('input[name="examDate"]', '2026-02-04');
  await page.click('text=Upload');
  
  // Wait for AI extraction
  await page.waitForSelector('text=Validação de Exame');
  
  // Validate first biomarker
  await page.click('button:has-text("Confirmar Tudo")');
  
  // Check success
  await expect(page.locator('text=Exame validado com sucesso')).toBeVisible();
});
```

### **AI Testing (Golden Dataset)**
- **Dataset**: 100 exam PDFs with known-good extractions
- **Metrics**: Precision, recall, F1-score per biomarker
- **Threshold**: 75% accuracy minimum

```typescript
// Example: AI extraction accuracy test
describe('AI Exam Extraction', () => {
  const goldenDataset = loadGoldenDataset(); // 100 PDFs + expected results
  
  it('should achieve 75%+ accuracy on golden dataset', async () => {
    const results = await Promise.all(
      goldenDataset.map(async (item) => {
        const extracted = await extractExam(item.pdf);
        return compareResults(extracted, item.expected);
      })
    );
    
    const accuracy = results.filter(r => r.correct).length / results.length;
    expect(accuracy).toBeGreaterThanOrEqual(0.75);
  });
});
```

---

## 📊 MONITORING & OBSERVABILITY

### **Application Performance Monitoring (APM)**
- **Tool**: Vercel Analytics + Sentry
- **Metrics**:
  - Page load time (target: \< 2s)
  - API response time (target: \< 500ms)
  - Database query time (target: \< 100ms)

### **Error Tracking**
- **Tool**: Sentry
- **Alerts**: Slack webhook for critical errors
- **Threshold**: \> 10 errors/hour → alert

### **AI Cost Monitoring**
- **Dashboard**: Custom (Next.js + Recharts)
- **Metrics**:
  - Cost per patient
  - Cost per AI agent
  - Monthly burn rate
- **Alerts**: \> 80% of monthly budget → email

### **Business Metrics**
- **Tool**: Metabase or Posthog
- **KPIs**:
  - Daily active nutritionists
  - Patients per nutritionist
  - Exam uploads per week
  - AI usage rate

---

## 💰 COST ESTIMATES

### **Infrastructure (Monthly)**
- **Vercel Pro**: $20/month
- **Supabase Pro**: $25/month
- **Supabase Storage**: ~$5/month (100GB)
- **Total**: ~$50/month (base)

### **AI Costs (Per 100 Patients)**
- **Exam OCR (GPT-4 Vision)**: 100 exams × $0.05 = $5
- **Consultation Transcription (Whisper)**: 100 consultations × $0.10 = $10
- **Meal Planning (GPT-4)**: 50 plans × $0.20 = $10
- **Total**: ~$25/month (100 patients)

### **Scaling Estimates**
- **500 patients**: $50 (infra) + $125 (AI) = $175/month
- **1,000 patients**: $50 (infra) + $250 (AI) = $300/month
- **5,000 patients**: $100 (infra) + $1,250 (AI) = $1,350/month

---

## 🚀 DEPLOYMENT STRATEGY

### **Environments**
- **Development**: Local (localhost:3000)
- **Staging**: Vercel Preview (per PR)
- **Production**: Vercel Production (main branch)

### **CI/CD Pipeline (GitHub Actions)**
```yaml
name: CI/CD
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run lint
      - run: npm test
      - run: npm run build
  
  deploy-preview:
    if: github.event_name == 'pull_request'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
  
  deploy-production:
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

### **Rollback Plan**
- **Vercel**: Instant rollback via dashboard (1 click)
- **Database**: Migration rollback scripts (Prisma)
- **Feature Flags**: LaunchDarkly for gradual rollouts

---

## ✅ ACCEPTANCE CRITERIA (MVP)

### **Functionality**
- ✅ Prontuário: Add, edit, search entries
- ✅ Exames: Upload PDF → AI extraction → Validation → Charts
- ✅ Patient context persists across navigation
- ✅ Sidebar navigation works on all breakpoints

### **Performance**
- ✅ Page load \< 2 seconds (Lighthouse)
- ✅ AI response \< 10 seconds (95th percentile)
- ✅ Database queries \< 100ms (95th percentile)

### **UX/UI**
- ✅ Mobile-responsive (tested on iPhone, Android)
- ✅ Dark mode support
- ✅ WCAG 2.1 AA compliance (axe DevTools)

### **Security**
- ✅ LGPD compliant (data encryption, consent)
- ✅ RLS enabled (multi-tenant isolation)
- ✅ Audit trail for clinical changes

### **AI**
- ✅ Exam OCR accuracy ≥ 75% (golden dataset)
- ✅ All AI outputs require human validation
- ✅ Cost \< $0.10 per exam extraction

---

## 📚 DOCUMENTATION DELIVERABLES

### **Developer Documentation**
- [ ] README.md (setup, architecture, contribution)
- [ ] API documentation (OpenAPI/Swagger)
- [ ] Database schema diagram (ERD)
- [ ] ADRs (Architecture Decision Records)

### **User Documentation**
- [ ] Nutritionist user guide (in-app help)
- [ ] Patient FAQ
- [ ] Video tutorials (Loom)

### **Operational Documentation**
- [ ] Deployment runbook
- [ ] Incident response playbook
- [ ] Monitoring dashboard guide

---

## 🎯 SUCCESS METRICS (3 MONTHS POST-LAUNCH)

### **User Adoption**
- **Target**: 50+ nutritionists, 500+ patients
- **Metric**: Monthly active users (MAU)

### **Engagement**
- **Target**: 80% daily active nutritionists
- **Metric**: DAU/MAU ratio

### **AI Performance**
- **Target**: 75%+ OCR accuracy
- **Metric**: Human validation rate (lower = better)

### **Business**
- **Target**: 90% customer retention
- **Metric**: Churn rate

---

**END OF IMPROVED PROMPT V2**

---

## 🔄 CHANGELOG (V1 → V2)

### **Added**
- ✅ Executive summary (1 page)
- ✅ MVP scope (Phase 1: Prontuário + Exames only)
- ✅ Visual architecture diagrams (system, data flow)
- ✅ Realistic AI accuracy targets (75% vs. 90%)
- ✅ Phased food table rollout (TACO → TBCA → BLS)
- ✅ Comprehensive testing strategy (unit, integration, E2E, AI)
- ✅ Monitoring & observability (APM, error tracking, cost dashboard)
- ✅ Cost estimates (infrastructure + AI)
- ✅ CI/CD pipeline (GitHub Actions)
- ✅ Acceptance criteria (measurable)

### **Improved**
- ✅ Prioritization (P0/P1/P2)
- ✅ Effort estimates (days per requirement)
- ✅ Owner assignment (per requirement)
- ✅ Technical implementation details (code examples)
- ✅ UI mockups (ASCII diagrams)
- ✅ Error handling (validation, edge cases)

### **Removed**
- ❌ Overly ambitious timelines (12 weeks → 4 weeks MVP)
- ❌ Unrealistic AI expectations (90% → 75%)
- ❌ All-at-once food table integration (phased rollout)

---

**This improved prompt is actionable, realistic, and prioritized.**
