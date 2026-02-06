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
  User,
  Stethoscope,
  Shield,
  Sparkles,
  ShieldCheck,
  Wand2,
  TrendingUp,
} from "lucide-react";

const DEMO_ACCOUNTS = [
  {
    email: "patient@demo.nutriplan.com",
    role: "Paciente",
    description: "Acompanhe sua alimentação e sintomas",
    icon: User,
    color: "emerald",
  },
  {
    email: "nutri@demo.nutriplan.com",
    role: "Nutricionista",
    description: "Gerencie pacientes e protocolos",
    icon: Stethoscope,
    color: "blue",
  },
  {
    email: "owner@demo.nutriplan.com",
    role: "Administrador",
    description: "Administre clínicas e usuários",
    icon: Shield,
    color: "slate",
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

  const selectDemoAccount = (account: typeof DEMO_ACCOUNTS[0]) => {
    setEmail(account.email);
    setError("");
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(1200px_circle_at_10%_-10%,rgba(16,185,129,0.15),transparent),radial-gradient(900px_circle_at_90%_10%,rgba(59,130,246,0.12),transparent),linear-gradient(180deg,#f8fafc,rgba(248,250,252,0.85))] px-4 py-10">
      <div className="mx-auto w-full max-w-6xl grid lg:grid-cols-[1.05fr_0.95fr] gap-10 items-center">
        <div className="space-y-8">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-lg shadow-emerald-200">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">NutriPlan</p>
              <h1 className="text-3xl font-bold text-slate-900">Acesso inteligente</h1>
            </div>
          </div>
          <p className="text-lg text-muted-foreground max-w-lg">
            Entre no painel e acompanhe cada paciente com insights de IA, planos dinâmicos e comunicação
            instantanea. Tudo em um só lugar.
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { icon: Wand2, title: "Automacao real", desc: "Menos tarefas, mais estrategia" },
              { icon: ShieldCheck, title: "Seguranca", desc: "Dados clinicos protegidos" },
              { icon: TrendingUp, title: "Resultados", desc: "Adesao e evolucao visiveis" },
              { icon: Sparkles, title: "IA ativa", desc: "Sugestoes todos os dias" },
            ].map((item) => (
              <div key={item.title} className="rounded-2xl border border-white/70 bg-white/70 p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Link href="/" className="text-sm text-slate-500 hover:text-emerald-600 transition-colors inline-flex items-center">
            ← Voltar para a pagina inicial
          </Link>
        </div>

        <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/70 shadow-2xl p-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-slate-900">Bem-vindo de volta</h2>
            <p className="text-slate-500 mt-1">Entre na sua conta para continuar</p>
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

          <div className="mt-8 pt-6 border-t border-slate-200">
            <p className="text-center text-sm text-slate-500 mb-4">Selecione um perfil para demonstracao</p>
            <div className="grid gap-2">
              {DEMO_ACCOUNTS.map((account) => {
                const Icon = account.icon;
                const isSelected = email === account.email;
                return (
                  <button
                    key={account.email}
                    type="button"
                    onClick={() => selectDemoAccount(account)}
                    disabled={isLoading}
                    className={`w-full p-3 text-left rounded-lg border transition-all disabled:opacity-50 ${
                      isSelected
                        ? "border-emerald-500 bg-emerald-50"
                        : "border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          account.color === "emerald"
                            ? "bg-emerald-100 text-emerald-600"
                            : account.color === "blue"
                            ? "bg-blue-100 text-blue-600"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-slate-900 text-sm">{account.role}</p>
                        <p className="text-xs text-slate-500">{account.description}</p>
                      </div>
                      {isSelected && (
                        <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded">Selecionado</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-slate-400 text-center mt-3">Depois de selecionar, digite a senha demo</p>
          </div>
        </div>
      </div>
    </div>
  );
}
