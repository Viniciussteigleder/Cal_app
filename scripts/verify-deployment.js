const fs = require('fs');
const path = require('path');

const ANSI_GREEN = '\x1b[32m';
const ANSI_RED = '\x1b[31m';
const ANSI_YELLOW = '\x1b[33m';
const ANSI_RESET = '\x1b[0m';

console.log(`${ANSI_GREEN}Starting Deployment Verification...${ANSI_RESET}\n`);

let hasError = false;

// 1. Check for Duplicate Lockfiles
console.log('Checking lockfiles...');
const rootDir = path.resolve(__dirname, '..');
const pnpmLock = path.join(rootDir, 'pnpm-lock.yaml');
const yarnLock = path.join(rootDir, 'yarn.lock');
const npmLock = path.join(rootDir, 'package-lock.json');

if (fs.existsSync(npmLock)) {
    console.log(`${ANSI_GREEN}✓ package-lock.json found (Good)${ANSI_RESET}`);
} else {
    console.log(`${ANSI_RED}✕ package-lock.json is MISSING! Run 'npm install' to generate it.${ANSI_RESET}`);
    hasError = true;
}

if (fs.existsSync(pnpmLock)) {
    console.log(`${ANSI_RED}✕ pnpm-lock.yaml found! This conflicts with npm. Delete it.${ANSI_RESET}`);
    hasError = true;
}

if (fs.existsSync(yarnLock)) {
    console.log(`${ANSI_RED}✕ yarn.lock found! This conflicts with npm. Delete it.${ANSI_RESET}`);
    hasError = true;
}

// 2. Check for Next.js Build (Dry Run suggestion)
console.log('\nChecking build capability...');
// We won't run full build as it's slow, but we'll check if we can resolve main deps
try {
    // Just a basic check if critical files exist
    const pagePath = path.join(rootDir, 'src/app/page.tsx');
    if (fs.existsSync(pagePath)) {
        console.log(`${ANSI_GREEN}✓ Entry point src/app/page.tsx exists${ANSI_RESET}`);
    } else {
        console.log(`${ANSI_YELLOW}⚠ Entry point src/app/page.tsx not found (Check structure)${ANSI_RESET}`);
    }
} catch (e) {
    // ignore
}

// 3. Check vercel-build script target
console.log('\nChecking vercel-build script...');
try {
    const pkgPath = path.join(rootDir, 'package.json');
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    const script = pkg.scripts?.['vercel-build'];
    if (!script) {
        console.log(`${ANSI_RED}✕ vercel-build script missing in package.json${ANSI_RESET}`);
        hasError = true;
    } else if (!script.includes('scripts/vercel-build.js')) {
        console.log(`${ANSI_YELLOW}⚠ vercel-build script does not point to scripts/vercel-build.js${ANSI_RESET}`);
    } else {
        console.log(`${ANSI_GREEN}✓ vercel-build script configured${ANSI_RESET}`);
    }
} catch (e) {
    console.log(`${ANSI_YELLOW}⚠ Could not read package.json for vercel-build check${ANSI_RESET}`);
}

// 4. Warn if Next.js ignores type errors
console.log('\nChecking Next.js build safety...');
try {
    const nextConfig = path.join(rootDir, 'next.config.ts');
    if (fs.existsSync(nextConfig)) {
        const configText = fs.readFileSync(nextConfig, 'utf8');
        if (configText.includes('ignoreBuildErrors: true')) {
            console.log(`${ANSI_YELLOW}⚠ next.config.ts ignores TypeScript build errors${ANSI_RESET}`);
        } else {
            console.log(`${ANSI_GREEN}✓ TypeScript build errors are enforced${ANSI_RESET}`);
        }
    }
} catch (e) {
    // ignore
}

// 5. Warn if vercel.json hardcodes NEXT_PUBLIC_APP_URL
console.log('\nChecking Vercel env config...');
try {
    const vercelConfigPath = path.join(rootDir, 'vercel.json');
    if (fs.existsSync(vercelConfigPath)) {
        const vercelConfig = JSON.parse(fs.readFileSync(vercelConfigPath, 'utf8'));
        if (vercelConfig.env?.NEXT_PUBLIC_APP_URL) {
            console.log(`${ANSI_YELLOW}⚠ vercel.json hardcodes NEXT_PUBLIC_APP_URL (shared across envs)${ANSI_RESET}`);
        } else {
            console.log(`${ANSI_GREEN}✓ NEXT_PUBLIC_APP_URL is not hardcoded in vercel.json${ANSI_RESET}`);
        }
    }
} catch (e) {
    // ignore
}

if (hasError) {
    console.log(`\n${ANSI_RED}Verification FAILED. Please fix the issues above before deploying.${ANSI_RESET}`);
    process.exit(1);
} else {
    console.log(`\n${ANSI_GREEN}Verification PASSED. You are ready to push!${ANSI_RESET}`);
    console.log(`${ANSI_YELLOW}Tip: For complete confidence, run 'npm run build' locally.${ANSI_RESET}`);
}
