# Database Architecture Enhancement for AI-Driven Multi-Tenant Nutrition Platform

## Executive Summary

This document proposes comprehensive database enhancements to support:
1. **15 AI Agents** for automated workflows
2. **Advanced Multi-Tenancy** with enterprise features
3. **Middleware & Integration** capabilities
4. **Competitive Features** from top nutrition apps (WebDiet, MyFitnessPal, Cronometer, Lifesum)

---

## Part 1: 15 AI Agents - Definitions & Database Requirements

### 1. **AI Agent: Exam Analyzer (Analisador de Exames)**
**Purpose:** Automatically extract, interpret, and track lab results from uploaded PDFs/images

**Capabilities:**
- OCR extraction of blood work, biomarkers, hormones
- Trend analysis over time
- Flag abnormal values
- Suggest nutritional interventions

**Database Requirements:**
```prisma
model LabExam {
  id                String   @id @default(uuid()) @db.Uuid
  tenant_id         String   @db.Uuid
  patient_id        String   @db.Uuid
  exam_type         ExamType
  exam_date         DateTime @db.Timestamptz(6)
  file_url          String?
  raw_ocr_text      String?
  extracted_data    Json     // Structured biomarker data
  ai_interpretation Json?    // AI analysis
  ai_confidence     Float?
  flagged_values    Json?    // Abnormal markers
  created_at        DateTime @default(now())
  
  @@index([patient_id, exam_date])
}

model Biomarker {
  id              String   @id @default(uuid()) @db.Uuid
  exam_id         String   @db.Uuid
  marker_name     String
  value           Decimal  @db.Decimal
  unit            String
  reference_min   Decimal? @db.Decimal
  reference_max   Decimal? @db.Decimal
  is_abnormal     Boolean  @default(false)
  ai_suggestion   String?
  
  @@index([exam_id, marker_name])
}

enum ExamType {
  blood_work
  hormonal
  metabolic
  vitamin_panel
  allergy_test
  genetic
  other
}
```

---

### 2. **AI Agent: Medical Record Creator (Criador de Prontuário)**
**Purpose:** Auto-generate comprehensive patient records from consultations

**Capabilities:**
- Transcribe consultation audio
- Extract SOAP notes (Subjective, Objective, Assessment, Plan)
- Auto-populate anamnesis forms
- Generate consultation summaries

**Database Requirements:**
```prisma
model MedicalRecord {
  id                  String   @id @default(uuid()) @db.Uuid
  tenant_id           String   @db.Uuid
  patient_id          String   @db.Uuid
  consultation_id     String?  @db.Uuid
  record_type         RecordType
  audio_url           String?
  transcript          String?
  soap_notes          Json?    // {subjective, objective, assessment, plan}
  ai_summary          String?
  extracted_symptoms  String[]
  extracted_goals     String[]
  next_steps          Json?
  created_by          String   @db.Uuid
  created_at          DateTime @default(now())
  
  @@index([patient_id, created_at])
}

enum RecordType {
  initial_consultation
  follow_up
  emergency
  phone_call
  video_call
  ai_generated
}
```

---

### 3. **AI Agent: Protocol Generator (Gerador de Protocolos)**
**Purpose:** Create personalized nutrition protocols based on conditions

**Capabilities:**
- Analyze patient conditions, exams, symptoms
- Generate FODMAP, elimination, or custom protocols
- Auto-adjust phases based on progress
- Suggest food swaps

**Database Requirements:**
```prisma
model AIProtocolGeneration {
  id                String   @id @default(uuid()) @db.Uuid
  tenant_id         String   @db.Uuid
  patient_id        String   @db.Uuid
  input_data        Json     // Conditions, exams, symptoms
  generated_protocol_id String? @db.Uuid
  ai_reasoning      String?
  confidence_score  Float?
  approved_by       String?  @db.Uuid
  approved_at       DateTime? @db.Timestamptz(6)
  created_at        DateTime @default(now())
  
  @@index([patient_id, created_at])
}

// Enhance existing Protocol model
model Protocol {
  // ... existing fields ...
  ai_generated      Boolean  @default(false)
  generation_id     String?  @db.Uuid
  ai_reasoning      String?
}
```

