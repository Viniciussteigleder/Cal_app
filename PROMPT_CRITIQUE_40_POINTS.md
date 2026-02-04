# 🔍 PROFESSIONAL PROMPT CRITIQUE - 40 POINTS

## Evaluation Framework: Professional Implementation Prompt for NutriPlan

**Evaluator**: Senior Technical Architect & Prompt Engineering Specialist  
**Date**: 2026-02-04  
**Version Evaluated**: V1

---

## SCORING SYSTEM

- **Excellent (9-10)**: Exceeds expectations, industry best practice
- **Good (7-8)**: Meets expectations, minor improvements possible
- **Adequate (5-6)**: Functional but needs significant improvement
- **Poor (3-4)**: Major gaps, requires substantial rework
- **Critical (1-2)**: Fundamentally flawed, unusable

---

## 1. CLARITY & COMPREHENSIVENESS (10 points)

### **Score: 7/10**

#### ✅ Strengths:
- Clear module breakdown with numbered requirements (REQ-XX-XX)
- Expert roles well-defined with specific responsibilities
- Comprehensive coverage of all requested features
- Good use of formatting (headers, code blocks, tables)

#### ⚠️ Weaknesses:
- **Overwhelming length** (200+ KB): Too dense for initial consumption
- **Lack of executive summary**: No quick-start guide or TL;DR
- **Missing prioritization matrix**: All requirements seem equally important
- **No visual diagrams**: Complex relationships (e.g., multi-tenant architecture) need flowcharts

#### 💡 Improvement Points:
1. Add 1-page executive summary at the top
2. Create visual architecture diagrams (system, data flow, user journeys)
3. Implement priority levels (P0-Critical, P1-High, P2-Medium, P3-Nice-to-have)
4. Break into separate documents: Overview, Technical Specs, UI/UX Guidelines

---

## 2. TECHNICAL PRECISION (10 points)

### **Score: 8/10**

#### ✅ Strengths:
- **Database schema is well-structured**: Proper normalization, indexes, foreign keys
- **Technology stack is current**: Next.js 16, React 19, Prisma 5.22
- **Security considerations**: RLS, LGPD/GDPR, audit trails
- **AI integration is realistic**: GPT-4 Vision for OCR, proper token management

#### ⚠️ Weaknesses:
- **Missing API endpoint specifications**: No REST/GraphQL endpoint definitions
- **Incomplete error handling strategy**: No mention of retry logic, fallbacks
- **Vague "JSONB" usage**: Need specific schemas for JSONB fields
- **No performance benchmarks**: Missing query optimization targets (e.g., \< 100ms for food search)

#### 💡 Improvement Points:
1. Define API contracts (OpenAPI/Swagger specs)
2. Specify JSONB schemas with TypeScript interfaces
3. Add performance SLAs (Service Level Agreements) per module
4. Include database migration strategy (zero-downtime deployments)

---

## 3. IMPLEMENTATION FEASIBILITY (10 points)

### **Score: 6/10**

#### ✅ Strengths:
- **Phased approach**: 12-week timeline is realistic
- **Uses existing tech stack**: Leverages current NutriPlan infrastructure
- **Incremental delivery**: Can ship modules independently

#### ⚠️ Weaknesses:
- **Underestimates AI complexity**: Exam OCR with 90% accuracy is ambitious (real-world: 70-80%)
- **Multi-source food tables**: Integration of TBCA, TACO, BLS, Tucunduva is 3-6 months alone
- **No mention of data migration**: How to populate food tables? Manual? Automated?
- **Tucunduva availability unclear**: Prompt assumes access, but it's a commercial/proprietary source
- **Missing team size assumptions**: Is this for 1 developer or 10?

#### 💡 Improvement Points:
1. **Realistic AI accuracy targets**: 70-80% for OCR, with mandatory human validation
2. **Phased food table rollout**: Start with TACO (public, well-documented), add others later
3. **Data seeding strategy**: Scripts to import TACO/TBCA, manual entry for Tucunduva
4. **Team composition**: Specify 2 backend, 2 frontend, 1 AI specialist minimum
5. **MVP definition**: Define Phase 1 MVP (Prontuário + Exames only) for faster validation

