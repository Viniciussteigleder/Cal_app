# NutriPlan - Arquitetura Técnica

## Visão geral
Sistema multi-tenant com RLS e RBAC server-side. Dados clínicos são
versionados e snapshots são imutáveis para auditoria total.

## Segurança e isolamento
- **Tenant isolation**: `tenant_id` em todas as tabelas de domínio.
- **RLS** habilitado em todas as tabelas.
- **Claims**: `user_id`, `tenant_id`, `role` (OWNER, TENANT_ADMIN, TEAM, PATIENT).
- **Owner mode**: `app.owner_mode = true` somente em rotas `/owner`.

## RBAC
Implementado em `src/lib/rbac.ts` com mapa de permissões por recurso e ação.
Toda mutação protegida deve verificar RBAC no servidor.

## Snapshots e imutabilidade
- `food_snapshot`: sem UPDATE/DELETE (policies).
- `plan_version`: status `published` é imutável (trigger).
- `content_hash` gerado a partir de `snapshot_json` para auditoria.

## Auditoria
- `audit_event` para ações privilegiadas (CREATE, UPDATE, PUBLISH, etc.).
- `calc_audit` para TMB/TDEE e sobrescritas manuais.

## Cálculos
Fórmula padrão: Mifflin-St Jeor.
Fatores de atividade e ajustes de objetivo configuráveis, com guardrails.

## Integridade operacional
- Canary calculations (TMB/TDEE) com tolerância de ±1 kcal.
- Sanity check de datasets (negativos, inconsistências kcal/macros).
- Verificação de snapshots e hash.
- Imutabilidade de planos publicados.
- Smoke tests de RBAC/RLS.
