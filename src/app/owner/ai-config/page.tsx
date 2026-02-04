'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Brain, Settings, DollarSign, TrendingUp, Save, RotateCcw, Copy, Trash2, Plus } from 'lucide-react';

interface AIAgentConfig {
    id: string;
    name: string;
    description: string;
    status: 'active' | 'inactive';
    prompt: {
        system: string;
        userTemplate: string;
        variables: string[];
    };
    model: {
        provider: 'openai' | 'anthropic';
        modelName: string;
        temperature: number;
        maxTokens: number;
    };
    role: {
        persona: string;
        expertise: string[];
        tone: 'professional' | 'friendly' | 'empathetic';
    };
    examples: {
        input: string;
        output: string;
        explanation: string;
    }[];
    costControl: {
        maxCostPerExecution: number;
        dailyBudget: number;
        monthlyBudget: number;
        alertThreshold: number;
    };
    performance: {
        successRate: number;
        avgResponseTime: number;
        totalExecutions: number;
        avgCost: number;
    };
}

const defaultAgents: AIAgentConfig[] = [
    {
        id: 'meal-planner',
        name: 'Planejador de Refeições',
        description: 'Cria planos alimentares personalizados baseados em metas e restrições',
        status: 'active',
        prompt: {
            system: 'Você é um nutricionista especialista com 20 anos de experiência em planejamento alimentar.',
            userTemplate: 'Crie um plano alimentar para {{patient_name}} com {{target_calories}} calorias, considerando {{restrictions}}.',
            variables: ['patient_name', 'target_calories', 'restrictions', 'goals'],
        },
        model: {
            provider: 'openai',
            modelName: 'gpt-4-turbo-preview',
            temperature: 0.7,
            maxTokens: 2000,
        },
        role: {
            persona: 'Nutricionista experiente e empático',
            expertise: ['Planejamento alimentar', 'Nutrição clínica', 'Restrições alimentares'],
            tone: 'professional',
        },
        examples: [],
        costControl: {
            maxCostPerExecution: 0.10,
            dailyBudget: 20.00,
            monthlyBudget: 500.00,
            alertThreshold: 0.80,
        },
        performance: {
            successRate: 98.5,
            avgResponseTime: 3.2,
            totalExecutions: 1245,
            avgCost: 0.045,
        },
    },
    {
        id: 'patient-analyzer',
        name: 'Analisador de Paciente',
        description: 'Analisa dados do paciente sob múltiplas perspectivas de especialistas',
        status: 'active',
        prompt: {
            system: 'Você é um painel de 4 especialistas: médico clínico, nutricionista, psicólogo e médico funcional.',
            userTemplate: 'Analise o paciente {{patient_name}} com os seguintes dados: {{patient_data}}',
            variables: ['patient_name', 'patient_data', 'history'],
        },
        model: {
            provider: 'openai',
            modelName: 'gpt-4-turbo-preview',
            temperature: 0.5,
            maxTokens: 3000,
        },
        role: {
            persona: 'Painel de especialistas multidisciplinares',
            expertise: ['Medicina clínica', 'Nutrição', 'Psicologia', 'Medicina funcional'],
            tone: 'professional',
        },
        examples: [],
        costControl: {
            maxCostPerExecution: 0.15,
            dailyBudget: 25.00,
            monthlyBudget: 600.00,
            alertThreshold: 0.80,
        },
        performance: {
            successRate: 97.2,
            avgResponseTime: 4.8,
            totalExecutions: 856,
            avgCost: 0.068,
        },
    },
    {
        id: 'food-recognition',
        name: 'Reconhecimento de Alimentos',
        description: 'Identifica alimentos em fotos e estima valores nutricionais',
        status: 'active',
        prompt: {
            system: 'Você é um especialista em identificação de alimentos e estimativa de porções.',
            userTemplate: 'Identifique os alimentos nesta imagem e estime as quantidades e valores nutricionais.',
            variables: ['image_url', 'patient_restrictions'],
        },
        model: {
            provider: 'openai',
            modelName: 'gpt-4-vision-preview',
            temperature: 0.3,
            maxTokens: 1500,
        },
        role: {
            persona: 'Especialista em análise visual de alimentos',
            expertise: ['Identificação de alimentos', 'Estimativa de porções', 'Análise nutricional'],
            tone: 'professional',
        },
        examples: [],
        costControl: {
            maxCostPerExecution: 0.08,
            dailyBudget: 15.00,
            monthlyBudget: 400.00,
            alertThreshold: 0.80,
        },
        performance: {
            successRate: 94.8,
            avgResponseTime: 2.5,
            totalExecutions: 2134,
            avgCost: 0.042,
        },
    },
];

