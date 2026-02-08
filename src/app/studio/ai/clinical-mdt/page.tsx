'use client';

import { useState } from 'react';
import { Brain, FileText, Activity, AlertCircle, PlayCircle, Save, CheckCircle2, ChevronRight, Stethoscope } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MedicalDisclaimer } from '@/components/ui/medical-disclaimer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { runClinicalMDT, ClinicalMDTInputs } from './actions';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SpecialistsList } from './SpecialistsList';
import { CaseLibrary } from './CaseLibrary';

export default function ClinicalMDTPage() {
    const [isGenerating, setIsGenerating] = useState(false);
    const [activeTab, setActiveTab] = useState('input');
    const [result, setResult] = useState<string | null>(null);

    // Form State
    const [templateName, setTemplateName] = useState('Gastroenterologia Funcional');
    const [clinicalSetting, setClinicalSetting] = useState('outpatient'); // outpatient/inpatient/telehealth
    const [intakeJson, setIntakeJson] = useState(`{
  "age": 34,
  "gender": "female",
  "symptoms": ["bloating", "irregular bowel movements"],
  "diet": "omnivorous",
  "history": "chronic fatigue"
}`);
    const [attachmentsNotes, setAttachmentsNotes] = useState('Exames de sangue normais (Jan 2026). Endoscopia sem alterações.');
    const [medsSupps, setMedsSupps] = useState('Multivitamínico, Omega 3');
    const [careKitRules, setCareKitRules] = useState('Estilo conservador, guidelines ESPEN, foco em educação do paciente.');

    // Constraints
    const [timeBudgetCulture, setTimeBudgetCulture] = useState('Cozinha rápida 30min, orçamento médio, comida brasileira');
    const [eatingOut, setEatingOut] = useState('2x por semana');
    const [language, setLanguage] = useState('Português (BR)');
    const [readingLevel, setReadingLevel] = useState('Ensino Médio');


    const handleGenerate = async () => {
        setIsGenerating(true);
        setActiveTab('result'); // Switch to results tab to show loading state

        const inputs: ClinicalMDTInputs = {
            templateName,
            clinicalSetting,
            intakeJson,
            attachmentsNotes,
            medsSupps,
            constraints: {
                timeBudgetCookingCulture: timeBudgetCulture,
                eatingOut,
                language,
                readingLevel
            },
            careKitRules
        };

        try {
            const response = await runClinicalMDT(inputs);
            if (response.success && response.data) {
                setResult(response.data);
                toast.success('Plano Clínico gerado com sucesso!');
            } else {
                toast.error('Erro ao gerar plano. Tente novamente.');
                console.error(response.error);
            }
        } catch (error) {
            toast.error('Ocorreu um erro inesperado.');
            console.error(error);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
            <div className="space-y-6 h-full flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-2">
                            <Stethoscope className="h-8 w-8 text-primary" />
                            MDT Clínico Colaborativo (Beta)
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Equipe multidisciplinar virtual para casos complexos.
                        </p>
                    </div>
                </div>

                <SpecialistsList />

                <MedicalDisclaimer />

                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="input">Dados do Caso</TabsTrigger>
                        <TabsTrigger value="result" disabled={!result && !isGenerating}>Plano & Decisões</TabsTrigger>
                    </TabsList>

                    {/* INPUT TAB */}
                    <TabsContent value="input" className="mt-4 space-y-4">
                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                            <div className="lg:col-span-3">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Configuração do Caso</CardTitle>
                                        <CardDescription>Defina o contexto clínico e dados do paciente para a equipe multi-agente.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Left Column */}
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <Label>Template do Caso</Label>
                                                <Select value={templateName} onValueChange={setTemplateName}>
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="Gastroenterologia Funcional">Gastroenterologia Funcional</SelectItem>
                                                        <SelectItem value="Saúde da Mulher & Hormônios">Saúde da Mulher & Hormônios</SelectItem>
                                                        <SelectItem value="Performance Esportiva">Performance Esportiva</SelectItem>
                                                        <SelectItem value="Oncologia Integrativa">Oncologia Integrativa</SelectItem>
                                                        <SelectItem value="Pediatria">Pediatria</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="space-y-2">
                                                <Label>Ambiente Clínico (Setting)</Label>
                                                <Select value={clinicalSetting} onValueChange={setClinicalSetting}>
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="outpatient">Consultório (Outpatient)</SelectItem>
                                                        <SelectItem value="telehealth">Teleconsulta</SelectItem>
                                                        <SelectItem value="inpatient">Hospitalar (Inpatient)</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="space-y-2">
                                                <Label>JSON de Intake / Anamnese</Label>
                                                <Textarea
                                                    value={intakeJson}
                                                    onChange={(e) => setIntakeJson(e.target.value)}
                                                    className="font-mono text-xs h-40"
                                                    placeholder="{ patient_data... }"
                                                />
                                                <p className="text-xs text-muted-foreground">Cole o JSON estruturado do paciente aqui.</p>
                                            </div>

                                            <div className="space-y-2">
                                                <Label>Resumo de Anexos/Exames</Label>
                                                <Textarea
                                                    value={attachmentsNotes}
                                                    onChange={(e) => setAttachmentsNotes(e.target.value)}
                                                    rows={3}
                                                    placeholder="Resumo de exames anteriores, imagens, laudos..."
                                                />
                                            </div>
                                        </div>

                                        {/* Right Column */}
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <Label>Medicamentos & Suplementos Atuais</Label>
                                                <Textarea
                                                    value={medsSupps}
                                                    onChange={(e) => setMedsSupps(e.target.value)}
                                                    rows={2}
                                                    placeholder="Lista de medicamentos e suplementos em uso"
                                                />
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label>Orçamento / Tempo / Cultura</Label>
                                                    <Input
                                                        value={timeBudgetCulture}
                                                        onChange={(e) => setTimeBudgetCulture(e.target.value)}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Refeições Fora</Label>
                                                    <Input
                                                        value={eatingOut}
                                                        onChange={(e) => setEatingOut(e.target.value)}
                                                        placeholder="Ex: 2x semana"
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label>Idioma</Label>
                                                    <Select value={language} onValueChange={setLanguage}>
                                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="Português (BR)">Português (BR)</SelectItem>
                                                            <SelectItem value="English">English</SelectItem>
                                                            <SelectItem value="Español">Español</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Nível de Leitura (Paciente)</Label>
                                                    <Select value={readingLevel} onValueChange={setReadingLevel}>
                                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="Fundamental">Fundamental (Simples)</SelectItem>
                                                            <SelectItem value="Ensino Médio">Ensino Médio (Padrão)</SelectItem>
                                                            <SelectItem value="Técnico/Superior">Técnico/Superior (Detalhado)</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label>Regras do Care Kit (Estilo Clínico)</Label>
                                                <Textarea
                                                    value={careKitRules}
                                                    onChange={(e) => setCareKitRules(e.target.value)}
                                                    rows={3}
                                                    placeholder="Estilo de conduta, formatos preferidos, guidelines locais..."
                                                />
                                            </div>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="flex justify-end border-t p-4 bg-muted/20">
                                        <Button
                                            size="lg"
                                            className="bg-emerald-600 hover:bg-emerald-700"
                                            onClick={handleGenerate}
                                            disabled={isGenerating}
                                        >
                                            {isGenerating ? (
                                                <>
                                                    <Brain className="mr-2 h-4 w-4 animate-spin" />
                                                    Analisando Caso com MDT...
                                                </>
                                            ) : (
                                                <>
                                                    <PlayCircle className="mr-2 h-4 w-4" />
                                                    Iniciar MDT Clínico
                                                </>
                                            )}
                                        </Button>
                                    </CardFooter>
                                </Card>
                            </div>
                            <div className="lg:col-span-1 space-y-4">
                                <CaseLibrary />
                            </div>
                        </div>
                    </TabsContent>

                    {/* RESULT TAB */}
                    <TabsContent value="result" className="mt-4 flex-1">
                        {isGenerating ? (
                            <div className="flex flex-col items-center justify-center p-12 space-y-4">
                                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
                                <h3 className="text-xl font-semibold">Equipe MDT em Reunião...</h3>
                                <p className="text-muted-foreground w-[400px] text-center">
                                    Os especialistas estão analisando os dados, gerando hipóteses e debatendo a conduta. Isso pode levar alguns segundos.
                                </p>
                                <div className="w-full max-w-md space-y-2 pt-4">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Activity className="w-4 h-4 text-emerald-500" />
                                        <span>Triagem de Segurança e Red Flags...</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Brain className="w-4 h-4 text-blue-500" />
                                        <span>Gerando Memos dos Especialistas...</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <CheckCircle2 className="w-4 h-4 text-purple-500" />
                                        <span>Consolidando Decisões e Plano...</span>
                                    </div>
                                </div>
                            </div>
                        ) : result ? (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
                                {/* Result Output Area */}
                                <div className="lg:col-span-3 space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                                                Status: FINAL
                                            </Badge>
                                            <Badge variant="outline">
                                                Score de Utilidade: 92/100
                                            </Badge>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button variant="outline" size="sm">
                                                <Save className="w-4 h-4 mr-2" />
                                                Salvar no Prontuário
                                            </Button>
                                            <Button variant="default" size="sm">
                                                Exportar PDF
                                            </Button>
                                        </div>
                                    </div>

                                    <Card>
                                        <CardHeader className="bg-muted/30 pb-3">
                                            <CardTitle className="text-lg flex items-center gap-2">
                                                <FileText className="w-5 h-5" />
                                                Resultado da Análise MDT
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="p-0">
                                            <ScrollArea className="h-[600px] w-full p-6">
                                                <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
                                                    {result}
                                                </div>
                                            </ScrollArea>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center p-12 text-muted-foreground">
                                <Activity className="w-12 h-12 mb-4 opacity-20" />
                                <p>Preencha os dados na aba &quot;Dados do Caso&quot; para iniciar a análise.</p>
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </div>
    );
}
