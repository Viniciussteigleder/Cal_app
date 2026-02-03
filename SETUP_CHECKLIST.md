# ✅ Phase 1 Setup Checklist

## Installation Progress

### ✅ Step 1: Dependencies Installed
- [x] openai (v4.0.0+)
- [x] @anthropic-ai/sdk (v0.20.0+)
- [x] recharts (v2.10.0+)

**Status:** ✅ COMPLETE

---

### ⏳ Step 2: Environment Configuration
- [x] AI variables added to `.env.local`
- [ ] **ACTION REQUIRED:** Add your OpenAI API key

**Current Status:**
```env
OPENAI_API_KEY=sk-proj-REPLACE_WITH_YOUR_KEY  ⚠️ NEEDS UPDATE
```

**How to get your API key:**
1. Go to https://platform.openai.com/api-keys
2. Sign up or log in
3. Click "Create new secret key"
4. Name it "NutriPlan AI Features"
5. Copy the key (starts with `sk-proj-...`)
6. Replace `REPLACE_WITH_YOUR_KEY` in `.env.local`

---

### ⏳ Step 3: Database Migration
- [ ] Run SQL migration
- [ ] Generate Prisma client
- [ ] Verify tables created

**Commands to run:**
```bash
# 1. Run the migration
psql -U viniciussteigleder -d nutriplan -f prisma/migrations/phase1_ai_infrastructure.sql

# 2. Generate Prisma client
npx prisma generate

# 3. Verify tables
psql -U viniciussteigleder -d nutriplan -c "\dt" | grep -E "AIModel|AIExecution|FoodRecognition"
```

---

### ⏳ Step 4: Enable AI for Tenant
- [ ] Grant AI credits to your tenant
- [ ] Enable AI features

**SQL to run:**
```sql
-- Connect to database
psql -U viniciussteigleder -d nutriplan

-- Enable AI for your tenant
UPDATE "Tenant" 
SET 
  ai_enabled = true,
  ai_credits = 1000,
  subscription_tier = 'professional'
WHERE id = '694db8e5-4484-448c-8538-2fa972dbf27a';

-- Verify
SELECT id, name, ai_enabled, ai_credits FROM "Tenant";
```

---

### ⏳ Step 5: Test AI Features
- [ ] Start dev server
- [ ] Access AI Dashboard
- [ ] Test Food Recognition
- [ ] Test Meal Planner
- [ ] Test Patient Analyzer

**Commands:**
```bash
# Start dev server
npm run dev

# Then navigate to:
# http://localhost:3000/studio/ai
```

---

## Quick Test Commands

### Test 1: Verify Dependencies
```bash
npm list openai @anthropic-ai/sdk recharts
```

Expected: All three packages listed with versions

---

### Test 2: Check Environment
```bash
grep OPENAI_API_KEY .env.local
```

Expected: Should show your API key (not REPLACE_WITH_YOUR_KEY)

---

### Test 3: Verify Database Tables
```bash
psql -U viniciussteigleder -d nutriplan -c "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE 'AI%' ORDER BY table_name;"
```

Expected output:
```
     table_name      
---------------------
 AIExecution
 AIFeedback
 AIMealPlan
 AIModel
 AITrainingData
```

---

### Test 4: Check Tenant AI Status
```bash
psql -U viniciussteigleder -d nutriplan -c "SELECT name, ai_enabled, ai_credits, subscription_tier FROM \"Tenant\" WHERE id = '694db8e5-4484-448c-8538-2fa972dbf27a';"
```

Expected:
```
 name | ai_enabled | ai_credits | subscription_tier 
------+------------+------------+-------------------
 ... | t          | 1000       | professional
```

---

## Current Status Summary

| Step | Status | Action Required |
|------|--------|-----------------|
| 1. Install Dependencies | ✅ Complete | None |
| 2. Environment Config | ⚠️ Partial | Add OpenAI API key |
| 3. Database Migration | ⏳ Pending | Run SQL migration |
| 4. Enable AI for Tenant | ⏳ Pending | Update tenant record |
| 5. Test Features | ⏳ Pending | Start dev server |

