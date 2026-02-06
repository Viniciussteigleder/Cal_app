import Link from "next/link";
import {
  Activity,
  Brain,
  CalendarCheck,
  Droplets,
  Flame,
  LineChart,
  MessageCircle,
  Sparkles,
  Target,
  Utensils,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PatientOverviewPage() {
  return (
    <div className="space-y-10">
      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-3xl border border-slate-100 bg-white/80 p-8 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Visao geral</p>
              <h2 className="text-2xl font-bold text-slate-900">Seu dia, organizado pela IA</h2>
              <p className="text-sm text-muted-foreground mt-2 max-w-xl">
                Acompanhe metas, refeicoes e insights de saude em tempo real. Tudo o que voce precisa para
                manter o plano com consistencia.
              </p>
            </div>
            <Button className="rounded-full bg-emerald-600 hover:bg-emerald-700">
              Registrar refeicao
            </Button>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {[
              { label: "Calorias hoje", value: "1.420 kcal", icon: Flame },
              { label: "Hidratacao", value: "1.8 L", icon: Droplets },
              { label: "Meta semanal", value: "82%", icon: Target },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                    <p className="text-lg font-semibold text-slate-900">{item.value}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-100 bg-white/80 p-8 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <Brain className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">IA Nutri Coach</p>
                <p className="text-xs text-muted-foreground">Insight do dia</p>
              </div>
            </div>
            <span className="text-xs font-semibold text-emerald-600">Ativo</span>
          </div>
          <p className="mt-4 text-sm text-slate-700">
            Hoje seu consumo de fibras esta abaixo da meta. Sugestao: adicionar 1 porcao de leguminosas
            no almoco para melhorar saciedade.
          </p>
          <div className="mt-6 rounded-2xl border border-emerald-200/60 bg-emerald-50/70 p-4">
            <div className="flex items-center gap-3">
              <Sparkles className="h-4 w-4 text-emerald-600" />
              <p className="text-sm text-emerald-700">Impacto estimado: +12% de adesao semanal</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        {[
          {
            title: "Plano de hoje",
            desc: "Refeicoes e ajustes alinhados com seu objetivo.",
            icon: Utensils,
            action: "/patient/plan",
            actionLabel: "Ver plano",
          },
          {
            title: "Atividades",
            desc: "Movimento e energia para completar suas metas.",
            icon: Activity,
            action: "/patient/exercise",
            actionLabel: "Ver atividades",
          },
          {
            title: "Mensagens",
            desc: "Fale com seu nutricionista quando precisar.",
            icon: MessageCircle,
            action: "/patient/chat",
            actionLabel: "Abrir chat",
          },
        ].map((item) => (
          <div key={item.title} className="rounded-3xl border border-slate-100 bg-white/80 p-6 shadow-sm">
            <div className="h-12 w-12 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <item.icon className="h-5 w-5" />
            </div>
            <h3 className="mt-6 text-lg font-bold text-slate-900">{item.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{item.desc}</p>
            <Link href={item.action}>
              <Button variant="outline" className="mt-6 w-full rounded-full">
                {item.actionLabel}
              </Button>
            </Link>
          </div>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-3xl border border-slate-100 bg-white/80 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900">Progresso semanal</p>
              <p className="text-xs text-muted-foreground">Comparativo dos ultimos 7 dias</p>
            </div>
            <LineChart className="h-5 w-5 text-emerald-600" />
          </div>
          <div className="mt-6 grid grid-cols-3 gap-3">
            {["Proteinas", "Fibras", "Hidratacao"].map((label, index) => (
              <div key={label} className="rounded-2xl bg-slate-50/80 border border-slate-100 p-4">
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-lg font-semibold text-slate-900">{index === 0 ? "78%" : index === 1 ? "64%" : "91%"}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-100 bg-white/80 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900">Agenda inteligente</p>
              <p className="text-xs text-muted-foreground">Proximos passos sugeridos</p>
            </div>
            <CalendarCheck className="h-5 w-5 text-emerald-600" />
          </div>
          <div className="mt-6 space-y-3">
            {[
              "Enviar registro do jantar",
              "Responder check-in de sintomas",
              "Atualizar peso semanal",
            ].map((task) => (
              <div key={task} className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/80 p-3">
                <div className="h-8 w-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <Target className="h-4 w-4" />
                </div>
                <p className="text-sm text-slate-700">{task}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
