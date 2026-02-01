# Notas de Implementação

## Decisões arquiteturais
- RLS com session variables (`app.user_id`, `app.tenant_id`, `app.role`) para
  garantir isolamento por tenant e reduzir dependências externas no MVP1.
- `owner_mode` habilita acesso cross-tenant somente em rotas `/owner`.
- Snapshots imutáveis com `content_hash` gerado no banco.
  - Middleware (`src/middleware.ts`) adiciona header `x-owner-mode=true`.
  - `getRequestClaims()` lê JWT do Supabase ou fallback de headers/cookies.

## Tradeoffs
- `calc_audit` é gravado apenas para TMB/TDEE e sobrescritas manuais.
- Totais de refeições são calculados sob demanda e podem ser cacheados em
  `meal.totals_json` para evitar poluição do banco.

## Como rodar
```bash
pnpm install
docker compose up -d
pnpm prisma migrate dev
pnpm prisma db seed
pnpm dev
```

Se Docker não estiver disponível, é possível usar Postgres local (Homebrew):
```bash
brew install postgresql@15
brew services start postgresql@15
createdb nutriplan
psql -d postgres -c "CREATE ROLE nutriplan_app LOGIN PASSWORD 'nutriplan'"
psql -d postgres -c "ALTER DATABASE nutriplan OWNER TO nutriplan_app"
psql -d nutriplan -c "GRANT USAGE ON SCHEMA public TO nutriplan_app; GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO nutriplan_app; GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO nutriplan_app; ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO nutriplan_app;"
psql -d nutriplan -f prisma/migrations/0001_init/migration.sql
psql -d nutriplan -f prisma/migrations/0002_snapshot_policies/migration.sql
psql -d nutriplan -f prisma/migrations/0003_snapshot_insert_owner/migration.sql
```

## Testes
```bash
pnpm test
pnpm test:e2e
pnpm integrity:run
```

Canários TMB (Mifflin-St Jeor):
- Homem 30a 80kg 175cm: 1749 kcal
- Mulher 25a 60kg 165cm: 1345 kcal

## Limitações conhecidas (MVP1)
- Protocolos GI estruturados estão em MVP2.
- i18n completo (DE) em MVP3.
- Autenticação Supabase é planejada, com stub via session variables no MVP1.

## Assumptions
- Claims são fornecidas via session variables no banco enquanto Supabase Auth
  não é integrado ao MVP1.