---

## 4. USER EXPERIENCE FOCUS (10 points)

### **Score: 7/10**

#### ✅ Strengths:
- **Patient context persistence**: Critical UX requirement well-defined
- **Accessibility**: WCAG 2.1 AA mentioned
- **Mobile-first**: Responsive design emphasized
- **Dark mode**: Modern UX expectation included

#### ⚠️ Weaknesses:
- **Missing user flows**: No step-by-step workflows (e.g., "How does a nutritionist add a new patient?")
- **No wireframes/mockups**: Text-only descriptions are hard to visualize
- **Unclear navigation hierarchy**: How many clicks to reach Exam Results from Dashboard?
- **No mention of onboarding**: How do new nutritionists learn the system?
- **Offline support**: No consideration for poor internet (common in Brazil)

#### 💡 Improvement Points:
1. **User journey maps**: Visualize key workflows (patient intake, meal planning, exam review)
2. **Wireframes**: Low-fidelity sketches for each module
3. **Navigation sitemap**: Tree diagram showing all pages and their relationships
4. **Onboarding flow**: Interactive tutorial for first-time users
5. **Progressive Web App (PWA)**: Offline support for critical features (meal logging)

---

## 5. LOCALIZATION & CULTURAL ADAPTATION (5 points)

### **Score: 4/5**

#### ✅ Strengths:
- **Roberto Silva role**: Dedicated localization expert
- **PT-BR primary**: Correct prioritization for Brazilian market
- **German support**: Acknowledges DE market for food tables
- **Regional food names**: Mentions "abobrinha" vs "courgette"

#### ⚠️ Weaknesses:
- **No translation workflow**: How are new features translated? Manual? Automated?
- **Missing cultural nuances**: Brazilian meal timing (café da manhã, almoço, jantar, lanche) not explicitly defined
- **No locale-specific validation**: E.g., Brazilian phone format (11) 98765-4321

#### 💡 Improvement Points:
1. **Translation management**: Use i18n platform (e.g., Lokalise, Crowdin)
2. **Cultural calendar**: Brazilian holidays, meal times, fasting periods (Ramadan for Muslim patients)
3. **Locale-specific formats**: Phone, CPF (Brazilian ID), date/time, currency

---

## 6. SECURITY & COMPLIANCE (5 points)

### **Score: 5/5**

#### ✅ Strengths:
- **LGPD/GDPR**: Explicitly mentioned
- **Multi-tenancy**: Row-level security (RLS)
- **Audit trail**: All clinical changes logged
- **Soft deletes**: No hard deletion of patient data
- **Encrypted storage**: Files and data at rest

#### ⚠️ Weaknesses:
- None significant for initial prompt

#### 💡 Improvement Points:
1. **Data retention policies**: How long to keep patient data after account closure?
2. **Right to be forgotten**: LGPD Article 18 - patient data deletion process
3. **Consent management**: Explicit patient consent for AI processing

---

## 7. AI INTEGRATION STRATEGY (5 points)

### **Score: 6/10**

#### ✅ Strengths:
- **Multiple AI agents**: Well-defined use cases
- **Cost optimization**: Token limits, model selection
- **Prompt engineering**: Role definition, context, output format
- **Safety filters**: No medical diagnosis, no prescription

#### ⚠️ Weaknesses:
- **No fallback for AI failures**: What if GPT-4 is down?
- **Prompt versioning**: How to update prompts without breaking existing workflows?
- **No A/B testing**: How to measure prompt effectiveness?
- **Missing human-in-the-loop**: All AI outputs should be reviewable, but not always enforced
- **No cost ceiling**: What if a patient triggers $100 in AI costs?

#### 💡 Improvement Points:
1. **Fallback mechanisms**: Manual entry if AI fails, queue for retry
2. **Prompt version control**: Git-based prompt management, rollback capability
3. **AI output metrics**: Track accuracy, user edits, rejection rate
4. **Cost guardrails**: Per-patient daily/monthly AI budget limits
5. **Human validation UI**: Clear "AI-generated" badges, easy edit/reject buttons

---

## 8. DATABASE DESIGN (5 points)

### **Score: 8/10**

