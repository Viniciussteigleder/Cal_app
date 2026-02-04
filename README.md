# 🥗 NutriPlan - AI-Powered Nutrition Platform

A comprehensive nutrition management platform built with Next.js, featuring AI-powered meal planning, symptom tracking, and patient management.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL database (or Supabase)
- npm or pnpm

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your credentials

# Generate Prisma Client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## 📚 Documentation

### Essential Guides
- **[Deployment Checklist](./DEPLOYMENT_CHECKLIST.md)** - Step-by-step deployment guide
- **[Deployment Summary](./DEPLOYMENT_SUMMARY.md)** - Overview of deployment fixes
- **[Deploy Commands](./DEPLOY_COMMANDS.md)** - Quick command reference
- **[Deployment Flow](./DEPLOYMENT_FLOW.md)** - Visual deployment diagrams

### Additional Documentation
- [Installation Guide](./INSTALLATION_GUIDE.md)
- [Database Setup](./DATABASE_SETUP_GUIDE.md)
- [API Documentation](./API_IMPLEMENTATION_STATUS.md)
- [Testing Guide](./TESTING_CHECKLIST.md)

## 🛠️ Tech Stack

- **Framework**: Next.js 16.1.6 (App Router + Turbopack)
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Supabase Auth
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **AI**: OpenAI & Anthropic APIs
- **Deployment**: Vercel

## 📦 Available Scripts

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run start            # Start production server

# Database
npm run prisma:generate  # Generate Prisma Client
npm run prisma:migrate   # Run migrations (dev)
npm run prisma:seed      # Seed database

# Testing
npm test                 # Run unit tests
npm run test:e2e         # Run E2E tests

# Deployment
npm run vercel-build     # Production build (used by Vercel)
```

## 🌐 Deployment

### Deploy to Vercel (Recommended)

1. **Set Environment Variables** in Vercel Dashboard:
   - `DATABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `OPENAI_API_KEY` (optional)
   - `ANTHROPIC_API_KEY` (optional)

2. **Deploy**:
   ```bash
   # Via Git (recommended)
   git push origin main
   
   # Or via CLI
   vercel --prod
   ```

3. **Verify**: Check [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)

## 🔧 Recent Fixes (2026-02-04)

### Deployment Issues Resolved ✅
- Fixed Prisma version mismatch (now using 5.22.0)
- Added automatic Prisma Client generation via postinstall
- Implemented production migration deployment
- Simplified Vercel configuration
- Created comprehensive deployment documentation

See [DEPLOYMENT_FIX.md](./DEPLOYMENT_FIX.md) for details.

## 🏗️ Project Structure

```
├── src/
│   ├── app/              # Next.js App Router pages
│   ├── components/       # React components
│   ├── lib/             # Utilities and helpers
│   └── types/           # TypeScript types
├── prisma/
│   ├── schema.prisma    # Database schema
│   └── migrations/      # Database migrations
├── public/              # Static assets
└── scripts/             # Build and utility scripts
```

## 🎯 Features

### Patient Portal
- 📊 Dashboard with progress tracking
- 📝 Food diary and meal logging
- 🥗 Personalized meal plans
- 📈 Progress visualization
- 🩺 Symptom tracking
- 📱 Mobile-responsive design

### Studio Portal (Nutritionist)
- 👥 Patient management
- 📋 Custom forms and templates
- 🤖 AI-powered tools
- 📊 Analytics dashboard
- 📝 Protocol management
- 🍳 Recipe library

### AI Features
- Meal planning assistant
- Symptom correlation analysis
- Exam result analyzer
- Shopping list generator
- Supplement advisor
- Medical record creator

## 🔒 Security

- Row Level Security (RLS) enabled on all tables
- Environment variables for sensitive data
- API route authentication
- Input validation with Zod
- HTTPS enforced (automatic on Vercel)

## 📊 Performance

- ✅ Lighthouse score > 90
- ✅ First Contentful Paint < 1.5s
- ✅ Time to Interactive < 3s
- ✅ Optimized images with next/image
- ✅ Code splitting and lazy loading

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is proprietary software.

## 🆘 Support

- Check [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) for deployment issues
- Review [DEPLOYMENT_FIX.md](./DEPLOYMENT_FIX.md) for troubleshooting
- See [QUICK_START.md](./QUICK_START.md) for setup help

## 🎉 Status

**Current Version**: 0.1.0  
**Last Updated**: 2026-02-04  
**Status**: ✅ Production Ready

---

Built with ❤️ using Next.js and Prisma

