# 🚀 PRODUCTION DEPLOYMENT GUIDE
## Complete Step-by-Step Production Launch

**Estimated Time**: 2-3 hours total  
**Difficulty**: Medium  
**Prerequisites**: All integration guides completed

---

## 📋 **PRE-DEPLOYMENT CHECKLIST**

### **1. Database** ✅
- [ ] Supabase project created
- [ ] All tables created (9 tables)
- [ ] RLS policies enabled
- [ ] Storage buckets created (4 buckets)
- [ ] Connection tested

**Guide**: `DATABASE_SETUP_GUIDE.md`

### **2. AI Integration** ✅
- [ ] OpenAI API key obtained
- [ ] `openai` package installed
- [ ] API key in environment
- [ ] All AI APIs updated
- [ ] Test successful

**Guide**: `REAL_AI_INTEGRATION.md`

### **3. File Storage** ✅
- [ ] Storage buckets configured
- [ ] Upload API updated
- [ ] Test upload successful
- [ ] Files accessible

**Guide**: `FILE_STORAGE_INTEGRATION.md`

### **4. Email Service** ✅
- [ ] Resend account created
- [ ] Domain verified
- [ ] `resend` package installed
- [ ] Templates created
- [ ] Test email sent

**Guide**: `EMAIL_INTEGRATION.md`

---

## 🔧 **DEPLOYMENT STEPS**

### **Step 1: Environment Variables** (10 minutes)

1. Go to your Vercel project dashboard
2. Click **Settings** → **Environment Variables**
3. Add all variables:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# OpenAI
OPENAI_API_KEY=sk-...
OPENAI_ORGANIZATION=org-... # Optional

# Resend
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=nutriplan@yourdomain.com
RESEND_FROM_NAME=NutriPlan

# App
NEXT_PUBLIC_APP_URL=https://nutriplan.vercel.app
NODE_ENV=production
```

4. Click "Save" for each variable
5. Select **Production**, **Preview**, and **Development** for each

---

### **Step 2: Build and Deploy** (15 minutes)

1. **Local Build Test**:
```bash
npm run build
```

2. **Fix any build errors**:
   - Check TypeScript errors
   - Check missing imports
   - Check environment variables

3. **Commit and Push**:
```bash
git add .
git commit -m "Production ready - all integrations complete"
git push origin main
```

4. **Vercel Auto-Deploy**:
   - Vercel will automatically detect the push
   - Build will start automatically
   - Wait 2-5 minutes for deployment

5. **Check Deployment**:
   - Go to Vercel dashboard
   - Check deployment status
   - View deployment logs
   - Click "Visit" to see live site

---

### **Step 3: Post-Deployment Verification** (20 minutes)

#### **A. Test Authentication**:
1. Go to `/signup`
2. Create a test account
3. Verify email (if enabled)
4. Log in
5. Check dashboard loads

#### **B. Test Database**:
1. Create a test patient
2. Create a test meal plan
3. Create a test protocol
4. Verify data saves
5. Verify data loads

#### **C. Test AI Features**:
1. Go to `/studio/ai/meal-planner`
2. Generate a meal plan
3. Verify AI response
4. Check credits deducted
5. Test 2-3 other AI agents

#### **D. Test File Upload**:
1. Upload a food photo
2. Upload an exam PDF
3. Verify files appear in Supabase Storage
4. Verify files are accessible

#### **E. Test Email**:
1. Trigger a welcome email
2. Check inbox
3. Verify email formatting
4. Test links in email

---

### **Step 4: Performance Optimization** (15 minutes)

1. **Enable Vercel Analytics**:
   - Go to Vercel dashboard
   - Click **Analytics**
   - Enable Web Analytics
   - Enable Speed Insights

2. **Enable Caching**:
```typescript
// In next.config.js
module.exports = {
  // ... existing config
  headers: async () => [
    {
      source: '/:path*',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=3600, must-revalidate',
        },
      ],
    },
  ],
};
```

3. **Optimize Images**:
   - All images should use Next.js `<Image>` component
   - Already implemented in the app

4. **Enable Compression**:
   - Vercel automatically enables gzip/brotli
   - No action needed

---

### **Step 5: Monitoring Setup** (15 minutes)

#### **A. Vercel Monitoring**:
1. Go to **Analytics** → **Web Vitals**
2. Monitor:
   - Largest Contentful Paint (LCP)
   - First Input Delay (FID)
   - Cumulative Layout Shift (CLS)

#### **B. Supabase Monitoring**:
1. Go to Supabase dashboard
2. Check **Database** → **Usage**
3. Monitor:
   - Database size
   - API requests
   - Storage usage

#### **C. OpenAI Monitoring**:
1. Go to [platform.openai.com/usage](https://platform.openai.com/usage)
2. Set up billing alerts:
   - $50 threshold
   - $100 threshold
   - $200 threshold

#### **D. Error Tracking** (Optional but Recommended):

Install Sentry:
```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

Add to `.env.local`:
```bash
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn
```

---

### **Step 6: Security Hardening** (20 minutes)

#### **A. Enable Rate Limiting**:

Create middleware:
```typescript
// File: /src/middleware.ts

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const rateLimit = new Map<string, { count: number; resetTime: number }>();

export function middleware(request: NextRequest) {
  const ip = request.ip || 'unknown';
  const now = Date.now();
  
  // Get or create rate limit entry
  let limit = rateLimit.get(ip);
  if (!limit || now > limit.resetTime) {
    limit = { count: 0, resetTime: now + 60000 }; // 1 minute window
    rateLimit.set(ip, limit);
  }
  
  // Check limit (100 requests per minute)
  if (limit.count > 100) {
    return new NextResponse('Too many requests', { status: 429 });
  }
  
  limit.count++;
  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
```

