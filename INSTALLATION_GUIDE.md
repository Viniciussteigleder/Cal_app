# Phase 1 Installation Guide - AI Features

## 🚀 Quick Start (5 minutes)

### Step 1: Install Dependencies

```bash
# Install AI provider SDKs
npm install openai @anthropic-ai/sdk

# Install additional UI dependencies (if not already installed)
npm install recharts
```

### Step 2: Set Up Environment Variables

```bash
# Copy the AI environment template
cp .env.ai.example .env.local

# Edit .env.local and add your OpenAI API key
# Get it from: https://platform.openai.com/api-keys
```

Add to your `.env.local`:
```env
OPENAI_API_KEY=sk-proj-...
```

### Step 3: Run Database Migration

```bash
# Connect to your database
psql -U viniciussteigleder -d nutriplan

# Run the Phase 1 migration
\i prisma/migrations/phase1_ai_infrastructure.sql

# Exit psql
\q

# Generate Prisma client
npx prisma generate
```

### Step 4: Start Development Server

```bash
npm run dev
```

### Step 5: Access AI Features

Navigate to:
- **AI Dashboard**: http://localhost:3000/studio/ai
- **Food Recognition**: http://localhost:3000/studio/ai/food-recognition
- **Meal Planner**: http://localhost:3000/studio/ai/meal-planner
- **Patient Analyzer**: http://localhost:3000/studio/ai/patient-analyzer

---

## 📋 Detailed Installation Steps

### Prerequisites

- ✅ Node.js 18+ installed
- ✅ PostgreSQL database running
- ✅ Existing NutriPlan app set up
- ✅ OpenAI API account (https://platform.openai.com)

### 1. Install NPM Packages

```bash
# Core AI dependencies
npm install openai@^4.0.0
npm install @anthropic-ai/sdk@^0.20.0

# Chart library for analytics
npm install recharts@^2.10.0

# Verify installation
npm list openai @anthropic-ai/sdk recharts
```

### 2. Database Setup

#### Option A: Using SQL Migration (Recommended)

```bash
# Navigate to project directory
cd /Users/viniciussteigleder/Documents/Web\ apps\ -\ vide\ coding/Cal_app

# Run migration
psql -U viniciussteigleder -d nutriplan -f prisma/migrations/phase1_ai_infrastructure.sql

# Verify tables were created
psql -U viniciussteigleder -d nutriplan -c "\dt" | grep -E "AIModel|AIExecution|FoodRecognition"
```

#### Option B: Using Prisma Migrate

```bash
# Create a new migration
npx prisma migrate dev --name add_ai_infrastructure

# Apply migration
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate
```

### 3. OpenAI API Setup

1. **Create Account**
   - Go to https://platform.openai.com
   - Sign up or log in

2. **Generate API Key**
   - Navigate to https://platform.openai.com/api-keys
   - Click "Create new secret key"
   - Name it "NutriPlan AI Features"
   - Copy the key (starts with `sk-proj-...`)

3. **Add Credits**
   - Go to https://platform.openai.com/account/billing
   - Add payment method
   - Add at least $10 in credits for testing

4. **Set Usage Limits** (Recommended)
   - Go to https://platform.openai.com/account/limits
   - Set monthly budget limit (e.g., $50)
   - Set email notifications

### 4. Environment Configuration

Create or update `.env.local`:

```env
# ============================================================================
# AI CONFIGURATION
# ============================================================================

# OpenAI API Key (REQUIRED)
OPENAI_API_KEY=sk-proj-your-key-here

# Anthropic API Key (OPTIONAL - for future use)
# ANTHROPIC_API_KEY=sk-ant-your-key-here

# AI Feature Flags
AI_FEATURES_ENABLED=true
AI_DEFAULT_LLM_MODEL=gpt-4-turbo-preview
AI_DEFAULT_VISION_MODEL=gpt-4-vision-preview
AI_DEFAULT_STT_MODEL=whisper-1

# Cost Controls
AI_MAX_TOKENS=4000
AI_REQUEST_TIMEOUT=30000
AI_MAX_COST_PER_EXECUTION=1.00
AI_DAILY_COST_LIMIT=50.00

# ============================================================================
# EXISTING CONFIGURATION (Keep as is)
# ============================================================================

DATABASE_URL=postgresql://nutriplan_app:your-password@localhost:5432/nutriplan
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 5. Verify Installation

```bash
# Start dev server
npm run dev

# In another terminal, test the AI service
curl -X POST http://localhost:3000/api/ai/food-recognition \
  -H "Content-Type: application/json" \
  -d '{
    "imageUrl": "https://example.com/meal.jpg",
    "patientId": "test-patient-id",
    "tenantId": "test-tenant-id"
  }'
