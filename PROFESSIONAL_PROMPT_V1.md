# 🏥 PROFESSIONAL IMPLEMENTATION PROMPT - NutriPlan Clinical Nutrition Platform

## 🎯 PROJECT OVERVIEW

You are tasked with implementing a comprehensive **Clinical Nutrition Management System** for nutritionists serving Brazilian and German-speaking markets. This is a **multi-tenant SaaS platform** that combines traditional nutrition practice management with cutting-edge AI capabilities.

---

## 👥 EXPERT PANEL ROLES

### **Dr. Sofia Mendes - Lead System Architect**
- **Expertise**: Healthcare SaaS architecture, LGPD/GDPR compliance, PostgreSQL database design
- **Responsibility**: Overall system architecture, multi-tenant data isolation, API design, security protocols
- **Focus**: Ensure scalability, data integrity, and regulatory compliance

### **Dr. Ana Paula Costa - AI/ML Specialist**
- **Expertise**: GPT-4 integration, prompt engineering, healthcare AI applications, cost optimization
- **Responsibility**: AI agent configuration, multilingual processing (PT/DE/EN), OCR for medical documents
- **Focus**: Accurate AI outputs, cost-effective token usage, clinical safety validation

### **Marina Oliveira - Clinical Data Architect**
- **Expertise**: Healthcare data modeling, nutritional databases (TACO, TBCA, BLS), FHIR standards
- **Responsibility**: Database schema for clinical records, exam results, food composition tables
- **Focus**: Data normalization, temporal tracking, multi-source data reconciliation

### **Lucas Ferreira - UX/UI Director**
- **Expertise**: Healthcare UX, accessibility (WCAG 2.1 AA), mobile-first design
- **Responsibility**: User flows, interface design, responsive layouts, dark mode support
- **Focus**: Intuitive navigation, cognitive load reduction, professional aesthetics

### **Roberto Silva - Localization Expert**
- **Expertise**: Brazilian Portuguese (native), German, healthcare terminology
- **Responsibility**: Translation accuracy, cultural adaptation, regulatory language compliance
- **Focus**: Natural language flow, medical terminology precision, regional food names

### **Gabriel Santos - Frontend Engineer**
- **Expertise**: Next.js 16, React 19, TypeScript, Tailwind CSS, Prisma ORM
- **Responsibility**: Component development, state management, performance optimization
- **Focus**: Type safety, reusable components, optimistic UI updates

---

## 📋 IMPLEMENTATION REQUIREMENTS

### **GLOBAL REQUIREMENTS (All Modules)**

#### **REQ-GLOBAL-01 | Sidebar Navigation (Studio View)**
- **Requirement**: Add sidebar navigation visible only in Nutritionist (Studio) view
- **Modules to include**:
  - Prontuário (Medical Record)
  - Exames (Lab Results)
  - Antropometria (Anthropometry)
  - Cálculo Energético (Energy Calculation)
  - Plano Alimentar (Meal Plan)
  - Prescrição (Prescription)
  - Extras (Recipes, Orientations, eBooks, Food Lists, Protocols, Exam Requests)
- **Behavior**: Each sidebar item opens the corresponding screen **in the context of the selected patient**
- **Technical**: Use existing `DashboardLayout` wrapper, maintain responsive behavior

#### **REQ-GLOBAL-02 | Patient Context (Mandatory)**
- **Requirement**: All screens must display and maintain patient context
- **Display elements**:
  - Patient identifier (name + ID)
  - Last update timestamp
  - Last interaction timestamp
- **Behavior**: Patient selection persists when navigating between modules
- **Technical**: Implement via React Context or URL parameters (`/studio/patients/[patientId]/[module]`)

#### **REQ-GLOBAL-03 | Standard Actions Pattern**
- **Requirement**: Consistent action buttons across all screens
- **Actions** (where applicable):
  - Add / Edit / Delete
  - Upload (files/images)
  - Export PDF
  - Share to patient
  - Audit trail (for clinical changes: plans, prescriptions, exams)
- **Technical**: Create reusable action button components with role-based permissions

---

## 🏥 MODULE 1: PRONTUÁRIO (MEDICAL RECORD)

### **Objective**
Centralize all patient annotations and interactions in a single, searchable, timeline-based document (similar to Word document with advanced features).

### **REQ-PR-01 | Single Cumulative Record**
- **Requirement**: One medical record per patient, cumulative and continuous
- **Behavior**: No entry limits, chronological timeline, living document concept
- **Technical**: Use `patient_log_entries` table with soft deletes