---

### 4. **AI Agent: Patient Analyzer (Analisador de Pacientes)**
**Purpose:** Continuous monitoring and predictive analytics

**Capabilities:**
- Adherence scoring
- Progress prediction
- Risk detection (dropout, non-compliance)
- Personalized intervention suggestions

**Database Requirements:**
```prisma
model PatientAnalysis {
  id                    String   @id @default(uuid()) @db.Uuid
  tenant_id             String   @db.Uuid
  patient_id            String   @db.Uuid
  analysis_date         DateTime @default(now()) @db.Timestamptz(6)
  adherence_score       Float?   // 0-100
  progress_score        Float?   // 0-100
  dropout_risk          RiskLevel
  intervention_needed   Boolean  @default(false)
  ai_insights           Json?
  recommended_actions   Json?
  
  @@index([patient_id, analysis_date])
}

enum RiskLevel {
  low
  medium
  high
  critical
}
```

---

### 5. **AI Agent: Meal Planner (Planejador de Refeições)**
**Purpose:** Auto-generate meal plans based on goals, preferences, and constraints

**Capabilities:**
- Generate weekly meal plans
- Balance macros automatically
- Consider allergies, preferences, budget
- Swap meals intelligently

**Database Requirements:**
```prisma
model AIMealPlan {
  id                String   @id @default(uuid()) @db.Uuid
  tenant_id         String   @db.Uuid
  patient_id        String   @db.Uuid
  plan_id           String?  @db.Uuid
  generation_params Json     // Goals, constraints, preferences
  generated_meals   Json     // Full week structure
  macro_distribution Json
  estimated_cost    Decimal? @db.Decimal
  ai_reasoning      String?
  approved_by       String?  @db.Uuid
  created_at        DateTime @default(now())
  
  @@index([patient_id, created_at])
}
```

---

### 6. **AI Agent: Food Recognition (Reconhecimento de Alimentos)**
**Purpose:** Identify foods from photos and estimate portions

**Capabilities:**
- Image recognition
- Portion size estimation
- Nutritional calculation
- Meal logging automation

**Database Requirements:**
```prisma
model FoodRecognition {
  id                String   @id @default(uuid()) @db.Uuid
  tenant_id         String   @db.Uuid
  patient_id        String   @db.Uuid
  image_url         String
  recognized_foods  Json     // [{food_id, confidence, portion_grams}]
  ai_model_version  String
  confidence_score  Float
  user_confirmed    Boolean  @default(false)
  corrections       Json?
  created_at        DateTime @default(now())
  
  @@index([patient_id, created_at])
}
```

---

### 7. **AI Agent: Symptom Correlator (Correlacionador de Sintomas)**
**Purpose:** Find patterns between foods and symptoms

**Capabilities:**
- Statistical correlation analysis
- Trigger food identification
- Pattern recognition over time
- Predictive symptom alerts

**Database Requirements:**
```prisma
model SymptomCorrelation {
  id                  String   @id @default(uuid()) @db.Uuid
  tenant_id           String   @db.Uuid
  patient_id          String   @db.Uuid
  food_id             String   @db.Uuid
  symptom_type        SymptomType
  correlation_score   Float    // -1 to 1
  occurrences         Int
  confidence_level    Float
  time_window_hours   Int      // Typical delay
  ai_analysis         Json?
  created_at          DateTime @default(now())
  
  @@unique([patient_id, food_id, symptom_type])
  @@index([patient_id, correlation_score])
}
```

---

### 8. **AI Agent: Recipe Creator (Criador de Receitas)**
**Purpose:** Generate custom recipes based on constraints