#### ✅ Strengths:
- **Proper normalization**: Separate tables for entities, relationships
- **Indexes**: Performance-critical indexes defined
- **Multi-source support**: `dataset_release_id` for versioning
- **Audit trail**: `created_at`, `updated_at`, `validated_by` fields
- **Soft deletes**: `deleted_at` field (where applicable)

#### ⚠️ Weaknesses:
- **Missing composite indexes**: E.g., `(patient_id, exam_date, canonical_exam_id)` for exam time-series queries
- **No partitioning strategy**: Large tables (e.g., `patient_log_entries`) will need partitioning by date
- **JSONB schema validation**: No CHECK constraints or triggers to validate JSONB structure

#### 💡 Improvement Points:
1. **Composite indexes**: Add for common query patterns
2. **Table partitioning**: Partition `patient_log_entries` by month/year
3. **JSONB validation**: Use PostgreSQL CHECK constraints with `jsonb_schema_is_valid()`
4. **Materialized views**: For expensive aggregations (e.g., exam trends)

---

## 9. ERROR HANDLING & EDGE CASES (5 points)

### **Score: 4/10**

#### ✅ Strengths:
- **Validation status**: `pending`, `validated`, `rejected` for exam results
- **Confidence levels**: `high`, `medium`, `low` for AI extractions

#### ⚠️ Weaknesses:
- **No error scenarios defined**: What if exam PDF is corrupted?
- **Missing edge cases**: What if patient has 2 exams on same day with conflicting values?
- **No retry logic**: AI API failures not addressed
- **Incomplete validation**: What if AI extracts negative cholesterol value?

#### 💡 Improvement Points:
1. **Error taxonomy**: Define error types (user error, system error, AI error, data error)
2. **Edge case matrix**: Document 20+ edge cases per module with handling strategy
3. **Retry policies**: Exponential backoff for AI API calls
4. **Data validation**: Range checks for biomarkers (e.g., cholesterol 0-500 mg/dL)
5. **Conflict resolution**: UI to resolve duplicate/conflicting exam results

---

## 10. TESTING & QUALITY ASSURANCE (5 points)

### **Score: 3/10**

#### ✅ Strengths:
- **Acceptance criteria**: Defined at end of prompt

#### ⚠️ Weaknesses:
- **No testing strategy**: Unit, integration, E2E tests not mentioned
- **No test data**: How to generate realistic test patients, exams, meals?
- **Missing QA process**: Code review, manual testing, user acceptance testing (UAT)
- **No performance testing**: Load testing, stress testing not addressed
- **AI testing unclear**: How to validate AI outputs systematically?

#### 💡 Improvement Points:
1. **Testing pyramid**: 70% unit, 20% integration, 10% E2E
2. **Test data generation**: Faker.js for synthetic patients, real TACO data for foods
3. **AI testing framework**: Golden dataset of 100 exam PDFs with known-good extractions
4. **Performance benchmarks**: Lighthouse CI, database query profiling
5. **UAT plan**: Beta test with 5 real nutritionists before launch

---

## 11. DOCUMENTATION & KNOWLEDGE TRANSFER (5 points)

### **Score: 5/10**

#### ✅ Strengths:
- **Comprehensive prompt**: Serves as initial documentation
- **Code comments implied**: TypeScript interfaces shown

#### ⚠️ Weaknesses:
- **No API documentation**: Swagger/OpenAPI not mentioned
- **Missing developer onboarding**: How does a new dev get started?
- **No user documentation**: Nutritionist user guide, patient FAQ
- **Unclear knowledge base**: Where to document decisions, FAQs, troubleshooting?

#### 💡 Improvement Points:
1. **API docs**: Auto-generated from code (tRPC, OpenAPI)
2. **Developer README**: Setup guide, architecture overview, contribution guidelines
3. **User documentation**: In-app help, video tutorials, knowledge base (Notion, GitBook)
4. **Decision log**: ADRs (Architecture Decision Records) for major choices
5. **Runbooks**: Operational guides for deployment, monitoring, incident response

---

## 12. SCALABILITY & PERFORMANCE (5 points)

### **Score: 5/10**

