# Como o NutriPlan Funciona
## Guia Completo para App Owner/Admin

---

## 🎯 Escolha seu caminho

**Navegação rápida** — Clique para ir direto ao que você precisa:

→ **[Sou App Owner: quero configurar](#configuração-inicial-app-owner)**  
→ **[Sou Nutricionista: quero operar](#workspace-do-nutricionista)**  
→ **[Quero entender as regras](#motor-de-regras-e-decisões)**  
→ **[Quero entender impactos de mudanças](#tabela-de-impacto-de-mudanças)**  
→ **[Quero ver exemplos práticos](#casos-práticos)**  
→ **[Quero tirar dúvidas (FAQ)](#perguntas-frequentes)**  
→ **[Glossário](#glossário)**

---

## O que você controla como App Owner

Como App Owner (Admin), você governa a plataforma NutriPlan e define os padrões que garantem segurança, qualidade e consistência para todos os nutricionistas e pacientes.

**Suas áreas de controle:**

- **Governança de usuários e permissões** — Quem pode fazer o quê (Owner, Nutricionista, Paciente)
- **Templates e protocolos padrão** — Estruturas reutilizáveis para planos, consultas e protocolos clínicos
- **Regras de segurança alimentar** — Bloqueios, alertas e permissões baseados em alergias, restrições e condições de saúde
- **Configuração de agentes de IA** — Prompts, modelos, custos e limites de uso
- **Bases de dados centralizadas** — Tabelas de alimentos, exames, protocolos e receitas
- **Padrões de qualidade** — Critérios de validação, nomenclaturas e boas práticas
- **Monitoramento e auditoria** — Acompanhamento de uso, custos de IA, aderência e qualidade

---

## Modelo de interação entre papéis

O NutriPlan opera com três papéis principais que interagem em um fluxo de trabalho estruturado:

```
┌─────────────────────────────────────────────────────────────────┐
│                         APP OWNER (VOCÊ)                        │
│  Configura • Governa • Publica • Padroniza • Audita • Monitora │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
         ┌───────────────────────────────────┐
         │        NUTRICIONISTA              │
         │  Avalia • Ajusta • Monta •        │
         │  Revisa • Acompanha               │
         └───────────┬───────────────────────┘
                     │
                     ▼
         ┌───────────────────────────────────┐
         │      PACIENTE/CLIENTE             │
         │  Visualiza • Segue • Registra •   │
         │  Solicita • Dá feedback           │
         └───────────────────────────────────┘
```

### Quem cria o quê

| O que                          | Quem cria         | Quem aprova/publica | Quem consome       |
|--------------------------------|-------------------|---------------------|--------------------|
| Templates de plano             | Owner             | Owner               | Nutricionista      |
| Protocolos clínicos padrão     | Owner             | Owner               | Nutricionista      |
| Regras de segurança            | Owner             | Owner               | Sistema (automático)|
| Tabelas de alimentos           | Owner             | Owner               | Nutricionista + IA |
| Configuração de agentes de IA  | Owner             | Owner               | Nutricionista      |
| Plano alimentar do paciente    | Nutricionista     | Nutricionista       | Paciente           |
| Análise de sintomas            | IA + Nutricionista| Nutricionista       | Paciente           |
| Registros diários (log)        | Paciente          | —                   | Nutricionista      |
| Feedback de aderência          | Paciente          | —                   | Nutricionista      |

---

## Fluxo de trabalho completo (ponta a ponta)

### 1. **[Owner]** Configuração inicial da plataforma
**Entrada:** Requisitos de negócio, padrões clínicos, políticas de segurança  
**Processamento:** Owner configura templates, protocolos, regras de segurança, tabelas de alimentos, agentes de IA  
**Saída:** Plataforma configurada e pronta para uso pelos nutricionistas

### 2. **[Owner]** Publicação de templates e protocolos
**Entrada:** Templates criados, protocolos validados  
**Processamento:** Owner revisa, ajusta e publica para disponibilizar aos nutricionistas  
**Saída:** Biblioteca de templates e protocolos acessível no workspace do nutricionista

### 3. **[Nutricionista]** Cadastro e avaliação inicial do paciente
**Entrada:** Dados do paciente (anamnese, exames, sintomas, restrições)  
**Processamento:** Nutricionista registra informações, identifica alergias e condições de saúde  
**Saída:** Perfil do paciente criado com restrições mapeadas

### 4. **[Sistema]** Validação de segurança
**Entrada:** Perfil do paciente com restrições  
**Processamento:** Motor de regras valida contra base de alergênicos e restrições  
**Saída:** Regras de bloqueio/alerta ativadas para o paciente

### 5. **[Nutricionista + IA]** Criação do plano alimentar
**Entrada:** Perfil do paciente, metas nutricionais, preferências  
**Processamento:** Nutricionista usa templates ou IA para montar plano; sistema valida contra regras de segurança  
**Saída:** Plano alimentar personalizado (rascunho)

### 6. **[Sistema]** Validação e alertas
**Entrada:** Plano alimentar (rascunho)  
**Processamento:** Sistema verifica conflitos com restrições, alergias, interações medicamentosas  
**Saída:** Alertas de bloqueio (impeditivos) ou atenção (revisão necessária)

### 7. **[Nutricionista]** Revisão e ajustes
**Entrada:** Plano + alertas do sistema  
**Processamento:** Nutricionista revisa alertas, ajusta substituições, valida segurança  
**Saída:** Plano alimentar validado

### 8. **[Nutricionista]** Publicação do plano
**Entrada:** Plano validado  
**Processamento:** Nutricionista publica o plano para o paciente  
**Saída:** Plano disponível no app do paciente

### 9. **[Paciente]** Acompanhamento e registro
**Entrada:** Plano publicado  
**Processamento:** Paciente visualiza plano, registra refeições, sintomas, aderência  
**Saída:** Log diário com dados de consumo, sintomas e feedback

### 10. **[IA + Nutricionista]** Análise de aderência e sintomas
**Entrada:** Log diário do paciente (30+ dias)  
**Processamento:** IA correlaciona alimentos com sintomas, identifica gatilhos, calcula aderência  
**Saída:** Relatório de análise com correlações, padrões e recomendações

### 11. **[Nutricionista]** Ajustes e acompanhamento
**Entrada:** Relatório de análise, feedback do paciente  
**Processamento:** Nutricionista ajusta plano, protocolo ou substituições  
**Saída:** Plano atualizado (retorna ao passo 5)

### 12. **[Owner]** Monitoramento e governança
**Entrada:** Dados agregados de uso, custos de IA, aderência, qualidade  
**Processamento:** Owner revisa métricas, identifica oportunidades de melhoria, ajusta padrões  
**Saída:** Ajustes em templates, regras ou configurações (retorna ao passo 1)

---

## Módulos e fronteiras

### Console do App Owner (`/owner`)

**O que vive aqui:**
- Configuração de agentes de IA (`/owner/ai-config`)
- Gestão de usuários e permissões (`/owner/users`)
- Gestão de tenants (multi-inquilino) (`/owner/tenants`)
- Bases de dados centralizadas (`/owner/datasets`)
- Auditoria e integridade (`/owner/integrity`)
- Descrição e configuração do app (`/owner/app-description`)

**O que NÃO vive aqui:**
- Planos alimentares de pacientes específicos (isso é no workspace do nutricionista)
- Registros diários de pacientes (isso é no app do paciente)
- Análises clínicas individuais (isso é no workspace do nutricionista)

**Ações típicas do Owner:**
- [Configurar permissões]
- [Criar template padrão]
- [Publicar protocolo]
- [Ajustar regras de alergênicos]
- [Configurar agente de IA]
- [Revisar custos de IA]
- [Auditar qualidade]

---

### Workspace do Nutricionista (`/studio`)

**O que vive aqui:**
- Dashboard com visão geral (`/studio/dashboard`)
- Gestão de pacientes (`/studio/patients`)
- Planos alimentares (`/studio/plans/[patientId]`)
- Protocolos aplicados (`/studio/protocols`)
- Receitas (`/studio/recipes`)
- Templates de documentos (`/studio/templates`)
- Ferramentas de IA (`/studio/ai/*`)
  - Reconhecimento de alimentos (`/studio/ai/food-recognition`)
  - Planejador de refeições (`/studio/ai/meal-planner`)
  - Análise de paciente (`/studio/ai/patient-analyzer`)
  - Análise de exames (`/studio/ai/exam-analyzer`)
  - Gerador de protocolos (`/studio/ai/protocol-generator`)
  - Correlacionador de sintomas (`/studio/ai/symptom-correlator`)
  - Criador de prontuário (`/studio/ai/medical-record-creator`)
  - Gerador de relatórios (`/studio/ai/report-generator`)
  - Gerador de lista de compras (`/studio/ai/shopping-list`)
  - Assessor de suplementos (`/studio/ai/supplement-advisor`)
- Análise de créditos de IA (`/studio/ai-workflows/credits`)
- Consultas (`/studio/consultations`)
- Calculadoras nutricionais (`/studio/calculations`)
- Chat com pacientes (`/studio/chat`)
- Configurações (`/studio/settings`)

**O que NÃO vive aqui:**
- Configuração global de agentes de IA (isso é no console do Owner)
- Gestão de usuários e permissões (isso é no console do Owner)
- Configuração de regras de segurança globais (isso é no console do Owner)

**Ações típicas do Nutricionista:**
- [Avaliar paciente]
- [Montar plano alimentar]
- [Revisar sintomas]
- [Ajustar substituições]
- [Publicar plano]
- [Analisar aderência]
- [Gerar relatório]

---

### App do Paciente (`/patient`)

**O que vive aqui:**
- Dashboard do paciente (`/patient/dashboard`)
- Diário alimentar (`/patient/diary`)
- Plano alimentar (`/patient/plan`)
- Progresso e métricas (`/patient/progress`)
- Sintomas (`/patient/symptoms`)
- Log diário completo (`/patient/log`)
- Exames (`/patient/exams`)
- Exercícios (`/patient/exercise`)
- Controle de água (`/patient/water`)
- Captura de refeições (foto) (`/patient/capture`)
- Chat com nutricionista (`/patient/chat`)
- Coach de IA (24/7) (`/patient/coach`)
- Configurações (`/patient/settings`)

**O que NÃO vive aqui:**
- Criação ou edição de planos (isso é no workspace do nutricionista)
- Configuração de regras de segurança (isso é no console do Owner)
- Análise clínica profunda (isso é no workspace do nutricionista)

**Ações típicas do Paciente:**
- [Visualizar plano]
- [Registrar refeição]
- [Registrar sintoma]
- [Ver progresso]
- [Solicitar ajuste]
- [Dar feedback]
- [Conversar com coach de IA]

---

## Motor de regras e decisões

O NutriPlan usa um motor de regras para garantir segurança alimentar e qualidade clínica. Cada ação é validada contra três níveis de decisão:

### Níveis de decisão

1. **BLOQUEIA** 🔴 — Ação não permitida (hard stop)
2. **ALERTA** ⚠️ — Ação permitida, mas requer revisão (soft warning)
3. **PERMITE** ✅ — Ação permitida sem restrições

### Ordem de prioridade (do mais restritivo ao mais permissivo)

1. **Alergias alimentares graves** → BLOQUEIA
2. **Restrições médicas absolutas** (ex: doença celíaca + glúten) → BLOQUEIA
3. **Interações medicamentosas perigosas** → BLOQUEIA
4. **Restrições médicas relativas** (ex: diabetes + açúcar alto) → ALERTA
5. **Intolerâncias alimentares** (ex: lactose, FODMAP) → ALERTA
6. **Preferências pessoais** (ex: vegetarianismo) → PERMITE (com filtro)
7. **Metas nutricionais** (ex: low-carb) → PERMITE (com sugestão)

### Exemplos de mensagens do sistema

#### Exemplo 1: Bloqueado 🔴
```
❌ BLOQUEADO: Não é possível adicionar "Camarão" ao plano.

Motivo: Paciente possui alergia grave a crustáceos.
Risco: Reação anafilática.
Ação: Remova este alimento ou escolha uma substituição segura.

[Ver substituições seguras] [Revisar perfil do paciente]
```

#### Exemplo 2: Atenção ⚠️
```
⚠️ ATENÇÃO: "Aveia" pode conter traços de glúten.

Motivo: Paciente possui sensibilidade ao glúten (não celíaca).
Risco: Sintomas digestivos leves a moderados.
Recomendação: Use aveia certificada sem glúten ou substitua por quinoa.

[Aceitar com ressalva] [Substituir] [Marcar como revisado]
```

#### Exemplo 3: Informativo ℹ️
```
ℹ️ INFORMATIVO: Este plano está 15% acima da meta calórica.

Motivo: Meta definida: 1800 kcal/dia | Plano atual: 2070 kcal/dia
Impacto: Pode retardar perda de peso.
Sugestão: Ajuste porções ou substitua alimentos de alta densidade calórica.

[Ajustar automaticamente] [Manter como está] [Ver detalhes]
```

---

## Configuração inicial (App Owner)

### Checklist de primeiro acesso

Se você está configurando o NutriPlan pela primeira vez, siga este caminho:

#### 1. Configurar permissões e usuários
- Acesse `/owner/users`
- Defina papéis: Owner, Nutricionista, Paciente
- Configure permissões por papel
- Convide nutricionistas para a plataforma

[Configurar permissões]

#### 2. Criar templates de plano alimentar
- Acesse `/owner/datasets` ou `/studio/templates`
- Crie templates reutilizáveis (ex: "Plano Low-Carb Padrão", "Plano Vegetariano")
- Defina estrutura: refeições, macros, substituições
- Publique para disponibilizar aos nutricionistas

[Criar template]

#### 3. Publicar protocolos clínicos
- Acesse `/studio/protocols`
- Revise protocolos padrão (FODMAP, Anti-inflamatório, Detox, etc.)
- Valide fases, alimentos permitidos/proibidos, duração
- Publique protocolos validados

[Revisar protocolos]

#### 4. Configurar regras de segurança
- Acesse `/owner/datasets` (seção de alergênicos)
- Defina alimentos alergênicos e gatilhos
- Configure níveis de bloqueio (grave, moderado, leve)
- Ative validação automática

[Configurar regras de alergênicos]

#### 5. Configurar agentes de IA
- Acesse `/owner/ai-config`
- Para cada agente (Reconhecimento de Alimentos, Planejador de Refeições, etc.):
  - Ajuste prompts (sistema + usuário)
  - Defina temperatura e max tokens
  - Configure limites de custo
  - Ative/desative agentes

[Configurar agentes de IA]

#### 6. Revisar bases de dados
- Acesse `/owner/datasets`
- Valide tabelas de alimentos (TACO, USDA, customizadas)
- Revise tabelas de exames e biomarcadores
- Adicione receitas padrão

[Revisar bases de dados]

#### 7. Definir padrões de qualidade
- Estabeleça critérios de validação para planos
- Defina nomenclaturas padrão (ex: "Paciente" vs "Cliente")
- Configure alertas de qualidade
- Ative auditoria automática

[Definir padrões]

---

### Boas práticas de governança

**Governança de templates:**
- Revise templates a cada 3 meses
- Mantenha versionamento (v1.0, v1.1, etc.)
- Documente mudanças e justificativas
- Teste templates antes de publicar

**Governança de protocolos:**
- Valide protocolos com base em evidências científicas
- Inclua referências bibliográficas
- Marque nível de evidência (alta, moderada, baixa)
- Revise quando novas pesquisas surgirem

**Governança de regras de segurança:**
- Priorize segurança sobre conveniência
- Documente exceções e justificativas
- Revise regras com equipe clínica
- Atualize conforme diretrizes médicas

**Governança de IA:**
- Monitore custos semanalmente
- Revise qualidade das respostas mensalmente
- Ajuste prompts com base em feedback
- Mantenha logs de execuções para auditoria

---

## Tabela de impacto de mudanças

Quando você altera configurações como Owner, entenda o impacto:

| O que mudou (Owner)                          | Afeta planos existentes? | Afeta planos futuros? | Impacto imediato                                      | Quem é afetado            | O que revisar                          | Status      |
|----------------------------------------------|--------------------------|------------------------|-------------------------------------------------------|---------------------------|----------------------------------------|-------------|
| Adicionar novo alergênico à lista            | ✅ Sim                   | ✅ Sim                 | Sistema revalida todos os planos e gera alertas       | Nutricionistas + Pacientes| Planos com alimentos agora bloqueados  | ⚠️ Atenção  |
| Remover alergênico da lista                  | ✅ Sim                   | ✅ Sim                 | Bloqueios são removidos, alertas desaparecem          | Nutricionistas            | Nenhuma ação necessária                | ✅ OK       |
| Alterar nível de bloqueio (grave → moderado) | ✅ Sim                   | ✅ Sim                 | Bloqueios viram alertas                               | Nutricionistas            | Planos anteriormente bloqueados        | ⚠️ Atenção  |
| Alterar nível de bloqueio (moderado → grave) | ✅ Sim                   | ✅ Sim                 | Alertas viram bloqueios                               | Nutricionistas + Pacientes| Planos agora bloqueados                | 🔴 Bloqueado|
| Publicar novo template                       | ❌ Não                   | ✅ Sim                 | Template disponível para novos planos                 | Nutricionistas            | Nenhuma ação necessária                | ✅ OK       |
| Editar template existente                    | ❌ Não                   | ✅ Sim                 | Planos criados antes mantêm versão antiga             | Nutricionistas            | Considere atualizar planos antigos     | ⚠️ Atenção  |
| Arquivar template                            | ❌ Não                   | ✅ Sim                 | Template não aparece mais para novos planos           | Nutricionistas            | Planos existentes não são afetados     | ✅ OK       |
| Alterar prompt de agente de IA               | ❌ Não                   | ✅ Sim                 | Próximas execuções usam novo prompt                   | Nutricionistas            | Teste novo prompt antes de publicar    | ⚠️ Atenção  |
| Aumentar limite de custo de IA               | ❌ Não                   | ✅ Sim                 | Agente pode executar mais vezes                       | Owner (orçamento)         | Monitore custos semanalmente           | ⚠️ Atenção  |
| Diminuir limite de custo de IA               | ✅ Sim                   | ✅ Sim                 | Agente pode parar de executar se limite atingido      | Nutricionistas            | Avise nutricionistas sobre limite      | ⚠️ Atenção  |
| Desativar agente de IA                       | ✅ Sim                   | ✅ Sim                 | Agente não executa mais                               | Nutricionistas            | Avise com antecedência                 | 🔴 Bloqueado|
| Adicionar novo protocolo                     | ❌ Não                   | ✅ Sim                 | Protocolo disponível para aplicação                   | Nutricionistas            | Nenhuma ação necessária                | ✅ OK       |
| Editar fases de protocolo existente          | ⚠️ Depende               | ✅ Sim                 | Pacientes em protocolo ativo podem ser afetados       | Nutricionistas + Pacientes| Revise pacientes em protocolo ativo    | ⚠️ Atenção  |
| Alterar tabela de alimentos (TACO)           | ✅ Sim                   | ✅ Sim                 | Valores nutricionais recalculados                     | Nutricionistas + Pacientes| Revise planos com alimentos alterados  | ⚠️ Atenção  |
| Adicionar novo biomarcador (exames)          | ❌ Não                   | ✅ Sim                 | Biomarcador disponível para análise                   | Nutricionistas            | Nenhuma ação necessária                | ✅ OK       |
| Alterar permissões de papel (role)           | ✅ Sim                   | ✅ Sim                 | Usuários ganham ou perdem acesso imediatamente        | Todos os usuários         | Avise usuários afetados                | ⚠️ Atenção  |

---

## Casos práticos

### Caso 1: Paciente com Síndrome do Intestino Irritável (SII)

**Snapshot:**
- Mulher, 34 anos, diagnóstico de SII há 2 anos
- Sintomas: inchaço, dor abdominal, alternância entre diarreia e constipação
- Gatilhos conhecidos: laticínios, cebola, alho, trigo

**Restrições configuradas (Owner):**
- Alergênicos: Nenhum
- Intolerâncias: Lactose (ALERTA), FODMAP alto (ALERTA)
- Condições: SII (protocolo FODMAP recomendado)

**Estratégia do Nutricionista:**
1. Aplicar Protocolo FODMAP (Fase 1: Eliminação)
2. Usar template "Plano Low-FODMAP Padrão"
3. Ajustar substituições: leite → leite sem lactose; cebola → cebolinha verde; trigo → arroz/quinoa

**Exemplo de 1 dia de cardápio (genérico):**
- **Café da manhã:** Mingau de aveia sem glúten com leite sem lactose, banana, canela
- **Lanche da manhã:** Iogurte sem lactose com sementes de chia
- **Almoço:** Arroz integral, frango grelhado, cenoura e abobrinha refogadas, salada de alface
- **Lanche da tarde:** Castanhas e frutas permitidas (ex: morango)
- **Jantar:** Quinoa, peixe assado, brócolis cozido, tomate cereja
- **Ceia:** Chá de camomila

**Proteções acionadas:**
- ⚠️ ALERTA ao tentar adicionar "Leite integral" → Sistema sugere "Leite sem lactose"
- ⚠️ ALERTA ao tentar adicionar "Cebola" → Sistema sugere "Cebolinha verde (parte verde)"
- ⚠️ ALERTA ao tentar adicionar "Pão de trigo" → Sistema sugere "Pão sem glúten" ou "Tapioca"

**Controles do Owner envolvidos:**
- Template: "Plano Low-FODMAP Padrão"
- Protocolo: "Protocolo FODMAP (Fase 1: Eliminação)"
- Regras: Intolerância a lactose (ALERTA), FODMAP alto (ALERTA)
- Tabela de alimentos: FODMAP classificados (alto, médio, baixo)

---

### Caso 2: Paciente com Alergia a Crustáceos e Diabetes Tipo 2

**Snapshot:**
- Homem, 52 anos, diabetes tipo 2 controlado com metformina
- Alergia grave a crustáceos (camarão, lagosta, caranguejo)
- Meta: controle glicêmico e perda de peso (10 kg em 6 meses)

**Restrições configuradas (Owner):**
- Alergênicos: Crustáceos (BLOQUEIA)
- Condições: Diabetes tipo 2 (ALERTA para açúcares simples e carboidratos refinados)
- Metas: 1800 kcal/dia, low-carb (30% carbs, 35% proteína, 35% gordura)

**Estratégia do Nutricionista:**
1. Usar template "Plano Low-Carb para Diabetes"
2. Priorizar proteínas magras (frango, peixe, ovos) — NUNCA crustáceos
3. Incluir gorduras boas (abacate, azeite, castanhas)
4. Limitar carboidratos a fontes integrais e baixo índice glicêmico

**Exemplo de 1 dia de cardápio (genérico):**
- **Café da manhã:** Omelete com espinafre e tomate, abacate, café sem açúcar
- **Lanche da manhã:** Mix de castanhas
- **Almoço:** Salada verde, salmão grelhado, brócolis, couve-flor gratinada (sem farinha)
- **Lanche da tarde:** Iogurte natural sem açúcar com nozes
- **Jantar:** Frango grelhado, abobrinha refogada, salada de rúcula com azeite
- **Ceia:** Chá verde

**Proteções acionadas:**
- 🔴 BLOQUEADO ao tentar adicionar "Camarão" → Sistema impede adição e exibe alerta de risco anafilático
- ⚠️ ALERTA ao tentar adicionar "Arroz branco" → Sistema sugere "Arroz integral" ou "Quinoa"
- ⚠️ ALERTA ao tentar adicionar "Banana" (alta carga glicêmica) → Sistema sugere "Frutas vermelhas"

**Controles do Owner envolvidos:**
- Template: "Plano Low-Carb para Diabetes"
- Regras: Alergia a crustáceos (BLOQUEIA), Diabetes tipo 2 (ALERTA para açúcares)
- Tabela de alimentos: Índice glicêmico, carga glicêmica, macros
- Agente de IA: "Planejador de Refeições" configurado para respeitar restrições

---

### Caso 3: Paciente Vegana com Deficiência de Ferro

**Snapshot:**
- Mulher, 28 anos, vegana há 3 anos
- Exames recentes: ferritina baixa (15 ng/mL, referência: 30-200)
- Sintomas: fadiga, queda de cabelo, unhas fracas
- Meta: aumentar ferritina para 50+ ng/mL em 3 meses

**Restrições configuradas (Owner):**
- Preferências: Veganismo (PERMITE com filtro — sem produtos animais)
- Condições: Deficiência de ferro (ALERTA para alimentos ricos em ferro + vitamina C)
- Suplementação: Sulfato ferroso 40 mg/dia (prescrito por médico)

**Estratégia do Nutricionista:**
1. Usar template "Plano Vegano Balanceado"
2. Priorizar fontes vegetais de ferro: feijão, lentilha, grão-de-bico, espinafre, quinoa
3. Combinar com vitamina C para aumentar absorção (laranja, limão, pimentão)
4. Evitar chá preto/café próximo às refeições (inibem absorção de ferro)
5. Monitorar ferritina a cada 6 semanas

**Exemplo de 1 dia de cardápio (genérico):**
- **Café da manhã:** Mingau de aveia com leite de amêndoa, sementes de abóbora, suco de laranja natural
- **Lanche da manhã:** Frutas cítricas (laranja, kiwi)
- **Almoço:** Arroz integral, feijão preto, couve refogada, beterraba, salada com limão
- **Lanche da tarde:** Homus com palitos de cenoura e pimentão
- **Jantar:** Quinoa, lentilha, espinafre refogado, tomate
- **Ceia:** Chá de hibisco (sem cafeína)

**Proteções acionadas:**
- ✅ PERMITE alimentos veganos (filtro ativo)
- ℹ️ INFORMATIVO ao adicionar "Espinafre + Feijão" → Sistema destaca "Excelente combinação para ferro!"
- ⚠️ ALERTA ao tentar adicionar "Chá preto" próximo ao almoço → Sistema sugere "Evite chá 1h antes/depois das refeições"
- ℹ️ INFORMATIVO → Sistema sugere "Adicione fonte de vitamina C (ex: limão na salada) para aumentar absorção de ferro"

**Controles do Owner envolvidos:**
- Template: "Plano Vegano Balanceado"
- Regras: Veganismo (filtro), Deficiência de ferro (sugestões de alimentos ricos em ferro)
- Tabela de alimentos: Teor de ferro, vitamina C, inibidores de absorção
- Agente de IA: "Análise de Exames" para interpretar ferritina e sugerir ajustes
- Agente de IA: "Assessor de Suplementos" para validar suplementação

---

## Monitoramento (App Owner)

Como Owner, você deve monitorar sinais de qualidade e eficiência da plataforma:

### Sinais para observar

**1. Taxa de conclusão de planos**
- **O que é:** % de planos criados que foram publicados (vs. abandonados em rascunho)
- **Meta:** ≥ 85%
- **Se abaixo:** Investigue barreiras (templates complexos? Alertas excessivos? Falta de treinamento?)

**2. Conflitos de segurança sinalizados**
- **O que é:** Número de alertas/bloqueios acionados por semana
- **Meta:** Alertas devem diminuir com o tempo (nutricionistas aprendem padrões)
- **Se aumentando:** Revise se regras estão muito restritivas ou se há novos nutricionistas sem treinamento

**3. Uso de templates**
- **O que é:** % de planos criados a partir de templates (vs. do zero)
- **Meta:** ≥ 70%
- **Se abaixo:** Templates podem não estar atendendo necessidades reais; colete feedback

**4. Aderência dos pacientes**
- **O que é:** % de refeições registradas vs. planejadas
- **Meta:** ≥ 60%
- **Se abaixo:** Planos podem estar muito restritivos ou complexos; revise templates

**5. Custos de IA por paciente**
- **O que é:** Custo médio de créditos de IA por paciente/mês
- **Meta:** Dentro do orçamento (ex: R$ 5-15/paciente)
- **Se acima:** Revise configuração de agentes (temperatura alta? Max tokens excessivo? Uso desnecessário?)

**6. Qualidade das respostas de IA**
- **O que é:** Avaliação dos nutricionistas sobre respostas de IA (1-5 estrelas)
- **Meta:** ≥ 4.0/5.0
- **Se abaixo:** Revise prompts, exemplos (few-shot), temperatura

**7. Tempo médio para criar plano**
- **O que é:** Tempo que nutricionista leva para criar e publicar um plano
- **Meta:** ≤ 20 minutos (com templates e IA)
- **Se acima:** Identifique gargalos (validação lenta? Templates inadequados? Interface confusa?)

**8. Taxa de retrabalho**
- **O que é:** % de planos que precisaram ser editados após publicação
- **Meta:** ≤ 15%
- **Se acima:** Melhore validação pré-publicação ou treinamento de nutricionistas

---

### Ações recomendadas por sinal

| Sinal                                  | Ação do Owner                                                                 |
|----------------------------------------|-------------------------------------------------------------------------------|
| Taxa de conclusão baixa                | [Revisar templates] [Simplificar validação] [Treinar nutricionistas]         |
| Conflitos de segurança aumentando      | [Revisar regras] [Treinar nutricionistas] [Auditar perfis de pacientes]      |
| Uso de templates baixo                 | [Coletar feedback] [Criar novos templates] [Melhorar documentação]           |
| Aderência de pacientes baixa           | [Revisar complexidade dos planos] [Ajustar metas] [Melhorar comunicação]     |
| Custos de IA acima do orçamento        | [Ajustar limites] [Revisar prompts] [Otimizar max tokens] [Desativar agentes]|
| Qualidade de IA baixa                  | [Revisar prompts] [Adicionar exemplos] [Ajustar temperatura] [Trocar modelo] |
| Tempo para criar plano alto            | [Simplificar interface] [Melhorar templates] [Automatizar validação]         |
| Taxa de retrabalho alta                | [Melhorar validação] [Treinar nutricionistas] [Revisar templates]            |

---

## Perguntas frequentes

### 1. Qual a diferença entre "Paciente" e "Cliente"?
No NutriPlan, usamos **"Paciente"** como termo primário para consistência clínica. "Cliente" é aceito como sinônimo em contextos comerciais, mas a plataforma padroniza "Paciente" em toda a interface.

### 2. O que acontece se eu alterar uma regra de segurança que já está em uso?
Depende do tipo de alteração:
- **Adicionar bloqueio:** Sistema revalida todos os planos existentes e gera alertas para nutricionistas.
- **Remover bloqueio:** Bloqueios desaparecem imediatamente; nenhuma ação necessária.
- **Alterar nível (grave ↔ moderado):** Planos são revalidados; nutricionistas recebem notificação.

**Recomendação:** Sempre avise nutricionistas antes de mudanças críticas.

### 3. Posso desativar um agente de IA temporariamente?
Sim. Acesse `/owner/ai-config`, selecione o agente e desative. Nutricionistas verão status "Indisponível" e não poderão executar o agente até você reativá-lo.

### 4. Como controlo os custos de IA?
Configure limites em `/owner/ai-config`:
- **Custo máximo por execução** (ex: $0.10)
- **Orçamento diário** (ex: $10/dia)
- **Orçamento mensal** (ex: $200/mês)
- **Alerta em X%** (ex: 80% do orçamento)

Monitore custos em `/studio/ai-workflows/credits`.

### 5. Posso criar meus próprios protocolos personalizados?
Sim. Use `/studio/ai/protocol-generator` para criar protocolos personalizados com IA, ou crie manualmente em `/studio/protocols`. Como Owner, você pode publicar protocolos para todos os nutricionistas.

### 6. O que é a "microbiota intestinal" e por que é importante?
A **microbiota intestinal** (não "flora intestinal") é o conjunto de microrganismos que vivem no intestino. Ela influencia digestão, imunidade, humor e saúde geral. Protocolos como FODMAP e Anti-inflamatório visam equilibrar a microbiota.

### 7. Como o sistema identifica gatilhos alimentares?
O agente de IA **Correlacionador de Sintomas** (`/studio/ai/symptom-correlator`) analisa o log diário do paciente (refeições + sintomas) e calcula correlações estatísticas. Exemplo: se o paciente registra "Inchaço" 2h após consumir "Laticínios" em 80% das vezes, o sistema sugere "Laticínios" como gatilho.

### 8. Posso importar minha própria tabela de alimentos?
Sim, se habilitado. Acesse `/owner/datasets` e importe arquivos CSV com colunas: nome, calorias, proteína, carboidratos, gordura, fibra, etc. O sistema valida e integra à tabela existente.

### 9. O que o NutriPlan NÃO faz?
- **Não diagnostica doenças** — Apenas nutricionistas e médicos podem diagnosticar.
- **Não prescreve medicamentos** — Suplementos são sugeridos, mas prescrição é responsabilidade do profissional.
- **Não substitui consulta presencial** — É uma ferramenta de apoio, não substitui avaliação clínica.
- **Não garante resultados** — Resultados dependem de aderência, genética, estilo de vida e outros fatores.
- **Não armazena dados de saúde sem consentimento** — Conforme LGPD, pacientes controlam seus dados.

### 10. Como funciona a validação de segurança em tempo real?
Quando o nutricionista adiciona um alimento ao plano:
1. Sistema verifica perfil do paciente (alergias, intolerâncias, condições)
2. Cruza com tabela de alergênicos e restrições
3. Aplica regras de prioridade (bloqueio > alerta > permite)
4. Exibe mensagem instantânea (se aplicável)
5. Sugere substituições seguras (se disponível)

### 11. Posso exportar dados para análise externa?
Sim. Use `/studio/patients/[patientId]` → Aba "Exportar Dados". Formatos disponíveis: PDF (relatório), CSV (dados brutos), JSON (API). **Atenção:** Respeite LGPD e obtenha consentimento do paciente.

### 12. Como treino minha equipe de nutricionistas?
Recomendações:
- **Onboarding:** Crie guia de boas práticas (use templates, respeite alertas, documente ajustes)
- **Treinamento em IA:** Explique como cada agente funciona e quando usar
- **Simulações:** Crie pacientes fictícios para prática
- **Feedback contínuo:** Revise planos criados e dê feedback construtivo
- **Atualizações:** Avise sobre mudanças em templates, regras ou agentes

---

## Glossário

**Aderência** — Percentual de refeições/ações que o paciente seguiu conforme planejado. Exemplo: se o plano tinha 21 refeições na semana e o paciente seguiu 18, aderência = 85%.

**Agente de IA** — Módulo de inteligência artificial configurado para executar uma tarefa específica (ex: reconhecer alimentos, gerar planos, analisar sintomas). Cada agente tem prompts, modelos e limites próprios.

**Alergênicos** — Alimentos ou substâncias que podem causar reações alérgicas. Exemplos: crustáceos, amendoim, glúten (para celíacos), lactose (para intolerantes). No NutriPlan, alergênicos são classificados por gravidade (grave, moderado, leve).

**Alerta** — Nível de decisão do motor de regras que permite a ação, mas exige revisão do nutricionista. Exemplo: adicionar açúcar a um plano de diabético gera ALERTA.

**Anti-nutrientes** — Substâncias naturais em alimentos que reduzem absorção de nutrientes. Exemplo: aveia contém **fitatos, lectinas e taninos** que podem reduzir absorção de minerais.

**Bloqueio** — Nível de decisão do motor de regras que impede a ação por risco de segurança. Exemplo: adicionar camarão ao plano de paciente alérgico a crustáceos gera BLOQUEIO.

**Correlação** — Relação estatística entre alimento e sintoma. Exemplo: se paciente relata "Inchaço" após consumir "Laticínios" em 80% das vezes, correlação = 0.80 (alta).

**FODMAP** — Sigla para Fermentable Oligosaccharides, Disaccharides, Monosaccharides, And Polyols. São carboidratos de cadeia curta que fermentam no intestino e podem causar sintomas em pessoas com SII. Protocolo FODMAP elimina temporariamente esses alimentos.

**Gatilho alimentar** — Alimento que desencadeia sintomas (ex: inchaço, dor, fadiga). Identificado via correlação estatística no log diário.

**Microbiota intestinal** — Conjunto de microrganismos (bactérias, fungos, vírus) que vivem no intestino. Influencia digestão, imunidade, humor e saúde geral. (Não usar "flora intestinal".)

**Motor de regras** — Sistema que valida ações (adicionar alimento, criar plano) contra regras de segurança e retorna decisão (BLOQUEIA, ALERTA, PERMITE).

**Plano alimentar** — Conjunto de refeições, macros, substituições e orientações criado pelo nutricionista para o paciente. Pode ser baseado em template ou criado do zero.

**Protocolo clínico** — Sequência estruturada de fases com regras, alimentos permitidos/proibidos e duração. Exemplo: Protocolo FODMAP (Fase 1: Eliminação, Fase 2: Reintrodução, Fase 3: Personalização).

**Sintomas gatilho** — Sintomas que indicam reação a alimento ou condição. Exemplos: inchaço, dor abdominal, fadiga, dor de cabeça, erupções cutâneas.

**Substituição** — Alimento alternativo sugerido quando o alimento original é bloqueado ou gera alerta. Exemplo: "Leite integral" → "Leite sem lactose".

**Template** — Estrutura reutilizável para criar planos, protocolos ou documentos. Exemplo: "Template Plano Low-Carb Padrão" com macros pré-definidos (30% carbs, 35% proteína, 35% gordura).

**Validação** — Processo de verificar se plano, alimento ou ação está conforme regras de segurança e qualidade.

---

## Suposições

As seguintes suposições foram feitas para criar este guia. Caso alguma não se aplique, ajuste conforme necessário:

1. **[Alta]** O NutriPlan usa três papéis principais: App Owner, Nutricionista, Paciente.
2. **[Alta]** O motor de regras valida ações em tempo real contra alergias, intolerâncias e condições de saúde.
3. **[Alta]** Templates e protocolos são criados/publicados pelo Owner e usados pelos nutricionistas.
4. **[Alta]** Agentes de IA são configuráveis pelo Owner (prompts, modelos, custos).
5. **[Média]** Alterações em regras de segurança revalidam planos existentes automaticamente.
6. **[Média]** O sistema usa tabelas de alimentos (TACO, USDA, customizadas) para cálculos nutricionais.
7. **[Média]** O log diário do paciente alimenta análises de IA (correlação de sintomas, aderência).
8. **[Baixa]** Exportação de dados respeita LGPD e requer consentimento do paciente.

---

**Versão do documento:** 1.0  
**Data de criação:** 2026-02-04  
**Idioma:** Português (Brasil)  
**Público-alvo:** App Owner/Admin do NutriPlan

---

*Este guia foi criado para ajudar você, App Owner, a entender, configurar e governar a plataforma NutriPlan com segurança, qualidade e eficiência. Para dúvidas ou sugestões, entre em contato com o suporte técnico.*

[Voltar ao topo](#como-o-nutriplan-funciona)
