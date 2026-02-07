"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  BarChart3,
  Brain,
  CheckCircle2,
  ChevronRight,
  Leaf,
  MessageCircle,
  PlayCircle,
  Scale,
  ShieldCheck,
  Sparkles,
  Star,
  Timer,
  TrendingUp,
  Utensils,
  Users,
  Wand2,
  Zap,
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
    <div className="min-h-screen bg-[radial-gradient(1200px_circle_at_10%_-10%,rgba(16,185,129,0.15),transparent),radial-gradient(900px_circle_at_90%_10%,rgba(59,130,246,0.12),transparent),linear-gradient(180deg,#f8fafc,rgba(248,250,252,0.8))] text-foreground selection:bg-emerald-100">
      <div className="pointer-events-none fixed inset-0 opacity-40 [background-image:radial-gradient(rgba(15,23,42,0.08)_1px,transparent_1px)] [background-size:24px_24px]" />

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-background/70 backdrop-blur-xl border-b border-emerald-100/60">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="font-bold text-xl flex items-center gap-2 text-slate-900">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-lg shadow-emerald-200">
              <Leaf className="h-5 w-5 text-white" />
            </div>
            NutriPlan
          </div>
          <div className="hidden md:flex gap-8 text-sm font-semibold text-muted-foreground">
            <a href="#features" className="hover:text-emerald-600 transition-colors">Recursos</a>
            <a href="#impact" className="hover:text-emerald-600 transition-colors">Impacto</a>
            <a href="#plans" className="hover:text-emerald-600 transition-colors">Planos</a>
            <a href="#faq" className="hover:text-emerald-600 transition-colors">FAQ</a>
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" className="text-muted-foreground" onClick={openLogin}>
              Entrar
            </Button>
            <Button
              className="bg-slate-900 hover:bg-slate-800 text-white rounded-full shadow-lg shadow-slate-200"
              onClick={openSignup}
            >
              Começar agora
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-[1.1fr_0.9fr] gap-14 items-center">
          <div className="space-y-8 animate-in slide-in-from-left-6 duration-700">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-bold uppercase tracking-wide shadow-sm">
              <Sparkles className="h-3 w-3" />
              O Futuro da Nutrição Clínica Escalável
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-slate-900 leading-[1.05]">
              Atenda <span className="text-emerald-600">3x Mais</span> Pacientes Sem Perder a Qualidade.
            </h1>
            <p className="text-lg md:text-2xl text-muted-foreground max-w-2xl leading-relaxed">
              NutriPlan é o motor de eficiência para clínicas que querem crescer. Automatize prontuários,
              analise refeições em segundos e recupere 10+ horas da sua semana com nossa IA clínica.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button
                size="lg"
                className="h-16 px-10 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-xl shadow-emerald-200 text-xl font-bold transition-transform hover:scale-[1.02] active:scale-95"
                onClick={openSignup}
              >
                Escalar Minha Clínica Agora
                <ArrowRight className="ml-2 h-6 w-6" />
              </Button>
            </div>
            <p className="text-sm text-slate-500 font-medium">
              ✓ Comece grátis • Sem cartão de crédito • Setup em 2 minutos
            </p>

            <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-600" /> Dados seguros
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-emerald-600" /> Setup em 5 minutos
              </div>
              <div className="flex items-center gap-2">
                <Timer className="h-4 w-4 text-emerald-600" /> Acompanhamento diário
              </div>
            </div>
          </div>

          <div className="relative animate-in slide-in-from-right-6 duration-700">
            <div className="absolute -top-10 -right-10 h-60 w-60 rounded-full bg-emerald-200/40 blur-3xl animate-pulse" />
            <div className="absolute -bottom-12 -left-10 h-60 w-60 rounded-full bg-blue-200/30 blur-3xl" />

            {/* Premium Dashboard Mockup */}
            <div className="relative bg-white/90 backdrop-blur-2xl border border-white shadow-[0_32px_64px_-16px_rgba(16,185,129,0.2)] rounded-[2.5rem] p-8 overflow-hidden">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-slate-900 flex items-center justify-center">
                    <Brain className="h-6 w-6 text-emerald-400" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900 uppercase tracking-tighter">Clinical Intelligence</div>
                    <div className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                      <div className="h-1 w-1 rounded-full bg-emerald-500 animate-ping" />
                      Sincronizado em tempo real
                    </div>
                  </div>
                </div>
                <div className="flex -space-x-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-8 w-8 rounded-full border-2 border-white bg-slate-200" />
                  ))}
                  <div className="h-8 w-8 rounded-full border-2 border-white bg-emerald-100 flex items-center justify-center text-[10px] font-bold text-emerald-700">+12</div>
                </div>
              </div>

              <div className="grid gap-6">
                {/* UPF Score Visualization */}
                <div className="rounded-3xl bg-slate-50/50 border border-slate-100 p-5 group hover:bg-white hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-500">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600">
                        <Zap className="h-4 w-4" />
                      </div>
                      <span className="text-sm font-bold text-slate-700">Carga de Ultraprocessados (NOVA)</span>
                    </div>
                    <span className="text-xs font-bold px-2 py-1 rounded-lg bg-emerald-100 text-emerald-700">-22% este mês</span>
                  </div>
                  <div className="flex gap-1 h-3 w-full rounded-full bg-slate-200 overflow-hidden">
                    <div className="w-[60%] bg-emerald-500" />
                    <div className="w-[20%] bg-amber-400" />
                    <div className="w-[20%] bg-rose-500" />
                  </div>
                </div>

                {/* Micronutrient Density */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-3xl bg-slate-50/50 border border-slate-100 p-5">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Densidade Nutricional</p>
                    <p className="text-2xl font-black text-slate-900 mt-1">8.4/10</p>
                    <div className="mt-2 text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" /> Máxima eficiência metabólica
                    </div>
                  </div>
                  <div className="rounded-3xl bg-emerald-600 text-white p-5 shadow-lg shadow-emerald-200">
                    <p className="text-[10px] font-bold text-emerald-100 uppercase tracking-widest">Proteína PDCAAS</p>
                    <p className="text-2xl font-black mt-1">Alta</p>
                    <div className="mt-2 text-[10px] text-emerald-200 font-medium">Biodisponibilidade otimizada</div>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="text-xs font-bold text-slate-600">IA detectou inflamação baixa hoje</span>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-400" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Logos / Social proof */}
      <section className="px-6 pb-12">
        <div className="max-w-6xl mx-auto rounded-3xl border border-slate-100 bg-white/80 p-6 shadow-sm">
          <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-8 items-center">
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Demo</p>
              <h2 className="text-3xl font-bold text-slate-900">Veja o NutriPlan em acao</h2>
              <p className="text-sm text-muted-foreground">
                Um fluxo completo de paciente, plano e IA em menos de 2 minutos. Resultado real, sem friccao.
              </p>
              <Button onClick={openSignup} className="rounded-full bg-slate-900 hover:bg-slate-800 text-white">
                Assistir demo
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
            <div className="relative aspect-video rounded-2xl bg-slate-900/90 overflow-hidden border border-slate-800">
              <div className="absolute inset-0 bg-[radial-gradient(300px_circle_at_30%_20%,rgba(16,185,129,0.35),transparent),radial-gradient(280px_circle_at_80%_30%,rgba(59,130,246,0.35),transparent)]" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-16 w-16 rounded-full bg-white/90 text-slate-900 flex items-center justify-center shadow-xl">
                  <PlayCircle className="h-8 w-8" />
                </div>
              </div>
              <div className="absolute bottom-4 left-4 rounded-full bg-white/10 text-white text-xs px-3 py-1">
                Demo interativa
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 pb-20">
        <div className="max-w-7xl mx-auto">
          <div className="bg-slate-900 rounded-[3rem] p-12 md:p-20 text-white relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-1/2 h-full bg-emerald-500/10 skew-x-12 translate-x-1/4" />
            <div className="relative z-10 grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <Badge variant="outline" className="border-emerald-500/50 text-emerald-400 mb-6 uppercase tracking-widest px-4 py-1">Business Impact</Badge>
                <h2 className="text-4xl md:text-6xl font-black tracking-tighter leading-[1.05]">
                  Escalabilidade <br />
                  <span className="text-emerald-400 font-serif italic">sem Burnout.</span>
                </h2>
                <p className="text-xl text-slate-400 mt-6 leading-relaxed max-w-lg">
                  O NutriPlan não é apenas uma ferramenta; é um ativo que aumenta o Valor Vitalício (LTV) do seu paciente em 40% ao evitar o abandono preventivamente.
                </p>

                <div className="mt-10 space-y-6">
                  {[
                    { val: "R$ 15k+", label: "Faturamento adicional/mês com escala" },
                    { val: "40h", label: "Economia de tempo em prontuários/mês" },
                    { val: "92%", label: "Aumente a retenção de pacientes" }
                  ].map(stat => (
                    <div key={stat.label} className="flex items-center gap-6 group">
                      <div className="text-3xl font-black text-white group-hover:text-emerald-400 transition-colors">{stat.val}</div>
                      <div className="h-px flex-1 bg-slate-800" />
                      <div className="text-sm font-bold text-slate-500 uppercase tracking-widest text-right">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Card className="bg-white/5 border-white/10 p-6 backdrop-blur-sm rounded-[2rem]">
                  <TrendingUp className="h-8 w-8 text-emerald-400 mb-4" />
                  <h4 className="text-lg font-bold">Crescimento Linear</h4>
                  <p className="text-sm text-slate-400 mt-2">Dobre sua base de pacientes sem aumentar sua carga horária.</p>
                </Card>
                <Card className="bg-white/5 border-white/10 p-6 backdrop-blur-sm rounded-[2rem] mt-8">
                  <Star className="h-8 w-8 text-amber-400 mb-4" />
                  <h4 className="text-lg font-bold">Autoridade Premium</h4>
                  <p className="text-sm text-slate-400 mt-2">Seja percebido como um nutrólogo de elite com IA própria.</p>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Deep Health / Precision Section */}
      <section className="py-24 px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-emerald-50/30 -skew-x-12 translate-x-1/2" />
        <div className="max-w-7xl mx-auto relative">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div className="order-2 lg:order-1 space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-bold uppercase tracking-wide">
                <Brain className="h-3 w-3" /> Nutrição de Precisão 2.0
              </div>
              <h2 className="text-4xl md:text-6xl font-bold text-slate-900 leading-[1.1]">
                Vá além das <span className="text-emerald-600 underline decoration-emerald-200 underline-offset-8">calorias</span>.
              </h2>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Pare de perder tempo com dados genéricos. O NutriPlan fornece a profundidade clínica que diferencia um profissional comum de um especialista de elite.
              </p>

              <div className="grid gap-6">
                {[
                  {
                    title: "Score de Ultraprocessados (UPF)",
                    desc: "Identifique automaticamente alimentos inflamatórios usando a classificação NOVA.",
                    icon: <ShieldCheck className="h-6 w-6 text-emerald-600" />
                  },
                  {
                    title: "Biodisponibilidade Proteica",
                    desc: "Análise baseada em PDCAAS/DIAAS para garantir que o paciente absorva o que come.",
                    icon: <Zap className="h-6 w-6 text-emerald-600" />
                  },
                  {
                    title: "Densidade de Micronutrientes",
                    desc: "Visualize a 'riqueza' do prato, indo além dos macros para otimizar a saúde celular.",
                    icon: <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                  }
                ].map((item) => (
                  <div key={item.title} className="flex gap-4 group cursor-default">
                    <div className="mt-1 h-12 w-12 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
                      {item.icon}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">{item.title}</h4>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <div className="relative aspect-square rounded-[3rem] bg-gradient-to-br from-slate-900 to-slate-800 p-1 shadow-2xl overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1543332164-6e82f355badc?q=80&w=2070&auto=format&fit=crop')] bg-cover opacity-20" />
                <div className="relative h-full w-full bg-slate-900/40 backdrop-blur-sm flex items-center justify-center flex-col p-12 text-center text-white">
                  <div className="h-20 w-20 rounded-full bg-emerald-500 flex items-center justify-center mb-6 shadow-xl shadow-emerald-500/20">
                    <Sparkles className="h-10 w-10" />
                  </div>
                  <h3 className="text-3xl font-black mb-4">IA Clínica de Elite</h3>
                  <p className="text-slate-300 text-lg">
                    "O NutriPlan não apenas rastreia; ele pensa como um nutricionista sênior, avisando você sobre riscos que passariam despercebidos."
                  </p>
                  <div className="mt-8 flex items-center gap-3">
                    <div className="h-1 rounded-full bg-emerald-500 w-12" />
                    <div className="h-1 rounded-full bg-slate-700 w-8" />
                    <div className="h-1 rounded-full bg-slate-700 w-8" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6 bg-slate-50/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-16 items-start">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-bold uppercase tracking-wide">
                <Wand2 className="h-3 w-3" />
                Máxima Eficiência Operacional
              </div>
              <h2 className="text-3xl md:text-5xl font-bold text-slate-900 leading-tight">
                Recupere suas noites. <br />
                <span className="text-emerald-600">IA cuida da burocracia.</span>
              </h2>
              <p className="text-xl text-muted-foreground">
                Do registro à prescrição, o NutriPlan automatiza tarefas repetitivas e cria insights
                acionáveis para decisões clínicas mais rápidas.
              </p>
              <div className="space-y-4">
                {[
                  "Análise Vision AI: Identifica UPF e bio-disponibilidade instantaneamente",
                  "Ajuste Preditivo: Algoritmos que antecipam queda de adesão (LTV)",
                  "Fricção Zero: Registro por voz ou foto que salva 15 min/dia",
                  "Inteligência Clínica: Correlação entre sono, estresse e dieta",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <div className="mt-1 h-5 w-5 rounded-full bg-emerald-200 flex items-center justify-center">
                      <CheckCircle2 className="h-3 w-3 text-emerald-700" />
                    </div>
                    <p className="text-slate-800 font-medium">{item}</p>
                  </div>
                ))}
              </div>
              <Button
                size="lg"
                className="h-14 px-8 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-lg font-bold"
                onClick={openSignup}
              >
                Quero Escalar Minha Clínica
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              {[
                {
                  title: "Registro instantâneo",
                  description: "Capture refeições em segundos e elimine planilhas.",
                  icon: <Scale className="h-5 w-5" />,
                  tone: "from-orange-100 to-orange-50 text-orange-600",
                },
                {
                  title: "Chat integrado",
                  description: "Converse com pacientes e envie ajustes rápidos.",
                  icon: <MessageCircle className="h-5 w-5" />,
                  tone: "from-blue-100 to-blue-50 text-blue-600",
                },
                {
                  title: "Painel inteligente",
                  description: "Priorize quem precisa de intervenção agora.",
                  icon: <BarChart3 className="h-5 w-5" />,
                  tone: "from-emerald-100 to-emerald-50 text-emerald-600",
                },
                {
                  title: "Planos dinâmicos",
                  description: "Ajustes contínuos com base em resultados reais.",
                  icon: <Utensils className="h-5 w-5" />,
                  tone: "from-slate-100 to-slate-50 text-slate-700",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="group rounded-3xl border border-slate-100 bg-white/80 backdrop-blur-sm p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className={`h-11 w-11 rounded-2xl bg-gradient-to-br ${item.tone} flex items-center justify-center shadow-sm`}>
                    {item.icon}
                  </div>
                  <h3 className="mt-4 text-lg font-bold text-slate-900">{item.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Impact */}
      <section id="impact" className="py-24 px-6 bg-white/70 border-y border-slate-100">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-[1.05fr_0.95fr] gap-14 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wide">
              <Users className="h-3 w-3" />
              Impacto clínico
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
              O futuro da nutrição é preditivo, personalizado e conectado.
            </h2>
            <p className="text-lg text-muted-foreground">
              A plataforma transforma dados do dia a dia em intervenções inteligentes que elevam o
              resultado do paciente e a escala da sua clínica.
            </p>
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                { value: "+41%", label: "Adesão aos planos" },
                { value: "-32%", label: "Tempo operacional" },
                { value: "3x", label: "Pacientes acompanhados" },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl bg-white border border-slate-100 p-4 shadow-sm">
                  <p className="text-2xl font-bold text-slate-900">{item.value}</p>
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                </div>
              ))}
            </div>
            <div className="rounded-3xl border border-emerald-200/60 bg-emerald-50/60 p-6">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-2xl bg-emerald-500/20 flex items-center justify-center">
                  <Brain className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Game changer para o acompanhamento.</p>
                  <p className="text-sm text-muted-foreground">
                    A IA prevê queda de adesão e sugere intervenções antes que o paciente desista.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {["Hoje", "Em 90 dias", "Em 12 meses"].map((label, index) => (
              <div
                key={label}
                className="rounded-3xl border border-slate-100 bg-white/80 backdrop-blur-sm p-6 shadow-sm transition-transform duration-300 hover:-translate-y-1"
              >
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-slate-900">{label}</p>
                  <span className="text-xs font-semibold text-emerald-600">Fase {index + 1}</span>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">
                  {index === 0 &&
                    "Plano personalizado, registro de refeições e feedback instantâneo."}
                  {index === 1 &&
                    "Ajustes automáticos com insights de padrão alimentar e comportamento."}
                  {index === 2 &&
                    "Projeções de resultado, alertas preditivos e planos com IA prescritiva."}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900">Como funciona</h2>
            <p className="text-lg text-muted-foreground mt-3">
              Uma jornada simples para transformar a gestão nutricional.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: "Conecte pacientes",
                description: "Envie convite e centralize histórico, objetivos e restrições.",
                icon: <Users className="h-5 w-5" />,
              },
              {
                title: "Automatize a nutrição",
                description: "IA organiza dados, sugere ajustes e cria relatórios rápidos.",
                icon: <Brain className="h-5 w-5" />,
              },
              {
                title: "Escale resultados",
                description: "Priorize intervenções e acompanhe evolução em tempo real.",
                icon: <TrendingUp className="h-5 w-5" />,
              },
            ].map((item, index) => (
              <div
                key={item.title}
                className="relative rounded-3xl border border-slate-100 bg-white/80 p-6 shadow-sm transition-all duration-300 hover:-translate-y-1"
              >
                <div className="absolute -top-5 left-6 text-xs font-semibold text-slate-400">0{index + 1}</div>
                <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-sm">
                  {item.icon}
                </div>
                <h3 className="mt-6 text-lg font-bold text-slate-900">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Plans */}
      <section id="plans" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900">Planos para cada fase</h2>
            <p className="text-lg text-muted-foreground mt-3">
              Comece agora e evolua conforme sua clínica cresce.
            </p>
          </div>
          <div className="grid lg:grid-cols-3 gap-8">
            {[
              {
                name: "Essential",
                price: "R$ 0",
                description: "Base sólida para começar a acompanhar pacientes.",
                features: ["Cadastro de pacientes", "Registro de refeições", "Chat essencial"],
              },
              {
                name: "Growth AI",
                price: "R$ 199",
                description: "IA aplicada ao dia a dia clínico com escala.",
                features: ["Automação com IA", "Relatórios semanais", "Alertas preditivos"],
                highlight: true,
              },
              {
                name: "Clinic Plus",
                price: "R$ 499",
                description: "Para equipes, unidades e operação avançada.",
                features: ["Multi-profissionais", "IA prescritiva", "Suporte dedicado"],
              },
            ].map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-3xl border p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 ${plan.highlight
                  ? "border-emerald-300 bg-emerald-50/70 shadow-emerald-200/40"
                  : "border-slate-100 bg-white/80"
                  }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-4 left-6 rounded-full bg-emerald-600 text-white text-xs font-semibold px-3 py-1 shadow">
                    Mais escolhido
                  </div>
                )}
                <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
                <p className="text-sm text-muted-foreground mt-2">{plan.description}</p>
                <div className="mt-6 text-3xl font-bold text-slate-900">
                  {plan.price}
                  <span className="text-sm font-medium text-muted-foreground">/mês</span>
                </div>
                <div className="mt-6 space-y-3">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-center gap-3 text-sm text-slate-700">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      {feature}
                    </div>
                  ))}
                </div>
                <Button
                  className={`mt-8 w-full rounded-full ${plan.highlight
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                    : "bg-slate-900 hover:bg-slate-800 text-white"
                    }`}
                  onClick={openSignup}
                >
                  Começar agora
                </Button>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center text-sm text-muted-foreground">
            Sem fidelidade. Cancele quando quiser. Atualize ou faça downgrade a qualquer momento.
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6 bg-white/70 border-y border-slate-100">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6">
          {[
            {
              quote:
                "A IA nos ajudou a identificar quedas de adesão antes que virassem abandono. Mudou o jogo.",
              name: "Dra. Marina Ribeiro",
              role: "Nutricionista clínica",
            },
            {
              quote:
                "Com o NutriPlan consigo acompanhar o dobro de pacientes sem perder qualidade.",
              name: "Bruno Alves",
              role: "Coordenador de nutrição",
            },
            {
              quote:
                "Relatórios prontos e insights inteligentes toda semana. Economia real de tempo.",
              name: "Laura Mendes",
              role: "Nutri esportiva",
            },
          ].map((item) => (
            <div key={item.name} className="rounded-3xl border border-slate-100 bg-white/80 p-6 shadow-sm">
              <div className="flex items-center gap-1 text-emerald-500">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star key={index} className="h-4 w-4" />
                ))}
              </div>
              <p className="mt-4 text-sm text-slate-700">“{item.quote}”</p>
              <div className="mt-4">
                <p className="text-sm font-semibold text-slate-900">{item.name}</p>
                <p className="text-xs text-muted-foreground">{item.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto bg-slate-900 rounded-[2rem] p-10 md:p-16 text-center relative overflow-hidden shadow-2xl shadow-emerald-900/20">
          <div className="absolute inset-0 bg-[radial-gradient(400px_circle_at_20%_20%,rgba(16,185,129,0.25),transparent),radial-gradient(420px_circle_at_80%_30%,rgba(59,130,246,0.2),transparent)]" />
          <div className="relative z-10">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              Pronto para elevar sua nutrição a outro nível?
            </h2>
            <p className="text-slate-300 max-w-2xl mx-auto mb-10 text-lg">
              Crie sua conta, conecte pacientes e deixe a IA trabalhar. Resultados rápidos, processos
              escaláveis e acompanhamento real.
            </p>
            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="rounded-full bg-white text-slate-900 hover:bg-emerald-50 h-12 px-8 font-bold shadow-lg"
                onClick={openSignup}
              >
                Começar grátis
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Link href="/login">
                <Button size="lg" variant="ghost" className="rounded-full text-white hover:text-emerald-200">
                  Já tenho conta
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900">Perguntas frequentes</h2>
            <p className="text-lg text-muted-foreground mt-3">
              Tudo que você precisa saber antes de começar.
            </p>
          </div>
          <div className="space-y-4">
            {[
              {
                question: "Posso começar grátis?",
                answer:
                  "Sim. O plano Starter é gratuito e já inclui acompanhamento essencial e registro de refeições.",
              },
              {
                question: "Como funciona a IA?",
                answer:
                  "A IA organiza registros, identifica padrões e sugere intervenções para melhorar a adesão.",
              },
              {
                question: "É seguro para dados clínicos?",
                answer:
                  "Usamos criptografia, controle de acesso e boas práticas para garantir segurança e privacidade.",
              },
            ].map((item) => (
              <div key={item.question} className="rounded-2xl border border-slate-100 bg-white/80 p-6 shadow-sm">
                <p className="font-semibold text-slate-900">{item.question}</p>
                <p className="mt-2 text-sm text-muted-foreground">{item.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background/80 border-t border-slate-100 py-10 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="font-bold text-slate-900 flex items-center gap-2">
            <div className="h-6 w-6 rounded bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center">
              <Leaf className="h-4 w-4 text-white" />
            </div>
            NutriPlan
          </div>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-emerald-600 transition-colors">Recursos</a>
            <a href="#impact" className="hover:text-emerald-600 transition-colors">Impacto</a>
            <a href="#plans" className="hover:text-emerald-600 transition-colors">Planos</a>
            <Link href="/login" className="hover:text-emerald-600 transition-colors">Entrar</Link>
          </div>
          <p className="text-muted-foreground text-sm">© 2026 NutriPlan. Todos os direitos reservados.</p>
        </div>
      </footer>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        defaultTab={authDefaultTab}
      />
    </div>
  );
}
