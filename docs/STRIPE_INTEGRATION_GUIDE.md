# 💳 Guia de Configuração Stripe - NutriPlan

Este guia fornece o passo a passo para configurar a integração de pagamentos e assinaturas utilizando o Stripe, focado no mercado brasileiro (BRL).

## 📋 Pré-requisitos
1.  Uma conta criada em [dashboard.stripe.com/register](https://dashboard.stripe.com/register).
2.  Conta bancária PJ (Pessoa Jurídica) ou PF (Pessoa Física) para receber os pagamentos.
3.  Acesso ao código fonte do NutriPlan (chaves de API).

---

## 🚀 Parte 1: Configuração no Dashboard Stripe

### 1. Ativação da Conta
Antes de processar pagamentos reais, você precisa ativar a conta enviando documentos da empresa/pessoal.
*   Acesse **Configurações > Detalhes da conta**.
*   Preencha CNPJ/CPF, endereço e dados bancários.

### 2. Criação dos Produtos (Planos)
Vamos criar os planos definidos no Conceito (Professional e Enterprise).

1.  No Dashboard, vá para **Catálogo de produtos**.
2.  Clique em **+ Adicionar produto**.

#### Criando o Plano Professional
*   **Nome**: NutriPlan Professional
*   **Descrição**: Para nutricionistas estabelecidos. Inclui 500 créditos de IA.
*   **Preço 1 (Mensal)**:
    *   Modelo de preço: **Padrão**
    *   Preço: **R$ 197,00**
    *   Cobrança: **Recorrente** > **Mensalmente**
*   **Preço 2 (Anual)**:
    *   Clique em "Adicionar outro preço" no mesmo produto.
    *   Modelo de preço: **Padrão**
    *   Preço: **R$ 1.970,00**
    *   Cobrança: **Recorrente** > **Anualmente**
*   **Imagem**: Faça upload do ícone "Professional" (Roxo/Ouro).

#### Criando o Plano Enterprise
*   Repita o processo para o plano Enterprise.
*   **Nome**: NutriPlan Enterprise
*   **Preço Mensal**: R$ 497,00
*   **Preço Anual**: R$ 4.970,00

### 3. Configuração do Portal do Cliente (Customer Portal)
O Stripe oferece um portal pronto para o cliente gerenciar a assinatura (trocar cartão, baixar fatura, cancelar).
1.  Vá para **Configurações > Portal do cliente**.
2.  Ative o link do portal.
3.  Permita que os clientes:
    *   Cancelem assinaturas.
    *   Façam upgrade/downgrade (trocar de plano).
    *   Atualizem métodos de pagamento.
    *   Atualizem informações de faturamento (essencial para NF).
4.  Salve as alterações.

### 4. Obtenção das Chaves de API
1.  Vá para **Desenvolvedores > Chaves de API**.
2.  Copie a **Chave publicável** (`pk_test_...` ou `pk_live_...`).
3.  Copie a **Chave secreta** (`sk_test_...` ou `sk_live_...`).
    *   *Nota: Comece sempre com as chaves de teste (`_test_`) para desenvolvimento.*

---

## 💻 Parte 2: Integração Técnica (Next.js)

### 1. Instalação do SDK
```bash
npm install stripe @stripe/stripe-js
```

### 2. Variáveis de Ambiente
Adicione ao seu arquivo `.env.local`:
```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_... (visto na parte 3)
```

### 3. Setup do Cliente Stripe (`lib/stripe.ts`)
Crie um arquivo para inicializar o Stripe de forma segura.

```typescript
import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16', // Use a versão mais recente disponível no seu dashboard
  appInfo: {
    name: 'NutriPlan',
    version: '0.1.0',
  },
});
```

### 4. Criando Checkout Session (Server Action ou API Route)
Quando o usuário clica em "Assinar", você cria uma sessão.

```typescript
// app/api/stripe/checkout/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth'; // Ou sua lib de auth (Supabase)
import { stripe } from '@/lib/stripe';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const priceId = searchParams.get('priceId');
  
  // 1. Verificar autenticação do usuário
  // const user = await getUser(); 
  
  // 2. Criar ou recuperar Customer no Stripe (vincular ao ID do usuário no DB)
  
  // 3. Criar Sessão
  const session = await stripe.checkout.sessions.create({
    customer: stripeCustomerId, // ID do cliente no Stripe
    mode: 'subscription',
    payment_method_types: ['card', 'boleto'], // Boleto funciona bem no Brasil
    line_items: [
      {
        price: priceId, // ID do preço (ex: price_123...) copiado do Dashboard
        quantity: 1,
      },
    ],
    success_url: `${process.env.NEXT_PUBLIC_URL}/owner/settings/billing?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_URL}/owner/settings/billing?canceled=true`,
    metadata: {
      userId: user.id,
    },
  });

  return NextResponse.redirect(session.url!);
}
```

### 5. Webhooks (Sincronizando com o Banco de Dados)
Você precisa escutar eventos do Stripe para liberar o acesso no seu banco de dados.

1.  Crie uma rota `/api/webhooks/stripe`.
2.  Configure o webhook no Dashboard Stripe para ouvir os eventos:
    *   `checkout.session.completed`: Pagamento inicial aprovado.
    *   `invoice.payment_succeeded`: Renovação mensal aprovada.
    *   `invoice.payment_failed`: Pagamento falhou (bloquear acesso ou avisar).
    *   `customer.subscription.deleted`: Assinatura cancelada.

```typescript
// Exemplo simplificado de webhook
export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get('Stripe-Signature') as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error) {
    return new NextResponse('Webhook error', { status: 400 });
  }

  const session = event.data.object as Stripe.Checkout.Session;

  if (event.type === 'checkout.session.completed') {
    // Atualizar tabela Tenant no Supabase
    // - Definir plan = 'PROFESSIONAL'
    // - Definir status = 'ACTIVE'
    // - Adicionar Créditos de IA
  }

  return new NextResponse(null, { status: 200 });
}
```

---

## 🇧🇷 Dicas Específicas para o Brasil

### Meios de Pagamento
*   **Cartão de Crédito**: Padrão para SaaS. Habilite todas as bandeiras.
*   **Boleto**: O Stripe suporta Boleto para assinaturas, mas a confirmação pode levar 1-3 dias.
*   **Pix**: O Stripe **ainda não suporta Pix nativamente para assinaturas recorrentes** de forma 100% automática (apenas pagamentos únicos). Para assinaturas via Pix, geralmente se usa gateways locais (como Asaas ou Iugu) ou workarounds (cobrar mês a mês).
    *   *Recomendação*: Comece apenas com **Cartão de Crédito** para simplificar a recorrência.

### Notas Fiscais (NF-e)
O Stripe **não** emite nota fiscal brasileira (NFS-e) para o seu cliente final. Ele apenas processa o pagamento.
*   Você precisará integrar com um emissor de notas fiscais, como **eNotas**, **Focus NFe** ou **Nfe.io**.
*   Essas ferramentas se conectam ao Stripe: quando o pagamento cai (`invoice.payment_succeeded`), elas geram a nota na prefeitura e enviam para o cliente.
