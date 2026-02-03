"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Grip, Utensils, Droplets, MessageCircle, FileText } from "lucide-react";
import Link from "next/link";

export default function PatientDetailPage() {
  const [modules, setModules] = useState({
    chat: true,
    water: false,
    maa: true,
    questionnaires: true,
  });

  const handleToggle = (key: keyof typeof modules) => {
    setModules(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/studio/patients">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Maria Silva</h1>
          <p className="text-sm text-muted-foreground">Paciente Ativo • Última consulta: 15 Jan 2026</p>
        </div>
      </div>

      <Tabs defaultValue="settings" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="planning">Planejamento</TabsTrigger>
          <TabsTrigger value="settings">Configurações do App</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Prontuário do paciente</CardTitle>
              <CardDescription>
                Dados clínicos básicos, condições e histórico de consultas.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">
                  Dados básicos
                </p>
                <ul className="mt-2 space-y-2 text-sm">
                  <li className="flex justify-between border-b pb-1"><span>Sexo biológico:</span> <span className="font-medium">Feminino</span></li>
                  <li className="flex justify-between border-b pb-1"><span>Data Nasc.:</span> <span className="font-medium">12/05/1990</span></li>
                  <li className="flex justify-between border-b pb-1"><span>Altura:</span> <span className="font-medium">165 cm</span></li>
                  <li className="flex justify-between border-b pb-1"><span>Peso atual:</span> <span className="font-medium">68 kg</span></li>
                </ul>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">
                  Condições e observações
                </p>
                <ul className="mt-2 space-y-2 text-sm">
                  <li className="bg-amber-50 text-amber-900 border border-amber-200 px-3 py-1.5 rounded-md">⚠️ Intolerância à lactose (leve)</li>
                  <li className="bg-blue-50 text-blue-900 border border-blue-200 px-3 py-1.5 rounded-md">ℹ️ Observação: ansiedade em períodos de pico</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="mt-4">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Módulos do Aplicativo</CardTitle>
                <CardDescription>
                  Defina quais funcionalidades estarão disponíveis para este paciente no app.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">

                <div className="flex items-center justify-between space-x-4 rounded-lg border p-4">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-full">
                      <Utensils className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div className="space-y-0.5">
                      <Label className="text-base">Módulo de Acompanhamento Avançado (MAA)</Label>
                      <p className="text-sm text-muted-foreground">
                        Permite registrar peso, refeições detalhadas e biofeedback.
                      </p>
                    </div>
                  </div>
                  <Switch checked={modules.maa} onCheckedChange={() => handleToggle('maa')} />
                </div>

                <div className="flex items-center justify-between space-x-4 rounded-lg border p-4">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                      <Droplets className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="space-y-0.5">
                      <Label className="text-base">Lembrete de Hidratação</Label>
                      <p className="text-sm text-muted-foreground">
                        Envia notificações e permite registro de ingestão de água.
                      </p>
                    </div>
                  </div>
                  <Switch checked={modules.water} onCheckedChange={() => handleToggle('water')} />
                </div>

                <div className="flex items-center justify-between space-x-4 rounded-lg border p-4">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                      <MessageCircle className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="space-y-0.5">
                      <Label className="text-base">Chat Integrado</Label>
                      <p className="text-sm text-muted-foreground">
                        Canal direto de comunicação com o nutricionista pelo app.
                      </p>
                    </div>
                  </div>
                  <Switch checked={modules.chat} onCheckedChange={() => handleToggle('chat')} />
                </div>

                <div className="flex items-center justify-between space-x-4 rounded-lg border p-4">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-full">
                      <FileText className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div className="space-y-0.5">
                      <Label className="text-base">Questionários de Saúde</Label>
                      <p className="text-sm text-muted-foreground">
                        Libera acesso a frequência alimentar, rastreamento metabólico e disbiose.
                      </p>
                    </div>
                  </div>
                  <Switch checked={modules.questionnaires} onCheckedChange={() => handleToggle('questionnaires')} />
                </div>

              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
