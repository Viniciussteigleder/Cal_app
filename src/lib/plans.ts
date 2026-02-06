import { prisma } from "@/lib/prisma";
import { SubscriptionPlan, type SubscriptionPlanConfig } from "@prisma/client";

const DEFAULT_PLAN_CONFIGS: Array<Omit<SubscriptionPlanConfig, "id" | "created_at" | "updated_at" | "stripe_product_id" | "stripe_price_id">> = [
  {
    plan: SubscriptionPlan.BASIC,
    name: "Basic",
    description: "Para experimentar e começar.",
    price_cents: 0,
    currency: "BRL",
    interval: "month",
    features: [
      "Até 5 Pacientes ativos",
      "Cálculos Básicos",
      "Acesso limitado ao App",
      "Sem IA",
      "Suporte Comunitário",
    ],
    ai_credits: 0,
    ai_usage_limit: 200,
    patient_limit: 5,
    is_active: true,
    display_order: 0,
  },
  {
    plan: SubscriptionPlan.PRO,
    name: "PRO",
    description: "Para nutricionistas autônomos.",
    price_cents: 4900,
    currency: "BRL",
    interval: "month",
    features: [
      "Até 50 Pacientes",
      "App Paciente Completo",
      "500 Créditos IA/mês",
      "Receitas por IA",
      "Suporte por Email",
    ],
    ai_credits: 500,
    ai_usage_limit: 5000,
    patient_limit: 50,
    is_active: true,
    display_order: 1,
  },
  {
    plan: SubscriptionPlan.PRO_MAX,
    name: "PRO MAX",
    description: "Para escalar seu atendimento.",
    price_cents: 9700,
    currency: "BRL",
    interval: "month",
    features: [
      "Até 200 Pacientes",
      "Tudo do PRO",
      "2.000 Créditos IA/mês",
      "Gerador de Protocolos",
      "Análise de Exames",
      "Branding Personalizado",
    ],
    ai_credits: 2000,
    ai_usage_limit: 20000,
    patient_limit: 200,
    is_active: true,
    display_order: 2,
  },
  {
    plan: SubscriptionPlan.PRO_MAX_AI,
    name: "PRO MAX AI",
    description: "O poder máximo da tecnologia.",
    price_cents: 19700,
    currency: "BRL",
    interval: "month",
    features: [
      "Pacientes Ilimitados",
      "Tudo do PRO MAX",
      "5.000 Créditos IA/mês",
      "Food Recognition Ilimitado",
      "API Access",
      "Gerente Dedicado",
    ],
    ai_credits: 5000,
    ai_usage_limit: 100000,
    patient_limit: null,
    is_active: true,
    display_order: 3,
  },
];

const DEFAULT_PRICE_IDS: Record<SubscriptionPlan, string | undefined> = {
  [SubscriptionPlan.BASIC]: undefined,
  [SubscriptionPlan.PRO]: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO,
  [SubscriptionPlan.PRO_MAX]: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_MAX,
  [SubscriptionPlan.PRO_MAX_AI]: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_MAX_AI,
};

export async function ensurePlanConfigs(): Promise<SubscriptionPlanConfig[]> {
  const existing = await prisma.subscriptionPlanConfig.findMany({
    orderBy: { display_order: "asc" },
  });

  if (existing.length === 0) {
    await prisma.subscriptionPlanConfig.createMany({
      data: DEFAULT_PLAN_CONFIGS.map((plan) => ({
        ...plan,
        stripe_price_id: DEFAULT_PRICE_IDS[plan.plan] || undefined,
      })),
    });
    return prisma.subscriptionPlanConfig.findMany({
      orderBy: { display_order: "asc" },
    });
  }

  const existingPlans = new Set(existing.map((plan) => plan.plan));
  const missing = DEFAULT_PLAN_CONFIGS.filter((plan) => !existingPlans.has(plan.plan));

  if (missing.length > 0) {
    await prisma.subscriptionPlanConfig.createMany({
      data: missing.map((plan) => ({
        ...plan,
        stripe_price_id: DEFAULT_PRICE_IDS[plan.plan] || undefined,
      })),
    });
  }

  return prisma.subscriptionPlanConfig.findMany({
    orderBy: { display_order: "asc" },
  });
}

export function formatPriceBRL(priceCents: number): string {
  if (priceCents <= 0) return "Grátis";
  const value = (priceCents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
  });
  return value.replace("R$\u00a0", "R$ ");
}
