"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Mail, Eye, EyeOff, AlertCircle, ArrowLeft, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: "login" | "signup";
}

// Google Icon SVG
const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

// Apple Icon SVG
const AppleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
  </svg>
);

export function AuthModal({ isOpen, onClose, defaultTab = "login" }: AuthModalProps) {
  const router = useRouter();
  const [view, setView] = useState<"options" | "email-login" | "email-signup" | "onboarding">(
    defaultTab === "signup" ? "options" : "options"
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [patientData, setPatientData] = useState({
    goal: "",
    birthYear: "",
    weight: "",
    height: "",
  });

  if (!isOpen) return null;

  const handleSocialLogin = async (provider: "google" | "apple") => {
    setIsLoading(true);
    // In production, this would redirect to OAuth flow
    // For now, show a message
    setError(`Login com ${provider === "google" ? "Google" : "Apple"} em breve!`);
    setIsLoading(false);
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
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

      onClose();
      router.push(data.redirect);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao fazer login");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Move to onboarding after basic signup info
    setView("onboarding");
    setIsLoading(false);
  };

  const completeOnboarding = async () => {
    setIsLoading(true);
    setError("");

    try {
      // Create account with onboarding data
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          name,
          ...patientData,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao criar conta");
      }

      onClose();
      router.push("/patient/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar conta");
    } finally {
      setIsLoading(false);
    }
  };

  const renderContent = () => {
    if (view === "onboarding") {
      return (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {onboardingStep === 1 && "Qual seu objetivo?"}
              {onboardingStep === 2 && "Seus dados básicos"}
              {onboardingStep === 3 && "Quase lá!"}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Passo {onboardingStep} de 3
            </p>
          </div>

          {/* Progress bar */}
          <div className="h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all duration-300"
              style={{ width: `${(onboardingStep / 3) * 100}%` }}
            />
          </div>

          {onboardingStep === 1 && (
            <div className="grid gap-3">
              {[
                { id: "loss", label: "Perder peso", desc: "Emagrecer de forma saudável" },
                { id: "gain", label: "Ganhar massa", desc: "Aumentar massa muscular" },
                { id: "maintain", label: "Manter peso", desc: "Equilibrar alimentação" },
                { id: "health", label: "Melhorar saúde", desc: "Alimentação mais saudável" },
              ].map((goal) => (
                <button
                  key={goal.id}
                  type="button"
                  onClick={() => {
                    setPatientData({ ...patientData, goal: goal.id });
                    setOnboardingStep(2);
                  }}
                  className={cn(
                    "w-full p-4 text-left rounded-xl border-2 transition-all",
                    patientData.goal === goal.id
                      ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20"
                      : "border-slate-200 dark:border-slate-700 hover:border-emerald-300"
                  )}
                >
                  <p className="font-semibold text-slate-900 dark:text-white">{goal.label}</p>
                  <p className="text-sm text-muted-foreground">{goal.desc}</p>
                </button>
              ))}
            </div>
          )}

          {onboardingStep === 2 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Ano de nascimento</Label>
                <Input
                  type="number"
                  placeholder="1990"
                  value={patientData.birthYear}
                  onChange={(e) => setPatientData({ ...patientData, birthYear: e.target.value })}
                  className="h-12"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Peso atual (kg)</Label>
                  <Input
                    type="number"
                    placeholder="70"
                    value={patientData.weight}
                    onChange={(e) => setPatientData({ ...patientData, weight: e.target.value })}
                    className="h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Altura (cm)</Label>
                  <Input
                    type="number"
                    placeholder="170"
                    value={patientData.height}
                    onChange={(e) => setPatientData({ ...patientData, height: e.target.value })}
                    className="h-12"
                  />
                </div>
              </div>
              <Button
                type="button"
                onClick={() => setOnboardingStep(3)}
                disabled={!patientData.birthYear || !patientData.weight || !patientData.height}
                className="w-full h-12 bg-emerald-600 hover:bg-emerald-700"
              >
                Continuar
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setOnboardingStep(1)}
                className="w-full"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
            </div>
          )}

          {onboardingStep === 3 && (
            <div className="space-y-6">
              <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-6 space-y-3">
                <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                  <Check className="w-5 h-5" />
                  <span className="font-medium">Tudo pronto!</span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Agora você pode começar a acompanhar sua alimentação e se conectar com nutricionistas.
                </p>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}

              <Button
                onClick={completeOnboarding}
                disabled={isLoading}
                className="w-full h-12 bg-emerald-600 hover:bg-emerald-700"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Criando conta...
                  </>
                ) : (
                  "Começar agora"
                )}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setOnboardingStep(2)}
                className="w-full"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
            </div>
          )}
        </div>
      );
    }

    if (view === "email-login") {
      return (
        <div className="space-y-6">
          <button
            onClick={() => setView("options")}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </button>

          <div className="text-center">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Entrar com email</h2>
            <p className="text-sm text-muted-foreground mt-1">Digite seus dados</p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12"
              />
            </div>
            <div className="space-y-2">
              <Label>Senha</Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-12 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <Button type="submit" disabled={isLoading} className="w-full h-12 bg-emerald-600 hover:bg-emerald-700">
              {isLoading ? "Entrando..." : "Entrar"}
            </Button>
          </form>
        </div>
      );
    }

    if (view === "email-signup") {
      return (
        <div className="space-y-6">
          <button
            onClick={() => setView("options")}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </button>

          <div className="text-center">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Criar conta</h2>
            <p className="text-sm text-muted-foreground mt-1">Preencha seus dados</p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-2">
              <Label>Seu nome</Label>
              <Input
                type="text"
                placeholder="Maria Silva"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="h-12"
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12"
              />
            </div>
            <div className="space-y-2">
              <Label>Senha</Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="h-12 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <Button type="submit" disabled={isLoading} className="w-full h-12 bg-emerald-600 hover:bg-emerald-700">
              {isLoading ? "Criando..." : "Continuar"}
            </Button>
          </form>
        </div>
      );
    }

    // Default: options view
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Bem-vindo ao NutriPlan</h2>
          <p className="text-sm text-muted-foreground mt-1">Escolha como prefere continuar</p>
        </div>

        {error && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2 text-amber-700 text-sm">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        <div className="space-y-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleSocialLogin("google")}
            disabled={isLoading}
            className="w-full h-12 justify-center gap-3 border-slate-200 hover:bg-slate-50"
          >
            <GoogleIcon />
            Continuar com Google
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => handleSocialLogin("apple")}
            disabled={isLoading}
            className="w-full h-12 justify-center gap-3 border-slate-200 hover:bg-slate-50"
          >
            <AppleIcon />
            Continuar com Apple
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white dark:bg-slate-900 px-2 text-muted-foreground">ou</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={() => setView("email-login")}
            disabled={isLoading}
            className="w-full h-12 justify-center gap-3 border-slate-200 hover:bg-slate-50"
          >
            <Mail className="w-5 h-5" />
            Entrar com email
          </Button>
        </div>

        <p className="text-center text-sm text-muted-foreground">
          Não tem conta?{" "}
          <button
            onClick={() => setView("email-signup")}
            className="text-emerald-600 hover:underline font-medium"
          >
            Criar agora
          </button>
        </p>

        <p className="text-xs text-center text-muted-foreground">
          Ao continuar, você concorda com os{" "}
          <a href="#" className="underline hover:text-foreground">Termos de Uso</a>
          {" "}e{" "}
          <a href="#" className="underline hover:text-foreground">Política de Privacidade</a>
        </p>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md mx-4 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-6 animate-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
        >
          <X className="w-5 h-5" />
        </button>

        {renderContent()}
      </div>
    </div>
  );
}
