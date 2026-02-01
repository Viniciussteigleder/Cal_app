import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, ShieldCheck, Heart, Zap, ArrowRight, Quote } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-foreground font-sans selection:bg-emerald-100">

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-emerald-100/50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="font-bold text-xl flex items-center gap-2 text-slate-900">
            <div className="h-8 w-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/200 flex items-center justify-center text-white shadow-lg shadow-emerald-200">NP</div>
            NutriPlan
          </div>
          <div className="hidden md:flex gap-8 text-sm font-medium text-muted-foreground">
            <a href="#features" className="hover:text-emerald-600 transition-colors">Funcionalidades</a>
            <a href="#clinic" className="hover:text-emerald-600 transition-colors">Para Clínicas</a>
            <a href="#pricing" className="hover:text-emerald-600 transition-colors">Planos</a>
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" className="text-muted-foreground">Login</Button>
            <Button className="bg-slate-900 hover:bg-slate-800 text-white rounded-full shadow-lg shadow-slate-200">Começar Grátis</Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center space-y-8 animate-in slide-in-from-bottom-4 duration-700">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 text-emerald-700 text-xs font-bold uppercase tracking-wide shadow-sm">
            <Zap className="h-3 w-3" />
            Nova Versão 2.0
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-slate-900 leading-[1.1]">
            Nutrição clínica com <br />
            <span className="text-emerald-600 relative inline-block">
              precisão científica
              <svg className="absolute w-full h-3 -bottom-1 left-0 text-emerald-200 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
                <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
              </svg>
            </span>.
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            A plataforma completa que une nutricionistas e pacientes.
            Planejamento dietético auditável, diário alimentar sem culpa e adesão comprovada.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link href="/patient/dashboard">
              <Button size="lg" className="h-14 px-8 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-xl shadow-emerald-200 text-lg transition-transform hover:scale-105 active:scale-95">
                Sou Paciente
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/studio/dashboard">
              <Button size="lg" variant="outline" className="h-14 px-8 rounded-full border-slate-200 text-slate-700 hover:bg-white hover:text-emerald-700 text-lg transition-all hover:border-emerald-200">
                Sou Nutricionista
              </Button>
            </Link>
          </div>

          <div className="pt-8 flex items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" /> Dados Criptografados
            </div>
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4" /> Recomendado por Especialistas
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section id="features" className="py-24 bg-card/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-12">

            {/* Feature 1 */}
            <div className="space-y-4 group">
              <div className="h-12 w-12 rounded-2xl bg-orange-50 dark:bg-orange-950/20 flex items-center justify-center text-orange-600 text-2xl group-hover:scale-110 transition-transform shadow-sm">
                ⚖️
              </div>
              <h3 className="text-xl font-bold text-slate-900">Diário sem Culpa</h3>
              <p className="text-muted-foreground leading-relaxed">
                Nossa interface behavioral reduz a ansiedade ao registrar refeições.
                Focamos na consistência, não na perfeição.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="space-y-4 group">
              <div className="h-12 w-12 rounded-2xl bg-purple-50 dark:bg-purple-950/20 flex items-center justify-center text-purple-600 text-2xl group-hover:scale-110 transition-transform shadow-sm">
                🧬
              </div>
              <h3 className="text-xl font-bold text-slate-900">Precisão Clínica</h3>
              <p className="text-muted-foreground leading-relaxed">
                Cálculos de TMB e macros auditáveis. Cada grama é contabilizada
                com base em tabelas nutricionais oficiais (TACO/USDA).
              </p>
            </div>

            {/* Feature 3 */}
            <div className="space-y-4 group">
              <div className="h-12 w-12 rounded-2xl bg-blue-50 dark:bg-blue-950/20 flex items-center justify-center text-blue-600 text-2xl group-hover:scale-110 transition-transform shadow-sm">
                🤝
              </div>
              <h3 className="text-xl font-bold text-slate-900">Chat Direto</h3>
              <p className="text-muted-foreground leading-relaxed">
                Tire dúvidas com seu nutricionista em tempo real.
                Envie fotos das refeições e receba feedback imediato.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Preview Section */}
      <section className="py-24 px-6 overflow-hidden">
        <div className="max-w-6xl mx-auto bg-slate-900 rounded-[2rem] p-8 md:p-16 text-center relative shadow-2xl shadow-emerald-900/20">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>

          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 relative z-10">
            Pronto para transformar sua saúde?
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-10 text-lg relative z-10">
            Junte-se a mais de 12.000 pacientes que já estão usando o NutriPlan para
            alcançar seus objetivos de forma sustentável.
          </p>

          <div className="flex flex-col md:flex-row gap-4 justify-center relative z-10">
            <Button size="lg" className="rounded-full bg-white text-slate-900 hover:bg-emerald-50 dark:bg-emerald-950/20 h-12 px-8 font-bold shadow-lg shadow-white/10 transition-colors">
              Criar Conta Grátis
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background/80 border-t border-slate-100 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="font-bold text-slate-900 flex items-center gap-2">
            <div className="h-6 w-6 rounded bg-slate-900 text-white flex items-center justify-center text-xs">NP</div>
            NutriPlan systems
          </div>
          <p className="text-muted-foreground text-sm">© 2024 NutriPlan. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