### **REQ-PR-02 | Entry Types**
- **Requirement**: Support multiple entry types (mandatory field)
- **Types**:
  - Consulta (Consultation)
  - Ligação (Phone Call)
  - Pergunta do paciente (Patient Question)
  - Nota livre (Free Note - for spontaneous annotations)
- **Technical**: Use enum `entry_type` with extensible design

### **REQ-PR-03 | Content and Authorship**
- **Requirement**: Track authorship and metadata for all entries
- **Fields**:
  - Author (nutritionist user ID)
  - Date/time (auto-generated)
  - Event type
  - Content (rich text)
- **Technical**: Store as JSONB with full-text search indexing

### **REQ-PR-04 | Flexible Structure (No Rigid Templates)**
- **Requirement**: For "Free Note" type, allow writing without mandatory fields
- **Fields**:
  - Date/time (auto)
  - Text (free-form, rich text editor)
- **Technical**: Conditional validation based on entry type

### **REQ-PR-05 | AI: Transcription + Structured Summary**
- **Requirement**: For "Consultation" entries, AI must transcribe and summarize
- **Process**:
  1. AI transcribes consultation (full text)
  2. AI generates structured summary (key points as bullets)
- **Storage**: Same entry contains both:
  - `transcription` (full text)
  - `summary` (structured bullets)
- **Editable**: Nutritionist can review and edit AI output
- **Technical**: Use GPT-4 with custom prompt, store in JSONB

### **REQ-PR-06 | Filters, Search, and Actions**
- **Requirement**: Advanced filtering and search capabilities
- **Filters**:
  - Date range (from/to)
  - Keyword search (full-text)
  - Entry type (consultation/call/question/note)
  - Tags/actions (see REQ-PR-07)
- **Behavior**: Real-time list updates (UX)
- **Technical**: PostgreSQL full-text search with tsvector

### **REQ-PR-07 | Tasks / Next Steps (Checklist)**
- **Requirement**: Each entry can contain actionable tasks
- **Features**:
  - Checkable items (checkbox UI)
  - Status: open / completed
  - Creation date and completion date
- **Aggregated view**: "Open tasks" counter and list per patient
- **Technical**: Store tasks as JSONB array with status tracking

### **UI/UX Requirements (Lucas Ferreira)**
- Timeline layout with expandable cards
- Skeleton loading states
- Inline editing for quick updates
- Filter panel (collapsible on mobile)
- Color-coded entry types
- Dark mode support

---

## 🧪 MODULE 2: EXAMES LABORATORIAIS (LAB RESULTS)

### **Objective**
Convert uploaded lab results (PDFs) into structured database records for temporal comparison, maintaining original files and ensuring data quality through validation.

### **REQ-EX-01 | Upload**
- **Requirement**: Allow PDF/image upload of lab results
- **Metadata** (per upload):
  - Exam date (extracted or manually entered)
  - Laboratory name (if available)
  - Observations (optional text)
  - Detected language (PT/DE/EN)
- **Storage**: Save original file (link to file storage)
- **Technical**: Use Supabase Storage or similar, store URL in database

### **REQ-EX-02 | AI: Multilingual Extraction**
- **Requirement**: AI must extract values from exams in PT, DE, or EN
- **Mapping**:
  - Canonical name (normalized, e.g., "Colesterol Total")
  - Raw name (as appears in document, e.g., "Cholesterol, Total")
  - Unit (mg/dL, mmol/L, etc.)
  - Value (numeric)
- **Technical**: Use GPT-4 Vision for OCR + extraction, language detection

### **REQ-EX-03 | Database Structure**
- **Entities**:
  - `ExamUpload` (document metadata + file URL)
  - `ExamResult` (individual biomarker results)
- **Relationship**: `ExamUpload` → multiple `ExamResult` records
- **Fields** (ExamResult):
  - exam_name (canonical)
  - raw_name (as extracted)
  - value (numeric)
  - unit (string)
  - reference_range (string or JSONB)
  - upload_id (foreign key)
  - date (exam date)
- **Technical**: See database schema section below

### **REQ-EX-04 | Canonical Exam List + Technical Names**
- **Requirement**: Maintain a master list of exams with synonyms
- **Fields**:
  - Common name (e.g., "Colesterol")
  - Technical name (e.g., "Colesterol Total Sérico")
  - Synonyms (PT/DE/EN arrays)
- **Behavior**: Auto-map extracted names to canonical exams
- **Technical**: Separate `ExamCanonical` table with fuzzy matching

