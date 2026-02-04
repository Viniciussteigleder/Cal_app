# ⚡ Quick Fixes Reference - NutriPlan

**Quick lookup guide for all fixes implemented in this session**

---

## 🚨 Critical Safety & Legal (P0)

### ✅ Medical Disclaimers
**Where**: All 11 AI agent pages + patient chatbot (12 pages total)
**What**: Added warning boxes explaining AI limitations
**File**: `src/components/ui/medical-disclaimer.tsx`
**Variants**:
- `<MedicalDisclaimer />` - Standard (10 pages)
- `<MedicalDisclaimer variant="supplement" />` - Enhanced warnings (1 page)
- `<MedicalDisclaimer variant="emergency" />` - SAMU/ER instructions (1 page)

**How to use**:
```tsx
import { MedicalDisclaimer } from '@/components/ui/medical-disclaimer';

<MedicalDisclaimer variant="default" />
```

---

### ✅ LGPD Consent Checkboxes
**Where**: `src/components/auth/auth-modal.tsx` (lines 252-278)
**What**: 3 consent checkboxes in patient signup (step 3)
- ☑️ Health data processing (required)
- ☑️ Nutritionist data sharing (required)
- ☑️ Marketing communications (optional)

**Compliance**: LGPD Lei 13.709/2018 Articles 7, 8, 9

---

### ✅ Emergency Warnings
**Where**: `src/app/patient/symptoms/page.tsx`
**What**: Red alert box with SAMU 192 instructions
**Triggers**: Shows when user logs severe symptoms
**Content**: "Dor intensa, vômitos com sangue... LIGUE 192 (SAMU)"

---

## ♿ Accessibility Fixes (WCAG 2.1 AA)

### ✅ Touch Targets (44px minimum)
**Where**: `src/components/ui/button.tsx` (lines 24-27)
**What**: All buttons increased from 40px to 44px height
**Applies to**: Every button in the app (100+ instances)

**Before**:
```tsx
default: "h-10 px-8"        // 40px
icon: "h-10 w-10"           // 40x40px
```

**After**:
```tsx
default: "h-11 px-8 min-h-[44px]"       // 44px
icon: "h-11 w-11 min-h-[44px] min-w-[44px]"  // 44x44px
```

---

### ✅ Skip to Content Link
**Where**: `src/components/layout/dashboard-layout.tsx` (lines 14-20)
**What**: Hidden link that appears on Tab key press
**Jumps to**: `#main-content`
**Saves**: Keyboard users from tabbing through 20+ nav links

**How it works**:
```tsx
<a href="#main-content" className="sr-only focus:not-sr-only ...">
  Pular para o conteúdo principal
</a>
```

---

### ✅ ARIA Labels
**Where**:
- `src/components/layout/sidebar.tsx` (navigation)
- `src/components/layout/mobile-nav.tsx` (mobile nav)

**Added**:
- `aria-label="Main navigation"` on sidebar
- `aria-current="page"` on active links
- `aria-label="Go to Dashboard"` on mobile buttons
- `aria-label="Settings"`, `aria-label="Logout"` on icon buttons

**Screen readers now announce**: "Main navigation. Dashboard, current page. 5 of 12."

---

## 📱 Mobile UX Fixes

### ✅ Responsive Patient Table
**Where**: `src/app/studio/patients/page.tsx` (lines 31-121)
**What**: Dual-view pattern
- **Desktop** (≥768px): Table with columns
- **Mobile** (<768px): Card-based list

**Code pattern**:
```tsx
{/* Desktop */}
<div className="hidden md:block">
  <table>...</table>
</div>

{/* Mobile */}
<div className="md:hidden space-y-3">
  {patients.map(p => <Card>...</Card>)}
</div>
```

---

### ✅ Sidebar Name Truncation
**Where**: `src/components/layout/sidebar.tsx` (user profile section)
**What**: Tooltip shows full name on hover
**Handles**: Long Portuguese names like "Maria Fernanda da Silva"

**Code pattern**:
```tsx
<Tooltip>
  <TooltipTrigger>
    <p className="truncate">{user.name}</p>
  </TooltipTrigger>
  <TooltipContent>
    <p>{user.name}</p> {/* Full name */}
  </TooltipContent>
</Tooltip>
```

---

### ✅ Symptom Scale Snap Scrolling
**Where**: `src/app/patient/symptoms/page.tsx` (discomfort scale)
**What**: Smooth iOS-style snap scrolling for 0-10 scale
**Buttons**: Fixed 44x44px (WCAG compliant)

**Code pattern**:
```tsx
<div className="overflow-x-auto snap-x snap-mandatory">
  <div className="flex gap-1">
    {[0-10].map(i => (
      <button className="w-12 h-12 snap-start">
        {i}
      </button>
    ))}
  </div>
</div>
```

---

### ✅ Medical Disclaimer Overflow Fix
**Where**: `src/components/ui/medical-disclaimer.tsx`
**What**: Changed Alert → Card for better overflow control
**Key classes**:
- `flex-1 min-w-0` - Allows text to shrink below content size
- `flex-shrink-0` - Prevents icon from squishing
- `overflow-hidden` - Prevents text clipping

