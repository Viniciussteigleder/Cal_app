# 💰 Conceito de Planos Premium: Professional & Enterprise (Planos 3 e 4)

Este documento detalha a estratégia de preços, funcionalidades e diferenciais para os níveis superiores do NutriPlan (Planos 3 e 4), focados em nutricionistas estabelecidos e clínicas.

## 📊 Estrutura Geral de Planos

| Nível | Nome do Plano | Perfil Alvo | Foco |
| :--- | :--- | :--- | :--- |
| 1 | Free | Estudantes / Iniciantes | Experimentação e aprendizado |
| 2 | Starter | Nutricionistas em início de carreira | Gestão básica de poucos pacientes |
| **3** | **Professional** | **Nutricionistas estabelecidos** | **Automação, escala e ferramentas avançadas** |
| **4** | **Enterprise** | **Clínicas e Equipes** | **Gestão de múltiplos profissionais e volume** |

---

## 🚀 Plano 3: Professional (O "Best Seller")

**Objetivo**: Oferecer tudo que um nutricionista precisa para escalar seu atendimento sem aumentar a carga horária, utilizando automação e IA pesada.

### 💲 Precificação Sugerida
*   **Mensal**: R$ 197,00 / mês
*   **Anual**: R$ 1.970,00 / ano (equivalente a R$ 164,16/mês - **2 meses de desconto**)

### ✨ Funcionalidades Principais
Além de tudo do plano Starter:

1.  **Limites Expandidos**:
    *   **Pacientes Ativos**: Até 100 pacientes (vs 20 no Starter).
    *   **Armazenamento**: 50GB para exames e arquivos.
2.  **Pacote de IA Robusto**:
    *   **500 Créditos de IA/mês** (Valor de ~R$ 500 incluso).
    *   Acesso ilimitado ao *Food Recognition* (IA de fotos) para pacientes.
    *   Acesso prioritário a novos Agentes (Beta).
3.  **Funcionalidades Exclusivas**:
    *   **App White-label (Parcial)**: Logo da clínica nos PDFs e na área do paciente.
    *   **Protocol Generator**: Acesso completo ao gerador de protocolos clínicos.
    *   **Exam Analyzer**: Upload e análise automática de exames de sangue ilimitados.
    *   **Portal do Paciente Premium**: Pacientes têm acesso a histórico ilimitado (vs 30 dias no Starter).
4.  **Suporte**:
    *   Chat prioritário em horário comercial.

### 🔄 Upgrade Path (Gatilhos de Conversão)
*   Nutricionista atingiu 20 pacientes no Starter.
*   Necessidade de customizar a marca (Branding).
*   Alto consumo de créditos de IA avulsos no plano Starter.

---

## 🏢 Plano 4: Enterprise (Clínicas)

**Objetivo**: Solução completa para gestão de clínicas com múltiplos nutricionistas, secretárias e alto volume de pacientes.

### 💲 Precificação Sugerida
*   **Mensal**: A partir de R$ 497,00 / mês (Base para até 3 profissionais)
    *   +R$ 97,00 por profissional adicional.
*   **Anual**: A partir de R$ 4.970,00 / ano (**2 meses de desconto**).

### ✨ Funcionalidades Principais
Além de tudo do plano Professional:

1.  **Limites Corporativos**:
    *   **Pacientes Ativos**: Ilimitado.
    *   **Armazenamento**: 1TB.
    *   **Múltiplos Usuários**: Contas para secretárias e estagiários (acesso restrito).
2.  **Pacote de IA Massivo**:
    *   **2.000 Créditos de IA/mês** (Pool compartilhado entre a equipe).
    *   Compra de créditos adicionais com 20% de desconto por volume.
3.  **Gestão de Equipe**:
    *   **Dashboard do Dono**: Visão geral de desempenho de todos os nutricionistas.
    *   **Atribuição de Pacientes**: Secretária pode agendar e atribuir pacientes.
    *   **Controle de Acesso (RBAC)**: Define quem pode ver/editar o quê.
4.  **Funcionalidades Exclusivas**:
    *   **White-label Total**: Domínio personalizado (ex: `app.suaclinica.com.br`) e remoção total da marca NutriPlan.
    *   **API Access**: Integração com outros sistemas (CRM, Agendamento externo).
    *   **Audit Logs**: Histórico completo de quem acessou qual prontuário (Compliance LGPD avançado).
    *   **SLA de Uptime**: Garantia de 99.9%.
5.  **Suporte**:
    *   Gerente de conta dedicado (WhatsApp).
    *   Onboarding assistido para a equipe.

---

## 💳 Estratégia de Pagamento (Stripe/Gateway)

### 1. Frequência de Cobrança
*   **Recorrência Automática (Assinatura)**: Cobrança automática no cartão de crédito.
*   **Mensal vs. Anual**:
    *   O plano anual deve ser apresentado com destaque ("Melhor Valor") e o desconto calculado explicitamente ("Economize R$ 394/ano").
    *   Opção de parcelamento do plano Anual em até 12x (com juros repassados ou absorvidos, dependendo da estratégia de caixa).

### 2. Fluxo de Upgrade/Downgrade
*   **Prorating (Prorrateio)**:
    *   Ao mudar do Starter para Pro no meio do mês, o cliente paga apenas a diferença proporcional aos dias restantes.
    *   O Stripe lida com isso automaticamente ("Prorations").
*   **Gestão de Falhas**:
    *   Smart Retries (Stripe) para cartões recusados.
    *   Dunning emails (emails de cobrança) automáticos.
*   **Portal do Cliente**:
    *   Permitir que o usuário baixe faturas (NF-e integrada via eNotas ou similar) e altere cartão de crédito sozinho (Self-service).

### 3. Trial (Período de Teste)
*   **Estratégia**: Oferecer 14 dias de Trial do plano **Professional** para novos cadastros (com cartão ou sem cartão, dependendo da fricção desejada).
*   **Objetivo**: Viciar o usuário nas funcionalidades de IA (que consomem créditos) para justificar a assinatura.
