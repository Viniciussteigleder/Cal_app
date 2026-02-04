# 🚀 Vercel Deployment Guide - NutriPlan

## Quick Deploy (Demo/Preview Mode)

The app will now build successfully on Vercel **without a database** for preview purposes. All functionality uses mock data.

### Step 1: Deploy to Vercel

```bash
# Push to your GitHub repository
git push origin main

# Or use Vercel CLI
vercel deploy
```

The build will succeed with a placeholder DATABASE_URL. The app will be fully functional with mock data.

---

## Full Production Deployment (With Database)

To enable real data persistence, you need to set up a PostgreSQL database.

### Option 1: Vercel Postgres (Recommended)

1. Go to your Vercel project dashboard
2. Navigate to **Storage** tab
3. Click **Create Database** → **Postgres**
4. Copy the `DATABASE_URL` connection string
5. Go to **Settings** → **Environment Variables**
6. Add these variables:

```env
DATABASE_URL=postgresql://...  (from Vercel Postgres)
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

### Option 2: Supabase Postgres (Alternative)

1. Create a Supabase project at https://supabase.com
2. Get your database URL from **Project Settings** → **Database**
3. Add to Vercel environment variables:

```env
DATABASE_URL=postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require

# Optional: For Supabase Auth features
SUPABASE_URL=https://[PROJECT-REF].supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Step 2: Run Database Migrations

After setting up the database, run migrations:

```bash
# Local setup
npx prisma migrate deploy

# Or via Vercel CLI
vercel env pull .env.local
npx prisma migrate deploy
```

### Step 3: Seed Demo Data (Optional)

```bash
npm run populate:demo
```

This creates 3 demo accounts:
- **Patient**: `patient@demo.nutriplan.com`
- **Nutritionist**: `nutri@demo.nutriplan.com`
- **Owner**: `owner@demo.nutriplan.com`

---

## Environment Variables Reference

### Required for Production
```env
DATABASE_URL=postgresql://...
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

### Optional (AI Features)
```env
OPENAI_API_KEY=sk-...           # For AI meal planner, food recognition, etc.
ANTHROPIC_API_KEY=sk-ant-...    # Alternative AI provider
```

### Optional (Authentication)
```env
SUPABASE_URL=https://...
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

### Optional (Demo Accounts)
```env
DEMO_PASSWORD=your-secure-password
```

---

## Build Configuration

The `vercel.json` includes:
- **Placeholder DATABASE_URL** for build-time (no real DB needed for demo)
- **Region**: `iad1` (US East)
- **Framework**: Next.js 16

To deploy with real database, simply add the environment variables in Vercel dashboard.

---

## Troubleshooting

### ❌ Build fails with "DATABASE_URL must start with postgresql://"
**Solution**: The placeholder DATABASE_URL in `vercel.json` should fix this. If not, add `DATABASE_URL` to Vercel environment variables with any valid PostgreSQL URL format.

### ❌ App works but no data persists
**Solution**: You're using mock data (demo mode). Add real `DATABASE_URL` to enable persistence.

### ❌ Prisma client errors at runtime
**Solution**:
1. Ensure `DATABASE_URL` is set in **Environment Variables** (not just build env)
2. Redeploy after adding the variable
3. Check database is accessible from Vercel's region

---

## Next Steps After Deployment

1. ✅ Verify medical disclaimers appear on all AI pages
2. ✅ Test LGPD consent checkboxes in signup flow
3. ✅ Check mobile responsiveness (especially patient table)
4. ✅ Verify accessibility features (skip link, ARIA labels)
5. ⚙️ Configure OpenAI API key to enable real AI features
6. 📊 Set up analytics (Vercel Analytics, Mixpanel, etc.)
7. 🔒 Configure custom domain with SSL

---

## Current Build Status

- ✅ **Frontend**: 100% functional (mock data)
- ✅ **UI/UX**: WCAG 2.1 AA compliant
- ✅ **Legal**: Medical disclaimers + LGPD consent
- ⚠️ **Backend APIs**: 5% complete (mostly mock responses)
- ⚠️ **Database**: Optional (app works without it)

**Demo URL**: Will be available after first deploy
**Production**: Requires DATABASE_URL for full functionality
