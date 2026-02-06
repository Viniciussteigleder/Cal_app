# 🛠️ Remaining Features Implementation Plan

**Date**: 2026-02-06
**Based on**: `WHAT_IS_MISSING.md` (2026-02-04) and Codebase Audit

## 📊 Status Overview

The codebase has advanced significantly since the last analysis. The **Frontend UI is nearly 100% complete**, and the **Server Actions/API structure is in place** for all major features (Patient Log, AI Agents, Protocol Management).

However, several critical backend services are currently **MOCKED** and need to be replaced with real integrations to be production-ready.

---

## 🔴 Critical Gaps (Must Fix for Production)

### 1. File Storage (Currently Mocked)
- **Current State**: `/api/upload` returns success but matches no real storage. `fs` writing is commented out or disabled.
- **Goal**: Integrate **Supabase Storage**.
- **Steps**:
  1. Create `StorageService` utility in `lib/storage.ts`.
  2. Configure Supabase Storage buckets (`patients`, `exams`, `foods`).
  3. Update `/api/upload/route.ts` to upload to Supabase and return public/authenticated URLs.
  4. Ensure `DailyLogTimeline` and `PatientProfile` use these real URLs.

### 2. Email & Notifications (Currently Mocked)
- **Current State**: `/api/notifications/email` simulates a delay and logs to console.
- **Goal**: Integrate **Resend** or **SendGrid**.
- **Steps**:
  1. Install SDK (e.g. `resend`).
  2. Create standard Email Templates (Welcome, Meal Plan, Appointment).
  3. Update `/api/notifications/email/route.ts` to actually send emails.
  4. Verify domain verification status.

### 3. Authentication Hardening
- **Current State**: `/api/auth/login` attempts Database login but falls back to `MOCK_USERS` if not in production.
- **Goal**: Secure Auth for Production.
- **Steps**:
  1. Audit `auth/login/route.ts` to ensure the mock fallback is strictly disabled in `NODE_ENV=production`.
  2. Implement `middleware.ts` robustly to protect `/studio` and `/owner` routes (currently relies on client-side or basic checks).
  3. Ensure Password Hashing (`bcryptjs`) is consistently used for all new user creation.

### 4. Database Setup & Sync
- **Current State**: Code assumes Prisma schema is in sync. `verify-deployment.js` checks for deployment issues.
- **Goal**: Reliable Database Migration.
- **Steps**:
  1. Confirm `prisma/schema.prisma` matches the code expectations (e.g. `PatientAnalysis` table).
  2. Ensure `prisma db push` or `prisma migrate deploy` is part of the build/deployment pipeline (verified in `package.json` scripts).
  3. Verify RLS policies on Supabase if allowing direct client access (though currently using Server Actions/Prisma which bypass RLS).

---

## 🟡 Important Enhancements (Feature Completion)

### 5. AI Agent "Real" Execution
- **Current State**: `ai-service.ts` is implemented for `patient_analyzer`, `meal_planner`, `food_recognition`.
- **Goal**: Full Verification.
- **Steps**:
  1. Ensure `OPENAI_API_KEY` is set in the environment.
  2. Verify `food_recognition` receives real image URLs (from the new Storage implementation).
  3. Test `medical-record-creator` (Whisper) - check if endpoint exists and is wired.

### 6. PDF Generation (Missing)
- **Current State**: Likely simulated or basic printing.
- **Goal**: Professional PDF Reports.
- **Steps**:
  1. Implement `react-pdf` or a generation endpoint.
  2. Create `PDFService` to generating Meal Plan PDFs and Expert Reports.

---

## 🗓️ Implementation Roadmap

### Week 1: Infrastructure & "Real" Backend
- **Day 1**: **Storage Integration** (Supabase Buckets + API Update).
- **Day 2**: **Email Service** (Resend Setup + Template Creation).
- **Day 3**: **Auth Hardening** & Middleware Review.
- **Day 4**: **Database Sync** & Migration Verification.
- **Day 5**: **AI Verification** (Test all agents with real keys).

### Week 2: Polish & Reporting
- **Day 1-2**: **PDF Generation** for Meal Plans & Analysis.
- **Day 3-4**: **E2E Testing** of critical flows (Login -> Upload Exam -> AI Analyze -> Log).
- **Day 5**: **Production Deploy** & Final Checks.

---

## ✅ Recommendation
Focus immediately on **Storage** and **Email**, as these are currently "fake" endpoints that will break user trust if they try to save data that disappears or expect emails that never arrive.
