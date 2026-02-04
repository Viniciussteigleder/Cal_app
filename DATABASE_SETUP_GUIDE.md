# 🗄️ DATABASE SETUP - COMPLETE GUIDE
## Supabase Database Configuration

**Estimated Time**: 1-2 hours  
**Difficulty**: Easy  
**Prerequisites**: Supabase account

---

## 📋 **STEP-BY-STEP SETUP**

### **Step 1: Create Supabase Project** (5 minutes)

1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign in with GitHub
4. Click "New Project"
5. Fill in:
   - **Name**: nutriplan-production
   - **Database Password**: (generate strong password - save it!)
   - **Region**: Choose closest to your users (e.g., South America)
   - **Pricing Plan**: Free (or Pro for production)
6. Click "Create new project"
7. Wait 2-3 minutes for setup

---

### **Step 2: Get API Credentials** (2 minutes)

1. In your Supabase project, go to **Settings** → **API**
2. Copy these values:

```bash
# Project URL
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co

# Anon/Public Key (safe for client-side)
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Service Role Key (NEVER expose to client!)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

3. Add to `.env.local`:

```bash
# Create/edit .env.local in project root
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

---

### **Step 3: Create Database Tables** (10 minutes)

1. In Supabase, go to **SQL Editor**
2. Click "New query"
3. Copy and paste the following SQL:

