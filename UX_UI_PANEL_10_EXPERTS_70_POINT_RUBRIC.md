# UX/UI Panel (10 Experts) + 70-Point Rubric + Consolidated Fixes

**Review date:** 2026-02-08  
**Scope:** Landing (`/`), Patient Portal (`/patient/*`), Studio/Nutri (`/studio/*`), Owner (`/owner/*`)  
**Note:** This is a *simulated* expert panel (structured critique) based on the repository UI and routes.

## 1) Product Understanding (What This App Is)

**NutriPlan** is a multi-tenant nutrition platform with three main user groups:
- **Patient:** daily logging (meals, water, exercise, symptoms), plan adherence, chat/coach.
- **Nutritionist/Clinic team (Studio):** patient management, forms/templates, AI workflows (meal plans, OCR, reports), operations (agenda, materials, reports, billing).
- **Owner (cross-tenant admin):** integrity/governance, datasets, tenants/users, subscription oversight.

Primary success metrics implied by the UI:
- Faster, lower-friction meal logging and adherence loops (patient).
- Faster triage and decision support (studio).
- Strong tenant isolation, auditability, and operational clarity (owner).

## 2) “Best 10” UX/UI Expert Names (Anchored to Leading UX/UI Sources)

Each “expert” below is a persona aligned to a well-known UX/UI source (used as a lens, not attribution):
1. **Nielsen Norman Heuristics Auditor** (NN/g)
2. **Smashing Magazine UI Systems Editor** (Smashing)
3. **A List Apart IA Reviewer** (A List Apart)
4. **Material Design Interaction Specialist** (Material Design)
5. **Apple HIG Mobile Ergonomics Specialist** (Apple HIG)
6. **Gov.UK Accessibility Assessor** (GDS / Gov.UK)
7. **Stripe Dashboard Pattern Critic** (Stripe)
8. **Figma Design Systems Maintainer** (Figma)
9. **UX Collective Microcopy Editor** (UX Collective)
10. **Baymard Forms & Checkout Researcher** (Baymard)

## 3) 70-Point Assessment Per Expert (10 Categories x 0–7)

**Categories (max 70):**
1. Clarity of value + next step
2. Information architecture + navigation
3. Visual hierarchy + scannability
4. Accessibility (keyboard, labels, targets)
5. Mobile ergonomics (thumb zones, spacing)
6. Data entry friction (forms, logging)
7. Feedback + error states
8. Trust + safety signals (privacy, governance)
9. Consistency across portals
10. Performance perception (layout stability, loading)

### Panel Scores (Summary)

| Expert Persona | Score / 70 | Highest-Risk Finding |
| --- | ---: | --- |
| NN/g Heuristics Auditor | 43 | Inconsistent shells/navigation between pages causes “where am I?” moments. |
| Smashing UI Systems Editor | 46 | Two competing shells (PortalShell vs DashboardLayout vs NutriLayout) fragment UI consistency. |
| A List Apart IA Reviewer | 41 | Patient routes include competing “Diary” variants and mismatched labels/targets. |
| Material Interaction Specialist | 49 | Good component base, but some icon-only controls lack clear affordance/targets. |
| Apple HIG Mobile Specialist | 44 | Mobile nav “+” action was non-functional; home route mismatch. |
| Gov.UK Accessibility Assessor | 40 | Several icon buttons lacked `aria-label` and touch targets below recommended size. |
| Stripe Dashboard Critic | 47 | Owner/Patient pages nested shells add duplicated padding/background and “double headers”. |
| Figma DS Maintainer | 48 | The design language is strong; main issue is consistency enforcement and reuse. |
| UX Collective Microcopy Editor | 45 | Portal copy is strong, but some pages use wrong audience copy (“seus pacientes” in patient route). |
| Baymard Forms Researcher | 42 | Logging flows have avoidable steps; needs more “quick actions” and sane defaults. |

### Key Findings Per Expert (Top 7 items each, not exhaustive)

1. **NN/g Heuristics Auditor**
   - Unify layout shell per portal; avoid nesting shells.
   - Ensure “Home” means the same route everywhere.
   - Fix audience mismatches (patient vs studio copy).
   - Always show current location (active nav state).
   - Make primary actions functional and discoverable.
   - Reduce duplicate routes (one diary, one dashboard entry point).
   - Keep predictable “Settings” destinations per role.

2. **Smashing UI Systems Editor**
   - Enforce one shell component per portal and reuse patterns.
   - Centralize nav definitions and route naming conventions.
   - Standardize icon-button sizes and states.
   - Ensure cards/tables share consistent spacing tokens.
   - Create “page container” primitives for max-width consistency.
   - Avoid per-page background gradients when a shell already provides it.
   - Validate dark-mode initialization consistency (avoid per-component toggles).

3. **A List Apart IA Reviewer**
   - Remove “shadow routes” that look similar but differ (diary vs log).
   - Rename labels to match intent (“Diário” vs “Registrar” vs “Hoje”).
   - Make portal separation strict: studio-only pages must not appear in patient namespace.
   - Align navigation with mental models: Today, Plan, Log, Progress, Messages.
   - Confirm owner portal prioritizes governance and integrity, not mixed “app UX”.
   - Ensure consistent “back” behavior across auth and portals.
   - Reduce top-level nav options for first-week users.