**Capabilities:**
- Create recipes from available ingredients
- Match macro targets
- Consider dietary restrictions
- Generate cooking instructions

**Database Requirements:**
```prisma
model AIRecipeGeneration {
  id                String   @id @default(uuid()) @db.Uuid
  tenant_id         String   @db.Uuid
  recipe_id         String?  @db.Uuid
  input_constraints Json     // Macros, ingredients, restrictions
  generated_recipe  Json
  ai_model_version  String
  user_rating       Int?     // 1-5
  approved_by       String?  @db.Uuid
  created_at        DateTime @default(now())
  
  @@index([tenant_id, created_at])
}
```

---

### 9. **AI Agent: Nutrition Coach (Coach Nutricional)**
**Purpose:** Provide personalized daily guidance and motivation

**Capabilities:**
- Daily tips and reminders
- Motivational messages
- Answer patient questions
- Behavioral nudges

**Database Requirements:**
```prisma
model AICoachingMessage {
  id                String   @id @default(uuid()) @db.Uuid
  tenant_id         String   @db.Uuid
  patient_id        String   @db.Uuid
  message_type      CoachMessageType
  content           String
  context_data      Json?    // What triggered this message
  sent_at           DateTime @default(now())
  read_at           DateTime? @db.Timestamptz(6)
  patient_response  String?
  effectiveness_score Float?
  
  @@index([patient_id, sent_at])
}

enum CoachMessageType {
  daily_tip
  motivational
  reminder
  celebration
  intervention
  educational
  qa_response
}
```

---

### 10. **AI Agent: Supplement Advisor (Consultor de Suplementos)**
**Purpose:** Recommend supplements based on deficiencies and goals

**Capabilities:**
- Analyze nutrient gaps
  - Suggest supplements
- Dosage recommendations
- Interaction warnings

**Database Requirements:**
```prisma
model SupplementRecommendation {
  id                String   @id @default(uuid()) @db.Uuid
  tenant_id         String   @db.Uuid
  patient_id        String   @db.Uuid
  supplement_name   String
  dosage            String
  frequency         String
  reason            String   // Why recommended
  based_on_data     Json     // Exams, diet analysis
  ai_confidence     Float
  approved_by       String?  @db.Uuid
  started_at        DateTime? @db.Timestamptz(6)
  ended_at          DateTime? @db.Timestamptz(6)
  created_at        DateTime @default(now())
  
  @@index([patient_id, created_at])
}

model SupplementInteraction {
  id                String   @id @default(uuid()) @db.Uuid
  supplement_a      String
  supplement_b      String
  interaction_type  InteractionType
  severity          Severity
  description       String
  
  @@unique([supplement_a, supplement_b])
}

enum InteractionType {
  enhances
  reduces
  contraindicated
  neutral
}
```

---

### 11. **AI Agent: Shopping List Generator (Gerador de Lista de Compras)**
**Purpose:** Create optimized shopping lists from meal plans

**Capabilities:**
- Aggregate ingredients from meal plans
- Optimize quantities
- Categorize by store section
- Estimate costs

**Database Requirements:**
```prisma
model ShoppingList {
  id                String   @id @default(uuid()) @db.Uuid
  tenant_id         String   @db.Uuid
  patient_id        String   @db.Uuid
  plan_id           String?  @db.Uuid
  items             Json     // [{food, quantity, category, estimated_cost}]
  total_estimated_cost Decimal? @db.Decimal
  ai_optimized      Boolean  @default(false)
  created_at        DateTime @default(now())
  completed_at      DateTime? @db.Timestamptz(6)
  
  @@index([patient_id, created_at])
}
```

---

### 12. **AI Agent: Macro Balancer (Balanceador de Macros)**
**Purpose:** Auto-adjust meals to hit macro targets

**Capabilities:**
- Real-time macro tracking
- Suggest portion adjustments
- Recommend food swaps
- Predict end-of-day totals

