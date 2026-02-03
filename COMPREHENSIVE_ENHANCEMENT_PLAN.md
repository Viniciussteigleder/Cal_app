# 🚀 COMPREHENSIVE ENHANCEMENT PLAN - NutriPlan Platform
## Expert-Driven Implementation Strategy

---

## 👥 EXPERT PANEL ASSEMBLY

### **Lead Architect: Dr. Sofia Mendes**
- **Role**: Full-Stack Architecture & System Integration
- **Expertise**: 15+ years in healthcare SaaS, LGPD compliance
- **Responsibility**: Overall system architecture, database design, API integration

### **UX/UI Director: Lucas Ferreira**
- **Role**: User Experience & Interface Design
- **Expertise**: 10+ years in health tech, accessibility specialist (WCAG 2.1 AA)
- **Responsibility**: User flows, visual design, interaction patterns

### **AI/ML Specialist: Dr. Ana Paula Costa**
- **Role**: AI Agent Development & Optimization
- **Expertise**: PhD in Machine Learning, GPT-4 integration expert
- **Responsibility**: AI agent configuration, prompt engineering, cost optimization

### **Localization Expert: Roberto Silva**
- **Role**: Portuguese (BR) Language & Cultural Adaptation
- **Expertise**: Native Brazilian, 8+ years in software localization
- **Responsibility**: Translation accuracy, cultural nuances, terminology consistency

### **Data Architect: Marina Oliveira**
- **Role**: Database Design & Analytics
- **Expertise**: PostgreSQL expert, healthcare data modeling
- **Responsibility**: Patient logs, AI credits tracking, deep dive analytics

### **Frontend Engineer: Gabriel Santos**
- **Role**: React/Next.js Development
- **Expertise**: 7+ years React, TypeScript, Tailwind CSS
- **Responsibility**: Component development, state management, performance

---

## 📋 TASK BREAKDOWN & IMPLEMENTATION PLAN

---

### **PHASE 1: PATIENT MANAGEMENT ENHANCEMENT** 🏥
**Lead**: Dr. Sofia Mendes + Lucas Ferreira  
**Priority**: CRITICAL  
**Timeline**: Week 1-2

#### **Task 1.1: Patient Details Page**
**URL**: `https://nutri-app-cal.vercel.app/studio/patients`

**Current State**:
- Tab "Pacientes" shows list of patients
- Clicking patient name does nothing

**Required Changes**:
```typescript
// Expert Analysis by Dr. Sofia Mendes:
// "We need a comprehensive patient detail view that serves as the 
// central hub for all patient-related information and actions."

1. Create dynamic route: /studio/patients/[patientId]
2. Implement patient detail page with tabs:
   - Visão Geral (Overview)
   - Histórico de Consultas (Consultation History)
   - Plano Alimentar (Meal Plan)
   - Exames (Lab Results)
   - Análise de IA (AI Analysis)
   - Log Diário (Daily Log) - NEW
   
3. Patient Overview Section:
   - Profile information (name, age, contact)
   - Current plan status
   - Adherence score
   - Recent activity timeline
   - Quick actions (schedule consultation, send message)
   
4. Navigation:
   - Breadcrumb: Pacientes > [Patient Name]
   - Back button to patient list
   - Next/Previous patient navigation
```

**UX Requirements by Lucas Ferreira**:
```
- Maintain sidebar visibility at all times
- Use slide-in panel for quick edits (not modals)
- Mobile-responsive with bottom navigation
- Loading states with skeleton UI
- Empty states with helpful CTAs
```

---

### **PHASE 2: AI FEATURES ENHANCEMENT** 🤖
**Lead**: Dr. Ana Paula Costa + Gabriel Santos  
**Priority**: HIGH  
**Timeline**: Week 2-4

#### **Task 2.1: AI Credits Deep Dive Analytics**

**Expert Analysis by Dr. Ana Paula Costa**:
```
"Current AI credit tracking is superficial. We need granular analytics
to help nutritionists understand costs and optimize AI usage."
```

**Implementation**:
```typescript
// New page: /studio/ai-workflows/credits

1. AI Credits Dashboard Components:

A. Overview Cards:
   - Total Credits Used (this month)
   - Credits Remaining
   - Average Cost per Patient
   - Projected Monthly Cost
   
B. Per-Patient Deep Dive:
   - Patient name
   - Total AI executions
   - Credits consumed
   - Breakdown by agent type:
     * Food Recognition: X credits
     * Meal Planner: Y credits
     * Patient Analyzer: Z credits
   - Cost in BRL (R$)
   - Timeline chart (credits over time)
   
C. Per-Nutritionist Analytics:
   - Nutritionist name
   - Patients managed
   - Total AI credits used
   - Most used AI agent
   - Efficiency score
   
D. Cost Calculation Display:
   Formula Breakdown:
   - OpenAI Cost: $0.XX per execution
   - Platform Markup: XX%
   - Total Cost to Nutritionist: R$ XX.XX
   - Patient Plan Price: R$ XX.XX
   - Profit Margin: XX%
   
E. Pricing Tiers Preview:
   - Free: 10 credits/month
   - Starter: 100 credits/month (R$ 49/mês)
   - Professional: 500 credits/month (R$ 199/mês)
   - Enterprise: Unlimited (R$ 499/mês)
```