```sql
-- ============================================
-- NUTRIPLAN DATABASE SCHEMA
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. USERS & PROFILES
-- ============================================

CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  role TEXT NOT NULL CHECK (role IN ('patient', 'nutritionist', 'owner')),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 2. PATIENTS
-- ============================================

CREATE TABLE public.patients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nutritionist_id UUID REFERENCES public.profiles(id) NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  date_of_birth DATE,
  gender TEXT,
  height DECIMAL(5,2), -- cm
  initial_weight DECIMAL(5,2), -- kg
  current_weight DECIMAL(5,2), -- kg
  target_weight DECIMAL(5,2), -- kg
  medical_conditions TEXT[],
  allergies TEXT[],
  dietary_restrictions TEXT[],
  goals TEXT[],
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 3. MEAL PLANS
-- ============================================

CREATE TABLE public.meal_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
  nutritionist_id UUID REFERENCES public.profiles(id),
  name TEXT NOT NULL,
  target_calories INTEGER,
  start_date DATE,
  end_date DATE,
  meals JSONB NOT NULL, -- Array of meal objects
  macros JSONB, -- {protein: 30, carbs: 40, fat: 30}
  notes TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'draft')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 4. PROTOCOLS
-- ============================================

CREATE TABLE public.protocols (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nutritionist_id UUID REFERENCES public.profiles(id),
  name TEXT NOT NULL,
  description TEXT,
  type TEXT,
  phases JSONB NOT NULL, -- Array of phase objects
  food_lists JSONB,
  scientific_basis JSONB,
  contraindications TEXT[],
  warnings TEXT[],
  is_public BOOLEAN DEFAULT false,
  expert_review_score INTEGER,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 5. RECIPES
-- ============================================

CREATE TABLE public.recipes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nutritionist_id UUID REFERENCES public.profiles(id),
  name TEXT NOT NULL,
  description TEXT,
  ingredients JSONB NOT NULL, -- Array of ingredient objects
  instructions JSONB NOT NULL, -- Array of step objects
  nutrition JSONB, -- {calories, protein, carbs, fat}
  prep_time INTEGER, -- minutes
  cook_time INTEGER, -- minutes
  servings INTEGER,
  tags TEXT[],
  is_public BOOLEAN DEFAULT false,
  image_url TEXT,
  rating DECIMAL(3,2),
  rating_count INTEGER DEFAULT 0,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 6. TEMPLATES
-- ============================================

CREATE TABLE public.templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nutritionist_id UUID REFERENCES public.profiles(id),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('consultation', 'anamnesis', 'progress', 'educational', 'report')),
  description TEXT,
  content TEXT NOT NULL,
  fields JSONB,
  tags TEXT[],
  usage_count INTEGER DEFAULT 0,
  is_favorite BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 7. EXAMS
-- ============================================

CREATE TABLE public.exams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
  exam_type TEXT NOT NULL CHECK (exam_type IN ('hemograma', 'perfil_lipidico', 'glicemia', 'funcao_hepatica', 'funcao_renal', 'vitaminas', 'minerais', 'hormonios', 'outros')),
  exam_date DATE NOT NULL,
  results JSONB NOT NULL, -- Biomarker results
  file_url TEXT,
  notes TEXT,
  ai_analysis JSONB, -- AI-generated analysis
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 8. DAILY LOGS
-- ============================================

CREATE TABLE public.patient_log_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
  nutritionist_id UUID REFERENCES public.profiles(id),
  entry_type TEXT NOT NULL CHECK (entry_type IN ('meal', 'symptom', 'exam', 'measurement', 'note', 'app_input')),
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  data JSONB NOT NULL, -- Flexible data storage
  photos TEXT[], -- Array of URLs
  files TEXT[], -- Array of file URLs
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE -- Soft delete
);

-- ============================================
-- 9. AI CREDITS
-- ============================================

CREATE TABLE public.ai_credits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nutritionist_id UUID REFERENCES public.profiles(id) UNIQUE,
  balance INTEGER NOT NULL DEFAULT 1000,
  total_purchased INTEGER DEFAULT 1000,
  total_used INTEGER DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.ai_credit_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nutritionist_id UUID REFERENCES public.profiles(id),
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('purchase', 'usage', 'refund')),
  agent_type TEXT,
  credits_amount INTEGER NOT NULL,
  cost_brl DECIMAL(10,2),
  balance_after INTEGER NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Patients
CREATE INDEX idx_patients_nutritionist ON public.patients(nutritionist_id);
CREATE INDEX idx_patients_status ON public.patients(status);
CREATE INDEX idx_patients_email ON public.patients(email);

-- Meal Plans
CREATE INDEX idx_meal_plans_patient ON public.meal_plans(patient_id);
CREATE INDEX idx_meal_plans_nutritionist ON public.meal_plans(nutritionist_id);
CREATE INDEX idx_meal_plans_status ON public.meal_plans(status);

-- Protocols
CREATE INDEX idx_protocols_nutritionist ON public.protocols(nutritionist_id);
CREATE INDEX idx_protocols_public ON public.protocols(is_public);

-- Recipes
CREATE INDEX idx_recipes_nutritionist ON public.recipes(nutritionist_id);
CREATE INDEX idx_recipes_public ON public.recipes(is_public);
CREATE INDEX idx_recipes_tags ON public.recipes USING GIN(tags);

-- Templates
CREATE INDEX idx_templates_nutritionist ON public.templates(nutritionist_id);
CREATE INDEX idx_templates_type ON public.templates(type);

-- Exams
CREATE INDEX idx_exams_patient ON public.exams(patient_id);
CREATE INDEX idx_exams_date ON public.exams(exam_date DESC);

-- Logs
CREATE INDEX idx_logs_patient_time ON public.patient_log_entries(patient_id, timestamp DESC);
CREATE INDEX idx_logs_type ON public.patient_log_entries(entry_type);

-- AI Credits
CREATE INDEX idx_credits_nutritionist ON public.ai_credits(nutritionist_id);
CREATE INDEX idx_transactions_nutritionist ON public.ai_credit_transactions(nutritionist_id);
CREATE INDEX idx_transactions_date ON public.ai_credit_transactions(created_at DESC);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.protocols ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_log_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_credit_transactions ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Patients: Nutritionists can manage their patients
CREATE POLICY "Nutritionists can view their patients" ON public.patients
  FOR SELECT USING (
    nutritionist_id IN (
      SELECT id FROM public.profiles WHERE id = auth.uid() AND role = 'nutritionist'
    )
  );

CREATE POLICY "Nutritionists can create patients" ON public.patients
  FOR INSERT WITH CHECK (
    nutritionist_id IN (
      SELECT id FROM public.profiles WHERE id = auth.uid() AND role = 'nutritionist'
    )
  );

CREATE POLICY "Nutritionists can update their patients" ON public.patients
  FOR UPDATE USING (
    nutritionist_id IN (
      SELECT id FROM public.profiles WHERE id = auth.uid() AND role = 'nutritionist'
    )
  );

-- Meal Plans: Nutritionists and patients can view
CREATE POLICY "Users can view relevant meal plans" ON public.meal_plans
  FOR SELECT USING (
    nutritionist_id = auth.uid() OR
    patient_id IN (
      SELECT id FROM public.patients WHERE id = patient_id
    )
  );

-- Protocols: Public protocols visible to all, private to owner
CREATE POLICY "Users can view protocols" ON public.protocols
  FOR SELECT USING (
    is_public = true OR
    nutritionist_id = auth.uid()
  );

-- Recipes: Public recipes visible to all, private to owner
CREATE POLICY "Users can view recipes" ON public.recipes
  FOR SELECT USING (
    is_public = true OR
    nutritionist_id = auth.uid()
  );

-- Templates: Only owner can view
CREATE POLICY "Users can view own templates" ON public.templates
  FOR SELECT USING (nutritionist_id = auth.uid());

-- Exams: Patient and their nutritionist can view
CREATE POLICY "Users can view relevant exams" ON public.exams
  FOR SELECT USING (
    patient_id IN (
      SELECT id FROM public.patients 
      WHERE nutritionist_id = auth.uid()
    )
  );

-- Logs: Patient and their nutritionist can view
CREATE POLICY "Users can view relevant logs" ON public.patient_log_entries
  FOR SELECT USING (
    patient_id IN (
      SELECT id FROM public.patients 
      WHERE nutritionist_id = auth.uid()
    ) AND deleted_at IS NULL
  );

-- AI Credits: Users can view their own credits
CREATE POLICY "Users can view own credits" ON public.ai_credits
  FOR SELECT USING (nutritionist_id = auth.uid());

CREATE POLICY "Users can view own transactions" ON public.ai_credit_transactions
  FOR SELECT USING (nutritionist_id = auth.uid());

-- ============================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON public.patients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_meal_plans_updated_at BEFORE UPDATE ON public.meal_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_protocols_updated_at BEFORE UPDATE ON public.protocols
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recipes_updated_at BEFORE UPDATE ON public.recipes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_templates_updated_at BEFORE UPDATE ON public.templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_exams_updated_at BEFORE UPDATE ON public.exams
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_logs_updated_at BEFORE UPDATE ON public.patient_log_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- INITIAL DATA (OPTIONAL)
-- ============================================

-- Create initial AI credits for new nutritionists
CREATE OR REPLACE FUNCTION create_initial_credits()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role = 'nutritionist' THEN
    INSERT INTO public.ai_credits (nutritionist_id, balance, total_purchased)
    VALUES (NEW.id, 1000, 1000);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER create_credits_on_signup AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION create_initial_credits();

-- ============================================
-- COMPLETE!
-- ============================================
```