### **REQ-EX-05 | Partial Filling (Gaps Allowed)**
- **Requirement**: Lab reports may contain only subset of exams
- **Behavior**:
  - Save only found biomarkers
  - Display "missing" status for canonical exams not in report
- **Technical**: Left join canonical list with patient results

### **REQ-EX-06 | Consolidated Table (Exam × Date)**
- **Requirement**: Display consolidated view
- **Layout**:
  - Rows = canonical exams
  - Columns = dates (chronological)
  - Cells = value + unit
- **Behavior**: Add new columns as new uploads are processed
- **Technical**: Pivot query or client-side transformation

### **REQ-EX-07 | Quality Control (Mandatory)**
- **Requirement**: Validation screen after AI extraction
- **Features**:
  - Show confidence level per line (high/medium/low)
  - Allow manual correction of:
    - Exam name mapping
    - Value
    - Unit
    - Date
- **Workflow**: Only "confirmed" results enter as "validated"
- **Audit**: Track who validated and when
- **Technical**: Validation status enum, audit trail table

### **REQ-EX-08 | Time Series Support**
- **Requirement**: Support multiple values per exam over time
- **Behavior**: Allow multiple results on same day (different uploads)
- **Technical**: Composite key or unique constraint relaxation

### **REQ-EX-09 | Charts**
- **Requirement**: Generate time-series charts per exam
- **Features**:
  - X-axis = dates
  - Y-axis = value
  - Exam selector (dropdown/search)
  - Toggle: validated only vs. all results
- **Technical**: Use Recharts library, filter by validation status

### **UI/UX Requirements (Lucas Ferreira)**
- Three tabs: Uploads | Database | Charts
- Validation screen with confidence indicators
- Inline editing in consolidated table
- Responsive chart with zoom/pan
- Export to PDF/Excel

---

## 📏 MODULE 3: ANTROPOMETRIA (ANTHROPOMETRY)

### **Objective**
Record body measurements per consultation and automatically calculate BMI.

### **REQ-AN-01 | Measurement Recording**
- **Requirement**: Record measurements by date/session
- **Fields**:
  - Weight (kg)
  - Height (cm)
  - Bone measurements (optional)
  - Circumferences (optional)
  - Skinfolds (optional)
  - Other data (extensible field)
- **Technical**: Link to consultation or standalone date

### **REQ-AN-02 | Additional Fields**
- **Requirement**: Common anthropometric fields
- **Fields**:
  - Hip, waist, arm, thigh, calf (circumferences in cm)
  - Body fat percentage (if measured)
  - Lean mass (if measured)
  - Nutritionist observations (text)
  - Data source: measured / patient-reported
- **Technical**: Store in JSONB for flexibility

### **REQ-AN-03 | Automatic BMI Calculation**
- **Formula**: BMI = weight(kg) / height(m)²
- **Display**: Show BMI in record and in chart (trend over time)
- **Technical**: Calculate on save, store calculated value

### **UI/UX Requirements (Lucas Ferreira)**
- Table view by date + card for latest measurement
- Charts: weight and BMI over time (dual-axis option)
- Quick add form with auto-save
- Mobile-friendly input (numeric keyboards)

---

## ⚡ MODULE 4: CÁLCULO ENERGÉTICO (ENERGY CALCULATION)

### **Objective**
Calculate energy expenditure/needs using multiple formulas with full transparency of calculation process.

### **REQ-CE-01 | Formula Selection**
- **Requirement**: User selects formula from list
- **Formulas**:
  - Harris-Benedict 1984
  - Harris-Benedict 2019
  - Mifflin 1990 (obesity)
  - Mifflin 1990 (overweight)
  - GET (Total Energy Expenditure) "pocket formula"
- **Technical**: Enum or formula registry

### **REQ-CE-02 | Calculation Transparency**
- **Requirement**: Display full calculation breakdown
- **Show**:
  - Formula used (text/LaTeX)
  - Input variables (weight, height, age, sex, activity level)
  - Step-by-step calculation
  - Final result (kcal/day)
  - Reference/source (link or citation)
- **Technical**: Store calculation audit trail

### **REQ-CE-03 | History**
- **Requirement**: Save calculation history per patient
- **Fields**:
  - Calculation date
  - Formula used
  - Inputs (JSONB)
  - Result (numeric)
- **Feature**: Compare results between formulas on same date
- **Technical**: Use existing `CalcAudit` table

### **UI/UX Requirements (Lucas Ferreira)**
- Formula selector with descriptions
- Expandable calculation details
- Side-by-side comparison view
- Export to PDF

---