**Database Requirements:**
```prisma
model MacroAdjustment {
  id                String   @id @default(uuid()) @db.Uuid
  tenant_id         String   @db.Uuid
  patient_id        String   @db.Uuid
  meal_id           String   @db.Uuid
  original_macros   Json
  target_macros     Json
  suggested_changes Json     // [{food_id, from_grams, to_grams, reason}]
  ai_confidence     Float
  user_applied      Boolean  @default(false)
  created_at        DateTime @default(now())
  
  @@index([patient_id, created_at])
}
```

---

### 13. **AI Agent: Report Generator (Gerador de Relatórios)**
**Purpose:** Create comprehensive progress reports

**Capabilities:**
- Aggregate patient data
- Generate visualizations
- Write narrative summaries
- Compare periods

**Database Requirements:**
```prisma
model AIReport {
  id                String   @id @default(uuid()) @db.Uuid
  tenant_id         String   @db.Uuid
  patient_id        String   @db.Uuid
  report_type       ReportType
  period_start      DateTime @db.Timestamptz(6)
  period_end        DateTime @db.Timestamptz(6)
  data_summary      Json
  ai_narrative      String?
  visualizations    Json?    // Chart configs
  insights          Json?
  recommendations   Json?
  generated_at      DateTime @default(now())
  
  @@index([patient_id, generated_at])
}

enum ReportType {
  weekly_progress
  monthly_summary
  quarterly_review
  annual_report
  custom
}
```

---

### 14. **AI Agent: Appointment Scheduler (Agendador Inteligente)**
**Purpose:** Optimize scheduling and send smart reminders

**Capabilities:**
- Predict optimal appointment times
- Auto-reschedule based on patterns
- Send personalized reminders
- Reduce no-shows

**Database Requirements:**
```prisma
model Appointment {
  id                String   @id @default(uuid()) @db.Uuid
  tenant_id         String   @db.Uuid
  patient_id        String   @db.Uuid
  nutritionist_id   String   @db.Uuid
  scheduled_at      DateTime @db.Timestamptz(6)
  duration_minutes  Int
  type              AppointmentType
  status            AppointmentStatus
  ai_suggested      Boolean  @default(false)
  reminder_sent_at  DateTime? @db.Timestamptz(6)
  attended          Boolean?
  no_show_risk      RiskLevel?
  created_at        DateTime @default(now())
  
  @@index([patient_id, scheduled_at])
  @@index([nutritionist_id, scheduled_at])
}

enum AppointmentType {
  initial
  follow_up
  emergency
  video_call
  phone_call
}

enum AppointmentStatus {
  scheduled
  confirmed
  completed
  cancelled
  no_show
  rescheduled
}
```

---

### 15. **AI Agent: Content Educator (Educador de Conteúdo)**
**Purpose:** Deliver personalized educational content

**Capabilities:**
- Curate relevant articles/videos
- Create custom educational materials
- Quiz generation
- Track learning progress

**Database Requirements:**
```prisma
model EducationalContent {
  id                String   @id @default(uuid()) @db.Uuid
  tenant_id         String   @db.Uuid
  title             String
  content_type      ContentType
  content_url       String?
  content_text      String?
  topics            String[] // Tags
  difficulty_level  DifficultyLevel
  ai_generated      Boolean  @default(false)
  created_at        DateTime @default(now())
  
  @@index([tenant_id, topics])
}

model PatientEducation {
  id                String   @id @default(uuid()) @db.Uuid
  patient_id        String   @db.Uuid
  content_id        String   @db.Uuid
  assigned_at       DateTime @default(now())
  viewed_at         DateTime? @db.Timestamptz(6)
  completed_at      DateTime? @db.Timestamptz(6)
  quiz_score        Int?
  ai_recommended    Boolean  @default(false)
  
  @@index([patient_id, assigned_at])
}

enum ContentType {
  article
  video
  infographic
  quiz
  recipe
  guide
}

enum DifficultyLevel {
  beginner
  intermediate
  advanced
}
```