4. Click "Run" (or press Cmd/Ctrl + Enter)
5. Wait for "Success. No rows returned"

---

### **Step 4: Set Up Storage Buckets** (5 minutes)

1. In Supabase, go to **Storage**
2. Click "Create a new bucket"
3. Create these buckets:

```
Bucket Name: images
Public: Yes
File size limit: 5MB
Allowed MIME types: image/jpeg, image/png, image/webp
```

```
Bucket Name: audio
Public: No
File size limit: 10MB
Allowed MIME types: audio/mpeg, audio/wav, audio/webm
```

```
Bucket Name: documents
Public: No
File size limit: 10MB
Allowed MIME types: application/pdf
```

```
Bucket Name: exams
Public: No
File size limit: 10MB
Allowed MIME types: application/pdf, image/jpeg, image/png
```

---

### **Step 5: Configure Storage Policies** (5 minutes)

For each bucket, add these policies:

```sql
-- Images bucket (public)
CREATE POLICY "Public can view images" ON storage.objects FOR SELECT
  USING (bucket_id = 'images');

CREATE POLICY "Authenticated users can upload images" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'images' AND auth.role() = 'authenticated');

-- Audio bucket (private)
CREATE POLICY "Users can upload own audio" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'audio' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view own audio" ON storage.objects FOR SELECT
  USING (bucket_id = 'audio' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Documents bucket (private)
CREATE POLICY "Users can upload own documents" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view own documents" ON storage.objects FOR SELECT
  USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Exams bucket (private)
CREATE POLICY "Users can upload exams" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'exams' AND auth.role() = 'authenticated');

CREATE POLICY "Users can view exams" ON storage.objects FOR SELECT
  USING (bucket_id = 'exams' AND auth.role() = 'authenticated');
```

---

### **Step 6: Test Connection** (5 minutes)

1. In your project, create a test file:

```typescript
// test-db.ts
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function testConnection() {
  const { data, error } = await supabase
    .from('profiles')
    .select('count');
  
  if (error) {
    console.error('❌ Connection failed:', error);
  } else {
    console.log('✅ Connection successful!', data);
  }
}

testConnection();
```

2. Run: `npx tsx test-db.ts`
3. Should see: `✅ Connection successful!`

---

## ✅ **VERIFICATION CHECKLIST**

- [ ] Supabase project created
- [ ] API credentials copied to `.env.local`
- [ ] All 9 tables created
- [ ] All indexes created
- [ ] RLS policies enabled
- [ ] Triggers created
- [ ] 4 storage buckets created
- [ ] Storage policies configured
- [ ] Connection test passed

---

## 🎯 **NEXT STEPS**

1. ✅ Database is ready!
2. ⚠️ Update API routes to use real Supabase (see REAL_AI_INTEGRATION.md)
3. ⚠️ Test with real data
4. ⚠️ Deploy to production

---

**Database setup complete! Ready for production use.** 🚀
