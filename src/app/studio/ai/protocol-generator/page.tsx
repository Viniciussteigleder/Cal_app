'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Wand2, Plus, FileText, Clock, Users, CheckCircle, AlertCircle, Sparkles, Brain, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

interface ProtocolPhase {
    name: string;
    duration: number;
    rules: string[];
    allowedFoods: string[];
    forbiddenFoods: string[];
}

interface GeneratedProtocol {
    id: string;
    name: string;
    condition: string;
    createdDate: string;
    phases: ProtocolPhase[];
    expectedOutcomes: string[];
    monitoringPoints: string[];
    assignedPatients: number;
    status: 'draft' | 'active' | 'archived';
}

// Mock data
const mockProtocols: GeneratedProtocol[] = [
    {
        id: '1',
        name: 'Protocolo Personalizado - Síndrome do Intestino Irritável',
        condition: 'Síndrome do Intestino Irritável (SII)',
        createdDate: '2026-01-15',
        phases: [
            {
                name: 'Fase 1: Eliminação Inicial',
                duration: 14,
                rules: [
                    'Eliminar todos os alimentos FODMAP alto',
                    'Manter diário alimentar detalhado',
                    'Evitar alimentos processados',
                ],
                allowedFoods: ['Arroz', 'Frango', 'Cenoura', 'Espinafre', 'Banana'],
                forbiddenFoods: ['Trigo', 'Cebola', 'Alho', 'Laticínios', 'Leguminosas'],
            },
            {
                name: 'Fase 2: Reintrodução Gradual',
                duration: 28,
                rules: [
                    'Reintroduzir um grupo FODMAP por vez',
                    'Aguardar 3 dias entre reintroduções',
                    'Registrar sintomas imediatamente',
                ],
                allowedFoods: ['Alimentos da Fase 1', 'Grupos FODMAP testados'],
                forbiddenFoods: ['Grupos FODMAP ainda não testados'],
            },
            {
                name: 'Fase 3: Personalização',
                duration: 0,
                rules: [
                    'Manter alimentos bem tolerados',
                    'Evitar gatilhos identificados',
                    'Revisar a cada 3 meses',
                ],
                allowedFoods: ['Alimentos bem tolerados identificados'],
                forbiddenFoods: ['Gatilhos identificados'],
            },
        ],
        expectedOutcomes: [
            'Redução de 70-80% nos sintomas em 6 semanas',
            'Identificação de gatilhos alimentares específicos',
            'Melhora na qualidade de vida',
        ],
        monitoringPoints: [
            'Frequência e intensidade de sintomas',
            'Qualidade das evacuações',
            'Níveis de energia',
            'Qualidade do sono',
        ],
        assignedPatients: 3,
        status: 'active',
    },
];