---

## Part 2: Multi-Tenancy Enhancements

### Current Issues:
1. Missing tenant relations in many models
2. No tenant-level settings/configuration
3. No billing/subscription management
4. No team management within tenants

### Proposed Enhancements:

```prisma
// Enhanced Tenant model
model Tenant {
  id                String         @id @default(uuid()) @db.Uuid
  name              String
  type              TenantType
  status            TenantStatus
  created_at        DateTime       @default(now()) @db.Timestamptz(6)
  
  // New fields
  subdomain         String?        @unique
  custom_domain     String?        @unique
  logo_url          String?
  primary_color     String?
  subscription_tier SubscriptionTier @default(free)
  subscription_ends DateTime?      @db.Timestamptz(6)
  max_patients      Int            @default(10)
  max_team_members  Int            @default(1)
  features_enabled  Json?          // Feature flags
  settings          Json?          // Tenant-specific settings
  
  // AI Configuration
  ai_enabled        Boolean        @default(false)
  ai_credits        Int            @default(0)
  ai_usage_limit    Int?
  
  // Relations
  users             User[]
  patients          Patient[]
  teams             Team[]
  billing_history   BillingEvent[]
  api_keys          APIKey[]
}

model Team {
  id                String   @id @default(uuid()) @db.Uuid
  tenant_id         String   @db.Uuid
  name              String
  description       String?
  created_at        DateTime @default(now())
  
  tenant            Tenant   @relation(fields: [tenant_id], references: [id])
  members           TeamMember[]
  
  @@index([tenant_id])
}

model TeamMember {
  id                String   @id @default(uuid()) @db.Uuid
  team_id           String   @db.Uuid
  user_id           String   @db.Uuid
  role              TeamRole
  joined_at         DateTime @default(now())
  
  team              Team     @relation(fields: [team_id], references: [id])
  
  @@unique([team_id, user_id])
}

model BillingEvent {
  id                String   @id @default(uuid()) @db.Uuid
  tenant_id         String   @db.Uuid
  event_type        BillingEventType
  amount            Decimal  @db.Decimal
  currency          String   @default("BRL")
  description       String?
  invoice_url       String?
  payment_method    String?
  status            PaymentStatus
  created_at        DateTime @default(now())
  
  tenant            Tenant   @relation(fields: [tenant_id], references: [id])
  
  @@index([tenant_id, created_at])
}

model APIKey {
  id                String   @id @default(uuid()) @db.Uuid
  tenant_id         String   @db.Uuid
  name              String
  key_hash          String   @unique
  permissions       Json     // Scoped permissions
  last_used_at      DateTime? @db.Timestamptz(6)
  expires_at        DateTime? @db.Timestamptz(6)
  is_active         Boolean  @default(true)
  created_by        String   @db.Uuid
  created_at        DateTime @default(now())
  
  tenant            Tenant   @relation(fields: [tenant_id], references: [id])
  
  @@index([tenant_id])
}

enum SubscriptionTier {
  free
  starter
  professional
  enterprise
  custom
}

enum TeamRole {
  admin
  nutritionist
  assistant
  viewer
}

enum BillingEventType {
  subscription_charge
  ai_credits_purchase
  overage_charge
  refund
}

enum PaymentStatus {
  pending
  completed
  failed
  refunded
}
```

---

## Part 3: Middleware & Integration Layer

### Webhook System