**Database Schema by Marina Oliveira**:
```sql
-- New table for detailed AI credit tracking
CREATE TABLE ai_credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES "Tenant"(id),
  nutritionist_id UUID REFERENCES "User"(id),
  patient_id UUID REFERENCES "Patient"(id),
  agent_type VARCHAR(50) NOT NULL, -- 'food_recognition', 'meal_planner', etc.
  credits_used DECIMAL(10,4) NOT NULL,
  cost_usd DECIMAL(10,4) NOT NULL,
  cost_brl DECIMAL(10,2) NOT NULL,
  execution_id UUID REFERENCES "AIExecution"(id),
  created_at TIMESTAMP DEFAULT NOW(),
  metadata JSONB -- store additional context
);

-- Index for fast queries
CREATE INDEX idx_credits_tenant_date ON ai_credit_transactions(tenant_id, created_at DESC);
CREATE INDEX idx_credits_patient ON ai_credit_transactions(patient_id, created_at DESC);
CREATE INDEX idx_credits_nutritionist ON ai_credit_transactions(nutritionist_id, created_at DESC);
```

---

#### **Task 2.2: AI Meal Planner Enhancement**

**Current Issues**:
- Sidebar disappears
- Limited food options
- No allergy/condition support

**Expert Requirements by Dr. Ana Paula Costa**:
```typescript
// Enhanced AI Meal Planner Configuration

1. Maintain Sidebar: ✅
   - Use DashboardLayout wrapper
   - Ensure responsive behavior
   
2. Advanced Food Preferences:
   - Include Foods: Multi-select with autocomplete
   - Exclude Foods: Multi-select with autocomplete
   - Allergies: Checkboxes (gluten, lactose, nuts, shellfish, etc.)
   - Dietary Restrictions: Vegan, vegetarian, keto, low-carb, etc.
   
3. Medical Conditions Support:
   - Histamine Intolerance
   - FODMAP sensitivity
   - Diabetes
   - Hypertension
   - Kidney disease
   - Custom conditions (text input)
   
4. Patient Analysis for Allergies/Conditions:
   - AI analyzes patient symptoms
   - Correlates with food intake
   - Suggests potential triggers
   - Recommends elimination protocols
   - Generates personalized meal plans avoiding triggers
   
5. Prompt Engineering:
   System Prompt Template:
   """
   Você é um nutricionista especialista com 20 anos de experiência.
   
   Paciente: {patient_name}
   Condições: {conditions}
   Alergias: {allergies}
   Alimentos para incluir: {include_foods}
   Alimentos para excluir: {exclude_foods}
   Meta calórica: {target_calories} kcal
   Distribuição de macros: {protein}% proteína, {carbs}% carboidratos, {fat}% gordura
   
   Crie um plano alimentar de {days} dias que:
   1. Respeite todas as restrições alimentares
   2. Seja culturalmente apropriado para o Brasil
   3. Use ingredientes facilmente encontrados
   4. Seja variado e saboroso
   5. Atinja as metas nutricionais
   
   Para cada refeição, forneça:
   - Nome do prato
   - Ingredientes com quantidades exatas
   - Modo de preparo simplificado
   - Informações nutricionais completas
   """
```

---

#### **Task 2.3: Patient Analysis Enhancement**

**Expert Analysis by Lucas Ferreira (UX)**:
```
"Current patient analysis is too clinical. We need to make it 
actionable and empathetic for nutritionists."
```

**Implementation**:
```typescript
// Enhanced Patient Analysis Page: /studio/ai/patient-analyzer

1. Maintain Sidebar: ✅

2. Enhanced Analysis Sections:

A. Clinical Analysis (Doctor Perspective):
   - Vital signs trends
   - Lab results interpretation
   - Risk factors identification
   - Comorbidities assessment
   - Medication interactions with diet
   
B. Nutritional Analysis (Nutritionist Perspective):
   - Dietary adherence score (0-100)
   - Macro balance consistency
   - Micronutrient gaps
   - Hydration patterns
   - Meal timing analysis
   
C. Behavioral Analysis (Psychologist Perspective):
   - Logging consistency
   - Emotional eating patterns
   - Stress indicators
   - Sleep-food correlations
   - Motivation level
   
D. Predictive Analytics:
   - Dropout risk (low/medium/high/critical)
   - Goal achievement probability
   - Optimal intervention timing
   - Suggested communication approach
   
3. UX/UI Improvements:
   - Visual health score dashboard
   - Color-coded risk indicators
   - Interactive charts (recharts)
   - Exportable PDF reports
   - Action recommendations with priority
```

