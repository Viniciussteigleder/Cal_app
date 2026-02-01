# Fluxos Principais (MVP1)

## Consulta → Plano → Publicação
1. Nutricionista abre consulta do paciente.
2. Atualiza dados (peso, atividade, objetivo).
3. Define política de dados (região, fontes, overrides).
4. Calcula TMB/TDEE e aplica objetivo com guardrails.
5. Constrói plano adicionando alimentos (snapshot criado).
6. Revisa checklist, aprova e publica a versão.

## Registro de refeições (Paciente)
1. Paciente busca alimento.
2. Sistema resolve fonte via política do paciente.
3. Snapshot é criado e vinculado ao item.
4. Refeição fica editável no mesmo dia; depois, somente leitura.

## Integridade operacional
1. Owner executa `pnpm integrity:run`.
2. Canary calculations e sanity checks são realizados.
3. Issues são persistidas em `integrity_issue`.
4. Exit code indica severidade máxima.
