# Notas de Implementação

## Decisões arquiteturais
- RLS com session variables (`app.user_id`, `app.tenant_id`, `app.role`) para
  garantir isolamento por tenant e reduzir dependências externas no MVP1.
- `owner_mode` habilita acesso cross-tenant somente em rotas `/owner`.
- Snapshots imutáveis com `content_hash` gerado no banco.

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

## Testes
```bash
pnpm test
pnpm test:e2e
pnpm integrity:run
```

## Limitações conhecidas (MVP1)
- Protocolos GI estruturados estão em MVP2.
- i18n completo (DE) em MVP3.
- Autenticação Supabase é planejada, com stub via session variables no MVP1.