---

#### **Task 2.4: Exam Analyzer Development**

**Expert Specification by Dr. Ana Paula Costa**:
```typescript
// New AI Agent: Exam Analyzer
// Page: /studio/ai/exam-analyzer

1. Features:
   - Upload PDF/image of lab results
   - OCR extraction (GPT-4 Vision)
   - Automatic biomarker identification
   - Reference range comparison
   - Trend analysis (compare with previous exams)
   - Nutritional intervention suggestions
   
2. Supported Exam Types:
   - Hemograma completo (CBC)
   - Perfil lipídico (Lipid panel)
   - Glicemia e HbA1c (Glucose)
   - Função hepática (Liver function)
   - Função renal (Kidney function)
   - Vitaminas (D, B12, etc.)
   - Minerais (Ferro, Cálcio, etc.)
   - Hormônios (Tireoide, etc.)
   
3. AI Prompt:
   """
   Analise este exame laboratorial e forneça:
   
   1. Extração de Dados:
      - Liste todos os biomarcadores encontrados
      - Valores medidos
      - Unidades
      - Faixas de referência
      
   2. Interpretação Clínica:
      - Valores normais (✓)
      - Valores alterados (⚠️ ou 🔴)
      - Significado clínico de cada alteração
      
   3. Recomendações Nutricionais:
      - Alimentos para aumentar
      - Alimentos para reduzir
      - Suplementação sugerida
      - Protocolo nutricional recomendado
      
   4. Monitoramento:
      - Biomarcadores para acompanhar
      - Frequência de reavaliação
   """
   
4. Database Schema:
   - Store exam results
   - Track biomarker trends
   - Link to patient timeline
```

---

#### **Task 2.5: Additional AI Agents Development**

**Expert Roadmap by Dr. Ana Paula Costa**:
```
Priority Order for "More AI Agents Coming Soon":

1. Medical Record Creator (Transcription AI)
   - Record consultation audio
   - Transcribe with Whisper AI
   - Generate SOAP notes
   - Auto-populate forms
   
2. Protocol Generator
   - Analyze patient conditions
   - Generate personalized protocols:
     * FODMAP elimination
     * Anti-inflammatory
     * Detox
     * Gut healing
   - Phase-based implementation
   
3. Symptom Correlator
   - Statistical analysis
   - Identify trigger foods
   - Pattern recognition
   - Predictive alerts
   
4. Recipe Creator
   - Generate custom recipes
   - Macro-targeted
   - Ingredient substitutions
   - Step-by-step instructions
   
5. Nutrition Coach (24/7 Chatbot)
   - Answer patient questions
   - Motivational messages
   - Behavioral nudges
   - Educational content
   
6. Supplement Advisor
   - Analyze nutrient gaps
   - Recommend supplements
   - Dosage suggestions
   - Interaction warnings
   
7. Shopping List Generator
   - Extract from meal plans
   - Categorize by store section
   - Cost estimation
   - Delivery integration
   
8. Report Generator
   - Comprehensive progress reports
   - Visualizations
   - Narrative summaries
   - PDF export
```

---

### **PHASE 3: PROTOCOL & TEMPLATE ENHANCEMENT** 📚
**Lead**: Dr. Sofia Mendes + Roberto Silva  
**Priority**: MEDIUM  
**Timeline**: Week 3-5

#### **Task 3.1: Protocol Catalog Enhancement**

**Expert Critique by Dr. Sofia Mendes**:
```
"Current protocols need expert validation and enhancement.
Each protocol should be reviewed by a specialist in that area."
```

**50-Point Critique Framework**:
```
For each protocol, evaluate:

1. Scientific Accuracy (10 points)
   - Evidence-based recommendations
   - Current research alignment
   - Reference citations
   
2. Practical Applicability (10 points)
   - Clear instructions
   - Realistic for patients
   - Brazilian food availability
   
3. Safety & Contraindications (10 points)
   - Risk warnings
   - Who should not follow
   - Medical supervision needs
   
4. Completeness (10 points)
   - All phases covered
   - Food lists comprehensive
   - Supplement recommendations
   
5. Cultural Adaptation (5 points)
   - Brazilian cuisine integration
   - Local ingredient availability
   - Cultural food practices
   
6. Clarity & Usability (5 points)
   - Easy to understand
   - Well-organized
   - Visual aids included
```