export default function AIConfigPage() {
    const [agents, setAgents] = useState<AIAgentConfig[]>(defaultAgents);
    const [selectedAgent, setSelectedAgent] = useState<string>(defaultAgents[0].id);
    const [hasChanges, setHasChanges] = useState(false);

    const currentAgent = agents.find(a => a.id === selectedAgent) || agents[0];

    const updateAgent = (updates: Partial<AIAgentConfig>) => {
        setAgents(prev => prev.map(a =>
            a.id === selectedAgent ? { ...a, ...updates } : a
        ));
        setHasChanges(true);
    };

    const saveChanges = async () => {
        // TODO: Save to API
        console.log('Saving changes:', agents);
        setHasChanges(false);
    };

    const resetChanges = () => {
        setAgents(defaultAgents);
        setHasChanges(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-emerald-950/20 to-slate-950 p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-bold text-white mb-2">
                            Configuração de Agentes de IA
                        </h1>
                        <p className="text-slate-400">
                            Configure prompts, modelos e controles de custo para cada agente de IA
                        </p>
                    </div>
                    <div className="flex gap-3">
                        {hasChanges && (
                            <Button
                                variant="outline"
                                onClick={resetChanges}
                                className="border-slate-700 hover:bg-slate-800"
                            >
                                <RotateCcw className="w-4 h-4 mr-2" />
                                Descartar
                            </Button>
                        )}
                        <Button
                            onClick={saveChanges}
                            disabled={!hasChanges}
                            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                        >
                            <Save className="w-4 h-4 mr-2" />
                            Salvar Alterações
                        </Button>
                    </div>
                </div>

                {/* Agent Selector */}
                <Card className="bg-slate-900/50 border-slate-800">
                    <CardHeader>
                        <CardTitle className="text-white">Selecionar Agente</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-3 gap-4">
                            {agents.map(agent => (
                                <button
                                    key={agent.id}
                                    onClick={() => setSelectedAgent(agent.id)}
                                    className={`p-4 rounded-lg border-2 transition-all text-left ${selectedAgent === agent.id
                                            ? 'border-emerald-500 bg-emerald-500/10'
                                            : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                                        }`}
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <Brain className="w-5 h-5 text-emerald-400" />
                                        <Badge variant={agent.status === 'active' ? 'default' : 'secondary'}>
                                            {agent.status === 'active' ? 'Ativo' : 'Inativo'}
                                        </Badge>
                                    </div>
                                    <h3 className="font-semibold text-white mb-1">{agent.name}</h3>
                                    <p className="text-sm text-slate-400 line-clamp-2">{agent.description}</p>
                                    <div className="mt-3 flex items-center gap-4 text-xs text-slate-500">
                                        <span>{agent.performance.totalExecutions} execuções</span>
                                        <span>{agent.performance.successRate}% sucesso</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Configuration Tabs */}
                <Tabs defaultValue="prompt" className="space-y-6">
                    <TabsList className="bg-slate-900/50 border border-slate-800">
                        <TabsTrigger value="prompt">
                            <Settings className="w-4 h-4 mr-2" />
                            Prompt
                        </TabsTrigger>
                        <TabsTrigger value="model">
                            <Brain className="w-4 h-4 mr-2" />
                            Modelo
                        </TabsTrigger>
                        <TabsTrigger value="cost">
                            <DollarSign className="w-4 h-4 mr-2" />
                            Custos
                        </TabsTrigger>
                        <TabsTrigger value="performance">
                            <TrendingUp className="w-4 h-4 mr-2" />
                            Performance
                        </TabsTrigger>
                    </TabsList>

                    {/* Prompt Configuration */}
                    <TabsContent value="prompt" className="space-y-6">
                        <Card className="bg-slate-900/50 border-slate-800">
                            <CardHeader>
                                <CardTitle className="text-white">Configuração de Prompt</CardTitle>
                                <CardDescription>
                                    Configure o prompt do sistema e template de usuário
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-2">
                                    <Label className="text-white">Prompt do Sistema</Label>
                                    <Textarea
                                        value={currentAgent.prompt.system}
                                        onChange={(e) => updateAgent({
                                            prompt: { ...currentAgent.prompt, system: e.target.value }
                                        })}
                                        rows={4}
                                        className="bg-slate-800 border-slate-700 text-white"
                                        placeholder="Defina a personalidade e expertise do agente..."
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-white">Template de Usuário</Label>
                                    <Textarea
                                        value={currentAgent.prompt.userTemplate}
                                        onChange={(e) => updateAgent({
                                            prompt: { ...currentAgent.prompt, userTemplate: e.target.value }
                                        })}
                                        rows={6}
                                        className="bg-slate-800 border-slate-700 text-white font-mono text-sm"
                                        placeholder="Use {{variavel}} para placeholders..."
                                    />
                                    <p className="text-sm text-slate-400">
                                        Variáveis disponíveis: {currentAgent.prompt.variables.map(v => `{{${v}}}`).join(', ')}
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-white">Persona e Tom</Label>
                                    <Input
                                        value={currentAgent.role.persona}
                                        onChange={(e) => updateAgent({
                                            role: { ...currentAgent.role, persona: e.target.value }
                                        })}
                                        className="bg-slate-800 border-slate-700 text-white"
                                        placeholder="Ex: Nutricionista experiente e empático"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-white">Tom de Voz</Label>
                                    <Select
                                        value={currentAgent.role.tone}
                                        onValueChange={(value: any) => updateAgent({
                                            role: { ...currentAgent.role, tone: value }
                                        })}
                                    >
                                        <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="professional">Profissional</SelectItem>
                                            <SelectItem value="friendly">Amigável</SelectItem>
                                            <SelectItem value="empathetic">Empático</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Model Configuration */}
                    <TabsContent value="model" className="space-y-6">
                        <Card className="bg-slate-900/50 border-slate-800">
                            <CardHeader>
                                <CardTitle className="text-white">Configuração do Modelo</CardTitle>
                                <CardDescription>
                                    Escolha o modelo de IA e ajuste parâmetros
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-white">Provedor</Label>
                                        <Select
                                            value={currentAgent.model.provider}
                                            onValueChange={(value: any) => updateAgent({
                                                model: { ...currentAgent.model, provider: value }
                                            })}
                                        >
                                            <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="openai">OpenAI</SelectItem>
                                                <SelectItem value="anthropic">Anthropic</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-white">Modelo</Label>
                                        <Select
                                            value={currentAgent.model.modelName}
                                            onValueChange={(value) => updateAgent({
                                                model: { ...currentAgent.model, modelName: value }
                                            })}
                                        >
                                            <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="gpt-4-turbo-preview">GPT-4 Turbo</SelectItem>
                                                <SelectItem value="gpt-4">GPT-4</SelectItem>
                                                <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                                                <SelectItem value="gpt-4-vision-preview">GPT-4 Vision</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-white">Temperatura: {currentAgent.model.temperature}</Label>
                                        <span className="text-sm text-slate-400">
                                            {currentAgent.model.temperature < 0.3 ? 'Preciso' :
                                                currentAgent.model.temperature < 0.7 ? 'Balanceado' : 'Criativo'}
                                        </span>
                                    </div>
                                    <Slider
                                        value={[currentAgent.model.temperature]}
                                        onValueChange={([value]) => updateAgent({
                                            model: { ...currentAgent.model, temperature: value }
                                        })}
                                        min={0}
                                        max={2}
                                        step={0.1}
                                        className="py-4"
                                    />
                                    <p className="text-sm text-slate-400">
                                        Valores baixos (0.0-0.3) = respostas mais consistentes e precisas<br />
                                        Valores altos (0.7-2.0) = respostas mais criativas e variadas
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-white">Máximo de Tokens: {currentAgent.model.maxTokens}</Label>
                                    <Slider
                                        value={[currentAgent.model.maxTokens]}
                                        onValueChange={([value]) => updateAgent({
                                            model: { ...currentAgent.model, maxTokens: value }
                                        })}
                                        min={500}
                                        max={4000}
                                        step={100}
                                        className="py-4"
                                    />
                                    <p className="text-sm text-slate-400">
                                        Limite de tokens na resposta (1 token ≈ 0.75 palavras)
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Cost Control */}
                    <TabsContent value="cost" className="space-y-6">
                        <Card className="bg-slate-900/50 border-slate-800">
                            <CardHeader>
                                <CardTitle className="text-white">Controle de Custos</CardTitle>
                                <CardDescription>
                                    Defina limites de gastos e alertas
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-white">Custo Máximo por Execução</Label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                                            <Input
                                                type="number"
                                                value={currentAgent.costControl.maxCostPerExecution}
                                                onChange={(e) => updateAgent({
                                                    costControl: { ...currentAgent.costControl, maxCostPerExecution: parseFloat(e.target.value) }
                                                })}
                                                step="0.01"
                                                className="bg-slate-800 border-slate-700 text-white pl-8"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-white">Orçamento Diário</Label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                                            <Input
                                                type="number"
                                                value={currentAgent.costControl.dailyBudget}
                                                onChange={(e) => updateAgent({
                                                    costControl: { ...currentAgent.costControl, dailyBudget: parseFloat(e.target.value) }
                                                })}
                                                step="1"
                                                className="bg-slate-800 border-slate-700 text-white pl-8"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-white">Orçamento Mensal</Label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                                            <Input
                                                type="number"
                                                value={currentAgent.costControl.monthlyBudget}
                                                onChange={(e) => updateAgent({
                                                    costControl: { ...currentAgent.costControl, monthlyBudget: parseFloat(e.target.value) }
                                                })}
                                                step="10"
                                                className="bg-slate-800 border-slate-700 text-white pl-8"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-white">Alerta em: {(currentAgent.costControl.alertThreshold * 100).toFixed(0)}%</Label>
                                        <Slider
                                            value={[currentAgent.costControl.alertThreshold * 100]}
                                            onValueChange={([value]) => updateAgent({
                                                costControl: { ...currentAgent.costControl, alertThreshold: value / 100 }
                                            })}
                                            min={50}
                                            max={95}
                                            step={5}
                                            className="py-4"
                                        />
                                    </div>
                                </div>

                                <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                                    <p className="text-sm text-amber-200">
                                        <strong>Nota:</strong> Quando o orçamento atingir {(currentAgent.costControl.alertThreshold * 100).toFixed(0)}%,
                                        você receberá um alerta. O agente será pausado automaticamente ao atingir 100% do orçamento.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Performance */}
                    <TabsContent value="performance" className="space-y-6">
                        <div className="grid grid-cols-4 gap-6">
                            <Card className="bg-slate-900/50 border-slate-800">
                                <CardHeader className="pb-3">
                                    <CardDescription>Taxa de Sucesso</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold text-emerald-400">
                                        {currentAgent.performance.successRate}%
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-slate-900/50 border-slate-800">
                                <CardHeader className="pb-3">
                                    <CardDescription>Tempo Médio</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold text-blue-400">
                                        {currentAgent.performance.avgResponseTime}s
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-slate-900/50 border-slate-800">
                                <CardHeader className="pb-3">
                                    <CardDescription>Total de Execuções</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold text-purple-400">
                                        {currentAgent.performance.totalExecutions.toLocaleString()}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-slate-900/50 border-slate-800">
                                <CardHeader className="pb-3">
                                    <CardDescription>Custo Médio</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold text-amber-400">
                                        ${currentAgent.performance.avgCost.toFixed(3)}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