## 🍽️ MODULE 5: PLANO ALIMENTAR (MEAL PLAN)

### **Objective**
Build meal plans using nutritional tables (BR + DE) with proportional calculation and full traceability.

### **REQ-PA-01 | Table Selection**
- **Requirement**: User selects nutritional database
- **Supported Tables**:
  - **Brazil**:
    - TBCA 7.2 (tbca.net.br)
    - TACO (CFN)
    - Tucunduva (if accessible)
  - **Germany**:
    - BLS (Bundeslebensmittelschlüssel)
- **Technical**: Multi-source database architecture (see schema below)

### **REQ-PA-02 | Multi-Table Database Strategy**
- **Requirement**: Support multiple nutritional databases
- **Entities**:
  - `FoodItem` (canonical food)
  - `FoodAlias` (names by language and table)
  - `Nutrient` (code, name, unit)
  - `FoodNutrientValue` (per 100g, by table, by version)
  - `Source/Reference` (data origin)
- **Feature**: Compare values between tables for same food
- **Technical**: See database schema section

### **REQ-PA-03 | Food Search**
- **Requirement**: Search by name, synonyms, category
- **Languages**: PT/DE/EN
- **Display**: Show match with origin (TBCA/TACO/BLS)
- **Technical**: Full-text search with language-specific stemming

### **REQ-PA-04 | Calculation: 100g → Portion**
- **Requirement**: Base values are per 100g, recalculate for portion
- **Example**: TACO provides values per 100g
- **Calculation**:
  - Input: 50g portion
  - Factor: 50/100 = 0.5
  - Output: value × 0.5
- **Apply to**: Macros (carbs, protein, fat), vitamins, minerals
- **Display**: Show calculation breakdown
- **Technical**: Client-side or server-side calculation with audit

### **REQ-PA-05 | Transparency and Reference**
- **Requirement**: For each food in plan, show:
  - Table used (TBCA/TACO/BLS)
  - Version (when available)
  - Reference/source (citation)
- **Export**: Maintain traceability in PDF
- **Technical**: Store source metadata with each meal plan item

### **REQ-PA-06 | Output**
- **Requirement**: Display meal plan with totals
- **Views**:
  - By food (list)
  - By meal (breakfast, lunch, dinner, snacks)
  - Daily totals
- **Totals**: Per food, per meal, per day
- **Export**: PDF with full details
- **Technical**: Aggregation queries, PDF generation library

### **UI/UX Requirements (Lucas Ferreira)**
- Food search with autocomplete
- Drag-and-drop meal organization
- Real-time macro totals
- Visual macro balance (pie chart)
- Print-friendly layout

---

## 💊 MODULE 6: PRESCRIÇÃO (PRESCRIPTION)

### **Objective**
Generate prescriptions on letterhead with product catalog and AI → review → send workflow.

### **REQ-PS-01 | Letterhead Configuration**
- **Requirement**: Configurable letterhead template
- **Settings**:
  - Logo upload
  - Professional data: Name, CRN (license number), phone, address, etc.
  - Multiple layout templates
  - Default template selection
- **Technical**: Store in tenant settings, use in PDF generation

### **REQ-PS-02 | Document Generation**
- **Requirement**: AI generates draft, nutritionist reviews
- **Workflow**:
  1. AI generates prescription draft
  2. Nutritionist reviews and edits
  3. Finalize and generate PDF
- **Technical**: Editable rich text editor, version control

### **REQ-PS-03 | Prescription Content**
- **Requirement**: Support multiple product types
- **Types**:
  - Supplements
  - Phytotherapics (herbal)
  - Tinctures
  - Probiotics
  - Prebiotics
- **Technical**: Product type enum, flexible schema

### **REQ-PS-04 | Outputs and Sending**
- **Requirement**: After review, generate and send
- **Actions**:
  - Generate PDF for download
  - Send PDF to patient (email/app)
  - Send notification to patient
- **Technical**: PDF generation, email service, push notifications

### **REQ-PS-05 | Product Database**
- **Requirement**: Catalog of products for quick insertion
- **Fields**:
  - Name
  - Photo (image upload)
  - Information (rich text)
  - Purchase links (Amazon, Sunday, etc.)
- **Quick insert**: Paste link (e.g., Amazon), system extracts data and image
- **Manual edit**: Allow adjustments
- **Technical**: Web scraping or manual entry, image storage

### **REQ-PS-06 | Quick Selection in Prescription**
- **Requirement**: Select product from catalog
- **Behavior**:
  - Auto-insert name
  - Display photo inline
  - Include link (optional in document or as attachment)