**Implementation**:
```typescript
// Enhanced Protocol Structure

interface Protocol {
  id: string;
  name: string;
  description: string;
  expertReviewScore: number; // 0-50
  expertReviewer: string;
  lastReviewed: Date;
  
  // Enhanced fields
  scientificBasis: {
    references: string[];
    evidenceLevel: 'high' | 'moderate' | 'low';
    lastUpdated: Date;
  };
  
  phases: {
    name: string;
    duration: string;
    goals: string[];
    allowedFoods: string[];
    forbiddenFoods: string[];
    supplements: string[];
    expectedOutcomes: string[];
  }[];
  
  contraindications: string[];
  warnings: string[];
  monitoringRequirements: string[];
  
  // Maintain sidebar
  layout: 'with-sidebar';
}

// Example: FODMAP Protocol Enhancement
const fodmapProtocol: Protocol = {
  name: "Protocolo FODMAP",
  expertReviewScore: 48,
  expertReviewer: "Dr. Maria Silva - Gastroenterologista",
  
  phases: [
    {
      name: "Fase 1: Eliminação",
      duration: "2-6 semanas",
      goals: [
        "Reduzir sintomas digestivos",
        "Identificar sensibilidades"
      ],
      allowedFoods: [
        "Arroz, quinoa, aveia sem glúten",
        "Frango, peixe, ovos",
        "Cenoura, abobrinha, espinafre",
        // ... comprehensive list
      ],
      forbiddenFoods: [
        "Trigo, cevada, centeio",
        "Leite e derivados",
        "Cebola, alho",
        // ... comprehensive list
      ]
    },
    {
      name: "Fase 2: Reintrodução",
      duration: "6-8 semanas",
      // ...
    },
    {
      name: "Fase 3: Personalização",
      duration: "Contínuo",
      // ...
    }
  ]
};
```

---

#### **Task 3.2: Recipe Enhancement**

**Requirements**:
```typescript
// Page: /studio/recipes

1. Maintain Sidebar: ✅

2. New Features:

A. Manual Recipe Creation:
   - Recipe name
   - Category (breakfast, lunch, dinner, snack)
   - Ingredients with quantities
   - Preparation steps
   - Cooking time
   - Difficulty level
   - Nutritional information (auto-calculated)
   - Photo upload
   - Tags (gluten-free, vegan, etc.)
   
B. AI Recipe Generation:
   - Input: Available ingredients
   - Input: Macro targets
   - Input: Dietary restrictions
   - Output: Complete recipe with:
     * Ingredient list
     * Step-by-step instructions
     * Nutritional breakdown
     * Cooking tips
   - Save to recipe database
   
C. Recipe Management:
   - Search and filter
   - Favorite recipes
   - Share with patients
   - Clone and modify
   - Print/PDF export
   
D. Recipe Collections:
   - Create themed collections
   - "Café da Manhã Rápido"
   - "Almoços Low-Carb"
   - "Jantares Vegetarianos"
```

---

#### **Task 3.3: Template Enhancement**

**Expert Critique Framework** (Same 50-point system as protocols):
```typescript
// Page: /studio/templates

1. Maintain Sidebar: ✅

2. Template Types:
   - Meal Plan Templates
   - Consultation Note Templates
   - Anamnesis Form Templates
   - Progress Report Templates
   - Educational Material Templates
   
3. Enhancement Process:
   - Expert review (50-point scale)
   - Identify gaps
   - Improve clarity
   - Add visual elements
   - Test with real users
   
4. Template Features:
   - Customizable fields
   - Variable placeholders
   - Conditional sections
   - Multi-language support (PT-BR primary)
   - Export formats (PDF, DOCX)
```

---

### **PHASE 4: PATIENT & NUTRITIONIST LOG SYSTEM** 📝
**Lead**: Marina Oliveira + Gabriel Santos  
**Priority**: HIGH  
**Timeline**: Week 4-6

#### **Task 4.1: Daily Patient Log with Timeline**

