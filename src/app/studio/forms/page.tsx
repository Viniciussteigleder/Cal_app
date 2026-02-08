"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    ClipboardList,
    Activity,
    AlertCircle,
    Calendar,
    Stethoscope,
    Moon,
    Brain,
    FileText,
    Dumbbell,
    Target,
    Plus,
    Search,
    MoreHorizontal,
    FileBarChart
} from "lucide-react";

// 10 Pre-set Templates
const FORM_TEMPLATES = [
    { id: 1, title: "Anamnese Nutricional", desc: "Histórico clínico, social e alimentar detalhado.", icon: ClipboardList, type: "System" },
    { id: 2, title: "Rastreamento Metabólico", desc: "Identificação de sinais e sintomas sistêmicos.", icon: Activity, type: "System" },
    { id: 3, title: "Risco de Disbiose", desc: "Avaliação da saúde intestinal e microbiota.", icon: AlertCircle, type: "System" },
    { id: 4, title: "Frequência Alimentar", desc: "Registro de hábitos de consumo habitual.", icon: Calendar, type: "System" },
    { id: 5, title: "Sinais e Sintomas", desc: "Checklist de queixas físicas recorrentes.", icon: Stethoscope, type: "System" },
    { id: 6, title: "Qualidade do Sono", desc: "Avaliação de higiene e padrões de sono.", icon: Moon, type: "System" },
    { id: 7, title: "Estresse e Ansiedade", desc: "Monitoramento de saúde mental e cortisol.", icon: Brain, type: "System" },
    { id: 8, title: "Saúde Digestiva (Bristol)", desc: "Diário de evacuação e escala de Bristol.", icon: FileText, type: "System" },
    { id: 9, title: "Histórico de Atividade", desc: "Nível de sedentarismo e rotina de treinos.", icon: Dumbbell, type: "System" },
    { id: 10, title: "Metas e Preferências", desc: "Alinhamento de objetivos e aversões.", icon: Target, type: "System" },
];

const MOCK_RESPONSES = [
    { id: 101, patient: "Maria Silva", form: "Anamnese Nutricional", date: "15/01/2026", status: "Completo" },
    { id: 102, patient: "João Pereira", form: "Rastreamento Metabólico", date: "16/01/2026", status: "Pendente" },
    { id: 103, patient: "Ana Costa", form: "Risco de Disbiose", date: "14/01/2026", status: "Completo" },
];

export default function StudioFormsPage() {
    return (
            <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">Formulários e Anamneses</h1>
                        <p className="text-muted-foreground">Gerencie questionários pré-consulta e avalie respostas.</p>
                    </div>
                    <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                        <Plus className="mr-2 h-4 w-4" /> Criar Novo Modelo
                    </Button>
                </div>

                <Tabs defaultValue="templates" className="w-full">
                    <TabsList>
                        <TabsTrigger value="templates">Modelos (Templates)</TabsTrigger>
                        <TabsTrigger value="responses">Respostas Recebidas</TabsTrigger>
                    </TabsList>

                    {/* TEMPLATES TAB */}
                    <TabsContent value="templates" className="mt-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {FORM_TEMPLATES.map((template) => (
                                <Card key={template.id} className="group hover:border-emerald-500/50 transition-all cursor-pointer hover:shadow-md">
                                    <CardHeader className="pb-3 pt-5">
                                        <div className="flex justify-between items-start">
                                            <div className="p-2 bg-muted rounded-lg group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                                                <template.icon className="h-5 w-5" />
                                            </div>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 -mt-2 -mr-2 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        <CardTitle className="mt-3 text-base">{template.title}</CardTitle>
                                        <CardDescription className="line-clamp-2 text-xs mt-1">
                                            {template.desc}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="pb-4 pt-0">
                                        <div className="flex items-center gap-2 mt-2">
                                            <Badge variant="secondary" className="text-[10px] h-5 font-normal">
                                                {template.type}
                                            </Badge>
                                            <span className="text-[10px] text-muted-foreground ml-auto">v1.2</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}

                            {/* Add New Card Stub */}
                            <Card className="border-dashed border-2 flex flex-col items-center justify-center text-muted-foreground hover:border-emerald-500/50 hover:bg-emerald-50/50 hover:text-emerald-600 transition-all cursor-pointer min-h-[180px]">
                                <Plus className="h-8 w-8 mb-2" />
                                <span className="font-medium text-sm">Criar Personalizado</span>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* RESPONSES TAB */}
                    <TabsContent value="responses" className="mt-6">
                        <Card>
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-lg font-medium">Últimas Respostas</CardTitle>
                                    <div className="relative w-64">
                                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input placeholder="Buscar paciente..." className="pl-9 h-9" />
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="rounded-md border overflow-hidden">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-muted/50 text-muted-foreground font-medium">
                                            <tr>
                                                <th className="px-4 py-3">Paciente</th>
                                                <th className="px-4 py-3">Formulário</th>
                                                <th className="px-4 py-3">Data Envio</th>
                                                <th className="px-4 py-3">Status</th>
                                                <th className="px-4 py-3 text-right">Ações</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border bg-card">
                                            {MOCK_RESPONSES.map((resp) => (
                                                <tr key={resp.id} className="hover:bg-muted/50">
                                                    <td className="px-4 py-3 font-medium">{resp.patient}</td>
                                                    <td className="px-4 py-3 flex items-center gap-2">
                                                        <FileBarChart className="h-3 w-3 text-muted-foreground" />
                                                        {resp.form}
                                                    </td>
                                                    <td className="px-4 py-3 text-muted-foreground">{resp.date}</td>
                                                    <td className="px-4 py-3">
                                                        <Badge variant={resp.status === "Completo" ? "default" : "secondary"} className={resp.status === "Completo" ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200" : ""}>
                                                            {resp.status}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        <Button variant="ghost" size="sm" className="h-8">Ver Respostas</Button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
    );
}
