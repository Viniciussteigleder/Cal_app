# 🚀 Quick Deployment Commands

## Local Development
```bash
# Start development server
npm run dev

# Generate Prisma Client
npm run prisma:generate

# Run database migrations (dev)
npm run prisma:migrate
```

## Build & Test
```bash
# Install dependencies (includes automatic Prisma generation)
npm install

# Build for production
npm run build

# Test production build locally
npm run start
```

## Vercel Deployment

### First Time Setup
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Link project
vercel link
```

### Deploy
```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

### Environment Variables
```bash
# Add environment variable
vercel env add VARIABLE_NAME production

# Pull environment variables to local
vercel env pull
```

## Git-based Deployment
```bash
# Commit changes
git add .
git commit -m "your message"

# Push to main (triggers automatic deployment)
git push origin main
```

## Troubleshooting

### Clear Build Cache
```bash
rm -rf .next
npm run build
```

### Regenerate Prisma Client
```bash
npx prisma generate
```

### Check Deployment Logs
```bash
vercel logs --follow
```

### Rollback Deployment
```bash
vercel rollback
```

## Pre-deployment Checklist
- [ ] All environment variables set in Vercel
- [ ] Database migrations are up to date
- [ ] Build passes locally (`npm run build`)
- [ ] No TypeScript errors (or acknowledged)
- [ ] All tests pass (`npm test`)

## Required Environment Variables
```
DATABASE_URL
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
OPENAI_API_KEY (optional)
ANTHROPIC_API_KEY (optional)
NEXT_PUBLIC_APP_URL
```