4. **Material Design Interaction Specialist**
   - Convert dead-end buttons into links or actions (mobile “+”).
   - Improve focus behavior for clickables with `role="button"` + keyboard support.
   - Make states obvious: selected, hovered, active, disabled.
   - Prefer `Button size="icon"` with consistent dimensions.
   - Keep spacing predictable across breakpoints.
   - Audit icon usage for semantics and labels.
   - Avoid “dense” clusters of icons without text on mobile.

5. **Apple HIG Mobile Specialist**
   - Home route mismatch is a major trust breaker.
   - Touch targets should be comfortably tappable (not 24–32px).
   - The primary “create/log” action should always work and land in the capture flow.
   - Avoid vertical stacking that pushes primary action below the fold.
   - Keep the same bottom nav destinations across screens.
   - Use `dvh`-safe height calculations where needed.
   - Reduce “mode switching” within core flows unless it’s clearly explained.

6. **Gov.UK Accessibility Assessor**
   - Ensure icon-only buttons have accessible names.
   - Minimum touch target sizing for mobile controls.
   - Ensure interactive placeholders are keyboard reachable.
   - Prefer consistent landmarks and headings.
   - Keep “skip to content” where there is a sidebar layout (already present in DashboardLayout).
   - Avoid relying on color-only meaning for reactions.
   - Ensure “More” menu is reachable (was not actionable).

7. **Stripe Dashboard Pattern Critic**
   - Shell duplication causes visual “double framing”; fix at layout level.
   - Settings must be role-correct (owner should not land in studio settings).
   - Keep owner nav focused: tenants, users, integrity, datasets, subscription, AI config.
   - Preserve clear “operational” tone for owner.
   - Standardize max width for admin tables/cards.
   - Use consistent spacing and avoid extra wrapper padding.
   - Make quick navigation predictable across pages.

8. **Figma DS Maintainer**
   - Codify portal shells: PatientShell, OwnerShell, StudioShell or one DashboardLayout with roles.
   - Reduce one-off UI constructs in pages; prefer shared components.
   - Create naming conventions: `Today`, `Log`, `Capture`, `Plan`.
   - Keep icon buttons consistent via variants.
   - Ensure routes align with sidebar structure.
   - Avoid maintaining multiple “nav systems” for the same portal.
   - Keep typography scale consistent across portals.

9. **UX Collective Microcopy Editor**
   - Fix copy mismatches (patient page referring to “seus pacientes”).
   - Microcopy should guide next action (“Log meal”, “Open capture”).
   - Clarify what “Diary” means (photo triage vs patient daily log).
   - Avoid ambiguous “More” without destination.
   - Maintain strong tone already present on landing/auth.
   - Keep PT-BR diacritics consistent where used; avoid “Visao” vs “Visão”.
   - Use consistent CTA verbs across portals.

10. **Baymard Forms & Logging Researcher**
   - Logging should have fast defaults and low friction.
   - Support repeat actions (recent, favorites) in capture/log flows.
   - Keep primary action reachable on mobile.
   - Don’t hide key actions behind non-functional UI.
   - Provide “success” feedback tied to next step (already good in some flows).
   - Keep editing flows obvious (portions, corrections).
   - Standardize data entry components (inputs/selects).

## 4) Consolidated Feedback (Clustered)

**Cluster A: Shell + Navigation Consistency**
- One layout shell per portal, no nesting.
- Home route alignment (sidebar + mobile nav + links).
- Settings destinations per role.
- Remove route duplication / audience mismatch.

**Cluster B: Mobile Ergonomics + Actionability**
- Mobile “+” must navigate to capture/log flow.
- Touch targets for icon buttons.
- “More” must open something (at least route to settings).

**Cluster C: Accessibility Baseline**
- `aria-label` on icon-only buttons.
- Keyboard reachability for interactive placeholders.

## 5) Final, More Precise Recommendations (Actionable)

1. **Unify Patient shell**
   - Acceptance: All `/patient/*` pages render in one shell; no nested full-screen backgrounds/headers.
2. **Unify Owner shell**
   - Acceptance: All `/owner/*` pages render in one shell; no nested dashboard shells.
3. **Fix mobile nav**
   - Acceptance: Home goes to `/patient/today`; “+” goes to `/patient/capture`; “Mais” goes to `/patient/settings`.
4. **Role-correct settings**
   - Acceptance: Sidebar “Configurações” routes to `/patient/settings` (patient), `/studio/configuracoes` (studio), `/owner/subscription` (owner).
5. **Fix portal audience mismatch**
   - Acceptance: Studio photo diary lives in `/studio/diary`; `/patient/diary` redirects to the real patient diary `/patient/log`.
6. **Touch targets + labels**
   - Acceptance: Reaction buttons in visual diary are >= 40px and have `aria-label`.

## 6) Implementation (Applied in Code)

Implemented items above (see diffs):
- Patient shell unified via `src/app/patient/layout.tsx`
- Owner shell unified via `src/app/owner/layout.tsx`
- Removed nested shells from patient pages (`src/app/patient/*/page.tsx`)
- Removed nested shells from owner pages:
  - `src/app/owner/datasets/page.tsx`
  - `src/app/owner/integrity/page.tsx`
- Mobile navigation fixed and made actionable: `src/components/layout/mobile-nav.tsx`
- Role-correct settings and better patient nav: `src/components/layout/sidebar.tsx`
- Portal separation:
  - Added Studio diary: `src/app/studio/diary/page.tsx`
  - Redirected patient diary: `src/app/patient/diary/page.tsx`