export default function ProtocolGeneratorPage() {
    const [isGenerateOpen, setIsGenerateOpen] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generationProgress, setGenerationProgress] = useState(0);

    // Form state
    const [patientId, setPatientId] = useState('');
    const [condition, setCondition] = useState('');
    const [customCondition, setCustomCondition] = useState('');
    const [goals, setGoals] = useState<string[]>([]);
    const [restrictions, setRestrictions] = useState<string[]>([]);
    const [duration, setDuration] = useState('90');
    const [additionalNotes, setAdditionalNotes] = useState('');

    const handleGenerateProtocol = () => {
        setIsGenerating(true);
        setGenerationProgress(0);

        // Simulate AI generation with progress
        const interval = setInterval(() => {
            setGenerationProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setTimeout(() => {
                        toast.success('Protocolo gerado com sucesso!');
                        setIsGenerating(false);
                        setIsGenerateOpen(false);
                        setGenerationProgress(0);
                    }, 500);
                    return 100;
                }
                return prev + 10;
            });
        }, 300);
    };

    const toggleGoal = (goal: string) => {
        setGoals((prev) =>
            prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]
        );
    };

    const toggleRestriction = (restriction: string) => {
        setRestrictions((prev) =>
            prev.includes(restriction) ? prev.filter((r) => r !== restriction) : [...prev, restriction]
        );
    };

    const availableGoals = [
        'Reduzir sintomas digestivos',
        'Perda de peso',
        'Ganho de massa muscular',
        'Melhorar energia',
        'Controlar glicemia',
        'Reduzir inflamação',
        'Melhorar sono',
        'Aumentar imunidade',
    ];

    const availableRestrictions = [
        'Sem glúten',
        'Sem lactose',
        'Sem FODMAP',
        'Vegetariano',
        'Vegano',
        'Sem açúcar',
        'Baixo sódio',
        'Sem histamina',
    ];

    return (
        <DashboardLayout role="nutritionist">
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <Wand2 className="h-8 w-8 text-primary" />
                        Gerador de Protocolos com IA
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Crie protocolos nutricionais personalizados automaticamente com inteligência artificial
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Protocolos Gerados</p>
                                    <p className="text-2xl font-bold">12</p>
                                </div>
                                <FileText className="w-8 h-8 text-emerald-600 opacity-20" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Protocolos Ativos</p>
                                    <p className="text-2xl font-bold">8</p>
                                </div>
                                <CheckCircle className="w-8 h-8 text-blue-600 opacity-20" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Pacientes Ativos</p>
                                    <p className="text-2xl font-bold">15</p>
                                </div>
                                <Users className="w-8 h-8 text-purple-600 opacity-20" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Taxa de Sucesso</p>
                                    <p className="text-2xl font-bold text-emerald-600">85%</p>
                                </div>
                                <TrendingUp className="w-8 h-8 text-emerald-600 opacity-20" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Generate Button */}
                <div className="flex justify-end">
                    <Dialog open={isGenerateOpen} onOpenChange={setIsGenerateOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-emerald-600 hover:bg-emerald-700">
                                <Sparkles className="h-4 w-4 mr-2" />
                                Gerar Novo Protocolo
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Gerar Protocolo Personalizado com IA</DialogTitle>
                                <DialogDescription>
                                    Preencha as informações para gerar um protocolo nutricional personalizado
                                </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-6 py-4">
                                {/* Patient Selection */}
                                <div className="space-y-2">
                                    <Label>Paciente</Label>
                                    <Select value={patientId} onValueChange={setPatientId}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione o paciente" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="1">Maria Silva</SelectItem>
                                            <SelectItem value="2">João Santos</SelectItem>
                                            <SelectItem value="3">Ana Costa</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Condition */}
                                <div className="space-y-2">
                                    <Label>Condição Principal</Label>
                                    <Select value={condition} onValueChange={setCondition}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione a condição" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="ibs">Síndrome do Intestino Irritável</SelectItem>
                                            <SelectItem value="diabetes">Diabetes Tipo 2</SelectItem>
                                            <SelectItem value="hypertension">Hipertensão</SelectItem>
                                            <SelectItem value="obesity">Obesidade</SelectItem>
                                            <SelectItem value="gerd">Refluxo Gastroesofágico</SelectItem>
                                            <SelectItem value="crohn">Doença de Crohn</SelectItem>
                                            <SelectItem value="celiac">Doença Celíaca</SelectItem>
                                            <SelectItem value="custom">Outra (especificar)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {condition === 'custom' && (
                                    <div className="space-y-2">
                                        <Label>Especifique a Condição</Label>
                                        <Input
                                            placeholder="Digite a condição..."
                                            value={customCondition}
                                            onChange={(e) => setCustomCondition(e.target.value)}
                                        />
                                    </div>
                                )}

                                {/* Goals */}
                                <div className="space-y-3">
                                    <Label>Objetivos do Protocolo</Label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {availableGoals.map((goal) => (
                                            <div key={goal} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={goal}
                                                    checked={goals.includes(goal)}
                                                    onCheckedChange={() => toggleGoal(goal)}
                                                />
                                                <label
                                                    htmlFor={goal}
                                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                                >
                                                    {goal}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Restrictions */}
                                <div className="space-y-3">
                                    <Label>Restrições Alimentares</Label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {availableRestrictions.map((restriction) => (
                                            <div key={restriction} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={restriction}
                                                    checked={restrictions.includes(restriction)}
                                                    onCheckedChange={() => toggleRestriction(restriction)}
                                                />
                                                <label
                                                    htmlFor={restriction}
                                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                                >
                                                    {restriction}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Duration */}
                                <div className="space-y-2">
                                    <Label>Duração Total do Protocolo (dias)</Label>
                                    <Select value={duration} onValueChange={setDuration}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="30">30 dias (1 mês)</SelectItem>
                                            <SelectItem value="60">60 dias (2 meses)</SelectItem>
                                            <SelectItem value="90">90 dias (3 meses)</SelectItem>
                                            <SelectItem value="120">120 dias (4 meses)</SelectItem>
                                            <SelectItem value="180">180 dias (6 meses)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Additional Notes */}
                                <div className="space-y-2">
                                    <Label>Observações Adicionais</Label>
                                    <Textarea
                                        placeholder="Adicione informações relevantes sobre o paciente, preferências alimentares, histórico, etc..."
                                        value={additionalNotes}
                                        onChange={(e) => setAdditionalNotes(e.target.value)}
                                        rows={4}
                                    />
                                </div>

                                {/* AI Info */}
                                <div className="bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900 rounded-lg p-4">
                                    <div className="flex gap-3">
                                        <Brain className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <h4 className="font-medium text-purple-900 dark:text-purple-100 text-sm">
                                                Geração com IA Avançada
                                            </h4>
                                            <p className="text-xs text-purple-700 dark:text-purple-300 mt-1">
                                                Nossa IA irá analisar a condição, objetivos e restrições para criar um protocolo
                                                personalizado com fases progressivas, listas de alimentos permitidos/proibidos,
                                                regras específicas e pontos de monitoramento.
                                            </p>
                                            <p className="text-xs text-purple-600 dark:text-purple-400 mt-2 font-medium">
                                                Custo: 50 créditos (R$ 1,00)
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Generation Progress */}
                                {isGenerating && (
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="font-medium">Gerando protocolo...</span>
                                            <span className="text-muted-foreground">{generationProgress}%</span>
                                        </div>
                                        <Progress value={generationProgress} className="h-2" />
                                        <p className="text-xs text-muted-foreground">
                                            {generationProgress < 30 && 'Analisando condição e objetivos...'}
                                            {generationProgress >= 30 && generationProgress < 60 && 'Criando fases do protocolo...'}
                                            {generationProgress >= 60 && generationProgress < 90 && 'Definindo listas de alimentos...'}
                                            {generationProgress >= 90 && 'Finalizando protocolo...'}
                                        </p>
                                    </div>
                                )}
                            </div>

                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsGenerateOpen(false)} disabled={isGenerating}>
                                    Cancelar
                                </Button>
                                <Button
                                    className="bg-emerald-600 hover:bg-emerald-700"
                                    onClick={handleGenerateProtocol}
                                    disabled={!patientId || !condition || isGenerating}
                                >
                                    {isGenerating ? (
                                        <>
                                            <Brain className="h-4 w-4 mr-2 animate-spin" />
                                            Gerando...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="h-4 w-4 mr-2" />
                                            Gerar Protocolo
                                        </>
                                    )}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Protocols List */}
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold">Protocolos Gerados</h2>
                    {mockProtocols.map((protocol) => (
                        <Card key={protocol.id} className="overflow-hidden">
                            <CardHeader className="bg-muted/50">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <CardTitle className="text-lg">{protocol.name}</CardTitle>
                                        <CardDescription className="mt-1">
                                            Condição: {protocol.condition} • Criado em:{' '}
                                            {new Date(protocol.createdDate).toLocaleDateString('pt-BR')}
                                        </CardDescription>
                                    </div>
                                    <div className="flex gap-2">
                                        <Badge className="bg-emerald-100 text-emerald-800">
                                            <CheckCircle className="w-3 h-3 mr-1" />
                                            Ativo
                                        </Badge>
                                        <Badge variant="outline">
                                            <Users className="w-3 h-3 mr-1" />
                                            {protocol.assignedPatients} pacientes
                                        </Badge>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-6 space-y-6">
                                {/* Phases */}
                                <div>
                                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                                        <Clock className="w-4 h-4" />
                                        Fases do Protocolo
                                    </h3>
                                    <div className="space-y-4">
                                        {protocol.phases.map((phase, idx) => (
                                            <div key={idx} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                                                <div className="flex items-start justify-between mb-3">
                                                    <div>
                                                        <h4 className="font-medium">{phase.name}</h4>
                                                        <p className="text-sm text-muted-foreground mt-1">
                                                            {phase.duration > 0 ? `${phase.duration} dias` : 'Duração indefinida'}
                                                        </p>
                                                    </div>
                                                    <Badge variant="outline">Fase {idx + 1}</Badge>
                                                </div>

                                                <div className="space-y-3">
                                                    <div>
                                                        <p className="text-sm font-medium mb-2">Regras:</p>
                                                        <ul className="space-y-1">
                                                            {phase.rules.map((rule, rIdx) => (
                                                                <li key={rIdx} className="text-sm text-muted-foreground flex gap-2">
                                                                    <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                                                                    {rule}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                            <p className="text-sm font-medium mb-2 text-emerald-600">Alimentos Permitidos:</p>
                                                            <div className="flex flex-wrap gap-1">
                                                                {phase.allowedFoods.map((food, fIdx) => (
                                                                    <Badge key={fIdx} variant="outline" className="text-xs bg-emerald-50 dark:bg-emerald-950/20">
                                                                        {food}
                                                                    </Badge>
                                                                ))}
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium mb-2 text-red-600">Alimentos Proibidos:</p>
                                                            <div className="flex flex-wrap gap-1">
                                                                {phase.forbiddenFoods.map((food, fIdx) => (
                                                                    <Badge key={fIdx} variant="outline" className="text-xs bg-red-50 dark:bg-red-950/20">
                                                                        {food}
                                                                    </Badge>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Expected Outcomes */}
                                <div>
                                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                                        <TrendingUp className="w-4 h-4" />
                                        Resultados Esperados
                                    </h3>
                                    <ul className="space-y-2">
                                        {protocol.expectedOutcomes.map((outcome, idx) => (
                                            <li key={idx} className="flex gap-2 text-sm">
                                                <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                                                {outcome}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Monitoring Points */}
                                <div>
                                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                                        <AlertCircle className="w-4 h-4" />
                                        Pontos de Monitoramento
                                    </h3>
                                    <div className="grid grid-cols-2 gap-2">
                                        {protocol.monitoringPoints.map((point, idx) => (
                                            <div key={idx} className="flex gap-2 text-sm p-2 bg-muted/50 rounded">
                                                <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 flex-shrink-0" />
                                                {point}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2 pt-4 border-t">
                                    <Button variant="outline" size="sm">
                                        <FileText className="w-4 h-4 mr-2" />
                                        Ver Detalhes Completos
                                    </Button>
                                    <Button variant="outline" size="sm">
                                        Editar Protocolo
                                    </Button>
                                    <Button variant="outline" size="sm">
                                        Atribuir a Paciente
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </DashboardLayout>
    );
}