```prisma
model Webhook {
  id                String   @id @default(uuid()) @db.Uuid
  tenant_id         String   @db.Uuid
  name              String
  url               String
  events            WebhookEvent[]
  secret            String   // For signature verification
  is_active         Boolean  @default(true)
  retry_policy      Json?
  created_at        DateTime @default(now())
  
  deliveries        WebhookDelivery[]
  
  @@index([tenant_id])
}

model WebhookDelivery {
  id                String   @id @default(uuid()) @db.Uuid
  webhook_id        String   @db.Uuid
  event_type        WebhookEvent
  payload           Json
  response_status   Int?
  response_body     String?
  attempt_count     Int      @default(1)
  delivered_at      DateTime? @db.Timestamptz(6)
  created_at        DateTime @default(now())
  
  webhook           Webhook  @relation(fields: [webhook_id], references: [id])
  
  @@index([webhook_id, created_at])
}

enum WebhookEvent {
  patient_created
  patient_updated
  meal_logged
  plan_published
  appointment_scheduled
  exam_uploaded
  ai_analysis_completed
}
```

### External Integrations

```prisma
model Integration {
  id                String   @id @default(uuid()) @db.Uuid
  tenant_id         String   @db.Uuid
  provider          IntegrationProvider
  config            Json     // API keys, tokens (encrypted)
  is_active         Boolean  @default(true)
  last_sync_at      DateTime? @db.Timestamptz(6)
  created_at        DateTime @default(now())
  
  sync_logs         IntegrationSyncLog[]
  
  @@unique([tenant_id, provider])
}

model IntegrationSyncLog {
  id                String   @id @default(uuid()) @db.Uuid
  integration_id    String   @db.Uuid
  sync_type         String
  status            SyncStatus
  records_synced    Int      @default(0)
  errors            Json?
  started_at        DateTime @default(now())
  completed_at      DateTime? @db.Timestamptz(6)
  
  integration       Integration @relation(fields: [integration_id], references: [id])
  
  @@index([integration_id, started_at])
}

enum IntegrationProvider {
  google_calendar
  whatsapp_business
  stripe
  mailchimp
  zapier
  fitbit
  apple_health
  google_fit
  my_fitness_pal
}

enum SyncStatus {
  running
  completed
  failed
  partial
}
```

---

## Part 4: Competitive Features from Top Apps

### From WebDiet:
```prisma
// Meal Photo Reactions
model MealReaction {
  id                String   @id @default(uuid()) @db.Uuid
  meal_id           String   @db.Uuid
  patient_id        String   @db.Uuid
  reaction_type     ReactionType
  timing            ReactionTiming
  comment           String?
  created_at        DateTime @default(now())
  
  @@index([meal_id])
}

enum ReactionType {
  very_satisfied
  satisfied
  neutral
  unsatisfied
  very_unsatisfied
}

enum ReactionTiming {
  before_meal
  after_meal
}

// Water Tracking (already in your system, enhance it)
model WaterIntake {
  id                String   @id @default(uuid()) @db.Uuid
  tenant_id         String   @db.Uuid
  patient_id        String   @db.Uuid
  date              DateTime @db.Date
  amount_ml         Int
  logged_at         DateTime @default(now())
  
  @@index([patient_id, date])
}

// Exercise Tracking
model Exercise {
  id                String   @id @default(uuid()) @db.Uuid
  tenant_id         String   @db.Uuid
  patient_id        String   @db.Uuid
  exercise_type     String
  duration_minutes  Int
  intensity         ExerciseIntensity
  calories_burned   Int?
  notes             String?
  logged_at         DateTime @default(now())
  
  @@index([patient_id, logged_at])
}

enum ExerciseIntensity {
  light
  moderate
  vigorous
  very_vigorous
}
```

### From MyFitnessPal:
```prisma
// Barcode Scanner History
model BarcodeScanned {
  id                String   @id @default(uuid()) @db.Uuid
  tenant_id         String   @db.Uuid
  patient_id        String   @db.Uuid
  barcode           String
  food_id           String?  @db.Uuid
  scanned_at        DateTime @default(now())
  
  @@index([patient_id, scanned_at])
}

// Social Features
model PatientConnection {
  id                String   @id @default(uuid()) @db.Uuid
  patient_id        String   @db.Uuid
  connected_patient_id String @db.Uuid
  connection_type   ConnectionType
  status            ConnectionStatus
  created_at        DateTime @default(now())
  
  @@unique([patient_id, connected_patient_id])
}

enum ConnectionType {
  friend
  accountability_partner
  family
}

enum ConnectionStatus {
  pending
  accepted
  blocked
}
```