- **Technical**: Product picker component, rich text embedding

### **UI/UX Requirements (Lucas Ferreira)**
- WYSIWYG editor for prescription
- Product catalog with search
- Preview before PDF generation
- Mobile-responsive PDF viewer
- Send confirmation with tracking

---

## 📚 MODULE 7: EXTRAS (SHAREABLE CONTENT + PROTOCOLS + EXAM REQUESTS)

### **7.1 Recipes**

#### **REQ-EXTRA-RC-01 | Recipe Library**
- **Requirement**: Store nutritionist's favorite recipes
- **Features**:
  - Share with patients (multi-select)
  - Track what was shared and when
- **Technical**: Recipe sharing table with timestamps

#### **REQ-EXTRA-RC-02 | AI Recipe Generation**
- **Requirement**: AI generates new recipes on command
- **Workflow**:
  1. Nutritionist provides inputs (ingredients, macros, restrictions)
  2. AI generates recipe
  3. Nutritionist reviews before saving/sharing
- **Technical**: GPT-4 with recipe prompt, editable output

### **7.2 Orientations (Designed Info Sheets)**

#### **REQ-EXTRA-OR-01 | Info Sheets**
- **Requirement**: Single-page orientations (lifestyle, behavior)
- **Format**: "Lâmina" (info sheet)
- **Technical**: Template-based design system

#### **REQ-EXTRA-OR-02 | Visual Quality**
- **Requirement**: Beautiful, well-designed sheets
- **Features**:
  - AI can generate graphic elements/images
  - Text is controlled by nutritionist (AI auto-populate + edit)
- **Technical**: Design templates, AI image generation, text editor

### **7.3 eBooks**

#### **REQ-EXTRA-EB-01 | eBook Upload**
- **Requirement**: Upload and share eBooks with patients
- **Features**:
  - Multi-select patients
  - Track: what was sent, when, to whom
- **Technical**: File storage, sharing log table

### **7.4 Food Lists**

#### **REQ-EXTRA-AL-01 | Condition-Based Food Lists**
- **Requirement**: Generate food lists considering patient conditions
- **Structure**: Categorized by app-defined classifications
- **Technical**: Filter foods by condition tags, generate PDF

### **7.5 Protocol (AI + Dual Versions)**

#### **REQ-EXTRA-PRT-01 | AI Protocol Generation**
- **Requirement**: Generate protocol sequence by diagnosis
- **Inputs**: Patient history, medical record, exam results
- **Outputs**:
  - **Full version** (for nutritionist): detailed, clinical
  - **Compact version** (for patient): simplified, actionable
- **Technical**: GPT-4 with dual prompt templates

### **7.6 Exam Requests (Letterhead + Languages)**

#### **REQ-EXTRA-EXR-01 | Exam Selection**
- **Requirement**: Nutritionist selects exams from list
- **Output**: Document on professional letterhead
- **Technical**: Exam request template, PDF generation

#### **REQ-EXTRA-EXR-02 | Language and Export**
- **Requirement**: Select document language: PT or DE
- **Actions**:
  - Export PDF
  - Send to patient as PDF
- **Technical**: Multilingual templates, PDF generation

---

## 🗄️ DATABASE SCHEMA (MINIMAL FOR START)

### **Exams Module**

```sql
-- Exam uploads (original documents)
CREATE TABLE exam_uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES "Tenant"(id),
  patient_id UUID NOT NULL REFERENCES "Patient"(id),
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  exam_date DATE NOT NULL,
  lab_name TEXT,
  observations TEXT,
  detected_language VARCHAR(5), -- 'pt', 'de', 'en'
  uploaded_by UUID NOT NULL REFERENCES "User"(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Canonical exam list (master reference)
CREATE TABLE exam_canonical (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  common_name TEXT NOT NULL, -- e.g., "Colesterol"
  technical_name TEXT, -- e.g., "Colesterol Total Sérico"
  category TEXT, -- e.g., "Lipid Panel"
  synonyms_pt TEXT[], -- Portuguese synonyms
  synonyms_de TEXT[], -- German synonyms
  synonyms_en TEXT[], -- English synonyms
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Extracted exam results
CREATE TABLE exam_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES "Tenant"(id),
  patient_id UUID NOT NULL REFERENCES "Patient"(id),
  upload_id UUID NOT NULL REFERENCES exam_uploads(id) ON DELETE CASCADE,
  canonical_exam_id UUID REFERENCES exam_canonical(id),
  raw_name TEXT NOT NULL, -- As extracted from document
  value DECIMAL(10,4),
  unit TEXT,
  reference_range TEXT, -- e.g., "150-200 mg/dL"
  is_abnormal BOOLEAN DEFAULT false,
  confidence_level VARCHAR(10), -- 'high', 'medium', 'low'
  validation_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'validated', 'rejected'
  validated_by UUID REFERENCES "User"(id),
  validated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_exam_results_patient_date ON exam_results(patient_id, created_at DESC);
CREATE INDEX idx_exam_results_upload ON exam_results(upload_id);
CREATE INDEX idx_exam_results_canonical ON exam_results(canonical_exam_id);
```