**Why `min-w-0` matters**:
```tsx
// Without min-w-0: text pushes container, causes overflow
<div className="flex-1">
  <p>Very long text...</p>  {/* Overflows! */}
</div>

// With min-w-0: text wraps properly
<div className="flex-1 min-w-0">
  <p>Very long text...</p>  {/* Wraps ✓ */}
</div>
```

---

## 🚀 Deployment Fixes

### ✅ Vercel Build Fixed
**Where**:
- `package.json` (line 19)
- `vercel.json` (lines 6-10)

**Problem**: Build failed with "DATABASE_URL must start with postgresql://"
**Solution**:
1. Removed `prisma migrate deploy` from build script (needs live DB)
2. Added placeholder DATABASE_URL for build-time validation

**vercel.json**:
```json
{
  "build": {
    "env": {
      "DATABASE_URL": "postgresql://placeholder:placeholder@localhost:5432/nutriplan?sslmode=require"
    }
  }
}
```

**package.json**:
```json
{
  "vercel-build": "prisma generate && next build"
  // Removed: && prisma migrate deploy
}
```

**Result**: App builds without database, works with mock data

---

## 📊 Testing Quick Reference

### Visual Regression Testing
```bash
# Check these pages after merging
- /studio/patients (mobile card view)
- /studio/ai/supplement-advisor (enhanced disclaimer)
- /patient/symptoms (emergency warning + snap scroll)
- Any page (skip link appears on Tab)
```

### Accessibility Testing
```bash
# Keyboard navigation
1. Press Tab - Skip link should appear
2. Press Enter - Should jump to main content
3. Navigate sidebar - Focus indicators visible
4. All buttons reachable via keyboard

# Screen reader (VoiceOver on Mac)
Cmd+F5 to enable
Navigate sidebar - Should announce labels
Check active page - Should say "current page"
Icon buttons - Should announce purpose
```

### Mobile Testing
```bash
# Responsive breakpoints
- 375px (iPhone SE) - Patient table should be cards
- 768px (iPad) - Patient table should be table
- 390px (iPhone 14) - All buttons min 44px
- Landscape mode - Navigation still accessible
```

---

## 🔧 Common Patterns Used

### Responsive Dual-View
```tsx
{/* Desktop */}
<div className="hidden md:block">
  {/* Table or complex layout */}
</div>

{/* Mobile */}
<div className="md:hidden">
  {/* Simplified card layout */}
</div>
```

### Tooltip for Truncation
```tsx
<TooltipProvider>
  <Tooltip>
    <TooltipTrigger asChild>
      <div className="truncate">{longText}</div>
    </TooltipTrigger>
    <TooltipContent>
      <p>{longText}</p>
    </TooltipContent>
  </Tooltip>
</TooltipProvider>
```

### Snap Scrolling
```tsx
<div className="overflow-x-auto snap-x snap-mandatory">
  <div className="flex gap-2">
    {items.map(item => (
      <div className="snap-start snap-always flex-shrink-0">
        {item}
      </div>
    ))}
  </div>
</div>
```

### Prevent Flex Overflow
```tsx
// Parent
<div className="flex gap-3">
  {/* Icon - prevent squish */}
  <Icon className="flex-shrink-0" />

  {/* Text - allow wrap */}
  <div className="flex-1 min-w-0">
    <p className="truncate">{text}</p>
  </div>
</div>
```

---

## 📝 Checklist for Future Features

When adding new features, ensure:

- [ ] Medical disclaimer if AI-generated content
- [ ] LGPD consent if collecting health data
- [ ] All buttons min 44x44px touch targets
- [ ] ARIA labels on icon-only buttons
- [ ] Mobile-responsive (test at 375px)
- [ ] Keyboard accessible (no Tab traps)
- [ ] Long text has truncation + tooltip
- [ ] Horizontal scroll uses snap scrolling
- [ ] Emergency symptoms show warning
- [ ] Forms have proper labels (not just placeholders)

---

## 🚨 Critical Files (Don't Break These)

```
src/components/ui/button.tsx
  ↳ Touch target sizing for entire app

src/components/ui/medical-disclaimer.tsx
  ↳ Legal compliance for all AI features

src/components/layout/dashboard-layout.tsx
  ↳ Skip link for keyboard navigation

src/components/auth/auth-modal.tsx
  ↳ LGPD consent (lines 252-278)

vercel.json
  ↳ Deployment configuration
```

---

## 📞 Quick Help

**Vercel deployment failing?**
→ See `VERCEL_DEPLOYMENT.md`

**Need accessibility testing?**
→ Use axe DevTools browser extension

**Mobile testing?**
→ Chrome DevTools → Toggle device toolbar → Test at 375px, 768px, 1440px

**WCAG compliance questions?**
→ See WCAG 2.1 Quick Reference: https://www.w3.org/WAI/WCAG21/quickref/

**LGPD compliance questions?**
→ See Brazilian law: https://www.gov.br/cidadania/pt-br/acesso-a-informacao/lgpd

---

**Last Updated**: February 4, 2026
**Session**: https://claude.ai/code/session_01LbGSbg3LbqjuPeyUCbPTHM
