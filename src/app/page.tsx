"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ShieldCheck,
  Heart,
  Zap,
  ArrowRight,
  Scale,
  FlaskConical,
  MessageCircle,
  Smartphone,
  BarChart3,
  Utensils,
  Users,
  CheckCircle2,
  Leaf,
} from "lucide-react";
import { AuthModal } from "@/components/auth/auth-modal";

export default function LandingPage() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authDefaultTab, setAuthDefaultTab] = useState<"login" | "signup">("login");

  const openLogin = () => {
    setAuthDefaultTab("login");
    setShowAuthModal(true);
  };

  const openSignup = () => {
    setAuthDefaultTab("signup");
    setShowAuthModal(true);
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-foreground font-sans selection:bg-emerald-100">

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-emerald-100/50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="font-bold text-xl flex items-center gap-2 text-slate-900">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-200">
              <Leaf className="h-5 w-5 text-white" />
            </div>
            NutriPlan
          </div>
          <div className="hidden md:flex gap-8 text-sm font-medium text-muted-foreground">
            <a href="#features" className="hover:text-emerald-600 transition-colors">Funcionalidades</a>
            <a href="#clinic" className="hover:text-emerald-600 transition-colors">Para Clínicas</a>
            <a href="#pricing" className="hover:text-emerald-600 transition-colors">Preços</a>
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" className="text-muted-foreground" onClick={openLogin}>
              Entrar
            </Button>
            <Button
              className="bg-slate-900 hover:bg-slate-800 text-white rounded-full shadow-lg shadow-slate-200"
              onClick={openSignup}
            >
              Começar Grátis
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center space-y-8 animate-in slide-in-from-bottom-4 duration-700">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 text-emerald-700 text-xs font-bold uppercase tracking-wide shadow-sm">
            <Zap className="h-3 w-3" />
            Simples e Eficiente
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-slate-900 leading-[1.1]">
            Acompanhe sua <br />
            <span className="text-emerald-600 relative inline-block">
              alimentação
              <svg className="absolute w-full h-3 -bottom-1 left-0 text-emerald-200 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
                <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
              </svg>
            </span>{" "}
            com facilidade.
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Registre suas refeições, acompanhe seu progresso e converse com seu nutricionista.
            Tudo em um só lugar, sem complicação.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button
              size="lg"
              className="h-14 px-8 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-xl shadow-emerald-200 text-lg transition-transform hover:scale-105 active:scale-95"
              onClick={openSignup}
            >
              Criar conta grátis
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Link href="/login">
              <Button size="lg" variant="outline" className="h-14 px-8 rounded-full border-slate-200 text-slate-700 hover:bg-white hover:text-emerald-700 text-lg transition-all hover:border-emerald-200">
                Já tenho conta
              </Button>
            </Link>
          </div>

          <div className="pt-8 flex items-center justify-center gap-6 text-sm text-muted-foreground flex-wrap">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-600" /> Dados seguros
            </div>
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-emerald-600" /> 100% gratuito
            </div>
            <div className="flex items-center gap-2">
              <Smartphone className="h-4 w-4 text-emerald-600" /> Fácil de usar
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section id="features" className="py-24 bg-card/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Tudo que você precisa
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Ferramentas simples para você cuidar melhor da sua alimentação
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">

            {/* Feature 1 */}
            <div className="space-y-4 group">
              <div className="h-12 w-12 rounded-2xl bg-orange-50 dark:bg-orange-950/20 flex items-center justify-center text-orange-600 group-hover:scale-110 transition-transform shadow-sm">
                <Scale className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Registro fácil</h3>
              <p className="text-muted-foreground leading-relaxed">
                Anote suas refeições em segundos. Use a câmera, voz ou digite.
                Sem julgamento, só acompanhamento.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="space-y-4 group">
              <div className="h-12 w-12 rounded-2xl bg-purple-50 dark:bg-purple-950/20 flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform shadow-sm">
                <FlaskConical className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Informações precisas</h3>
              <p className="text-muted-foreground leading-relaxed">
                Calorias e nutrientes calculados com base em tabelas oficiais.
                Acompanhe suas metas de forma clara.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="space-y-4 group">
              <div className="h-12 w-12 rounded-2xl bg-blue-50 dark:bg-blue-950/20 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform shadow-sm">
                <MessageCircle className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Fale com seu nutri</h3>
              <p className="text-muted-foreground leading-relaxed">
                Chat direto com seu nutricionista.
                Tire dúvidas e receba orientações quando precisar.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* For Clinics Section */}
      <section id="clinic" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wide">
                <Users className="h-3 w-3" />
                Para Nutricionistas
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
                Gerencie seus pacientes com eficiência
              </h2>
              <p className="text-lg text-muted-foreground">
                Crie planos alimentares, acompanhe a adesão e mantenha contato
                próximo com seus pacientes. Tudo em uma plataforma profissional.
              </p>
              <ul className="space-y-3">
                {[
                  "Planos alimentares personalizados",
                  "Acompanhamento em tempo real",
                  "Chat integrado com pacientes",
                  "Relatórios e análises detalhadas",
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-700">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/login">
                <Button size="lg" className="rounded-full bg-blue-600 hover:bg-blue-700">
                  Acessar área profissional
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>

            <div className="bg-gradient-to-br from-slate-100 to-slate-50 rounded-3xl p-8 space-y-6">
              <div className="flex items-center gap-4 bg-white rounded-xl p-4 shadow-sm">
                <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                  <BarChart3 className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Dashboard completo</p>
                  <p className="text-sm text-muted-foreground">Veja todos os pacientes em um lugar</p>
                </div>
              </div>
              <div className="flex items-center gap-4 bg-white rounded-xl p-4 shadow-sm">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Utensils className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Planos personalizados</p>
                  <p className="text-sm text-muted-foreground">Crie dietas sob medida</p>
                </div>
              </div>
              <div className="flex items-center gap-4 bg-white rounded-xl p-4 shadow-sm">
                <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <MessageCircle className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Comunicação fácil</p>
                  <p className="text-sm text-muted-foreground">Chat e notificações integrados</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="pricing" className="py-24 px-6 overflow-hidden">
        <div className="max-w-6xl mx-auto bg-slate-900 rounded-[2rem] p-8 md:p-16 text-center relative shadow-2xl shadow-emerald-900/20">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none rounded-[2rem]"></div>

          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 relative z-10">
            Comece hoje, é grátis
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto mb-10 text-lg relative z-10">
            Crie sua conta em 30 segundos e comece a acompanhar sua alimentação.
            Sem cartão de crédito, sem compromisso.
          </p>

          <div className="flex flex-col md:flex-row gap-4 justify-center relative z-10">
            <Button
              size="lg"
              className="rounded-full bg-white text-slate-900 hover:bg-emerald-50 h-12 px-8 font-bold shadow-lg shadow-white/10 transition-colors"
              onClick={openSignup}
            >
              Criar conta grátis
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background/80 border-t border-slate-100 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="font-bold text-slate-900 flex items-center gap-2">
            <div className="h-6 w-6 rounded bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
              <Leaf className="h-4 w-4 text-white" />
            </div>
            NutriPlan
          </div>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-emerald-600 transition-colors">Funcionalidades</a>
            <a href="#clinic" className="hover:text-emerald-600 transition-colors">Para Clínicas</a>
            <Link href="/login" className="hover:text-emerald-600 transition-colors">Entrar</Link>
          </div>
          <p className="text-muted-foreground text-sm">© 2024 NutriPlan. Todos os direitos reservados.</p>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        defaultTab={authDefaultTab}
      />
    </div>
  );
}