### **Food Tables Module**

```sql
-- Food items (canonical, multi-source)
CREATE TABLE food_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES "Tenant"(id),
  canonical_name TEXT NOT NULL,
  food_group VARCHAR(50), -- 'grains', 'protein', 'vegetables', etc.
  region_tag VARCHAR(10), -- 'BR', 'DE', 'GLOBAL'
  is_generic BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Food aliases (names by language and source)
CREATE TABLE food_aliases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  food_id UUID NOT NULL REFERENCES food_items(id) ON DELETE CASCADE,
  alias TEXT NOT NULL,
  locale VARCHAR(5) NOT NULL, -- 'pt-BR', 'de-DE', 'en-US'
  source_table VARCHAR(50), -- 'TBCA', 'TACO', 'BLS', 'Tucunduva'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(food_id, alias, locale, source_table)
);

-- Nutrient definitions
CREATE TABLE nutrients (
  code VARCHAR(50) PRIMARY KEY, -- 'energy_kcal', 'protein_g', etc.
  name_pt TEXT NOT NULL,
  name_de TEXT,
  name_en TEXT,
  unit VARCHAR(20) NOT NULL, -- 'kcal', 'g', 'mg', etc.
  category VARCHAR(50) -- 'macronutrient', 'vitamin', 'mineral'
);

-- Dataset releases (versioning for nutritional tables)
CREATE TABLE dataset_releases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES "Tenant"(id),
  region VARCHAR(10) NOT NULL, -- 'BR', 'DE'
  source_name VARCHAR(50) NOT NULL, -- 'TBCA', 'TACO', 'BLS', 'Tucunduva'
  version_label TEXT NOT NULL, -- '7.2', '4th edition', '4.0'
  published_at DATE,
  status VARCHAR(20) DEFAULT 'published', -- 'draft', 'validated', 'published', 'archived'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Food nutrient values (per 100g, by source and version)
CREATE TABLE food_nutrient_values (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES "Tenant"(id),
  food_id UUID NOT NULL REFERENCES food_items(id) ON DELETE CASCADE,
  nutrient_code VARCHAR(50) NOT NULL REFERENCES nutrients(code),
  per_100g_value DECIMAL(10,4) NOT NULL,
  dataset_release_id UUID NOT NULL REFERENCES dataset_releases(id),
  quality_flag VARCHAR(20) DEFAULT 'verified', -- 'verified', 'estimated', 'incomplete'
  source_reference TEXT, -- Citation or URL
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(food_id, nutrient_code, dataset_release_id)
);

-- Indexes
CREATE INDEX idx_food_aliases_search ON food_aliases USING GIN(to_tsvector('portuguese', alias));
CREATE INDEX idx_food_nutrient_values_food ON food_nutrient_values(food_id, dataset_release_id);
```

### **Prescription Module**

```sql
-- Letterhead configurations
CREATE TABLE letterhead_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES "Tenant"(id),
  name TEXT NOT NULL,
  logo_url TEXT,
  professional_name TEXT NOT NULL,
  license_number TEXT, -- CRN, etc.
  phone TEXT,
  email TEXT,
  address TEXT,
  layout_template VARCHAR(50) DEFAULT 'default',
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Product catalog
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES "Tenant"(id),
  name TEXT NOT NULL,
  product_type VARCHAR(50), -- 'supplement', 'phytotherapic', 'probiotic', etc.
  photo_url TEXT,
  description TEXT,
  purchase_links JSONB, -- [{"platform": "Amazon", "url": "..."}]
  created_by UUID NOT NULL REFERENCES "User"(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Prescriptions
CREATE TABLE prescriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES "Tenant"(id),
  patient_id UUID NOT NULL REFERENCES "Patient"(id),
  letterhead_config_id UUID REFERENCES letterhead_configs(id),
  content JSONB NOT NULL, -- Rich text content
  status VARCHAR(20) DEFAULT 'draft', -- 'draft', 'reviewed', 'sent'
  pdf_url TEXT,
  created_by UUID NOT NULL REFERENCES "User"(id),
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Prescription items (products)
CREATE TABLE prescription_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prescription_id UUID NOT NULL REFERENCES prescriptions(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  product_name TEXT NOT NULL, -- Denormalized for historical accuracy
  dosage TEXT,
  instructions TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_prescriptions_patient ON prescriptions(patient_id, created_at DESC);
CREATE INDEX idx_prescription_items_prescription ON prescription_items(prescription_id);
```