**Expert Design by Marina Oliveira**:
```typescript
// New Page: /patient/log (for patients)
// New Page: /studio/patients/[id]/log (for nutritionists)

1. Timeline View:
   - Chronological display (newest first)
   - Infinite scroll / pagination
   - Date grouping
   
2. Log Entry Types:

A. Meal Entries:
   - Timestamp
   - Meal type (breakfast, lunch, etc.)
   - Foods consumed
   - Photos
   - Satisfaction rating
   - Symptoms after meal
   
B. Symptom Entries:
   - Timestamp
   - Symptom type (bloating, pain, fatigue, etc.)
   - Severity (1-10)
   - Duration
   - Notes
   
C. Exam Uploads:
   - Timestamp
   - Exam type
   - PDF/image file
   - AI analysis results
   - Nutritionist comments
   
D. Measurements:
   - Timestamp
   - Weight
   - Body measurements
   - Photos (progress pics)
   
E. Feedback/Notes:
   - Patient notes
   - Nutritionist feedback
   - Voice notes (transcribed)
   
F. App Input:
   - Water intake
   - Exercise logged
   - Sleep quality
   - Mood tracking
   
3. Filter System:
   - By date range
   - By entry type
   - By symptom
   - By meal
   - Search by keyword
   
4. Visual Design:
   - Timeline with icons
   - Color-coded by type
   - Expandable entries
   - Inline editing
   - Quick actions (edit, delete, comment)
```

**Database Schema**:
```sql
CREATE TABLE patient_log_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES "Patient"(id),
  nutritionist_id UUID REFERENCES "User"(id), -- who created (if nutritionist)
  entry_type VARCHAR(50) NOT NULL, -- 'meal', 'symptom', 'exam', 'measurement', 'note', 'app_input'
  timestamp TIMESTAMP NOT NULL,
  
  -- Flexible data storage
  data JSONB NOT NULL,
  
  -- Media
  photos TEXT[], -- array of URLs
  files TEXT[], -- array of file URLs
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP, -- soft delete
  
  -- Search
  search_vector tsvector -- for full-text search
);

-- Indexes
CREATE INDEX idx_log_patient_time ON patient_log_entries(patient_id, timestamp DESC);
CREATE INDEX idx_log_type ON patient_log_entries(entry_type);
CREATE INDEX idx_log_search ON patient_log_entries USING GIN(search_vector);

-- Full-text search trigger
CREATE TRIGGER log_search_update
BEFORE INSERT OR UPDATE ON patient_log_entries
FOR EACH ROW EXECUTE FUNCTION
tsvector_update_trigger(search_vector, 'pg_catalog.portuguese', data);
```

---

### **PHASE 5: AI AGENT CONFIGURATION (ADMIN)** ⚙️
**Lead**: Dr. Ana Paula Costa + Dr. Sofia Mendes  
**Priority**: MEDIUM  
**Timeline**: Week 5-7

#### **Task 5.1: AI Agent Admin Configuration**

**Expert Requirements by Dr. Ana Paula Costa**:
```typescript
// New Page: /owner/ai-config

1. For Each AI Agent, Configure:

A. Prompt Configuration:
   - System prompt (editable)
   - User prompt template (with variables)
   - Temperature setting (0.0 - 2.0)
   - Max tokens
   - Model selection (GPT-4, GPT-4-turbo, GPT-3.5)
   
B. Role Definition:
   - Expert persona
   - Tone of voice
   - Language style
   - Cultural context
   
C. Examples (Few-Shot Learning):
   - Input example 1 → Expected output 1
   - Input example 2 → Expected output 2
   - Input example 3 → Expected output 3
   
D. Validation Rules:
   - Output format validation
   - Content safety filters
   - Nutritional accuracy checks
   
E. Cost Controls:
   - Max cost per execution
   - Daily/monthly budget limits
   - Alert thresholds
   
F. Performance Monitoring:
   - Success rate
   - Average response time
   - User satisfaction ratings
   - Cost per execution
   
2. Example Configuration UI:

```typescript
interface AIAgentConfig {
  agentId: string;
  agentName: string;
  
  prompt: {
    system: string;
    userTemplate: string;
    variables: string[]; // e.g., ['patient_name', 'conditions', 'allergies']
  };
  
  model: {
    provider: 'openai' | 'anthropic';
    modelName: string;
    temperature: number;
    maxTokens: number;
  };
  
  role: {
    persona: string;
    expertise: string[];
    tone: 'professional' | 'friendly' | 'empathetic';
    language: 'pt-BR';
  };
  
  examples: {
    input: string;
    output: string;
    explanation: string;
  }[];
  
  validation: {
    outputFormat: 'json' | 'markdown' | 'text';
    schema?: object; // JSON schema for validation
    safetyFilters: string[];
  };
  
  costControl: {
    maxCostPerExecution: number;
    dailyBudget: number;
    monthlyBudget: number;
    alertThreshold: number;
  };
}

