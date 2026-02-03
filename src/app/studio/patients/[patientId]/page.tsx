'use client';

import { use } from 'react';
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
    ArrowLeft,
    Calendar,
    Mail,
    Phone,
    MapPin,
    Activity,
    FileText,
    Brain,
    TrendingUp,
    MessageSquare,
    Clock
} from "lucide-react";
import Link from "next/link";
import { ptBR } from "@/i18n/pt-BR";

interface PatientDetailPageProps {
    params: Promise<{ patientId: string }>;
}

export default function PatientDetailPage({ params }: PatientDetailPageProps) {
    const { patientId } = use(params);

    // Mock patient data - in real app, fetch from database
    const patient = {
        id: patientId,
        name: "Maria Silva",
        email: "maria.silva@email.com",
        phone: "+55 11 98765-4321",
        age: 32,
        status: "Ativo",
        plan: "Hipertrofia v3",
        adherenceScore: 87,
        lastConsultation: "15 Jan 2026",
        nextConsultation: "22 Fev 2026",
        address: "São Paulo, SP",
        joinedDate: "10 Nov 2025",
    };

    return (
        <DashboardLayout role="nutritionist">
            <div className="grid gap-6">
                {/* Header with Back Button */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/studio/patients">
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-foreground">{patient.name}</h1>
                            <p className="text-sm text-muted-foreground">Paciente desde {patient.joinedDate}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge variant={patient.status === "Ativo" ? "default" : "secondary"}>
                            {patient.status}
                        </Badge>
                        <Button>
                            <MessageSquare className="mr-2 h-4 w-4" /> Enviar Mensagem
                        </Button>
                    </div>
                </div>

                {/* Patient Overview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Aderência</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-emerald-600">{patient.adherenceScore}%</div>
                            <p className="text-xs text-muted-foreground mt-1">Excelente progresso</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Plano Atual</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-lg font-semibold">{patient.plan}</div>
                            <p className="text-xs text-muted-foreground mt-1">Ativo há 3 meses</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Última Consulta</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-lg font-semibold">{patient.lastConsultation}</div>
                            <p className="text-xs text-muted-foreground mt-1">Há 19 dias</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Próxima Consulta</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-lg font-semibold">{patient.nextConsultation}</div>
                            <p className="text-xs text-muted-foreground mt-1">Em 19 dias</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Tabs for Different Sections */}
                <Tabs defaultValue="overview" className="w-full">
                    <TabsList className="grid w-full grid-cols-6">
                        <TabsTrigger value="overview">
                            <Activity className="h-4 w-4 mr-2" />
                            {ptBR.patients.details.overview}
                        </TabsTrigger>
                        <TabsTrigger value="consultations">
                            <Calendar className="h-4 w-4 mr-2" />
                            {ptBR.patients.details.consultations}
                        </TabsTrigger>
                        <TabsTrigger value="mealplan">
                            <FileText className="h-4 w-4 mr-2" />
                            {ptBR.patients.details.mealPlan}
                        </TabsTrigger>
                        <TabsTrigger value="exams">
                            <Activity className="h-4 w-4 mr-2" />
                            {ptBR.patients.details.exams}
                        </TabsTrigger>
                        <TabsTrigger value="ai-analysis">
                            <Brain className="h-4 w-4 mr-2" />
                            {ptBR.patients.details.aiAnalysis}
                        </TabsTrigger>
                        <TabsTrigger value="log">
                            <Clock className="h-4 w-4 mr-2" />
                            {ptBR.patients.details.dailyLog}
                        </TabsTrigger>
                    </TabsList>

                    {/* Overview Tab */}
                    <TabsContent value="overview" className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Contact Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Informações de Contato</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <Mail className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm">{patient.email}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Phone className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm">{patient.phone}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <MapPin className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm">{patient.address}</span>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Quick Stats */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Estatísticas Rápidas</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-muted-foreground">Idade</span>
                                        <span className="text-sm font-medium">{patient.age} anos</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-muted-foreground">Refeições Registradas (7d)</span>
                                        <span className="text-sm font-medium">18/21</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-muted-foreground">Meta Calórica Média</span>
                                        <span className="text-sm font-medium">2.000 kcal</span>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Recent Activity Timeline */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Atividade Recente</CardTitle>
                                <CardDescription>Últimas interações e registros</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {[
                                        { date: "Hoje, 14:30", action: "Registrou almoço", details: "Frango grelhado, arroz integral, brócolis" },
                                        { date: "Hoje, 08:15", action: "Registrou café da manhã", details: "Ovos mexidos, pão integral, café" },
                                        { date: "Ontem, 19:45", action: "Completou exercício", details: "Treino de força - 45 minutos" },
                                        { date: "15 Jan 2026", action: "Consulta realizada", details: "Avaliação mensal - Progresso excelente" },
                                    ].map((activity, i) => (
                                        <div key={i} className="flex gap-4 pb-4 border-b last:border-0">
                                            <div className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-emerald-500"></div>
                                            <div className="flex-1">
                                                <p className="text-sm font-medium">{activity.action}</p>
                                                <p className="text-xs text-muted-foreground">{activity.details}</p>
                                                <p className="text-xs text-muted-foreground mt-1">{activity.date}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Consultations Tab */}
                    <TabsContent value="consultations" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle>Histórico de Consultas</CardTitle>
                                    <Button>
                                        <Calendar className="mr-2 h-4 w-4" /> Agendar Consulta
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {[
                                        { date: "15 Jan 2026", type: "Avaliação Mensal", notes: "Progresso excelente. Manter plano atual." },
                                        { date: "15 Dez 2025", type: "Consulta de Acompanhamento", notes: "Ajuste nas porções de carboidratos." },
                                        { date: "15 Nov 2025", type: "Consulta Inicial", notes: "Anamnese completa. Definição de objetivos." },
                                    ].map((consultation, i) => (
                                        <Card key={i}>
                                            <CardContent className="pt-6">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <p className="font-medium">{consultation.type}</p>
                                                        <p className="text-sm text-muted-foreground mt-1">{consultation.notes}</p>
                                                    </div>
                                                    <Badge variant="outline">{consultation.date}</Badge>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Meal Plan Tab */}
                    <TabsContent value="mealplan" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Plano Alimentar Atual</CardTitle>
                                <CardDescription>{patient.plan}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">
                                    O plano alimentar detalhado será exibido aqui com todas as refeições planejadas.
                                </p>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Exams Tab */}
                    <TabsContent value="exams" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle>Exames e Resultados</CardTitle>
                                    <Button>
                                        <FileText className="mr-2 h-4 w-4" /> Adicionar Exame
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">
                                    Nenhum exame registrado ainda. Clique em "Adicionar Exame" para fazer upload.
                                </p>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* AI Analysis Tab */}
                    <TabsContent value="ai-analysis" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Análise de IA</CardTitle>
                                <CardDescription>Insights gerados por inteligência artificial</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <Card>
                                        <CardContent className="pt-6">
                                            <div className="flex items-center gap-2 mb-2">
                                                <TrendingUp className="h-5 w-5 text-emerald-600" />
                                                <span className="font-medium">Aderência</span>
                                            </div>
                                            <p className="text-2xl font-bold text-emerald-600">87%</p>
                                            <p className="text-xs text-muted-foreground mt-1">Acima da média</p>
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardContent className="pt-6">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Activity className="h-5 w-5 text-blue-600" />
                                                <span className="font-medium">Risco de Abandono</span>
                                            </div>
                                            <p className="text-2xl font-bold text-green-600">Baixo</p>
                                            <p className="text-xs text-muted-foreground mt-1">Paciente engajado</p>
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardContent className="pt-6">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Brain className="h-5 w-5 text-purple-600" />
                                                <span className="font-medium">Progresso</span>
                                            </div>
                                            <p className="text-2xl font-bold text-purple-600">92%</p>
                                            <p className="text-xs text-muted-foreground mt-1">Excelente evolução</p>
                                        </CardContent>
                                    </Card>
                                </div>

                                <Card className="bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200">
                                    <CardContent className="pt-6">
                                        <h4 className="font-medium mb-2">Recomendações da IA</h4>
                                        <ul className="space-y-2 text-sm">
                                            <li className="flex items-start gap-2">
                                                <span className="text-emerald-600">✓</span>
                                                <span>Paciente demonstra excelente aderência ao plano alimentar</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <span className="text-emerald-600">✓</span>
                                                <span>Frequência de registro de refeições está acima da média</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <span className="text-blue-600">ℹ</span>
                                                <span>Considere aumentar gradualmente a meta calórica em 100-150 kcal</span>
                                            </li>
                                        </ul>
                                    </CardContent>
                                </Card>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Daily Log Tab */}
                    <TabsContent value="log" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Log Diário do Paciente</CardTitle>
                                <CardDescription>Timeline completa de atividades, refeições e sintomas</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">
                                    O sistema de log diário será implementado em breve com filtros avançados e timeline interativa.
                                </p>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </DashboardLayout>
    );
}
