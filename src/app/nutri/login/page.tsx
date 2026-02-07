"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, AlertCircle, Sparkles, ShieldCheck, MessageCircle, TrendingUp } from "lucide-react";

const studioHighlights = [
  {
    title: "Monitoramento em tempo real",
    description: "Veja o estado clínico de cada paciente em segundos e receba alertas inteligentes.",
    tone: "from-emerald-100 to-emerald-50 text-emerald-600",
    icon: Sparkles,
  },
  {
    title: "Protocolos automatizados",
    description: "Gere planos, protocolos e documentos sem sair da plataforma.",
    tone: "from-blue-100 to-blue-50 text-blue-600",
    icon: MessageCircle,
  },
  {
    title: "Equipe e audit trail",
    description: "Distribua tarefas com níveis de permissão e registre cada alteração.",
    tone: "from-slate-100 to-slate-50 text-slate-700",
    icon: TrendingUp,
  },
  {
    title: "Segurança e compliance",
    description: "Controle de acesso, logs e LGPD prontos para auditoria.",
    tone: "from-orange-100 to-orange-50 text-orange-600",
    icon: ShieldCheck,
  },
];

export default function NutriLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao fazer login");
      }

      router.push(data.redirect);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao fazer login");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    setIsLoading(true);

    try {
      const { createSupabaseBrowserClient } = await import("@/lib/supabase/client");
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=/studio/dashboard`,
        },
      });

      if (error) throw error;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao iniciar login");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white px-4 py-8">
      <div className="mx-auto max-w-6xl grid lg:grid-cols-[1.1fr_0.9fr] gap-10">
        <div className="space-y-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-2xl shadow-emerald-900/50">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-emerald-300 font-semibold">NutriPlan</p>
              <h1 className="text-3xl font-black">Portal Nutricionista</h1>
            </div>
          </div>
          <p className="text-lg text-slate-300 max-w-2xl">
            A equipe tem um cockpit completo — protocolos, IA clínica, comunicação e auditoria. Faça login para
            acessar a central de atendimento e entregar planos escaláveis.
          </p>

          <div className="grid sm:grid-cols-2 gap-4">
            {studioHighlights.map((item) => (
              <div key={item.title} className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${item.tone} flex items-center justify-center`}>
                    <item.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{item.title}</p>
                    <p className="text-xs text-slate-300">{item.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <p className="text-xs text-slate-400">
            Precisa acessar o portal Owner? Clique em{" "}
            <Link href="/owner/login" className="text-emerald-400 underline">
              Owner Portal
            </Link>
            .
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-8 shadow-2xl">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold">Entrar como Nutricionista</h2>
            <p className="text-sm text-slate-300 mt-1">Gerencie casos, protocolos e pacientes com segurança.</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-300 flex items-center gap-2 text-sm">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-100">
                Email profissional
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="sua@clinica.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12 bg-white/20 border-white/20 text-white placeholder:text-slate-400"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-100">
                Senha
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-12 bg-white/20 border-white/20 text-white placeholder:text-slate-400 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-white"
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full h-12 bg-emerald-500 hover:bg-emerald-600" disabled={isLoading}>
              {isLoading ? "Entrando..." : "Entrar"}
            </Button>
          </form>

          <div className="mt-6">
            <Button
              type="button"
              variant="outline"
              className="w-full h-12 flex items-center justify-center gap-3 border-white/20 hover:bg-white/10"
              onClick={handleGoogleLogin}
              disabled={isLoading}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Entrar com Google
            </Button>
          </div>

          <p className="mt-6 text-xs text-slate-300">
            Caso precise de suporte ou onboarding institucional, fale com <Link href="mailto:support@nutriplan.com" className="underline text-emerald-300">support@nutriplan.com</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