### From Cronometer:
```prisma
// Micronutrient Tracking (enhance NutrientKey enum)
enum NutrientKey {
  // Macros
  energy_kcal
  protein_g
  carbs_g
  fat_g
  fiber_g
  
  // Vitamins
  vitamin_a_mcg
  vitamin_c_mg
  vitamin_d_mcg
  vitamin_e_mg
  vitamin_k_mcg
  thiamin_mg
  riboflavin_mg
  niacin_mg
  vitamin_b6_mg
  folate_mcg
  vitamin_b12_mcg
  
  // Minerals
  calcium_mg
  iron_mg
  magnesium_mg
  phosphorus_mg
  potassium_mg
  sodium_mg
  zinc_mg
  copper_mg
  selenium_mcg
  
  // Amino Acids
  tryptophan_mg
  leucine_mg
  lysine_mg
  // ... add all essential amino acids
}

// Custom Nutrient Goals
model CustomNutrientGoal {
  id                String   @id @default(uuid()) @db.Uuid
  patient_id        String   @db.Uuid
  nutrient_key      NutrientKey
  target_value      Decimal  @db.Decimal
  min_value         Decimal? @db.Decimal
  max_value         Decimal? @db.Decimal
  created_at        DateTime @default(now())
  
  @@unique([patient_id, nutrient_key])
}
```

### From Lifesum:
```prisma
// Life Score & Habits
model LifeScore {
  id                String   @id @default(uuid()) @db.Uuid
  patient_id        String   @db.Uuid
  date              DateTime @db.Date
  overall_score     Int      // 0-100
  nutrition_score   Int
  hydration_score   Int
  exercise_score    Int
  sleep_score       Int
  stress_score      Int
  calculated_at     DateTime @default(now())
  
  @@unique([patient_id, date])
}

// Intermittent Fasting
model FastingPeriod {
  id                String   @id @default(uuid()) @db.Uuid
  patient_id        String   @db.Uuid
  fasting_type      FastingType
  started_at        DateTime @db.Timestamptz(6)
  planned_end_at    DateTime @db.Timestamptz(6)
  actual_end_at     DateTime? @db.Timestamptz(6)
  completed         Boolean  @default(false)
  
  @@index([patient_id, started_at])
}

enum FastingType {
  intermittent_16_8
  intermittent_18_6
  intermittent_20_4
  alternate_day
  custom
}

// Personalized Meal Plans
model PersonalizedMealPlan {
  id                String   @id @default(uuid()) @db.Uuid
  patient_id        String   @db.Uuid
  diet_type         DietType
  duration_days     Int
  meals_per_day     Int
  generated_by_ai   Boolean  @default(false)
  created_at        DateTime @default(now())
}

enum DietType {
  mediterranean
  keto
  low_carb
  high_protein
  vegan
  vegetarian
  paleo
  fodmap
  custom
}
```

---

## Part 5: AI Infrastructure Tables

### AI Model Management