#### ✅ Strengths:
- **Indexes**: Defined for common queries
- **Multi-tenancy**: Efficient data isolation

#### ⚠️ Weaknesses:
- **No caching strategy**: Redis, CDN not mentioned
- **Missing rate limiting**: API abuse prevention
- **No horizontal scaling**: How to handle 10,000 concurrent users?
- **Database connection pooling**: Not addressed
- **File storage CDN**: Images/PDFs should be CDN-cached

#### 💡 Improvement Points:
1. **Caching layers**: Redis for session, API responses; CDN for static assets
2. **Rate limiting**: Per-user, per-tenant API quotas
3. **Database scaling**: Read replicas, connection pooling (PgBouncer)
4. **Serverless functions**: Offload AI processing to AWS Lambda/Vercel Functions
5. **CDN**: Cloudflare/Vercel Edge for global performance

---

## 13. MONITORING & OBSERVABILITY (5 points)

### **Score: 2/10**

#### ✅ Strengths:
- **Audit trail**: Logs clinical changes

#### ⚠️ Weaknesses:
- **No application monitoring**: APM (Application Performance Monitoring) not mentioned
- **Missing error tracking**: Sentry, Rollbar, etc.
- **No logging strategy**: Structured logs, log aggregation
- **Unclear alerting**: Who gets notified when AI fails? Database is slow?
- **No dashboards**: Business metrics, system health not visualized

#### 💡 Improvement Points:
1. **APM**: Vercel Analytics, Datadog, New Relic
2. **Error tracking**: Sentry for frontend/backend errors
3. **Logging**: Structured JSON logs, aggregated in Logtail/Papertrail
4. **Alerting**: PagerDuty, Slack webhooks for critical errors
5. **Dashboards**: Grafana for system metrics, Metabase for business KPIs

---

## 14. COST MANAGEMENT (5 points)

### **Score: 6/10**

#### ✅ Strengths:
- **AI cost controls**: Token limits, daily/monthly budgets
- **Model selection**: GPT-3.5 for simple tasks, GPT-4 for complex

#### ⚠️ Weaknesses:
- **No infrastructure cost estimates**: Vercel, Supabase, OpenAI monthly costs?
- **Missing cost allocation**: How to bill tenants for AI usage?
- **No cost monitoring**: Real-time cost tracking dashboard

#### 💡 Improvement Points:
1. **Cost calculator**: Estimate monthly costs based on user count, AI usage
2. **Billing integration**: Stripe for tenant billing, usage-based pricing
3. **Cost dashboard**: Real-time AWS/Vercel/OpenAI cost tracking
4. **Budget alerts**: Notify when approaching cost thresholds

---

## 15. DEPLOYMENT & CI/CD (5 points)

### **Score: 4/10**

#### ✅ Strengths:
- **Deployment platform**: Vercel specified
- **Database migrations**: Prisma migrate mentioned

#### ⚠️ Weaknesses:
- **No CI/CD pipeline**: GitHub Actions, GitLab CI not defined
- **Missing deployment strategy**: Blue-green? Canary? Rolling?
- **No rollback plan**: What if deployment breaks production?
- **Unclear environment strategy**: Dev, staging, production setup?

#### 💡 Improvement Points:
1. **CI/CD pipeline**: GitHub Actions for lint, test, build, deploy
2. **Deployment strategy**: Vercel preview deployments for PRs, production on merge
3. **Rollback**: Vercel instant rollback, database migration rollback scripts
4. **Environments**: Dev (local), Staging (Vercel preview), Production (Vercel prod)
5. **Feature flags**: LaunchDarkly for gradual rollouts

---

## 📊 TOTAL SCORE: 80/150 (53%)

---

## 🎯 OVERALL ASSESSMENT

### **Grade: C+ (Adequate, Needs Significant Improvement)**

The prompt is **comprehensive and well-structured** but suffers from:
1. **Overwhelming complexity** without prioritization
2. **Missing practical implementation details** (API specs, error handling, testing)
3. **Overly optimistic timelines** and AI accuracy expectations
4. **Lack of visual aids** (diagrams, wireframes, user flows)
5. **Insufficient operational considerations** (monitoring, deployment, cost management)