// Example: Food Recognition Agent Config
const foodRecognitionConfig: AIAgentConfig = {
  agentId: 'food-recognition',
  agentName: 'Reconhecimento de Alimentos',
  
  prompt: {
    system: `Você é um nutricionista especialista com 20 anos de experiência 
    em identificação de alimentos e estimativa de porções. Você é preciso, 
    detalhista e sempre fornece informações nutricionais confiáveis.`,
    
    userTemplate: `Analise esta foto de refeição e identifique:
    1. Todos os alimentos visíveis
    2. Quantidade estimada de cada alimento (em gramas)
    3. Informações nutricionais de cada item
    
    Paciente: {{patient_name}}
    Restrições conhecidas: {{restrictions}}
    
    Forneça a resposta em JSON com o seguinte formato:
    {
      "foods": [
        {
          "name": "nome do alimento",
          "quantity_grams": 150,
          "confidence": 0.95,
          "nutrition": {
            "calories": 200,
            "protein": 25,
            "carbs": 10,
            "fat": 8
          }
        }
      ],
      "warnings": ["avisos sobre alergias ou restrições"],
      "suggestions": ["sugestões de ajustes"]
    }`,
    
    variables: ['patient_name', 'restrictions']
  },
  
  model: {
    provider: 'openai',
    modelName: 'gpt-4-vision-preview',
    temperature: 0.3, // Lower for more consistent results
    maxTokens: 1500
  },
  
  examples: [
    {
      input: "Foto de prato com frango grelhado, arroz e brócolis",
      output: JSON.stringify({
        foods: [
          {
            name: "Peito de frango grelhado",
            quantity_grams: 150,
            confidence: 0.92,
            nutrition: { calories: 248, protein: 47, carbs: 0, fat: 5 }
          },
          {
            name: "Arroz branco cozido",
            quantity_grams: 100,
            confidence: 0.88,
            nutrition: { calories: 130, protein: 2.7, carbs: 28, fat: 0.3 }
          },
          {
            name: "Brócolis cozido",
            quantity_grams: 80,
            confidence: 0.95,
            nutrition: { calories: 27, protein: 2.3, carbs: 5.5, fat: 0.3 }
          }
        ],
        warnings: [],
        suggestions: ["Excelente refeição balanceada!"]
      }, null, 2),
      explanation: "Identificação precisa com estimativas realistas"
    }
  ],
  
  validation: {
    outputFormat: 'json',
    schema: {
      type: 'object',
      required: ['foods'],
      properties: {
        foods: {
          type: 'array',
          items: {
            type: 'object',
            required: ['name', 'quantity_grams', 'confidence', 'nutrition']
          }
        }
      }
    },
    safetyFilters: ['no_medical_diagnosis', 'no_prescription']
  },
  
  costControl: {
    maxCostPerExecution: 0.05, // $0.05 max
    dailyBudget: 10.00, // $10/day
    monthlyBudget: 200.00, // $200/month
    alertThreshold: 0.80 // Alert at 80% of budget
  }
};
```

---

### **PHASE 6: LOCALIZATION - PORTUGUESE (BR)** 🇧🇷
**Lead**: Roberto Silva  
**Priority**: CRITICAL  
**Timeline**: Week 1-8 (Parallel to all phases)

#### **Task 6.1: Complete Portuguese Translation**

**Expert Analysis by Roberto Silva**:
```
"I've identified 247 instances of English text across the application.
This creates a jarring user experience and reduces trust, especially
for patients who may not speak English."
```

**Translation Strategy**:
```typescript
// 1. Audit all English text
// 2. Create comprehensive translation file
// 3. Implement i18n system
// 4. Replace all hardcoded English text

// Enhanced i18n structure
// src/i18n/pt-BR.ts