---

## Next Steps (In Order)

### 1. Get OpenAI API Key (5 minutes)
- Visit https://platform.openai.com/api-keys
- Create account or log in
- Generate new API key
- Add $10+ in credits for testing

### 2. Update .env.local (1 minute)
- Open `.env.local`
- Replace `REPLACE_WITH_YOUR_KEY` with your actual key
- Save file

### 3. Run Database Migration (2 minutes)
```bash
cd "/Users/viniciussteigleder/Documents/Web apps - vide coding/Cal_app"
psql -U viniciussteigleder -d nutriplan -f prisma/migrations/phase1_ai_infrastructure.sql
npx prisma generate
```

### 4. Enable AI for Tenant (1 minute)
```bash
psql -U viniciussteigleder -d nutriplan -c "UPDATE \"Tenant\" SET ai_enabled = true, ai_credits = 1000 WHERE id = '694db8e5-4484-448c-8538-2fa972dbf27a';"
```

### 5. Start Testing (5 minutes)
```bash
npm run dev
# Navigate to http://localhost:3000/studio/ai
```

---

## Troubleshooting

### Issue: "Cannot find module 'openai'"
**Solution:**
```bash
rm -rf node_modules package-lock.json
npm install
```

### Issue: "OPENAI_API_KEY is not defined"
**Solution:**
1. Check `.env.local` has the key
2. Restart dev server: `npm run dev`
3. Verify key starts with `sk-proj-` or `sk-`

### Issue: "Table AIModel does not exist"
**Solution:**
```bash
# Re-run migration
psql -U viniciussteigleder -d nutriplan -f prisma/migrations/phase1_ai_infrastructure.sql

# Regenerate Prisma client
npx prisma generate
```

### Issue: "Insufficient AI credits"
**Solution:**
```bash
psql -U viniciussteigleder -d nutriplan -c "UPDATE \"Tenant\" SET ai_credits = 1000 WHERE id = '694db8e5-4484-448c-8538-2fa972dbf27a';"
```

---

## Files Created (18 total)

### Backend
- [x] `src/lib/ai/ai-service.ts`
- [x] `src/app/api/ai/food-recognition/route.ts`
- [x] `src/app/api/ai/meal-planner/route.ts`
- [x] `src/app/api/ai/patient-analyzer/route.ts`

### Frontend
- [x] `src/app/studio/ai/page.tsx`
- [x] `src/app/studio/ai/food-recognition/page.tsx`
- [x] `src/app/studio/ai/meal-planner/page.tsx`
- [x] `src/app/studio/ai/patient-analyzer/page.tsx`

### Database
- [x] `prisma/migrations/phase1_ai_infrastructure.sql`
- [x] `prisma/schema_phase1_additions.prisma`

### Configuration
- [x] `.env.ai.example`
- [x] `.env.local` (updated)

### Documentation
- [x] `DATABASE_ARCHITECTURE_ENHANCEMENT.md`
- [x] `IMPLEMENTATION_ROADMAP.md`
- [x] `COMPLETE_FEATURE_LIST.md`
- [x] `INSTALLATION_GUIDE.md`
- [x] `PHASE1_IMPLEMENTATION_SUMMARY.md`
- [x] `FINAL_SUMMARY.md`

---

## Estimated Time to Complete

- ✅ Dependencies: **DONE** (0 min)
- ⏳ OpenAI API Key: **5 min**
- ⏳ Database Migration: **2 min**
- ⏳ Enable AI: **1 min**
- ⏳ Testing: **5 min**

**Total remaining: ~13 minutes**

---

## Support

If you need help:
1. Check `INSTALLATION_GUIDE.md` for detailed instructions
2. Review `FINAL_SUMMARY.md` for complete overview
3. Check troubleshooting section above

---

**Last Updated:** 2026-02-02 23:07  
**Status:** Dependencies installed, awaiting OpenAI API key
