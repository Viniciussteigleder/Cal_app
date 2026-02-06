"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Star, Zap, Crown, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

type PlanKey = "BASIC" | "PRO" | "PRO_MAX" | "PRO_MAX_AI";

interface PlanConfig {
  plan: PlanKey;
  name: string;
  description?: string | null;
  price_cents: number;
  currency: string;
  interval: string;
  features?: string[] | null;
  ai_credits: number;
  ai_usage_limit: number;
  patient_limit: number | null;
  stripe_product_id?: string | null;
  stripe_price_id?: string | null;
  is_active: boolean;
  display_order: number;
}

interface PricingCardProps {
  title: string;
  price: string;
  description: string;
  features: string[];
  isPopular?: boolean;
  highlightColor?: string;
  icon?: React.ReactNode;
  buttonText: string;
  onSubscribe: () => void;
  isLoading?: boolean;
  disabled?: boolean;
}

function PricingCard({ title, price, description, features, isPopular, highlightColor, icon, buttonText, onSubscribe, isLoading, disabled }: PricingCardProps) {
  return (
    <Card className={`relative flex flex-col h-full ${isPopular ? "border-2 shadow-xl scale-105 z-10" : "border border-border"}`} style={isPopular && highlightColor ? { borderColor: highlightColor } : {}}>
      {isPopular && (
        <div className="absolute -top-4 left-0 right-0 flex justify-center">
          <Badge className="px-4 py-1" style={highlightColor ? { backgroundColor: highlightColor } : {}}>
            {title === "Basic" ? "Grátis" : "Recomendado"}
          </Badge>
        </div>
      )}
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              {icon} {title}
            </CardTitle>
            <CardDescription className="mt-2 text-sm">{description}</CardDescription>
          </div>
        </div>
        <div className="mt-4">
          <span className="text-4xl font-bold">{price}</span>
          {price !== "Grátis" && <span className="text-muted-foreground">/mês</span>}
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        <ul className="space-y-3">
          {features.map((feature, i) => (
            <li key={i} className="flex items-start gap-2 text-sm">
              <Check className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
              <span className="text-muted-foreground">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          variant={isPopular ? "default" : "outline"}
          style={isPopular && highlightColor ? { backgroundColor: highlightColor } : {}}
          onClick={onSubscribe}
          disabled={isLoading || disabled}
        >
          {isLoading ? "Processando..." : buttonText}
        </Button>
      </CardFooter>
    </Card>
  );
}

function planIcon(plan: PlanKey) {
  if (plan === "BASIC") return <Star className="h-5 w-5 text-gray-500" />;
  if (plan === "PRO") return <Zap className="h-5 w-5 text-blue-500" />;
  if (plan === "PRO_MAX") return <Crown className="h-5 w-5 text-white" />;
  return <Bot className="h-5 w-5 text-amber-500" />;
}

function formatPriceBRL(priceCents: number): string {
  if (priceCents <= 0) return "Grátis";
  const value = (priceCents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
  });
  return value.replace("R$\\u00a0", "R$ ");
}

export default function SubscriptionPage() {
  const [plans, setPlans] = useState<PlanConfig[]>([]);
  const [currentPlan, setCurrentPlan] = useState<PlanKey | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState<PlanKey | null>(null);
  const [savingPlan, setSavingPlan] = useState<PlanKey | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<PlanKey, PlanConfig>>({} as Record<PlanKey, PlanConfig>);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/owner/plans");
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Falha ao carregar planos");
        const normalized = (data.plans || []).map((plan: PlanConfig) => ({
          ...plan,
          features: Array.isArray(plan.features) ? plan.features : [],
        }));
        setPlans(normalized);
        setCurrentPlan(data.currentPlan || null);
        const nextDrafts: Record<PlanKey, PlanConfig> = {} as Record<PlanKey, PlanConfig>;
        normalized.forEach((plan: PlanConfig) => {
          nextDrafts[plan.plan] = { ...plan };
        });
        setDrafts(nextDrafts);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao carregar planos");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSubscribe = async (planKey: PlanKey) => {
    setCheckoutLoading(planKey);
    try {
      const response = await fetch(`/api/stripe/checkout?plan=${planKey}`);
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "Erro ao iniciar checkout");
      }
    } catch (err) {
      console.error(err);
      alert("Erro de conexão");
    } finally {
      setCheckoutLoading(null);
    }
  };

  const handleDraftChange = (planKey: PlanKey, field: keyof PlanConfig, value: PlanConfig[keyof PlanConfig]) => {
    setDrafts((prev) => ({
      ...prev,
      [planKey]: {
        ...prev[planKey],
        [field]: value,
      },
    }));
  };

  const handleSave = async (planKey: PlanKey) => {
    const draft = drafts[planKey];
    if (!draft) return;

    setSavingPlan(planKey);
    setError(null);

    try {
      const response = await fetch("/api/owner/plans", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: planKey,
          updates: {
            name: draft.name,
            description: draft.description,
            price_cents: Math.round(Number(draft.price_cents) || 0),
            currency: draft.currency,
            interval: draft.interval,
            features: draft.features || [],
            ai_credits: Number(draft.ai_credits) || 0,
            ai_usage_limit: Number(draft.ai_usage_limit) || 0,
            patient_limit: draft.patient_limit === null ? null : Number(draft.patient_limit),
            is_active: Boolean(draft.is_active),
            display_order: Number(draft.display_order) || 0,
          },
          syncStripe: true,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Falha ao salvar");

      setPlans((prev) => prev.map((plan) => (plan.plan === planKey ? data.plan : plan)));
      setDrafts((prev) => ({
        ...prev,
        [planKey]: data.plan,
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar plano");
    } finally {
      setSavingPlan(null);
    }
  };

  const sortedPlans = useMemo(
    () => [...plans].sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0)),
    [plans]
  );

  return (
    <div className="container mx-auto py-10 px-4 space-y-12">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight mb-4">Planos Flexíveis para Sua Evolução</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Comece grátis e escale com o poder da Inteligência Artificial.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 max-w-7xl mx-auto items-start">
        {loading ? (
          <div className="col-span-full text-center text-muted-foreground">Carregando planos...</div>
        ) : (
          sortedPlans.map((plan) => {
            const isCurrent = currentPlan === plan.plan;
            const isPopular = plan.plan === "PRO_MAX";
            const priceLabel = formatPriceBRL(plan.price_cents);
            const buttonText = isCurrent ? "Plano Atual" : plan.price_cents <= 0 ? "Grátis" : `Assinar ${plan.name}`;

            return (
              <PricingCard
                key={plan.plan}
                title={plan.name}
                price={priceLabel}
                description={plan.description || ""}
                icon={planIcon(plan.plan)}
                features={(plan.features || []) as string[]}
                isPopular={isPopular}
                highlightColor={isPopular ? "#8b5cf6" : undefined}
                buttonText={buttonText}
                isLoading={checkoutLoading === plan.plan}
                disabled={isCurrent || plan.price_cents <= 0 || !plan.is_active}
                onSubscribe={() => handleSubscribe(plan.plan)}
              />
            );
          })
        )}
      </div>

      <Card className="max-w-5xl mx-auto">
        <CardHeader>
          <CardTitle>Gerenciar Planos e Preços</CardTitle>
          <CardDescription>
            Ajuste escopo, preço e sincronize automaticamente com Stripe.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {loading ? (
            <div className="text-muted-foreground">Carregando configurações...</div>
          ) : (
            sortedPlans.map((plan) => {
              const draft = drafts[plan.plan];
              if (!draft) return null;
              const featureText = (draft.features || []).join("\n");

              return (
                <div key={plan.plan} className="border border-border rounded-xl p-4 space-y-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold">{plan.name}</h3>
                      <p className="text-sm text-muted-foreground">{plan.plan}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Label className="text-sm">Ativo</Label>
                      <Switch
                        checked={draft.is_active}
                        onCheckedChange={(value) => handleDraftChange(plan.plan, "is_active", value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Nome</Label>
                      <Input
                        value={draft.name}
                        onChange={(e) => handleDraftChange(plan.plan, "name", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Descrição</Label>
                      <Input
                        value={draft.description || ""}
                        onChange={(e) => handleDraftChange(plan.plan, "description", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label>Preço (centavos)</Label>
                      <Input
                        type="number"
                        value={draft.price_cents}
                        onChange={(e) => handleDraftChange(plan.plan, "price_cents", Number(e.target.value))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Moeda</Label>
                      <Input
                        value={draft.currency}
                        onChange={(e) => handleDraftChange(plan.plan, "currency", e.target.value.toUpperCase())}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Intervalo</Label>
                      <Input
                        value={draft.interval}
                        onChange={(e) => handleDraftChange(plan.plan, "interval", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Ordem</Label>
                      <Input
                        type="number"
                        value={draft.display_order}
                        onChange={(e) => handleDraftChange(plan.plan, "display_order", Number(e.target.value))}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Créditos IA/mês</Label>
                      <Input
                        type="number"
                        value={draft.ai_credits}
                        onChange={(e) => handleDraftChange(plan.plan, "ai_credits", Number(e.target.value))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Limite IA</Label>
                      <Input
                        type="number"
                        value={draft.ai_usage_limit}
                        onChange={(e) => handleDraftChange(plan.plan, "ai_usage_limit", Number(e.target.value))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Limite de Pacientes</Label>
                      <Input
                        type="number"
                        value={draft.patient_limit ?? ""}
                        onChange={(e) =>
                          handleDraftChange(
                            plan.plan,
                            "patient_limit",
                            e.target.value === "" ? null : Number(e.target.value)
                          )
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Features (uma por linha)</Label>
                    <Textarea
                      value={featureText}
                      onChange={(e) =>
                        handleDraftChange(
                          plan.plan,
                          "features",
                          e.target.value.split("\n").map((item) => item.trim()).filter(Boolean)
                        )
                      }
                      rows={5}
                    />
                  </div>

                  <div className="text-sm text-muted-foreground">
                    Stripe product: {plan.stripe_product_id || "(não configurado)"} | Stripe price: {plan.stripe_price_id || "(não configurado)"}
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={() => handleSave(plan.plan)} disabled={savingPlan === plan.plan}>
                      {savingPlan === plan.plan ? "Salvando..." : "Salvar e sincronizar"}
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}
