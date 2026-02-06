"use client";

import { Check, Star, Zap, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface PricingCardProps {
    title: string;
    price: string;
    description: string;
    features: string[];
    isPopular?: boolean;
    buttonText: string;
    onSubscribe: () => void;
    isLoading?: boolean;
}

function PricingCard({ title, price, description, features, isPopular, buttonText, onSubscribe, isLoading }: PricingCardProps) {
    return (
        <Card className={`relative flex flex-col ${isPopular ? 'border-primary shadow-lg scale-105' : 'border-border'}`}>
            {isPopular && (
                <div className="absolute -top-4 left-0 right-0 flex justify-center">
                    <Badge className="bg-primary hover:bg-primary/90">Mais Popular</Badge>
                </div>
            )}
            <CardHeader>
                <CardTitle className="text-2xl font-bold">{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
                <div className="mt-4">
                    <span className="text-4xl font-bold">{price}</span>
                    <span className="text-muted-foreground">/mês</span>
                </div>
            </CardHeader>
            <CardContent className="flex-1">
                <ul className="space-y-3">
                    {features.map((feature, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm">
                            <Check className="h-4 w-4 text-green-500" />
                            {feature}
                        </li>
                    ))}
                </ul>
            </CardContent>
            <CardFooter>
                <Button
                    className="w-full"
                    variant={isPopular ? 'default' : 'outline'}
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
    // In a real app, you would fetch the current plan from the server component or context
    const currentPlan = "STARTER"; // Mock
    const tenantId = "current-tenant-id"; // Mock - would come from session

    const handleSubscribe = async (priceId: string, planName: string) => {
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
                <h1 className="text-3xl font-bold tracking-tight mb-4">Escolha o Plano Ideal para Sua Carreira</h1>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                    Desbloqueie todo o potencial do NutriPlan com automação avançada e Inteligência Artificial.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {/* Starter Plan */}
                <PricingCard
                    title="Starter"
                    price="R$ 49"
                    description="Para quem está começando a atender."
                    features={[
                        "Até 20 Pacientes ativos",
                        "Cálculos Automáticos",
                        "App do Paciente (Básico)",
                        "100 Créditos de IA/mês",
                        "Suporte por Email"
                    ]}
                    buttonText={currentPlan === "STARTER" ? "Plano Atual" : "Downgrade"}
                    onSubscribe={() => { }} // Handle downgrade or show active
                />

                {/* Professional Plan */}
                <PricingCard
                    title="Professional"
                    price="R$ 197"
                    description="Para nutricionistas em crescimento."
                    isPopular={true}
                    features={[
                        "Até 100 Pacientes ativos",
                        "Tudo do Starter",
                        "500 Créditos de IA/mês",
                        "IA de Reconhecimento de Fotos (Ilimitado)",
                        "Gerador de Protocolos",
                        "Análise de Exames",
                        "Personalização de Cores (White-label parcial)"
                    ]}
                    buttonText="Fazer Upgrade"
                    onSubscribe={() => handleSubscribe(process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO || '', 'PROFESSIONAL')}
                />

                {/* Enterprise Plan */}
                <PricingCard
                    title="Enterprise"
                    price="R$ 497"
                    description="Para clínicas e alta demanda."
                    features={[
                        "Pacientes Ilimitados",
                        "Tudo do Professional",
                        "2.000 Créditos de IA/mês",
                        "Gestão de Equipe (Múltiplos Nutris)",
                        "Domínio Personalizado",
                        "API de Integração",
                        "Gerente de Conta Dedicado"
                    ]}
                    buttonText="Falar com Vendas"
                    onSubscribe={() => handleSubscribe(process.env.NEXT_PUBLIC_STRIPE_PRICE_ENTERPRISE || '', 'ENTERPRISE')}
                />
            </div>

            <div className="mt-16 bg-muted/50 rounded-lg p-8 text-center">
                <h2 className="text-xl font-semibold mb-2">Precisa de mais créditos de IA?</h2>
                <p className="text-muted-foreground mb-4">
                    Você pode comprar pacotes avulsos de créditos a qualquer momento sem mudar de plano.
                </p>
                <Button variant="outline">Ver Pacotes de Créditos</Button>
            </div>
        </div>
    );
}
