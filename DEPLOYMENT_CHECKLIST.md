# ✅ Deployment Checklist

Use this checklist to ensure a successful deployment.

## 📋 Pre-Deployment

### 1. Code Quality
- [ ] All features tested locally
- [ ] No console errors in browser DevTools
- [ ] Build completes successfully (`npm run build`)
- [ ] Application runs in production mode (`npm run start`)

### 2. Environment Variables
- [ ] `DATABASE_URL` set in Vercel
- [ ] `NEXT_PUBLIC_SUPABASE_URL` set in Vercel
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` set in Vercel
- [ ] `SUPABASE_SERVICE_ROLE_KEY` set in Vercel
- [ ] `NEXT_PUBLIC_APP_URL` set in Vercel
- [ ] `OPENAI_API_KEY` set in Vercel (if using AI features)
- [ ] `ANTHROPIC_API_KEY` set in Vercel (if using AI features)

### 3. Database
- [ ] Database is accessible from Vercel's IP range
- [ ] All migrations are committed to Git
- [ ] Database has sufficient resources (connections, storage)
- [ ] Backup strategy in place

### 4. Dependencies
- [ ] `npm install` completed without errors
- [ ] Prisma Client generated successfully
- [ ] No critical security vulnerabilities (`npm audit`)

## 🚀 Deployment

### Option A: Git-based Deployment (Recommended)
- [ ] Changes committed to Git
  ```bash
  git add .
  git commit -m "fix: deployment configuration"
  ```
- [ ] Pushed to main branch
  ```bash
  git push origin main
  ```
- [ ] Vercel deployment triggered automatically
- [ ] Deployment logs reviewed for errors

### Option B: Manual Deployment
- [ ] Vercel CLI installed (`npm i -g vercel`)
- [ ] Logged into Vercel (`vercel login`)
- [ ] Project linked (`vercel link`)
- [ ] Deployed to production (`vercel --prod`)

## 🧪 Post-Deployment Testing

### 1. Basic Functionality
- [ ] Homepage loads without errors
- [ ] Login/signup works
- [ ] Navigation works correctly
- [ ] All main pages accessible

### 2. Patient Portal
- [ ] Dashboard displays correctly
- [ ] Diary/log entry works
- [ ] Meal plan visible
- [ ] Progress tracking works
- [ ] Symptom logging works

### 3. Studio Portal
- [ ] Dashboard loads
- [ ] Patient list displays
- [ ] Can view patient details
- [ ] Forms work correctly
- [ ] AI features accessible (may show mock data)

### 4. Performance
- [ ] Page load time < 3 seconds
- [ ] No console errors
- [ ] Images load correctly
- [ ] Mobile responsive
- [ ] Dark mode works

### 5. Database
- [ ] Can create new records
- [ ] Can read existing records
- [ ] Can update records
- [ ] Can delete records (soft delete)
- [ ] Data persists across page refreshes

## 🔍 Monitoring

### First 24 Hours
- [ ] Check Vercel Analytics dashboard
- [ ] Monitor error logs (`vercel logs --follow`)
- [ ] Watch for performance issues
- [ ] Collect user feedback
- [ ] Fix critical bugs immediately

### Ongoing
- [ ] Weekly: Review error logs
- [ ] Monthly: Check performance metrics
- [ ] Quarterly: Security audit
- [ ] As needed: Scale resources

## 🆘 Troubleshooting

### If Build Fails
- [ ] Check Vercel build logs for errors
- [ ] Verify all environment variables are set
- [ ] Ensure DATABASE_URL is correct
- [ ] Try clearing build cache (redeploy)
- [ ] Check Prisma schema for syntax errors

### If Runtime Errors Occur
- [ ] Check browser console for errors
- [ ] Review Vercel function logs
- [ ] Verify database connection
- [ ] Check API routes are working
- [ ] Ensure environment variables are accessible

### If Database Issues
- [ ] Verify DATABASE_URL is correct
- [ ] Check database is accessible
- [ ] Ensure migrations are applied
- [ ] Check connection pool limits
- [ ] Review Prisma logs

## 📊 Success Metrics

### Deployment Success
- [ ] Build completed in < 2 minutes
- [ ] No build errors
- [ ] All routes deployed successfully
- [ ] Health check passes

### Application Success
- [ ] Lighthouse score > 90
- [ ] First Contentful Paint < 1.5s
- [ ] Time to Interactive < 3s
- [ ] No critical errors in logs

### User Success
- [ ] Users can access the application
- [ ] Core features work as expected
- [ ] No data loss
- [ ] Positive user feedback

## 🎉 Deployment Complete!

Once all items are checked:
- [ ] Announce deployment to team
- [ ] Update documentation if needed
- [ ] Monitor for first 24 hours
- [ ] Plan next iteration

---

## 📝 Notes

**Deployment Date**: _______________

**Deployed By**: _______________

**Deployment URL**: _______________

**Issues Encountered**: 
_______________________________________________
_______________________________________________
_______________________________________________

**Resolution**: 
_______________________________________________
_______________________________________________
_______________________________________________

---

## 🔗 Quick Links

- [Deployment Summary](./DEPLOYMENT_SUMMARY.md)
- [Deployment Fix Details](./DEPLOYMENT_FIX.md)
- [Deployment Commands](./DEPLOY_COMMANDS.md)
- [Deployment Flow](./DEPLOYMENT_FLOW.md)
- [Vercel Dashboard](https://vercel.com/dashboard)
- [Supabase Dashboard](https://app.supabase.com)

---

**Last Updated**: 2026-02-04