---

## 🚀 TOP 10 CRITICAL IMPROVEMENTS

### **1. Add Executive Summary (1 page)**
- Problem statement
- Solution overview
- Key features (top 5)
- Success metrics
- Timeline (high-level)

### **2. Create Visual Architecture Diagrams**
- System architecture (multi-tenant, microservices)
- Data flow (patient → exam upload → AI extraction → validation → storage)
- User journey maps (5 key workflows)

### **3. Define MVP Scope (Phase 1)**
- **P0 Features**: Prontuário + Exames only
- **Timeline**: 4 weeks (not 12)
- **Success criteria**: 5 beta nutritionists, 50 patients

### **4. Realistic AI Expectations**
- **OCR accuracy**: 70-80% (not 90%)
- **Mandatory human validation**: All AI outputs reviewed
- **Fallback**: Manual entry always available

### **5. Phased Food Table Rollout**
- **Phase 1**: TACO only (public, well-documented)
- **Phase 2**: TBCA (6 months later)
- **Phase 3**: BLS (German market, 12 months)
- **Phase 4**: Tucunduva (if accessible, 18 months)

### **6. API Specifications**
- **OpenAPI/Swagger**: Define all endpoints
- **Request/response schemas**: TypeScript interfaces
- **Error codes**: Standardized (4xx, 5xx)

### **7. Comprehensive Testing Strategy**
- **Unit tests**: 80% coverage
- **Integration tests**: API endpoints, database
- **E2E tests**: Playwright for critical workflows
- **AI testing**: Golden dataset (100 exam PDFs)

### **8. Monitoring & Alerting**
- **APM**: Vercel Analytics + Sentry
- **Dashboards**: System health, business KPIs
- **Alerts**: Slack/PagerDuty for critical errors

### **9. Cost Management**
- **Monthly estimate**: $500-2000 (Vercel + Supabase + OpenAI)
- **Cost dashboard**: Real-time tracking
- **Billing**: Usage-based pricing for tenants

### **10. Operational Runbooks**
- **Deployment**: Step-by-step guide
- **Rollback**: Emergency procedures
- **Incident response**: On-call rotation, escalation

---

## 📋 IMPROVEMENT CHECKLIST

### **Immediate (Before Starting Development)**
- [ ] Create 1-page executive summary
- [ ] Define MVP scope (Prontuário + Exames only)
- [ ] Draw system architecture diagram
- [ ] Specify API endpoints (OpenAPI)
- [ ] Set realistic AI accuracy targets (70-80%)

### **Short-term (Week 1-2)**
- [ ] Create user journey maps (5 key workflows)
- [ ] Design wireframes (low-fidelity)
- [ ] Write test plan (unit, integration, E2E)
- [ ] Set up CI/CD pipeline (GitHub Actions)
- [ ] Configure monitoring (Sentry, Vercel Analytics)

### **Medium-term (Month 1-2)**
- [ ] Implement comprehensive error handling
- [ ] Add performance benchmarks (Lighthouse, query profiling)
- [ ] Create user documentation (in-app help, videos)
- [ ] Set up cost tracking dashboard
- [ ] Conduct security audit (LGPD compliance)

### **Long-term (Month 3+)**
- [ ] Scale food table integration (TBCA, BLS)
- [ ] Implement advanced AI features (Protocol Generator)
- [ ] Add offline support (PWA)
- [ ] Internationalize (full German support)
- [ ] Optimize for 10,000+ concurrent users

---

## 🎓 LESSONS LEARNED

### **What Worked Well**
1. **Expert roles**: Clear ownership and accountability
2. **Modular structure**: Easy to navigate and reference
3. **Database schema**: Well-designed, normalized
4. **Security focus**: LGPD/GDPR compliance upfront

### **What Needs Improvement**
1. **Prioritization**: Not all features are equally important
2. **Realism**: AI accuracy, timelines, data availability
3. **Visuals**: Diagrams, wireframes, user flows
4. **Operations**: Monitoring, deployment, cost management

### **Key Takeaway**
> **"A great prompt is not just comprehensive—it's actionable, realistic, and prioritized."**

---

**END OF 40-POINT CRITIQUE**
