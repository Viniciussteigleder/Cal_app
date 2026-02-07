const { spawnSync } = require('child_process');

const ANSI_GREEN = '\x1b[32m';
const ANSI_RED = '\x1b[31m';
const ANSI_YELLOW = '\x1b[33m';
const ANSI_RESET = '\x1b[0m';

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    stdio: 'inherit',
    env: process.env,
    ...options,
  });

  if (result.status !== 0) {
    if (options.allowFailure) {
      console.warn(`${ANSI_YELLOW}Command failed (non-fatal): ${command} ${args.join(' ')}${ANSI_RESET}`);
      return false;
    }
    process.exit(result.status ?? 1);
  }
  return true;
}

console.log(`${ANSI_GREEN}Starting Vercel build...${ANSI_RESET}`);

// Always generate Prisma Client
console.log(`${ANSI_YELLOW}Running prisma generate...${ANSI_RESET}`);
run('npx', ['prisma', 'generate']);

const vercelEnv = process.env.VERCEL_ENV;
const databaseUrl = process.env.DATABASE_URL;
const migrateOnPreview = process.env.MIGRATE_ON_PREVIEW === 'true';

const isProduction = vercelEnv === 'production';
const shouldMigrate = isProduction || (vercelEnv === 'preview' && migrateOnPreview);

if (shouldMigrate) {
  if (!databaseUrl) {
    console.error(`${ANSI_RED}DATABASE_URL is required when migrations are enabled.${ANSI_RESET}`);
    process.exit(1);
  }

  const label = isProduction ? 'production' : 'preview';
  console.log(`${ANSI_YELLOW}Running prisma migrate deploy (${label})...${ANSI_RESET}`);
  const migrated = run('npx', ['prisma', 'migrate', 'deploy'], { allowFailure: true });
  if (!migrated) {
    console.warn(`${ANSI_YELLOW}Migration failed — DB may be paused or unreachable. Build continues.${ANSI_RESET}`);
  }
} else {
  console.log(`${ANSI_YELLOW}Skipping prisma migrate deploy (VERCEL_ENV=${vercelEnv || 'unknown'})${ANSI_RESET}`);
}

console.log(`${ANSI_YELLOW}Running next build...${ANSI_RESET}`);
run('npx', ['next', 'build']);

console.log(`${ANSI_GREEN}Vercel build completed.${ANSI_RESET}`);
