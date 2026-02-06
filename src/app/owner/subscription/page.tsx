
"use client";

import { Check, Star, Zap, Building2, Crown, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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
}

function PricingCard({ title, price, description, features, isPopular, highlightColor, icon, buttonText, onSubscribe, isLoading }: PricingCardProps) {
    return (
        <Card className={`relative flex flex-col h-full ${isPopular ? 'border-2 shadow-xl scale-105 z-10' : 'border border-border'}`} style={isPopular && highlightColor ? { borderColor: highlightColor } : {}}>
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
                    {price !== 'Grátis' && <span className="text-muted-foreground">/mês</span>}
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
                    variant={isPopular ? 'default' : 'outline'}
                    style={isPopular && highlightColor ? { backgroundColor: highlightColor } : {}}
                    onClick={onSubscribe}
                    disabled={isLoading}
                >
                    {isLoading ? 'Processando...' : buttonText}
                </Button>
            </CardFooter>
        </Card>
    );
}

export default function SubscriptionPage() {
    // Mock current plan for demo
    const currentPlan = "BASIC";
    const tenantId = "current-tenant-id";

    const handleSubscribe = async (priceId: string, planName: string) => {
        if (!priceId) {
            console.error("Missing Price ID for", planName);
            return;
        }
        try {
            const response = await fetch(`/api/stripe/checkout?priceId=${priceId}&tenantId=${tenantId}&planName=${planName}`);
            const data = await response.json();
            if (data.url) {
                window.location.href = data.url;
            } else {
                alert('Erro ao iniciar checkout');
            }
        } catch (error) {
            console.error(error);
            alert('Erro de conexão');
        }
    }

    return (
        <div className="container mx-auto py-10 px-4">
            <div className="text-center mb-12">
                <h1 className="text-3xl font-bold tracking-tight mb-4">Planos Flexíveis para Sua Evolução</h1>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                    Comece grátis e escale com o poder da Inteligência Artificial.
                </p>
            </div>

            {/* Grid adjusting for 4 items */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 max-w-7xl mx-auto items-start">

                {/* BASIC PLAN */}
                <PricingCard
                    title="Basic"
                    price="Grátis"
                    description="Para experimentar e começar."
                    icon={<Star className="h-5 w-5 text-gray-500" />}
                    features={[
                        "Até 5 Pacientes ativos",
                        "Cálculos Básicos",
                        "Acesso limitado ao App",
                        "Sem IA",
                        "Suporte Comunitário"
                    ]}
                    buttonText="Plano Atual"
                    onSubscribe={() => { }}
                />

                {/* PRO PLAN */}
                <PricingCard
                    title="PRO"
                    price="R$ 49"
                    description="Para nutricionistas autônomos."
                    icon={<Zap className="h-5 w-5 text-blue-500" />}
                    features={[
                        "Até 50 Pacientes",
                        "App Paciente Completo",
                        "500 Créditos IA/mês",
                        "Receitas por IA",
                        "Suporte por Email"
                    ]}
                    buttonText="Assinar PRO"
                    onSubscribe={() => handleSubscribe(process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO || '', 'PRO')}
                />

                {/* PRO MAX */}
                <PricingCard
                    title="PRO MAX"
                    price="R$ 97"
                    description="Para escalar seu atendimento."
                    isPopular={true}
                    highlightColor="#8b5cf6" // Violet
                    icon={<Crown className="h-5 w-5 text-white" />}
                    features={[
                        "Até 200 Pacientes",
                        "Tudo do PRO",
                        "2.000 Créditos IA/mês",
                        "Gerador de Protocolos",
                        "Análise de Exames",
                        "Branding Personalizado"
                    ]}
                    buttonText="Assinar PRO MAX"
                    onSubscribe={() => handleSubscribe(process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_MAX || '', 'PRO_MAX')}
                />

                {/* PRO MAX AI */}
                <PricingCard
                    title="PRO MAX AI"
                    price="R$ 197"
                    description="O poder máximo da tecnologia."
                    icon={<Bot className="h-5 w-5 text-amber-500" />}
                    features={[
                        "Pacientes Ilimitados",
                        "Tudo do PRO MAX",
                        "5.000 Créditos IA/mês",
                        "Food Recognition Ilimitado",
                        "API Access",
                        "Gerente Dedicado"
                    ]}
                    buttonText="Assinar UIltimate"
                    onSubscribe={() => handleSubscribe(process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_MAX_AI || '', 'PRO_MAX_AI')}
                />
            </div>

            {/* Explanation of Security Warning */}
            {/* 
         NOTE TO DEV: The Vercel warning about NEXT_PUBLIC_ variables is expected. 
         These keys (Price IDs) are designed to be public identifiers for Stripe Checkout. 
         They contain no secret data.
       */}

            <div className="mt-16 bg-muted/50 rounded-lg p-8 text-center max-w-4xl mx-auto">
                <h2 className="text-xl font-semibold mb-2">Dúvidas sobre os planos?</h2>
                <p className="text-muted-foreground mb-4">
                    Nossa equipe está pronta para te ajudar a escolher a melhor opção para sua carreira.
                </p>
                <Button variant="outline">Falar com Consultor</Button>
            </div>
        </div>
    );
}
