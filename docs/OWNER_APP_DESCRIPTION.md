# NutriPlan - Descrição do Aplicativo

## Visão geral
NutriPlan é uma plataforma de planejamento alimentar com foco em transparência,
auditoria e segurança clínica. O sistema atende nutricionistas e pacientes
brasileiros e alemães, com três portais especializados.

## Portais
### Portal do Paciente
- Dashboard com meta energética e progresso diário.
- Diário alimentar com busca e snapshots imutáveis.
- Plano publicado por refeição.
- Registro simplificado de sintomas.

### Portal do Nutricionista
- Gestão de pacientes e prontuário.
- Consulta guiada em 5 etapas.
- Políticas de dados por paciente.
- Planos versionados com aprovação e publicação.

### Portal do Owner
- Gestão de tenants e usuários.
- Datasets com importação, validação e publicação.
- Verificações de integridade.
- Visualização desta documentação.

## Segurança e auditoria
Todas as ações críticas são auditadas. Planos publicados e snapshots são
imutáveis. O acesso cross-tenant do Owner só ocorre em modo dedicado.

## Microcopy
- "Seus dados são atualizados em tempo real conforme você registra refeições."
- "Os valores mostrados aqui refletem a base de dados escolhida pelo seu nutricionista."
- "Após publicar, esta versão não poderá ser editada."
