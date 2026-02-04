# 🚀 Deployment Fix & Best Practices

## Issues Fixed

### 1. **Prisma Version Mismatch**
- **Problem**: Prisma Client v5.22.0 was being generated but package.json specified v5.19.1
- **Solution**: Updated both `@prisma/client` and `prisma` to `^5.22.0` in package.json

### 2. **Missing Postinstall Hook**
- **Problem**: Prisma Client wasn't automatically generated after `npm install`
- **Solution**: Added `"postinstall": "prisma generate"` script

### 3. **Incomplete Build Command**
- **Problem**: Build command didn't handle database migrations in production
- **Solution**: Added `"vercel-build": "prisma generate && prisma migrate deploy && next build"`

### 4. **Vercel Configuration**
- **Problem**: Redundant build commands in vercel.json
- **Solution**: Simplified vercel.json to let Vercel use the `vercel-build` script automatically

## Updated Files

### `package.json`
```json
{
  "scripts": {
    "postinstall": "prisma generate",
    "vercel-build": "prisma generate && prisma migrate deploy && next build"
  },
  "dependencies": {
    "@prisma/client": "^5.22.0"
  },
  "devDependencies": {
    "prisma": "^5.22.0"
  }
}
```

### `vercel.json`
```json
{
  "framework": "nextjs",
  "regions": ["iad1"],
  "env": {
    "NEXT_PUBLIC_APP_URL": "https://nutriplan-app.vercel.app"
  }
}
```

## Deployment Checklist

### Before Deploying

1. **Install Updated Dependencies**
   ```bash
   npm install
   ```

2. **Verify Prisma Client Generation**
   ```bash
   npm run prisma:generate
   ```

3. **Test Build Locally**
   ```bash
   npm run build
   ```

4. **Run Pre-deployment Checks** (Optional)
   ```bash
   ./scripts/pre-deploy.sh
   ```

### Environment Variables Required

Make sure these are set in your Vercel project:

```bash
# Database (Required)
DATABASE_URL=postgresql://user:password@host:port/database

# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# AI Services (Optional but recommended)
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# App Configuration
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
NEXT_PUBLIC_APP_NAME=NutriPlan
```

### Vercel Deployment Steps

1. **Link to Vercel** (if not already linked)
   ```bash
   vercel link
   ```

2. **Set Environment Variables**
   ```bash
   # Via Vercel CLI
   vercel env add DATABASE_URL production
   vercel env add NEXT_PUBLIC_SUPABASE_URL production
   # ... add all required variables
   
   # Or via Vercel Dashboard:
   # Project Settings → Environment Variables
   ```

3. **Deploy to Production**
   ```bash
   vercel --prod
   ```

   Or push to main branch if you have Git integration:
   ```bash
   git add .
   git commit -m "fix: deployment configuration"
   git push origin main
   ```

## Common Deployment Issues & Solutions

### Issue 1: "Prisma Client not found"
**Cause**: Prisma Client wasn't generated during build  
**Solution**: The `postinstall` script now handles this automatically

### Issue 2: "DATABASE_URL not set"
**Cause**: Missing environment variable  
**Solution**: Add DATABASE_URL in Vercel project settings

### Issue 3: "Migration failed"
**Cause**: Database schema out of sync  
**Solution**: The `vercel-build` script runs `prisma migrate deploy` automatically

### Issue 4: "Build timeout"
**Cause**: Long build times  
**Solution**: 
- Ensure you're using the latest Next.js (16.1.6 ✅)
- Consider upgrading Vercel plan for faster builds
- Check for unnecessary dependencies

### Issue 5: "Type errors during build"
**Current Status**: TypeScript errors are ignored via `ignoreBuildErrors: true`  
**Recommendation**: Fix type errors gradually and remove this flag

## Build Performance Optimization

### Current Build Script
```bash
prisma generate && prisma migrate deploy && next build
```

### What Happens:
1. **Prisma Generate** (~5-10s): Generates type-safe database client
2. **Prisma Migrate Deploy** (~2-5s): Applies pending migrations
3. **Next Build** (~30-60s): Builds the application

### Expected Total Build Time: 40-75 seconds

## Monitoring Deployment

### Check Build Logs
```bash
vercel logs --follow
```

### Check Deployment Status
```bash
vercel ls
```

### Inspect Specific Deployment
```bash
vercel inspect [deployment-url]
```

## Post-Deployment Verification

1. **Check Homepage**
   - Visit your deployment URL
   - Verify it loads without errors

2. **Check Database Connection**
   - Try logging in
   - Create a test record
   - Verify data persistence

3. **Check Console**
   - Open browser DevTools
   - Look for any errors in Console tab
   - Check Network tab for failed requests

4. **Performance Check**
   ```bash
   # Run Lighthouse audit
   npx lighthouse https://your-domain.vercel.app --view
   ```

## Rollback Plan

If deployment fails:

1. **Immediate Rollback**
   ```bash
   vercel rollback
   ```

2. **Deploy Previous Version**
   ```bash
   vercel --prod [previous-deployment-url]
   ```

3. **Revert Git Commit**
   ```bash
   git revert HEAD
   git push origin main
   ```

## Next Steps

1. ✅ **Updated package.json** with correct Prisma versions and build scripts
2. ✅ **Simplified vercel.json** configuration
3. ✅ **Created pre-deployment validation script**
4. 🔄 **Run `npm install`** to update dependencies
5. 🔄 **Test build locally** with `npm run build`
6. 🔄 **Deploy to Vercel** with `vercel --prod`

## Continuous Improvement

### Recommended Future Enhancements

1. **Add TypeScript Strict Mode**
   - Remove `ignoreBuildErrors: true`
   - Fix all type errors
   - Enable strict mode

2. **Add Pre-commit Hooks**
   ```bash
   npm install -D husky lint-staged
   npx husky install
   ```

3. **Add Build Caching**
   - Already enabled by default in Vercel
   - Consider using Turborepo for monorepo optimization

4. **Add Health Check Endpoint**
   ```typescript
   // app/api/health/route.ts
   export async function GET() {
     return Response.json({ status: 'ok', timestamp: new Date().toISOString() })
   }
   ```

5. **Add Database Connection Pool**
   - Already handled by Prisma
   - Monitor connection usage in production

---

**Last Updated**: 2026-02-04  
**Status**: ✅ Ready for Deployment