```

Expected response:
```json
{
  "success": true,
  "data": {
    "recognized_foods": [...],
    "confidence_score": 0.85
  },
  "executionId": "uuid",
  "tokensUsed": 1234,
  "cost": 0.05
}
```

---

## 🧪 Testing

### Test Food Recognition

1. Navigate to http://localhost:3000/studio/ai/food-recognition
2. Upload a test meal image
3. Verify AI recognizes foods
4. Check database for `FoodRecognition` record

### Test Meal Planner

1. Navigate to http://localhost:3000/studio/ai/meal-planner
2. Set parameters (2000 kcal, 30/45/25 macro split)
3. Click "Generate Meal Plan"
4. Verify plan is generated
5. Check database for `AIMealPlan` record

### Test Patient Analyzer

1. Navigate to http://localhost:3000/studio/ai/patient-analyzer
2. Click "Run Analysis"
3. Verify metrics are displayed
4. Check database for `PatientAnalysis` record

---

## 🔍 Troubleshooting

### Issue: "OpenAI API key not found"

**Solution:**
```bash
# Verify .env.local exists
ls -la .env.local

# Check if OPENAI_API_KEY is set
grep OPENAI_API_KEY .env.local

# Restart dev server
npm run dev
```

### Issue: "Database table does not exist"

**Solution:**
```bash
# Re-run migration
psql -U viniciussteigleder -d nutriplan -f prisma/migrations/phase1_ai_infrastructure.sql

# Regenerate Prisma client
npx prisma generate

# Restart server
npm run dev
```

### Issue: "Module not found: openai"

**Solution:**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Verify installation
npm list openai
```

### Issue: "AI request timeout"

**Solution:**
- Check internet connection
- Verify OpenAI API status: https://status.openai.com
- Increase timeout in `.env.local`:
  ```env
  AI_REQUEST_TIMEOUT=60000
  ```

### Issue: "Insufficient AI credits"

**Solution:**
```sql
-- Grant AI credits to tenant
UPDATE "Tenant" 
SET ai_credits = 1000, ai_enabled = true 
WHERE id = 'your-tenant-id';
```

---

## 📊 Monitoring

### Check AI Usage

```sql
-- Total AI executions
SELECT COUNT(*) FROM "AIExecution";

-- Executions by agent type
SELECT agent_type, COUNT(*) as count, SUM(cost) as total_cost
FROM "AIExecution"
GROUP BY agent_type;

-- Recent executions
SELECT * FROM "AIExecution"
ORDER BY created_at DESC
LIMIT 10;

-- Failed executions
SELECT * FROM "AIExecution"
WHERE status = 'failed'
ORDER BY created_at DESC;
```

### Monitor Costs

```sql
-- Daily cost by tenant
SELECT 
  tenant_id,
  DATE(created_at) as date,
  SUM(cost) as daily_cost
FROM "AIExecution"
GROUP BY tenant_id, DATE(created_at)
ORDER BY date DESC;

-- Cost by model
SELECT 
  m.name,
  COUNT(e.id) as executions,
  SUM(e.cost) as total_cost,
  AVG(e.cost) as avg_cost
FROM "AIExecution" e
JOIN "AIModel" m ON e.model_id = m.id
GROUP BY m.name;
```

---

## 🎯 Next Steps

After successful installation:

1. ✅ **Enable AI for Tenants**
   ```sql
   UPDATE "Tenant" 
   SET ai_enabled = true, ai_credits = 1000 
   WHERE id = 'your-tenant-id';
   ```

2. ✅ **Add Navigation Links**
   - Update sidebar to include AI features
   - Add "AI" section with links to all agents

3. ✅ **Test with Real Data**
   - Upload actual meal photos
   - Generate real meal plans
   - Analyze actual patients

4. ✅ **Configure Webhooks** (Optional)
   - Set up webhook endpoints
   - Test event delivery

5. ✅ **Set Up Monitoring**
   - Configure cost alerts
   - Set up error notifications
   - Monitor usage patterns

---

## 📚 Additional Resources

- **OpenAI Documentation**: https://platform.openai.com/docs
- **Prisma Documentation**: https://www.prisma.io/docs
- **Next.js API Routes**: https://nextjs.org/docs/api-routes/introduction

---

## 💡 Tips

- **Start Small**: Test with 1-2 patients first
- **Monitor Costs**: Check daily usage in OpenAI dashboard
- **Set Limits**: Use environment variables to control costs
- **Collect Feedback**: Use AIFeedback table to improve prompts
- **Iterate**: Adjust AI prompts based on results

---

## 🆘 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review error logs: `tail -f .next/server.log`
3. Check OpenAI status: https://status.openai.com
4. Review database logs: `psql -U viniciussteigleder -d nutriplan -c "SELECT * FROM \"AIExecution\" WHERE status = 'failed' ORDER BY created_at DESC LIMIT 5;"`

---

**Installation complete! 🎉**

You're now ready to use AI features in NutriPlan!
