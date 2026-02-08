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

const vercelEnv = process.env.VERCEL_ENV;
const databaseUrl = process.env.DATABASE_URL;
const directUrl = process.env.DIRECT_URL;
const migrateOnPreview = process.env.MIGRATE_ON_PREVIEW === 'true';

const isProduction = vercelEnv === 'production';
const shouldMigrate = isProduction || (vercelEnv === 'preview' && migrateOnPreview);

// Ensure DIRECT_URL is set (Prisma needs it for migrations when using connection pooler)
if (databaseUrl && !process.env.DIRECT_URL) {
  // If DATABASE_URL uses a pooler (port 6543 or pgbouncer param), DIRECT_URL should
  // ideally point to the direct connection. But as a fallback, use DATABASE_URL itself.
  process.env.DIRECT_URL = databaseUrl;
  console.log(
    `${ANSI_YELLOW}DIRECT_URL not set. Using DATABASE_URL as fallback for Prisma migrations.${ANSI_RESET}`
  );
}

// Ensure Prisma has a connection string even for demo/preview builds
if (!databaseUrl) {
  const placeholderDb =
    'postgresql://placeholder:placeholder@localhost:5432/placeholder';
  process.env.DATABASE_URL = placeholderDb;
  process.env.DIRECT_URL = process.env.DIRECT_URL || placeholderDb;
  console.log(
    `${ANSI_YELLOW}DATABASE_URL not set. Using placeholder for prisma generate (no migrations will run).${ANSI_RESET}`
  );
} else if (!directUrl) {
  // Prisma schema references DIRECT_URL. On Vercel, it's common to only set DATABASE_URL.
  process.env.DIRECT_URL = databaseUrl;
  console.log(
    `${ANSI_YELLOW}DIRECT_URL not set. Falling back to DATABASE_URL for Prisma CLI.${ANSI_RESET}`
  );
}

console.log(`${ANSI_GREEN}Starting Vercel build...${ANSI_RESET}`);

// Always generate Prisma Client
console.log(`${ANSI_YELLOW}Running prisma generate...${ANSI_RESET}`);
run('npx', ['prisma', 'generate']);

if (shouldMigrate) {
  if (!databaseUrl) {
    console.error(`${ANSI_RED}DATABASE_URL is required when migrations are enabled.${ANSI_RESET}`);
    process.exit(1);
  }

  const label = isProduction ? 'production' : 'preview';
  console.log(`${ANSI_YELLOW}Running prisma migrate deploy (${label})...${ANSI_RESET}`);
  const migrated = run('npx', ['prisma', 'migrate', 'deploy'], { allowFailure: !isProduction });
  if (!migrated && !isProduction) {
    console.warn(`${ANSI_YELLOW}Migration failed in preview — build continues.${ANSI_RESET}`);
  }
} else {
  console.log(`${ANSI_YELLOW}Skipping prisma migrate deploy (VERCEL_ENV=${vercelEnv || 'unknown'})${ANSI_RESET}`);
}

console.log(`${ANSI_YELLOW}Running next build...${ANSI_RESET}`);
run('npx', ['next', 'build']);

console.log(`${ANSI_GREEN}Vercel build completed.${ANSI_RESET}`);