---

## 🎨 UI/UX DESIGN PRINCIPLES (Lucas Ferreira)

### **Visual Design**
- **Color Palette**: Premium emerald green gradient (primary), dark mode support
- **Typography**: Inter or Roboto for body, professional medical aesthetic
- **Spacing**: Consistent 8px grid system
- **Components**: Radix UI primitives, custom styled with Tailwind

### **Layout**
- **Sidebar**: Persistent navigation (Studio view only)
- **Patient Context**: Always visible header with patient info
- **Responsive**: Mobile-first, breakpoints at 640px, 768px, 1024px, 1280px
- **Loading States**: Skeleton UI, optimistic updates where possible

### **Accessibility**
- **WCAG 2.1 AA**: Minimum contrast ratios, keyboard navigation
- **Screen Readers**: Proper ARIA labels, semantic HTML
- **Focus Management**: Visible focus indicators, logical tab order

### **Interactions**
- **Modals**: Use slide-in panels for edits (not blocking modals)
- **Forms**: Inline validation, clear error messages
- **Feedback**: Toast notifications (Sonner), loading spinners
- **Empty States**: Helpful CTAs, illustrations

---

## 🔒 SECURITY & COMPLIANCE (Dr. Sofia Mendes)

### **Data Protection**
- **LGPD/GDPR**: Patient data encryption at rest and in transit
- **Multi-Tenancy**: Row-level security (RLS) in PostgreSQL
- **Audit Trail**: All clinical changes logged (who, what, when)
- **Soft Deletes**: Never hard-delete patient data

### **Authentication & Authorization**
- **Supabase Auth**: Email/password, magic links
- **Role-Based Access Control (RBAC)**:
  - OWNER: Full system access
  - TENANT_ADMIN: Tenant management
  - TEAM (Nutritionist): Patient data access
  - PATIENT: Own data only
- **API Security**: JWT tokens, rate limiting

### **File Storage**
- **Supabase Storage**: Encrypted buckets
- **Access Control**: Signed URLs with expiration
- **File Types**: PDF, images (JPEG, PNG), max 10MB

---

## 🤖 AI CONFIGURATION (Dr. Ana Paula Costa)

### **AI Agents**
1. **Medical Record Transcriber**: Whisper AI + GPT-4 for SOAP notes
2. **Exam Analyzer**: GPT-4 Vision for OCR + extraction
3. **Meal Planner**: GPT-4 with nutritional constraints
4. **Protocol Generator**: GPT-4 with clinical guidelines
5. **Recipe Creator**: GPT-4 with macro targeting

### **Prompt Engineering Principles**
- **Role Definition**: Clear expert persona (e.g., "20-year nutritionist")
- **Context**: Patient conditions, allergies, restrictions
- **Output Format**: Structured JSON or Markdown
- **Safety**: No medical diagnosis, no prescription of medications
- **Language**: Default PT-BR, support DE and EN

### **Cost Optimization**
- **Token Limits**: Set max tokens per request
- **Caching**: Cache common prompts and responses
- **Model Selection**: Use GPT-3.5 for simple tasks, GPT-4 for complex
- **Monitoring**: Track costs per patient, per agent

---

## 🌍 LOCALIZATION (Roberto Silva)

### **Primary Language**: Portuguese (Brazil)
- **Medical Terminology**: Use Brazilian clinical standards
- **Food Names**: Regional Brazilian names (e.g., "abobrinha" not "courgette")
- **Date/Time**: DD/MM/YYYY, 24-hour format
- **Currency**: R$ (Brazilian Real)

### **Secondary Language**: German
- **Food Tables**: BLS (German nutritional database)
- **Medical Terms**: German clinical terminology
- **Date/Time**: DD.MM.YYYY, 24-hour format
- **Currency**: € (Euro)

### **Translation Strategy**
- **i18n Library**: Use Next.js i18n or react-i18next
- **File Structure**: `/src/i18n/pt-BR.ts`, `/src/i18n/de-DE.ts`
- **Dynamic Content**: Store translations in database for user-generated content