```prisma
model AIModel {
  id                String   @id @default(uuid()) @db.Uuid
  name              String
  version           String
  model_type        AIModelType
  provider          AIProvider
  endpoint_url      String?
  is_active         Boolean  @default(true)
  performance_metrics Json?
  created_at        DateTime @default(now())
  
  executions        AIExecution[]
  
  @@unique([name, version])
}

model AIExecution {
  id                String   @id @default(uuid()) @db.Uuid
  tenant_id         String   @db.Uuid
  model_id          String   @db.Uuid
  agent_type        AIAgentType
  input_data        Json
  output_data       Json?
  tokens_used       Int?
  execution_time_ms Int?
  cost              Decimal? @db.Decimal
  status            ExecutionStatus
  error_message     String?
  created_at        DateTime @default(now())
  
  model             AIModel  @relation(fields: [model_id], references: [id])
  
  @@index([tenant_id, created_at])
  @@index([agent_type, created_at])
}

enum AIModelType {
  llm
  vision
  speech_to_text
  text_to_speech
  embedding
}

enum AIProvider {
  openai
  anthropic
  google
  azure
  custom
}

enum AIAgentType {
  exam_analyzer
  medical_record_creator
  protocol_generator
  patient_analyzer
  meal_planner
  food_recognition
  symptom_correlator
  recipe_creator
  nutrition_coach
  supplement_advisor
  shopping_list_generator
  macro_balancer
  report_generator
  appointment_scheduler
  content_educator
}

enum ExecutionStatus {
  pending
  running
  completed
  failed
  timeout
}
```

### AI Training & Feedback

```prisma
model AIFeedback {
  id                String   @id @default(uuid()) @db.Uuid
  execution_id      String   @db.Uuid
  user_id           String   @db.Uuid
  rating            Int      // 1-5
  feedback_text     String?
  was_helpful       Boolean
  corrections       Json?    // User corrections to AI output
  created_at        DateTime @default(now())
  
  @@index([execution_id])
}

model AITrainingData {
  id                String   @id @default(uuid()) @db.Uuid
  agent_type        AIAgentType
  input_sample      Json
  expected_output   Json
  source            TrainingSource
  quality_score     Float?
  is_validated      Boolean  @default(false)
  created_at        DateTime @default(now())
  
  @@index([agent_type, is_validated])
}

enum TrainingSource {
  user_feedback
  expert_annotation
  synthetic
  imported
}
```

---

## Part 6: Implementation Priority

### Phase 1 (Immediate - 1-2 months)
1. Multi-tenancy enhancements (Team, Billing, API Keys)
2. AI Infrastructure (AIModel, AIExecution, AIFeedback)
3. Top 3 AI Agents:
   - Food Recognition
   - Meal Planner
   - Patient Analyzer

### Phase 2 (3-4 months)
4. Webhook & Integration system
5. Next 5 AI Agents:
   - Exam Analyzer
   - Medical Record Creator
   - Symptom Correlator
   - Nutrition Coach
   - Report Generator

### Phase 3 (5-6 months)
6. Competitive features (Water, Exercise, Social)
7. Remaining AI Agents
8. Advanced analytics

---

## Part 7: Migration Strategy

### Step 1: Add New Tables (Non-Breaking)
```bash
# Create migration for new tables only
npx prisma migrate dev --name add_ai_infrastructure
```

### Step 2: Add New Fields to Existing Tables
```bash
# Add fields like ai_generated, ai_confidence, etc.
npx prisma migrate dev --name enhance_existing_tables
```

### Step 3: Data Backfill
```typescript
// Backfill script for existing data
// Example: Set ai_generated = false for all existing records
```

### Step 4: Enable Features Gradually
```typescript
// Use feature flags in Tenant.features_enabled
{
  "ai_agents": {
    "food_recognition": true,
    "meal_planner": false,
    // ...
  }
}
```

---

## Conclusion

This enhanced database architecture provides:

✅ **15 AI Agents** with dedicated tables and tracking
✅ **Robust Multi-Tenancy** with billing, teams, and API management
✅ **Middleware Layer** for webhooks and integrations
✅ **Competitive Features** from top nutrition apps
✅ **Scalable AI Infrastructure** for model management and feedback
✅ **Clear Migration Path** with minimal disruption

**Next Steps:**
1. Review and approve this architecture
2. Prioritize features based on business goals
3. Begin Phase 1 implementation
4. Set up AI provider accounts (OpenAI, etc.)
5. Design UI/UX for new features
