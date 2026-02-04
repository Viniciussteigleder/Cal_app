'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertCircle, CheckCircle2, ShieldAlert, Settings, Users, FileText, Brain, Activity, ArrowRight, LayoutDashboard, UserCog, Database, Lock, Search, Building2, ShieldCheck, Sparkles, BookOpen, ClipboardList } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function AppDescriptionPage() {
  const [activeSection, setActiveSection] = useState<string>('');

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // Update hash in URL without jump
      window.history.pushState(null, '', `#${id}`);
    }
  };

  // Spy on scroll to update active section in TOC
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: '-20% 0px -60% 0px' }
    );

    const sections = document.querySelectorAll('section[id]');
    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  const tocItems = [
    { id: 'configuracao-owner', label: '1. Configuração Inicial', icon: Settings },
    { id: 'modelo-interacao', label: '2. Modelo de Interação', icon: Users },
    { id: 'motor-regras', label: '3. Motor de Regras', icon: ShieldAlert },
    { id: 'casos-praticos', label: '4. Casos Práticos', icon: Activity },
    { id: 'impacto-mudancas', label: '5. Impacto de Mudanças', icon: ArrowRight },
    { id: 'monitoramento', label: '6. Monitoramento', icon: LayoutDashboard },
    { id: 'faq', label: '7. FAQ & Glossário', icon: Brain },
  ];

  return (
    <div className="flex max-w-7xl mx-auto gap-8 p-6 relative">

      {/* Sidebar Table of Contents (Sticky) */}
      <aside className="hidden lg:block w-64 shrink-0">
        <div className="sticky top-24 space-y-2">
          <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-4 px-2">Navegação</h3>
          <div className="space-y-1">
            {tocItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={`group flex items-center gap-3 w-full px-3 py-2 text-sm font-medium rounded-md transition-all ${activeSection === item.id
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
              >
                <item.icon className={`h-4 w-4 ${activeSection === item.id ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`} />
                {item.label}
              </button>
            ))}
          </div>

          <div className="pt-8 px-2">
            <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/30 p-4 border border-emerald-100 dark:border-emerald-900">
              <h4 className="font-semibold text-emerald-800 dark:text-emerald-300 text-xs uppercase mb-2">Status do Admin</h4>
              <div className="flex items-center gap-2 mb-1">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">Sistema Operacional</span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 min-w-0 space-y-12">

        {/* Header */}
        <div className="bg-gradient-to-br from-emerald-900/20 to-emerald-600/10 rounded-xl p-8 border border-emerald-500/20">
          <h1 className="text-4xl font-bold tracking-tight mb-4">Como o NutriPlan Funciona</h1>
          <p className="text-lg text-muted-foreground max-w-3xl">
            Guia oficial para App Owners e Administradores. Governe a plataforma com segurança, configure regras de IA e monitore a qualidade clínica.
          </p>
        </div>

        {/* 1. Configuração Owner Section */}
        <section id="configuracao-owner" className="space-y-6 scroll-mt-24">
          <h2 className="text-2xl font-bold flex items-center gap-2 pb-2 border-b">
            <Settings className="h-6 w-6 text-emerald-500" />
            Configuração Inicial
          </h2>
          <p className="text-muted-foreground">Checklist de funcionalidades que você deve configurar antes de convidar nutricionistas.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { title: "Usuários & Acessos", icon: Users, desc: "Defina quem pode acessar o sistema (Nutricionistas, Admin).", link: "/owner/users", label: "Gerenciar Usuários" },
              { title: "Clínicas (Tenants)", icon: Building2, desc: "Gerencie as clínicas cadastradas na plataforma.", link: "/owner/tenants", label: "Ver Clínicas" },
              { title: "Gestão de IA", icon: Brain, desc: "Configure prompts, modelos e custos dos agentes.", link: "/owner/ai", label: "Ajustar IA" },
              { title: "Integridade de Dados", icon: ShieldCheck, desc: "Audite logs de segurança e consistência.", link: "/owner/integrity", label: "Ver Auditoria" },
              { title: "Bases de Dados", icon: Database, desc: "Importe e gerencie bases de alimentos e exames.", link: "/owner/datasets", label: "Acessar Bases" },
            ].map((item, i) => (
              <Card key={i} className="flex flex-col hover:border-emerald-500/50 transition-colors cursor-pointer" onClick={() => window.location.href = item.link}>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <item.icon className="h-5 w-5 text-emerald-500" />
                    {item.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 pb-3">
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </CardContent>
                <CardFooter className="pt-0">
                  <span className="text-xs text-primary font-medium flex items-center gap-1">
                    Ir para {item.title} <ArrowRight className="h-3 w-3" />
                  </span>
                </CardFooter>
              </Card>
            ))}
          </div>
        </section>

        {/* 2. Role Model Section */}
        <section id="modelo-interacao" className="space-y-6 scroll-mt-24">
          <h2 className="text-2xl font-bold flex items-center gap-2 pb-2 border-b">
            <Users className="h-6 w-6 text-blue-500" />
            Modelo de Interação
          </h2>
          <p className="text-muted-foreground">Entenda o fluxo de responsabilidades entre os três perfis da plataforma.</p>

          <Card>
            <CardContent className="pt-6">
              <div className="relative pl-4 md:pl-0">
                <div className="absolute left-8 top-8 bottom-8 w-0.5 bg-gradient-to-b from-emerald-500/50 via-blue-500/50 to-purple-500/50 hidden md:block"></div>

                <div className="space-y-12 relative">
                  <div className="md:pl-20 relative group">
                    <div className="md:absolute left-0 top-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-100 to-emerald-50 dark:from-emerald-900/40 dark:to-emerald-950/20 flex items-center justify-center border shadow-sm group-hover:shadow-md transition-all mb-4 md:mb-0 z-10">
                      <Settings className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <h3 className="text-lg font-bold text-emerald-600 dark:text-emerald-400">1. APP OWNER (Governance)</h3>
                    <p className="text-sm text-muted-foreground mb-3">Define as regras do jogo.</p>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm bg-muted/40 p-4 rounded-lg border border-border/50">
                      <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Cria Templates Globais</li>
                      <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Configura Agentes IA</li>
                      <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Define Regras de Bloqueio</li>
                      <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Audita Custos e Uso</li>
                    </ul>
                  </div>

                  <div className="md:pl-20 relative group">
                    <div className="md:absolute left-0 top-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/40 dark:to-blue-950/20 flex items-center justify-center border shadow-sm group-hover:shadow-md transition-all mb-4 md:mb-0 z-10">
                      <UserCog className="h-7 w-7 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-lg font-bold text-blue-600 dark:text-blue-400">2. NUTRICIONISTA (Execution)</h3>
                    <p className="text-sm text-muted-foreground mb-3">Usa as ferramentas para atender.</p>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm bg-muted/40 p-4 rounded-lg border border-border/50">
                      <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-blue-500" /> Cria Planos Personalizados</li>
                      <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-blue-500" /> Aplica Protocolos de IA</li>
                      <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-blue-500" /> Valida Alertas do Sistema</li>
                      <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-blue-500" /> Acompanha Evolução</li>
                    </ul>
                  </div>

                  <div className="md:pl-20 relative group">
                    <div className="md:absolute left-0 top-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-100 to-purple-50 dark:from-purple-900/40 dark:to-purple-950/20 flex items-center justify-center border shadow-sm group-hover:shadow-md transition-all mb-4 md:mb-0 z-10">
                      <Activity className="h-7 w-7 text-purple-600 dark:text-purple-400" />
                    </div>
                    <h3 className="text-lg font-bold text-purple-600 dark:text-purple-400">3. PACIENTE (Adherence)</h3>
                    <p className="text-sm text-muted-foreground mb-3">Segue o plano e gera dados.</p>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm bg-muted/40 p-4 rounded-lg border border-border/50">
                      <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-purple-500" /> Registra Diário Alimentar</li>
                      <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-purple-500" /> Relata Sintomas</li>
                      <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-purple-500" /> Recebe Feedback da IA</li>
                      <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-purple-500" /> Visualiza Progresso</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* 3. Motor de Regras Section */}
        <section id="motor-regras" className="space-y-6 scroll-mt-24">
          <h2 className="text-2xl font-bold flex items-center gap-2 pb-2 border-b">
            <ShieldAlert className="h-6 w-6 text-red-500" />
            Motor de Regras & Segurança
          </h2>
          <Card className="overflow-hidden">
            <CardHeader className="bg-muted/50">
              <CardTitle className="text-base">Ciclo de Validação Automática</CardTitle>
              <CardDescription>O sistema valida cada alimento adicionado contra o perfil do paciente em &lt; 200ms.</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="border border-red-200 bg-red-50 dark:bg-red-950/20 p-5 rounded-xl shadow-sm">
                  <div className="flex items-center gap-2 font-bold text-red-600 dark:text-red-400 mb-3 text-lg">
                    <ShieldAlert className="h-6 w-6" />
                    BLOQUEIA
                  </div>
                  <p className="text-sm mb-3 font-medium text-foreground">Risco Crítico (Hard Stop)</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Ação IMPEDIDA pelo sistema. Não é possível salvar o plano.
                    <br /><br />
                    <strong>Exemplos:</strong> Alergias graves (anafilaxia), interações medicamentosas perigosas.
                  </p>
                </div>

                <div className="border border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20 p-5 rounded-xl shadow-sm">
                  <div className="flex items-center gap-2 font-bold text-yellow-600 dark:text-yellow-400 mb-3 text-lg">
                    <AlertCircle className="h-6 w-6" />
                    ALERTA
                  </div>
                  <p className="text-sm mb-3 font-medium text-foreground">Atenção Necessária (Soft Warning)</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Ação PERMITIDA, mas exibe aviso destacado para o nutricionista confirmar.
                    <br /><br />
                    <strong>Exemplos:</strong> Intolerâncias leves, excesso de calorias, alimentos com traços de glúten.
                  </p>
                </div>

                <div className="border border-emerald-200 bg-emerald-50 dark:bg-emerald-950/20 p-5 rounded-xl shadow-sm">
                  <div className="flex items-center gap-2 font-bold text-emerald-600 dark:text-emerald-400 mb-3 text-lg">
                    <CheckCircle2 className="h-6 w-6" />
                    PERMITE
                  </div>
                  <p className="text-sm mb-3 font-medium text-foreground">Ação Segura</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Ação aprovada sem restrições. Está alinhada com as preferências e necessidades.
                    <br /><br />
                    <strong>Exemplos:</strong> Alimentos saudáveis, substituições inteligentes sugeridas.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* 4. Casos Práticos - Tabs */}
        <section id="casos-praticos" className="space-y-6 scroll-mt-24">
          <h2 className="text-2xl font-bold flex items-center gap-2 pb-2 border-b">
            <Activity className="h-6 w-6 text-purple-500" />
            Casos Práticos de Uso
          </h2>
          <Tabs defaultValue="caso1" className="w-full">
            <TabsList className="grid w-full grid-cols-1 md:grid-cols-3 h-auto p-1">
              <TabsTrigger value="caso1" className="py-2">1. SII (FODMAP)</TabsTrigger>
              <TabsTrigger value="caso2" className="py-2">2. Diabetes + Alergia</TabsTrigger>
              <TabsTrigger value="caso3" className="py-2">3. Vegana + Ferro Baixo</TabsTrigger>
            </TabsList>

            {/* Case 1 Content */}
            <TabsContent value="caso1" className="mt-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Paciente com Síndrome do Intestino Irritável</CardTitle>
                      <CardDescription>Mulher, 34 anos. Gatilhos: Laticínios, Cebola, Trigo.</CardDescription>
                    </div>
                    <Activity className="h-8 w-8 text-muted-foreground/30" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3 p-4 bg-muted/30 rounded-lg border">
                      <h4 className="font-semibold text-sm flex items-center gap-2"><Settings className="h-4 w-4" /> Configuração (Você)</h4>
                      <div className="space-y-2">
                        <Badge variant="outline" className="w-full justify-start py-1">Protocolo: FODMAP (Fase 1)</Badge>
                        <Badge variant="secondary" className="w-full justify-start py-1 text-yellow-600 bg-yellow-50 border-yellow-200">Regra: Intol. Lactose (ALERTA)</Badge>
                        <Badge variant="secondary" className="w-full justify-start py-1 text-yellow-600 bg-yellow-50 border-yellow-200">Regra: FODMAP Alto (ALERTA)</Badge>
                      </div>
                    </div>
                    <div className="space-y-3 p-4 bg-muted/30 rounded-lg border">
                      <h4 className="font-semibold text-sm flex items-center gap-2"><Brain className="h-4 w-4" /> Resposta do Sistema</h4>
                      <ul className="text-sm space-y-3">
                        <li className="flex gap-3 items-start p-2 bg-background rounded border">
                          <AlertCircle className="h-5 w-5 text-yellow-500 shrink-0" />
                          <div>
                            <span className="font-medium text-foreground">Detectou "Leite Integral"</span>
                            <p className="text-xs text-muted-foreground mt-1">Exibiu alerta e sugeriu substituição por "Leite Zero Lactose" ou "Leite de Amêndoas".</p>
                          </div>
                        </li>
                        <li className="flex gap-3 items-start p-2 bg-background rounded border">
                          <AlertCircle className="h-5 w-5 text-yellow-500 shrink-0" />
                          <div>
                            <span className="font-medium text-foreground">Detectou "Cebola"</span>
                            <p className="text-xs text-muted-foreground mt-1">Exibiu alerta FODMAP Alto e sugeriu usar apenas a parte verde da cebolinha.</p>
                          </div>
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Case 2 Content */}
            <TabsContent value="caso2" className="mt-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Paciente Diabético com Alergia a Crustáceos</CardTitle>
                      <CardDescription>Homem, 52 anos. Risco de anafilaxia.</CardDescription>
                    </div>
                    <Activity className="h-8 w-8 text-muted-foreground/30" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3 p-4 bg-muted/30 rounded-lg border">
                      <h4 className="font-semibold text-sm flex items-center gap-2"><Settings className="h-4 w-4" /> Configuração (Você)</h4>
                      <div className="space-y-2">
                        <Badge variant="destructive" className="w-full justify-start py-1">Critico: Alergia Crustáceos (BLOQUEIA)</Badge>
                        <Badge variant="outline" className="w-full justify-start py-1">Condição: Diabetes Tipo 2</Badge>
                        <Badge variant="outline" className="w-full justify-start py-1">Template: Low-Carb Diabetes</Badge>
                      </div>
                    </div>
                    <div className="space-y-3 p-4 bg-muted/30 rounded-lg border">
                      <h4 className="font-semibold text-sm flex items-center gap-2"><Brain className="h-4 w-4" /> Resposta do Sistema</h4>
                      <ul className="text-sm space-y-3">
                        <li className="flex gap-3 items-start p-2 bg-red-50 dark:bg-red-950/20 rounded border border-red-200">
                          <ShieldAlert className="h-5 w-5 text-red-500 shrink-0" />
                          <div>
                            <span className="font-bold text-red-700 dark:text-red-400">BLOQUEIO: "Camarão"</span>
                            <p className="text-xs text-red-600/80 mt-1">Ação impedida pelo sistema devido risco de anafilaxia.</p>
                          </div>
                        </li>
                        <li className="flex gap-3 items-start p-2 bg-background rounded border">
                          <AlertCircle className="h-5 w-5 text-yellow-500 shrink-0" />
                          <div>
                            <span className="font-medium text-foreground">Detectou "Arroz Branco"</span>
                            <p className="text-xs text-muted-foreground mt-1">Sugeriu troca por carbo de baixo índice glicêmico (Quinoa/Integral).</p>
                          </div>
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Case 3 Content */}
            <TabsContent value="caso3" className="mt-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Vegana com Deficiência de Ferro</CardTitle>
                      <CardDescription>Mulher, 28 anos. Ferritina baixa.</CardDescription>
                    </div>
                    <Activity className="h-8 w-8 text-muted-foreground/30" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3 p-4 bg-muted/30 rounded-lg border">
                      <h4 className="font-semibold text-sm flex items-center gap-2"><Settings className="h-4 w-4" /> Configuração (Você)</h4>
                      <div className="space-y-2">
                        <Badge variant="secondary" className="w-full justify-start py-1 bg-green-50 text-green-700 border-green-200">Filtro Ativo: Veganismo</Badge>
                        <Badge variant="outline" className="w-full justify-start py-1">Condição: Deficiência Ferro</Badge>
                        <Badge variant="outline" className="w-full justify-start py-1">IA: Assessor Suplementos</Badge>
                      </div>
                    </div>
                    <div className="space-y-3 p-4 bg-muted/30 rounded-lg border">
                      <h4 className="font-semibold text-sm flex items-center gap-2"><Brain className="h-4 w-4" /> Resposta do Sistema</h4>
                      <ul className="text-sm space-y-3">
                        <li className="flex gap-3 items-start p-2 bg-emerald-50 dark:bg-emerald-950/20 rounded border border-emerald-200">
                          <Sparkles className="h-5 w-5 text-emerald-500 shrink-0" />
                          <div>
                            <span className="font-bold text-emerald-700 dark:text-emerald-400">Dica Inteligente</span>
                            <p className="text-xs text-emerald-600/80 mt-1">"Combinação excelente! A Vitamina C da laranja aumentará a absorção do ferro do espinafre."</p>
                          </div>
                        </li>
                        <li className="flex gap-3 items-start p-2 bg-background rounded border">
                          <AlertCircle className="h-5 w-5 text-yellow-500 shrink-0" />
                          <div>
                            <span className="font-medium text-foreground">Detectou "Chá Preto" no almoço</span>
                            <p className="text-xs text-muted-foreground mt-1">Alerta: Taninos inibem absorção de ferro. Evite próximo às refeições.</p>
                          </div>
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </section>

        {/* 5. Impacto Mudanças Table */}
        <section id="impacto-mudancas" className="space-y-6 scroll-mt-24">
          <h2 className="text-2xl font-bold flex items-center gap-2 pb-2 border-b">
            <ArrowRight className="h-6 w-6 text-orange-500" />
            Tabela de Impacto de Mudanças
          </h2>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Consequências das suas ações</CardTitle>
              <CardDescription>O que acontece quando você altera uma configuração global.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[300px]">Ação do Owner</TableHead>
                    <TableHead className="hidden sm:table-cell">Afeta Planos?</TableHead>
                    <TableHead>Impacto Imediato</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow className="hover:bg-muted/50">
                    <TableCell className="font-medium">Adicionar novo Alergênico</TableCell>
                    <TableCell className="hidden sm:table-cell">Sim (Existentes e Futuros)</TableCell>
                    <TableCell className="text-muted-foreground text-sm">Sistema revalida e gera alertas em planos antigos</TableCell>
                    <TableCell className="text-right"><Badge variant="outline" className="text-yellow-600 bg-yellow-50 border-yellow-200">Atenção</Badge></TableCell>
                  </TableRow>
                  <TableRow className="hover:bg-muted/50">
                    <TableCell className="font-medium">Alterar nível (Grave → Moderado)</TableCell>
                    <TableCell className="hidden sm:table-cell">Sim</TableCell>
                    <TableCell className="text-muted-foreground text-sm">Bloqueios viram alertas (menos restritivo)</TableCell>
                    <TableCell className="text-right"><Badge variant="outline" className="text-yellow-600 bg-yellow-50 border-yellow-200">Atenção</Badge></TableCell>
                  </TableRow>
                  <TableRow className="hover:bg-muted/50">
                    <TableCell className="font-medium">Publicar novo Template</TableCell>
                    <TableCell className="hidden sm:table-cell">Apenas Futuros</TableCell>
                    <TableCell className="text-muted-foreground text-sm">Fica disponível na biblioteca para usar</TableCell>
                    <TableCell className="text-right"><Badge variant="outline" className="text-emerald-600 bg-emerald-50 border-emerald-200">OK</Badge></TableCell>
                  </TableRow>
                  <TableRow className="hover:bg-muted/50">
                    <TableCell className="font-medium">Desativar agente de IA</TableCell>
                    <TableCell className="hidden sm:table-cell">Sim</TableCell>
                    <TableCell className="text-muted-foreground text-sm">Funcionalidade para de funcionar imediatamente</TableCell>
                    <TableCell className="text-right"><Badge variant="destructive">Bloqueado</Badge></TableCell>
                  </TableRow>
                  <TableRow className="hover:bg-muted/50">
                    <TableCell className="font-medium">Atualizar Dataset de Alimentos</TableCell>
                    <TableCell className="hidden sm:table-cell">Sim</TableCell>
                    <TableCell className="text-muted-foreground text-sm">Recalcula macros de todos os planos que usam os itens</TableCell>
                    <TableCell className="text-right"><Badge variant="outline" className="text-blue-600 bg-blue-50 border-blue-200">Info</Badge></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </section>

        {/* 6. FAQ Section */}
        <section id="faq" className="space-y-6 scroll-mt-24 pb-20">
          <h2 className="text-2xl font-bold flex items-center gap-2 pb-2 border-b">
            <Brain className="h-6 w-6 text-pink-500" />
            Perguntas Frequentes e Glossário
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><MessageSquare className="h-5 w-5" /> Dúvidas Comuns</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm text-foreground">Posso importar tabelas de alimentos próprias?</h4>
                  <p className="text-sm text-muted-foreground">Sim. Vá em Datasets e use a importação CSV. O sistema validará colunas (Calorias, Proteínas, etc.) e vinculará automaticamente.</p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm text-foreground">O que significa "Microbiota Intestinal"?</h4>
                  <p className="text-sm text-muted-foreground">É o termo científico correto para "flora intestinal". Usamos apenas esta terminologia para manter o padrão clínico profissional.</p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm text-foreground">O NutriPlan faz diagnósticos médicos?</h4>
                  <p className="text-sm text-muted-foreground"><strong>Absolutamente não.</strong> Somos uma ferramenta de suporte à decisão. O diagnóstico e responsabilidade final são sempre do profissional de saúde.</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><BookOpen className="h-5 w-5" /> Glossário Essencial</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <dl className="space-y-4">
                  <div>
                    <dt className="font-semibold text-sm flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                      FODMAP
                    </dt>
                    <dd className="text-sm text-muted-foreground pl-4 mt-1 border-l-2 ml-1">Carboidratos fermentáveis que causam desconforto em alguns pacientes. Temos um protocolo específico para exclusão e reintrodução.</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-sm flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                      Anti-nutrientes
                    </dt>
                    <dd className="text-sm text-muted-foreground pl-4 mt-1 border-l-2 ml-1">Compostos naturais (ex: fitatos, taninos) que reduzem a absorção de vitaminas. O sistema alerta sobre combinações inadequadas.</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-sm flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                      Motor de Regras
                    </dt>
                    <dd className="text-sm text-muted-foreground pl-4 mt-1 border-l-2 ml-1">O "cérebro" da segurança. Valida cada interação em tempo real contra as regras que você configura.</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
}