---

## 📊 TECHNICAL STACK

### **Frontend**
- **Framework**: Next.js 16.1.6 (App Router)
- **React**: 19.2.3
- **TypeScript**: 5.x
- **Styling**: Tailwind CSS 3.4.17
- **UI Components**: Radix UI
- **Charts**: Recharts 3.7.0
- **Forms**: React Hook Form + Zod validation
- **State**: React Context + Server Actions

### **Backend**
- **Database**: PostgreSQL (Supabase)
- **ORM**: Prisma 5.22.0
- **Authentication**: Supabase Auth
- **File Storage**: Supabase Storage
- **API**: Next.js API Routes (Server Actions)

### **AI/ML**
- **OpenAI**: GPT-4, GPT-4 Vision, Whisper
- **Anthropic**: Claude (optional)
- **Libraries**: `openai` 6.17.0, `@anthropic-ai/sdk` 0.72.1

### **Deployment**
- **Platform**: Vercel
- **CI/CD**: GitHub Actions
- **Monitoring**: Vercel Analytics
- **Error Tracking**: Sentry (optional)

---

## 📈 IMPLEMENTATION PHASES

### **Phase 1: Foundation (Week 1-2)**
- Set up database schema (Exams, Food Tables, Prescription)
- Implement sidebar navigation with patient context
- Create base layouts and components

### **Phase 2: Core Modules (Week 3-5)**
- Prontuário (Medical Record)
- Exames (Lab Results with AI extraction)
- Antropometria (Anthropometry)

### **Phase 3: Advanced Features (Week 6-8)**
- Cálculo Energético (Energy Calculation)
- Plano Alimentar (Meal Plan with multi-source tables)
- Prescrição (Prescription with AI)

### **Phase 4: Extras & Polish (Week 9-10)**
- Recipes, Orientations, eBooks
- Protocol Generator
- Exam Requests
- Full localization (PT-BR + DE)

### **Phase 5: Testing & Deployment (Week 11-12)**
- End-to-end testing
- Performance optimization
- Security audit
- Production deployment

---

## ✅ ACCEPTANCE CRITERIA

### **Functionality**
- ✅ All modules accessible via sidebar navigation
- ✅ Patient context persists across navigation
- ✅ AI extraction accuracy ≥ 90% for exam results
- ✅ Meal plans calculate correctly with multi-source data
- ✅ Prescriptions generate valid PDFs on letterhead

### **Performance**
- ✅ Page load time \< 2 seconds
- ✅ AI response time \< 10 seconds
- ✅ Database queries optimized (no N+1)

### **UX/UI**
- ✅ Mobile-responsive (all breakpoints)
- ✅ Dark mode support
- ✅ WCAG 2.1 AA compliance
- ✅ Consistent design system

### **Security**
- ✅ LGPD/GDPR compliant
- ✅ Row-level security (RLS) enabled
- ✅ Audit trail for all clinical changes
- ✅ Encrypted file storage

### **Localization**
- ✅ 100% Portuguese (BR) translation
- ✅ German support for food tables and exam requests
- ✅ Regional food names and medical terminology

---

## 📚 REFERENCES

### **Nutritional Databases**
- **TBCA 7.2**: https://www.tbca.net.br/
- **TACO**: https://cfn.org.br/wp-content/uploads/2017/03/taco_4_edicao_ampliada_e_revisada.pdf
- **BLS 4.0**: https://www.mri.bund.de/en/institutes/nutritional-behaviour/translate-to-english-arbeitsbereiche/german-nutrient-database-bundeslebensmittelschluessel-bl/
- **Tucunduva**: https://www.amazon.com.br/Tabela-Composição-Alimentos-Suporte-Nutricional-ebook/dp/B00ZPP80DY

### **Standards & Compliance**
- **LGPD**: Brazilian General Data Protection Law
- **WCAG 2.1**: Web Content Accessibility Guidelines
- **FHIR**: Fast Healthcare Interoperability Resources (future consideration)

---

## 🎯 SUCCESS METRICS

### **User Adoption**
- 50+ nutritionists onboarded in first 3 months
- 500+ patients managed in system
- 80% daily active user rate (nutritionists)

### **AI Performance**
- 90%+ accuracy on exam extraction
- 95%+ user satisfaction with AI-generated meal plans
- \< 5% AI output rejection rate

### **Business**
- 30% reduction in nutritionist administrative time
- 50% increase in patient engagement
- 90% customer retention rate

---

**END OF PROFESSIONAL PROMPT V1**
