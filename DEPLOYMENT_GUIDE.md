# 🚀 DEPLOYMENT GUIDE - NutriPlan Platform
## Complete Deployment & Production Checklist

---

## 📋 **PRE-DEPLOYMENT CHECKLIST**

### **1. Environment Setup**

#### **Required Environment Variables**
Create a `.env.local` file with:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# App Configuration
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXT_PUBLIC_APP_NAME=NutriPlan

# Optional: Email Service (SendGrid/Resend)
EMAIL_API_KEY=your_email_api_key
EMAIL_FROM=noreply@your-domain.com

# Optional: WhatsApp Integration
WHATSAPP_API_KEY=your_whatsapp_api_key

# Optional: Storage (AWS S3/Cloudinary)
STORAGE_BUCKET=your_storage_bucket
STORAGE_ACCESS_KEY=your_storage_access_key
STORAGE_SECRET_KEY=your_storage_secret_key
```

---

### **2. Database Setup (Supabase)**

#### **Create Tables**

Run these SQL commands in Supabase SQL Editor:

```sql
-- Users table (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  role TEXT NOT NULL CHECK (role IN ('patient', 'nutritionist', 'owner')),
  full_name TEXT,
  email TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Patients table
CREATE TABLE public.patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles,
  nutritionist_id UUID REFERENCES public.profiles NOT NULL,
  date_of_birth DATE,
  gender TEXT,
  height DECIMAL,
  initial_weight DECIMAL,
  current_weight DECIMAL,
  target_weight DECIMAL,
  medical_conditions TEXT[],
  allergies TEXT[],
  dietary_restrictions TEXT[],
  goals TEXT[],
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Meal Plans table
CREATE TABLE public.meal_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES public.patients NOT NULL,
  nutritionist_id UUID REFERENCES public.profiles NOT NULL,
  name TEXT NOT NULL,
  target_calories INTEGER,
  start_date DATE,
  end_date DATE,
  meals JSONB NOT NULL,
  macros JSONB,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Daily Logs table
CREATE TABLE public.daily_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES public.patients NOT NULL,
  log_type TEXT NOT NULL CHECK (log_type IN ('meal', 'symptom', 'exam', 'measurement', 'note', 'app_input')),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data JSONB NOT NULL,
  photos TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Protocols table
CREATE TABLE public.protocols (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nutritionist_id UUID REFERENCES public.profiles NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT,
  phases JSONB,
  food_lists JSONB,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recipes table
CREATE TABLE public.recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nutritionist_id UUID REFERENCES public.profiles NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  ingredients JSONB NOT NULL,
  instructions TEXT[],
  nutrition JSONB,
  prep_time INTEGER,
  cook_time INTEGER,
  servings INTEGER,
  tags TEXT[],
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Templates table
CREATE TABLE public.templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nutritionist_id UUID REFERENCES public.profiles NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  description TEXT,
  content TEXT NOT NULL,
  fields JSONB,
  tags TEXT[],
  usage_count INTEGER DEFAULT 0,
  is_favorite BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI Credits table
CREATE TABLE public.ai_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nutritionist_id UUID REFERENCES public.profiles NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('purchase', 'usage', 'refund')),
  agent_type TEXT,
  credits_amount INTEGER NOT NULL,
  cost_brl DECIMAL,
  balance_after INTEGER NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Exams table
CREATE TABLE public.exams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES public.patients NOT NULL,
  exam_type TEXT NOT NULL,
  exam_date DATE,
  results JSONB NOT NULL,
  file_url TEXT,
  ai_analysis JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.protocols ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies (example for patients table)
CREATE POLICY "Nutritionists can view their patients"
  ON public.patients FOR SELECT
  USING (auth.uid() = nutritionist_id);

CREATE POLICY "Patients can view their own data"
  ON public.patients FOR SELECT
  USING (auth.uid() = user_id);

-- Add indexes for performance
CREATE INDEX idx_patients_nutritionist ON public.patients(nutritionist_id);
CREATE INDEX idx_meal_plans_patient ON public.meal_plans(patient_id);
CREATE INDEX idx_daily_logs_patient ON public.daily_logs(patient_id);
CREATE INDEX idx_daily_logs_timestamp ON public.daily_logs(timestamp);
CREATE INDEX idx_ai_credits_nutritionist ON public.ai_credits(nutritionist_id);
```

---

### **3. Build & Test**

```bash
# Install dependencies
npm install

# Run type checking
npm run type-check

# Run linting
npm run lint

# Build for production
npm run build

# Test production build locally
npm run start
```

---

## 🌐 **DEPLOYMENT OPTIONS**

### **Option 1: Vercel (Recommended)**

#### **Step 1: Install Vercel CLI**
```bash
npm i -g vercel
```

#### **Step 2: Login to Vercel**
```bash
vercel login
```

#### **Step 3: Deploy**
```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

#### **Step 4: Configure Environment Variables**
In Vercel Dashboard:
1. Go to Project Settings → Environment Variables
2. Add all variables from `.env.local`
3. Redeploy

#### **Step 5: Configure Custom Domain**
1. Go to Project Settings → Domains
2. Add your custom domain
3. Configure DNS records as instructed

---

### **Option 2: AWS Amplify**

```bash
# Install Amplify CLI
npm install -g @aws-amplify/cli

# Initialize Amplify
amplify init

# Add hosting
amplify add hosting

# Deploy
amplify publish
```

---

### **Option 3: Docker + Cloud Run**

#### **Create Dockerfile**
```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

#### **Deploy to Cloud Run**
```bash
# Build image
docker build -t nutriplan .

# Tag for GCR
docker tag nutriplan gcr.io/YOUR_PROJECT/nutriplan

# Push to GCR
docker push gcr.io/YOUR_PROJECT/nutriplan

# Deploy to Cloud Run
gcloud run deploy nutriplan \
  --image gcr.io/YOUR_PROJECT/nutriplan \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

---

## 🔒 **SECURITY CHECKLIST**

- [ ] All environment variables are set in production
- [ ] Row Level Security (RLS) enabled on all Supabase tables
- [ ] API routes have proper authentication
- [ ] Rate limiting implemented
- [ ] CORS configured correctly
- [ ] HTTPS enabled (automatic with Vercel)
- [ ] Content Security Policy configured
- [ ] Input validation on all forms
- [ ] SQL injection protection (using Supabase client)
- [ ] XSS protection enabled

---

## ⚡ **PERFORMANCE OPTIMIZATION**

### **Already Implemented**:
- ✅ Next.js App Router with automatic code splitting
- ✅ Image optimization with next/image
- ✅ Dynamic imports for heavy components
- ✅ Server-side rendering where appropriate

### **Additional Optimizations**:

```bash
# Enable compression
npm install compression

# Add to next.config.js
module.exports = {
  compress: true,
  images: {
    domains: ['your-storage-domain.com'],
    formats: ['image/avif', 'image/webp'],
  },
}
```

---

## 📊 **MONITORING & ANALYTICS**

### **Setup Vercel Analytics**
```bash
npm install @vercel/analytics
```

Add to `app/layout.tsx`:
```tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

### **Setup Error Tracking (Sentry)**
```bash
npm install @sentry/nextjs
```

---

## 🧪 **POST-DEPLOYMENT TESTING**

### **Smoke Tests**:
1. [ ] Homepage loads correctly
2. [ ] Login/signup works
3. [ ] Patient dashboard accessible
4. [ ] Nutritionist dashboard accessible
5. [ ] All AI features load (may show mock data)
6. [ ] Forms submit correctly
7. [ ] Navigation works
8. [ ] Mobile responsive
9. [ ] Dark mode works

### **Performance Tests**:
1. [ ] Lighthouse score > 90
2. [ ] First Contentful Paint < 1.5s
3. [ ] Time to Interactive < 3s
4. [ ] No console errors

---

## 🔄 **CI/CD SETUP**

### **GitHub Actions Workflow**

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run tests
        run: npm test
        
      - name: Build
        run: npm run build
        
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

---

## 📱 **MOBILE APP (Optional)**

### **PWA Configuration**

Already configured in `next.config.js`. To enhance:

1. Create `public/manifest.json`:
```json
{
  "name": "NutriPlan",
  "short_name": "NutriPlan",
  "description": "Plataforma de Nutrição com IA",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#10b981",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

---

## 🎯 **GO-LIVE CHECKLIST**

### **Pre-Launch** (1 week before):
- [ ] All environment variables configured
- [ ] Database migrations complete
- [ ] Backup strategy in place
- [ ] Monitoring tools configured
- [ ] Error tracking enabled
- [ ] Performance tested
- [ ] Security audit completed
- [ ] Legal pages added (Terms, Privacy)

### **Launch Day**:
- [ ] Final production build
- [ ] DNS configured
- [ ] SSL certificate active
- [ ] Monitoring dashboards open
- [ ] Support team ready
- [ ] Rollback plan prepared

### **Post-Launch** (first 24 hours):
- [ ] Monitor error rates
- [ ] Check performance metrics
- [ ] Verify all features working
- [ ] Collect user feedback
- [ ] Fix critical bugs immediately

---

## 🆘 **TROUBLESHOOTING**

### **Common Issues**:

**Build Fails**:
```bash
# Clear cache
rm -rf .next
npm run build
```

**Environment Variables Not Working**:
- Restart dev server after changing .env
- Verify variable names start with NEXT_PUBLIC_ for client-side
- Check Vercel dashboard for production variables

**Database Connection Issues**:
- Verify Supabase URL and keys
- Check RLS policies
- Ensure tables exist

---

## 📞 **SUPPORT & MAINTENANCE**

### **Regular Maintenance**:
- Weekly: Check error logs
- Monthly: Review performance metrics
- Quarterly: Security audit
- Yearly: Dependency updates

### **Backup Strategy**:
- Supabase: Automatic daily backups
- User uploads: S3 versioning enabled
- Database: Weekly manual exports

---

## 🎉 **DEPLOYMENT COMPLETE!**

Your NutriPlan platform is now live! 🚀

**Next Steps**:
1. Monitor initial user feedback
2. Iterate on features
3. Scale infrastructure as needed
4. Continue AI model improvements

---

*Last Updated: 2026-02-03*  
*Version: 1.0.0*