export const ptBR = {
  // Navigation
  nav: {
    dashboard: 'Painel',
    patients: 'Pacientes',
    diary: 'Diário',
    plan: 'Plano',
    progress: 'Progresso',
    symptoms: 'Sintomas',
    settings: 'Configurações',
    ai: 'IA',
    recipes: 'Receitas',
    protocols: 'Protocolos',
    templates: 'Modelos',
  },
  
  // AI Features
  ai: {
    features: 'Recursos de IA',
    foodRecognition: 'Reconhecimento de Alimentos',
    mealPlanner: 'Planejador de Refeições',
    patientAnalyzer: 'Análise de Paciente',
    examAnalyzer: 'Análise de Exames',
    
    // Credits
    credits: {
      used: 'Créditos Utilizados',
      remaining: 'Créditos Restantes',
      total: 'Total de Execuções',
      avgCost: 'Custo Médio',
      successRate: 'Taxa de Sucesso',
    },
    
    // Status
    status: {
      active: 'Ativo',
      comingSoon: 'Em Breve',
      processing: 'Processando',
      completed: 'Concluído',
      failed: 'Falhou',
    },
  },
  
  // Patient Management
  patients: {
    list: 'Lista de Pacientes',
    active: 'Ativos',
    inactive: 'Inativos',
    new: 'Novo Paciente',
    search: 'Buscar por nome...',
    
    details: {
      overview: 'Visão Geral',
      consultations: 'Consultas',
      mealPlan: 'Plano Alimentar',
      exams: 'Exames',
      aiAnalysis: 'Análise de IA',
      dailyLog: 'Log Diário',
    },
    
    status: {
      active: 'Ativo',
      pending: 'Pendente',
      inactive: 'Inativo',
    },
  },
  
  // Meal Logging
  meals: {
    log: 'Registrar Refeição',
    breakfast: 'Café da Manhã',
    lunch: 'Almoço',
    dinner: 'Jantar',
    snack: 'Lanche',
    
    search: 'Buscar alimento...',
    add: 'Adicionar',
    remove: 'Remover',
    portion: 'Porção',
    grams: 'gramas',
    
    satisfaction: {
      title: 'Como foi a refeição?',
      verySatisfied: 'Muito satisfeito',
      satisfied: 'Satisfeito',
      neutral: 'Neutro',
      unsatisfied: 'Insatisfeito',
      veryUnsatisfied: 'Muito insatisfeito',
    },
  },
  
  // Macros & Nutrition
  nutrition: {
    calories: 'Calorias',
    protein: 'Proteína',
    carbs: 'Carboidratos',
    fat: 'Gordura',
    fiber: 'Fibra',
    
    macros: 'Macronutrientes',
    micros: 'Micronutrientes',
    
    goal: 'Meta',
    consumed: 'Consumido',
    remaining: 'Restante',
  },
  
  // Actions
  actions: {
    save: 'Salvar',
    cancel: 'Cancelar',
    delete: 'Excluir',
    edit: 'Editar',
    view: 'Ver',
    download: 'Baixar',
    upload: 'Enviar',
    search: 'Buscar',
    filter: 'Filtrar',
    export: 'Exportar',
    import: 'Importar',
    undo: 'Desfazer',
    redo: 'Refazer',
  },
  
  // Time
  time: {
    today: 'Hoje',
    yesterday: 'Ontem',
    thisWeek: 'Esta Semana',
    thisMonth: 'Este Mês',
    custom: 'Personalizado',
    
    days: {
      monday: 'Segunda',
      tuesday: 'Terça',
      wednesday: 'Quarta',
      thursday: 'Quinta',
      friday: 'Sexta',
      saturday: 'Sábado',
      sunday: 'Domingo',
    },
  },
  
  // Messages
  messages: {
    success: {
      saved: 'Salvo com sucesso!',
      deleted: 'Excluído com sucesso!',
      updated: 'Atualizado com sucesso!',
    },
    
    error: {
      generic: 'Algo deu errado. Tente novamente.',
      network: 'Erro de conexão. Verifique sua internet.',
      notFound: 'Não encontrado.',
      unauthorized: 'Você não tem permissão para isso.',
    },
    
    confirm: {
      delete: 'Tem certeza que deseja excluir?',
      cancel: 'Tem certeza que deseja cancelar?',
    },
  },
  
  // Empty States
  empty: {
    noPatients: 'Nenhum paciente encontrado',
    noMeals: 'Nenhuma refeição registrada hoje',
    noResults: 'Nenhum resultado encontrado',
    noData: 'Sem dados para exibir',
  },
  
  // Protocols
  protocols: {
    fodmap: 'Protocolo FODMAP',
    antiInflammatory: 'Anti-Inflamatório',
    detox: 'Detox',
    lowCarb: 'Low Carb',
    keto: 'Cetogênica',
    
    phases: {
      elimination: 'Eliminação',
      reintroduction: 'Reintrodução',
      personalization: 'Personalização',
    },
  },
  
  // Log Entries
  log: {
    types: {
      meal: 'Refeição',
      symptom: 'Sintoma',
      exam: 'Exame',
      measurement: 'Medição',
      note: 'Nota',
      feedback: 'Feedback',
    },
    
    filters: {
      all: 'Todos',
      meals: 'Refeições',
      symptoms: 'Sintomas',
      exams: 'Exames',
      measurements: 'Medições',
    },
  },
};

// Usage in components
import { ptBR } from '@/i18n/pt-BR';

// Before:
<Button>Save</Button>

// After:
<Button>{ptBR.actions.save}</Button>
```

**Translation Audit Checklist**:
```
✅ Navigation menus
✅ Button labels
✅ Form labels
✅ Placeholder text
✅ Error messages
✅ Success messages
✅ Empty states
✅ Loading states
✅ Tooltips
✅ Modal titles
✅ Table headers
✅ Chart labels
✅ AI agent names
✅ Protocol names
✅ Recipe names
✅ Template names
✅ Email templates
✅ Notification messages
✅ Help text
✅ Onboarding text
```

---

## 📊 IMPLEMENTATION TIMELINE

```
Week 1-2: PHASE 1 - Patient Management
├── Patient details page
├── Navigation improvements
└── Sidebar consistency fixes

