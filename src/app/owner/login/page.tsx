"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    Shield,
    Leaf,
    ArrowLeft,
    Eye,
    EyeOff,
    AlertCircle,
    Building2,
    Users,
    Settings,
    Lock,
    Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function OwnerLoginPage() {
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

    const handleGoogleLogin = async () => {
        setIsLoading(true);
        setError("");

        try {
            const supabase = createSupabaseBrowserClient();
            const { error } = await supabase.auth.signInWithOAuth({
                provider: "google",
                options: {
                    redirectTo: `${window.location.origin}/auth/callback?next=/owner/tenants`,
                },
            });

            if (error) throw error;
        } catch (err) {
            setError(err instanceof Error ? err.message : "Erro ao iniciar login social");
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col md:flex-row relative overflow-hidden">
            {/* Abstract background elements */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/10 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2" />

            {/* Left side: Content & Branding */}
            <div className="flex-1 p-8 md:p-16 flex flex-col justify-between relative z-10 text-white">
                <div>
                    <div className="flex items-center gap-3 mb-12">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-900/40">
                            <Shield className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <p className="text-xs uppercase tracking-[0.4em] text-emerald-500 font-black">NutriPlan</p>
                            <h1 className="text-xl font-black text-white">Owner Portal</h1>
                        </div>
                    </div>

                    <div className="space-y-6 max-w-lg">
                        <h2 className="text-4xl md:text-6xl font-black leading-tight tracking-tighter">
                            Governança <br />
                            <span className="text-emerald-500">Cross-Tenant</span>
                        </h2>
                        <p className="text-xl text-slate-400 leading-relaxed font-light">
                            Módulo administrativo centralizado para auditoria, gestão de planos e integridade de dados do ecossistema NutriPlan.
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-12">
                            {[
                                { icon: Building2, text: "Gestão de Tenants" },
                                { icon: Users, text: "Admin de Usuários" },
                                { icon: Settings, text: "Configuração de IA" },
                                { icon: Lock, text: "Segurança Avançada" },
                            ].map((item) => (
                                <div key={item.text} className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                                    <item.icon className="w-5 h-5 text-emerald-400" />
                                    <span className="text-sm font-medium text-slate-300">{item.text}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="mt-12 flex items-center gap-6">
                    <div className="flex -space-x-3">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="w-10 h-10 rounded-full border-2 border-slate-900 bg-slate-800" />
                        ))}
                    </div>
                    <p className="text-sm text-slate-500 italic">
                        "Integridade e escalabilidade em um só lugar."
                    </p>
                </div>
            </div>

            {/* Right side: Login form */}
            <div className="w-full md:w-[480px] p-4 md:p-8 flex items-center justify-center relative z-10">
                <div className="w-full max-w-md bg-white/10 backdrop-blur-3xl border border-white/20 p-8 md:p-10 rounded-[2.5rem] shadow-2xl">
                    <div className="text-center mb-8">
                        <h3 className="text-2xl font-bold text-white mb-2">Acesso Restrito</h3>
                        <p className="text-slate-400 text-sm">Autenticação obrigatória para acesso administrativo.</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-2xl flex items-center gap-3 text-sm animate-in fade-in slide-in-from-top-2 duration-200">
                            <AlertCircle className="w-5 h-5 shrink-0" />
                            {error}
                        </div>
                    )}

                    <div className="space-y-6">
                        <Button
                            onClick={handleGoogleLogin}
                            disabled={isLoading}
                            className="w-full h-14 rounded-2xl bg-white hover:bg-slate-50 text-slate-950 font-bold flex items-center justify-center gap-3 shadow-xl transition-all hover:scale-[1.02] active:scale-95 translate-y-0"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            Google Workspace
                        </Button>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-white/10" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-transparent px-2 text-slate-500 font-bold">ou via credenciais</span>
                            </div>
                        </div>

                        <form onSubmit={handleLogin} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-slate-300 ml-1">Email Corporativo</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="admin@nutriplan.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="h-14 rounded-2xl bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus:ring-emerald-500/50"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-slate-300 ml-1">Senha de Acesso</Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="h-14 rounded-2xl bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus:ring-emerald-500/50 pr-12"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="w-full h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-900/40 transition-all hover:scale-[1.02] active:scale-95 mt-4"
                            >
                                {isLoading ? (
                                    <div className="flex items-center gap-2">
                                        <Sparkles className="w-4 h-4 animate-spin" />
                                        Autenticando...
                                    </div>
                                ) : "Entrar no Portal"}
                            </Button>
                        </form>
                    </div>

                    <div className="mt-10 flex flex-col items-center gap-4">
                        <button
                            onClick={() => router.push("/")}
                            className="text-sm text-slate-500 hover:text-emerald-400 flex items-center gap-2 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Voltar ao Início
                        </button>
                        <p className="text-[10px] text-slate-700 uppercase tracking-widest font-black">
                            Segurança nível bancário • LGPD Compliance
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