#### **B. Add Security Headers**:

```typescript
// In next.config.js
module.exports = {
  // ... existing config
  headers: async () => [
    {
      source: '/:path*',
      headers: [
        {
          key: 'X-DNS-Prefetch-Control',
          value: 'on',
        },
        {
          key: 'Strict-Transport-Security',
          value: 'max-age=63072000; includeSubDomains; preload',
        },
        {
          key: 'X-Frame-Options',
          value: 'SAMEORIGIN',
        },
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff',
        },
        {
          key: 'X-XSS-Protection',
          value: '1; mode=block',
        },
        {
          key: 'Referrer-Policy',
          value: 'origin-when-cross-origin',
        },
      ],
    },
  ],
};
```

#### **C. Environment Variable Security**:
- [ ] Never commit `.env.local` to git
- [ ] Use different keys for dev/staging/prod
- [ ] Rotate keys every 90 days
- [ ] Use Vercel's encrypted variables

---

### **Step 7: Backup Strategy** (10 minutes)

#### **A. Database Backups**:

Supabase Pro includes:
- Daily automatic backups
- 7-day retention
- Point-in-time recovery

Free tier:
- Manual backups via SQL dump
- Schedule weekly backups

```bash
# Manual backup script
pg_dump "postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres" > backup_$(date +%Y%m%d).sql
```

#### **B. Code Backups**:
- [ ] GitHub repository (already done)
- [ ] Enable branch protection on `main`
- [ ] Require pull request reviews
- [ ] Enable status checks

---

### **Step 8: Custom Domain** (15 minutes)

1. **Buy Domain** (if not done):
   - Namecheap, GoDaddy, or Google Domains
   - Recommended: `nutriplan.com.br` or `nutriplan.app`

2. **Add to Vercel**:
   - Go to Vercel project
   - Click **Settings** → **Domains**
   - Click "Add"
   - Enter your domain
   - Follow DNS instructions

3. **Update DNS**:
   - Add A record: `76.76.21.21`
   - Add CNAME record: `cname.vercel-dns.com`
   - Wait 5-30 minutes for propagation

4. **Enable SSL**:
   - Vercel automatically provisions SSL
   - Certificate from Let's Encrypt
   - Auto-renewal

---

## ✅ **FINAL VERIFICATION**

### **Functionality** ✅
- [ ] All pages load
- [ ] Authentication works
- [ ] Database operations work
- [ ] AI features work
- [ ] File uploads work
- [ ] Emails send
- [ ] No console errors

### **Performance** ✅
- [ ] LCP < 2.5s
- [ ] FID < 100ms
- [ ] CLS < 0.1
- [ ] Page load < 3s
- [ ] API response < 1s

### **Security** ✅
- [ ] HTTPS enabled
- [ ] Security headers set
- [ ] Rate limiting enabled
- [ ] RLS policies active
- [ ] API keys secure

### **Monitoring** ✅
- [ ] Vercel Analytics enabled
- [ ] Supabase monitoring set up
- [ ] OpenAI billing alerts set
- [ ] Error tracking enabled

### **Backups** ✅
- [ ] Database backups enabled
- [ ] Code in GitHub
- [ ] Branch protection enabled

---

## 🎯 **POST-LAUNCH TASKS**

### **Week 1**:
- [ ] Monitor error rates
- [ ] Check performance metrics
- [ ] Review user feedback
- [ ] Fix critical bugs

### **Week 2**:
- [ ] Analyze usage patterns
- [ ] Optimize slow queries
- [ ] Review AI costs
- [ ] Plan feature improvements

### **Month 1**:
- [ ] Review all metrics
- [ ] Conduct user interviews
- [ ] Plan roadmap
- [ ] Scale infrastructure if needed

---

## 📊 **EXPECTED METRICS**

### **Performance**:
- Page load: 1-2 seconds
- API response: 200-500ms
- AI response: 2-5 seconds
- Uptime: 99.9%

### **Costs** (100 active patients):
- Vercel: $0 (Hobby) or $20 (Pro)
- Supabase: $0 (Free) or $25 (Pro)
- OpenAI: ~$90/month
- Resend: $0 (Free) or $20 (Pro)
- **Total**: $90-155/month

### **Usage**:
- Database: ~500MB
- Storage: ~800MB
- Bandwidth: ~10GB/month
- AI requests: ~1,000/month

---

## 🚨 **TROUBLESHOOTING**

### **Build Fails**:
1. Check build logs in Vercel
2. Run `npm run build` locally
3. Fix TypeScript errors
4. Check environment variables

### **Database Connection Fails**:
1. Verify Supabase URL
2. Check API keys
3. Test connection locally
4. Check RLS policies

### **AI Calls Fail**:
1. Verify OpenAI API key
2. Check billing status
3. Review rate limits
4. Check error logs

### **Emails Don't Send**:
1. Verify Resend API key
2. Check domain verification
3. Review email logs
4. Test with different email

---

## ✅ **DEPLOYMENT COMPLETE!**

**Your NutriPlan platform is now LIVE in production!** 🎉

**Next Steps**:
1. Share with beta users
2. Gather feedback
3. Monitor metrics
4. Iterate and improve

**Support**:
- Vercel: [vercel.com/support](https://vercel.com/support)
- Supabase: [supabase.com/docs](https://supabase.com/docs)
- OpenAI: [platform.openai.com/docs](https://platform.openai.com/docs)
- Resend: [resend.com/docs](https://resend.com/docs)

---

**Congratulations on launching NutriPlan! 🚀**