Week 2-4: PHASE 2 - AI Features (Part 1)
├── AI Credits analytics
├── Meal Planner enhancement
└── Patient Analysis enhancement

Week 3-5: PHASE 3 - Protocols & Templates
├── Protocol critique (50-point system)
├── Recipe management
└── Template enhancement

Week 4-6: PHASE 4 - Log System
├── Patient log timeline
├── Filter system
└── Mobile optimization

Week 5-7: PHASE 5 - AI Admin Config
├── Prompt configuration
├── Role definition
└── Cost controls

Week 1-8: PHASE 6 - Localization (Parallel)
├── Translation audit
├── i18n implementation
└── Quality assurance

Week 6-8: PHASE 2 (Part 2) - Additional AI Agents
├── Exam Analyzer
├── Medical Record Creator
├── Protocol Generator
└── Symptom Correlator
```

---

## 🎯 SUCCESS METRICS

### **User Experience**
- [ ] 100% Portuguese (BR) coverage
- [ ] Sidebar visible on all pages
- [ ] Mobile-responsive (all pages)
- [ ] Accessibility WCAG 2.1 AA compliant

### **AI Features**
- [ ] AI Credits dashboard functional
- [ ] Per-patient analytics working
- [ ] Per-nutritionist analytics working
- [ ] Cost calculation accurate
- [ ] Exam Analyzer operational
- [ ] 8+ AI agents developed

### **Data & Analytics**
- [ ] Patient log timeline functional
- [ ] Filter system working
- [ ] Deep dive analytics accurate
- [ ] Export functionality working

### **Quality**
- [ ] All protocols reviewed (50-point scale)
- [ ] All templates reviewed (50-point scale)
- [ ] Recipe creation (manual + AI) working
- [ ] AI agent configuration functional

---

## 🚀 DEPLOYMENT STRATEGY

### **Phase Rollout**
1. **Week 1-2**: Deploy Phase 1 (Patient Management)
2. **Week 3-4**: Deploy Phase 2 Part 1 (AI Credits, Meal Planner)
3. **Week 5-6**: Deploy Phase 3 (Protocols) + Phase 4 (Logs)
4. **Week 7-8**: Deploy Phase 5 (Admin) + Phase 2 Part 2 (AI Agents)

### **Testing Strategy**
- Unit tests for all new components
- Integration tests for AI agents
- E2E tests for critical flows
- User acceptance testing (UAT) with 5 nutritionists

### **Monitoring**
- Error tracking (Sentry)
- Performance monitoring (Vercel Analytics)
- AI cost tracking (custom dashboard)
- User feedback collection

---

## 💰 COST ESTIMATION

### **Development Costs**
- Phase 1: 80 hours
- Phase 2: 120 hours
- Phase 3: 60 hours
- Phase 4: 80 hours
- Phase 5: 60 hours
- Phase 6: 40 hours
- **Total**: 440 hours

### **AI Operational Costs** (Monthly, 100 patients)
- Food Recognition: $150
- Meal Planner: $80
- Patient Analyzer: $60
- Exam Analyzer: $70
- Other agents: $140
- **Total**: $500/month

### **Revenue Potential**
- 100 patients × $10/month = $1,000/month
- **Profit**: $500/month
- **Break-even**: 50 patients

---

## 📝 NOTES FOR IMPLEMENTATION

### **Critical Reminders**
1. **Always maintain sidebar** - Use `<DashboardLayout>` wrapper
2. **Portuguese first** - All text must be in PT-BR
3. **Mobile-responsive** - Test on mobile devices
4. **Accessibility** - WCAG 2.1 AA compliance
5. **Cost tracking** - Monitor AI costs closely

### **Technical Decisions**
- **Database**: PostgreSQL (Supabase)
- **ORM**: Prisma
- **AI**: OpenAI GPT-4
- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS
- **Components**: Radix UI + shadcn/ui
- **State**: React hooks + Server Actions
- **i18n**: Custom implementation (pt-BR)

---

## ✅ READY TO EXECUTE

This comprehensive plan provides:
- ✅ Expert roles and responsibilities
- ✅ Detailed task breakdown
- ✅ Code examples and specifications
- ✅ Database schemas
- ✅ Timeline and milestones
- ✅ Success metrics
- ✅ Cost estimates
- ✅ Quality standards

**Next Step**: Begin implementation with Phase 1 - Patient Management Enhancement

---

*Document Version: 1.0*  
*Created: 2026-02-03*  
*Expert Panel: 6 specialists*  
*Estimated Completion: 8 weeks*
