# PR: MVP1 Foundation

## Repo Assessment
- **Antes:** repositório vazio (sem scaffold).
- **Depois:** Next.js App Router + Tailwind + shadcn-ui básico, Prisma schema/migrations
  com RLS, portal UI pt-BR e scripts de integridade.
- **Decisões-chave:** uso de session variables para claims de RLS no MVP1;
  snapshots imutáveis com `content_hash` gerado no banco.

## Como rodar
```bash
pnpm install
cp .env.example .env
docker compose up -d
pnpm prisma migrate dev
pnpm prisma db seed
pnpm dev
```

## Como testar
```bash
pnpm test
pnpm test:e2e
pnpm integrity:run
```

## Screenshots
- Portal do Paciente: (adicionar)
- Portal do Nutricionista: (adicionar)
- Portal do Owner: (adicionar)

## Limitações / MVP2+
- Protocolos GI: apenas catálogo + notas (MVP2).
- IA: stubs (MVP3).
- i18n completo: MVP3 (pt-BR atual).
