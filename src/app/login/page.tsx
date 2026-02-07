"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Leaf,
  Eye,
  EyeOff,
  AlertCircle,
  ShieldCheck,
  Sparkles,
  MessageCircle,
  Wand2,
  TrendingUp,
} from "lucide-react";

const patientHighlights = [
  {
    title: "Feedback diário com IA clínica",
    description: "Receba sugestões personalizadas sobre refeições, sintomas e sinais vitais.",
    icon: Sparkles,
    tone: "from-emerald-100 to-emerald-50 text-emerald-600",
  },
  {
    title: "Comunicação direta com o nutricionista",
    description: "Converse, envie fotos e ajuste planos em segundos.",
    icon: MessageCircle,
    tone: "from-blue-100 to-blue-50 text-blue-600",
  },
  {
    title: "Progresso visível",
    description: "Visualize evolução e encerramento de metas semanais.",
    icon: TrendingUp,
    tone: "from-slate-100 to-slate-50 text-slate-700",
  },
  {
    title: "Segurança clínica",
    description: "Dados criptografados e auditáveis a qualquer momento.",
    icon: ShieldCheck,
    tone: "from-orange-100 to-orange-50 text-orange-600",
  },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
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

  return (
    <div className="min-h-screen bg-[radial-gradient(1200px_circle_at_10%_-10%,rgba(16,185,129,0.15),transparent),radial-gradient(900px_circle_at_90%_10%,rgba(59,130,246,0.12),transparent),linear-gradient(180deg,#f8fafc,rgba(248,250,252,0.85))] px-4 py-10">
      <div className="mx-auto w-full max-w-6xl grid lg:grid-cols-[1.1fr_0.9fr] gap-10 items-center">
        <div className="space-y-8">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-lg shadow-emerald-200">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">NutriPlan</p>
              <h1 className="text-3xl font-bold text-slate-900">Acesso do Paciente</h1>
            </div>
          </div>
          <p className="text-lg text-muted-foreground max-w-lg">
            Entre no aplicativo, consulte orientações clínicas e mantenha seu plano atualizado com
            acompanhamento humano e IA ativa.
          </p>

          <div className="grid sm:grid-cols-2 gap-4">
            {patientHighlights.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-white/70 bg-white/70 p-4 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`h-10 w-10 rounded-xl bg-gradient-to-br ${item.tone} flex items-center justify-center shadow-sm`}
                  >
                    <item.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white/70 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-900">Precisa acessar o portal administrativo?</p>
              <Sparkles className="text-emerald-500 h-5 w-5" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Use a autenticação dedicada do Owner Portal —{" "}
              <Link href="/owner/login" className="font-semibold text-emerald-600">
                clicar para entrar como Owner
              </Link>
              .
            </p>
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-xl rounded-3xl border border-white/70 shadow-2xl p-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-slate-900">Entre na sua jornada NutriPlan</h2>
            <p className="text-slate-500 mt-1">Use seu e-mail e senha para continuar.</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-11 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full h-11 bg-emerald-600 hover:bg-emerald-700" disabled={isLoading}>
              {isLoading ? "Entrando..." : "Entrar"}
            </Button>
          </form>

          <div className="mt-8 space-y-4">
            <Button
              type="button"
              variant="outline"
              className="w-full h-11 flex items-center justify-center gap-3 border-slate-200 hover:bg-slate-50"
              onClick={async () => {
                const { createSupabaseBrowserClient } = await import("@/lib/supabase/client");
                const supabase = createSupabaseBrowserClient();
                await supabase.auth.signInWithOAuth({
                  provider: "google",
                  options: {
                    redirectTo: `${window.location.origin}/auth/callback?next=/patient/dashboard`,
                  },
                });
              }}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Entrar com Google
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              Ainda não tem conta? Entre em contato com seu nutricionista ou solicite o convite em{" "}
              <Link href="mailto:support@nutriplan.com" className="font-semibold text-emerald-600">
                support@nutriplan.com
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
