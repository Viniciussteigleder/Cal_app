# NutriPlan PRD (MVP1-3)

## Visão geral
NutriPlan é uma plataforma multi-tenant para planejamento alimentar auditável,
com três portais (Paciente, Nutricionista e Owner), baseada em dados
nutricionais versionados e snapshots imutáveis.

## Objetivos do MVP1
- Entregar a fundação auditável e segura para uso clínico.
- Garantir isolamento por tenant com RLS e RBAC server-side.
- Cálculos energéticos e nutricionais auditáveis.
- Versionamento e publicação de planos.
- Política de dados por paciente.
- Checagens operacionais de integridade.

## Escopo MVP1
### Portais
- **/patient**: dashboard, diário, plano publicado, sintomas.
- **/studio**: pacientes, consulta guiada (5 passos), políticas, planos.
- **/owner**: tenants, usuários, datasets, integridade, descrição do app.

### Dados e auditoria
- Snapshots imutáveis para refeições e planos.
- `audit_event` para ações privilegiadas.
- `calc_audit` apenas para TMB/TDEE e sobrescritas.
- `plan_version` publicado é imutável.

### Food Data Hub
- `food_canonical`, `food_alias`, `food_nutrient`.
- `dataset_release`, `import_job`, `validation_report`.
- Política de dados por paciente (versão + ativa).

## Não objetivos MVP1
- IA (somente stubs).
- Reconhecimento de fotos.
- Biblioteca de receitas.
- Protocolos GI estruturados (somente catálogo + notas livres).
- i18n além de pt-BR.

## MVP2 (resumo)
- Engine de protocolos GI (FODMAP, lactose, glúten).
- Automação parcial na geração de planos.
- Biblioteca de receitas e substituições.
- Relatórios sintomas × refeições.
- Pipeline avançado de qualidade de dados.

## MVP3 (resumo)
- IA com guardrails e auditoria.
- Foto reconhecimento com validação.
- Insights de aderência e predição.
- i18n completo pt-BR + DE.
- Conformidade LGPD/GDPR completa.
