'use client';

import { useState, useEffect } from 'react';
import { Brain, Save, RotateCcw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getAgentConfigs, saveAgentConfig } from './actions';

interface AIAgentConfig {
    id: string;
    name: string;
    type: string;
    description: string;
    provider: 'openai' | 'anthropic' | 'google';
    model: string;
    systemPrompt: string;
    userPromptTemplate: string;
    temperature: number;
    maxTokens: number;
    isActive: boolean;
}

const DEFAULT_AGENTS: AIAgentConfig[] = [
    {
        id: 'food_recognition',
        name: 'Food Recognition',
        type: 'food_recognition',
        description: 'Identifica alimentos em fotos e estima porções',
        provider: 'openai',
        model: 'gpt-4-vision-preview',
        systemPrompt: `You are an expert nutritionist and food recognition AI. Your task is to analyze meal photos and identify all foods present with their estimated portions in grams.

Be precise and conservative with portion estimates. Consider plate size, food density, and visual cues.

Return your analysis in JSON format with the following structure:
{
  "recognized_foods": [
    {
      "food_name": "string",
      "confidence": 0.0-1.0,
      "portion_grams": number,
      "notes": "string (optional)"
    }
  ],
  "confidence_score": 0.0-1.0
}`,
        userPromptTemplate: 'Analyze this meal photo and identify all foods with their portions.',
        temperature: 0.3,
        maxTokens: 1000,
        isActive: true,
    },
    {
        id: 'meal_planner',
        name: 'Meal Planner',
        type: 'meal_planner',
        description: 'Gera planos alimentares personalizados',
        provider: 'openai',
        model: 'gpt-4-turbo-preview',
        systemPrompt: `You are an expert nutritionist specializing in personalized meal planning. Create balanced, nutritious meal plans based on the patient's requirements.

Consider:
- Target calories and macro distribution
- Dietary preferences and restrictions
- Food variety and meal timing
- Cultural and regional food availability
- Practical cooking methods

Return your meal plan in JSON format with daily breakdowns including breakfast, lunch, dinner, and snacks.`,
        userPromptTemplate: `Create a {days_count}-day meal plan with:
- Target: {target_kcal} kcal/day
- Macros: {protein}% protein, {carbs}% carbs, {fat}% fat
- Preferences: {preferences}
- Restrictions: {restrictions}`,
        temperature: 0.7,
        maxTokens: 4000,
        isActive: true,
    },
    {
        id: 'patient_analyzer',
        name: 'Patient Analyzer',
        type: 'patient_analyzer',
        description: 'Analisa aderência e prevê risco de abandono',
        provider: 'anthropic',
        model: 'claude-3-sonnet-20240229',
        systemPrompt: `You are a clinical psychologist and data analyst specializing in patient adherence and retention. Analyze patient behavior patterns to predict dropout risk and suggest interventions.

Consider:
- Meal logging frequency and consistency
- Consultation attendance
- Symptom reporting patterns
- Progress trends
- Engagement metrics

Provide actionable insights and specific intervention recommendations.`,
        userPromptTemplate: `Analyze this patient's data:
- Recent meals: {recent_meals}
- Consultations: {consultations}
- Symptoms: {symptoms}

Provide adherence score, progress score, dropout risk level, insights, and recommended actions.`,
        temperature: 0.5,
        maxTokens: 2000,
        isActive: true,
    },
];

const AVAILABLE_MODELS = {
    openai: ['gpt-4-turbo-preview', 'gpt-4', 'gpt-3.5-turbo', 'gpt-4-vision-preview'],
    anthropic: ['claude-3-opus-20240229', 'claude-3-sonnet-20240229', 'claude-3-haiku-20240307'],
    google: ['gemini-pro', 'gemini-pro-vision', 'gemini-ultra'],
};

export default function AIAgentsConfigPage() {
    const [agents, setAgents] = useState<AIAgentConfig[]>(DEFAULT_AGENTS);
    const [selectedAgent, setSelectedAgent] = useState<string>(DEFAULT_AGENTS[0].id);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [hasChanges, setHasChanges] = useState(false);

    const currentAgent = agents.find((a) => a.id === selectedAgent);

    useEffect(() => {
        async function loadConfigs() {
            try {
                const res = await getAgentConfigs();
                if (res.success && res.data) {
                    const dbConfigs = res.data;

                    // Create a Map with defaults first
                    const agentMap = new Map<string, AIAgentConfig>();
                    DEFAULT_AGENTS.forEach(a => agentMap.set(a.id, a));

                    // Merge DB configs, overwriting or adding new
                    dbConfigs.forEach((dbAgent: any) => {
                        // If it exists in defaults, we merge fields. If new, we might need to map DB fields to UI shape carefully.
                        // For simplicity in this 'fix', we assume DB mirrors the UI structure or we map it.
                        // Note: If DB has an agent NOT in defaults, its 'type/description' might be missing if those aren't in DB.
                        // Assuming DB stores enough info or we accept 'Unknown Agent' as fallback.

                        const existing = agentMap.get(dbAgent.agent_id);
                        const merged: AIAgentConfig = {
                            id: dbAgent.agent_id,
                            name: existing?.name || dbAgent.agent_id, // Fallback name
                            type: existing?.type || 'custom',
                            description: existing?.description || 'Custom Agent',
                            provider: dbAgent.model_provider as any,
                            model: dbAgent.model_name,
                            systemPrompt: dbAgent.system_prompt,
                            userPromptTemplate: dbAgent.user_template || '',
                            temperature: Number(dbAgent.temperature),
                            maxTokens: Number(dbAgent.max_tokens),
                            isActive: dbAgent.is_active
                        };
                        agentMap.set(dbAgent.agent_id, merged);
                    });

                    setAgents(Array.from(agentMap.values()));

                    // If selected agent is no longer in list (unlikely), reset selection
                    if (!agentMap.has(selectedAgent)) {
                        setSelectedAgent(Array.from(agentMap.keys())[0]);
                    }
                }
            } catch (error) {
                toast.error("Erro ao carregar configurações");
            } finally {
                setIsLoading(false);
            }
        }
        loadConfigs();
    }, []);

    const updateAgent = (id: string, updates: Partial<AIAgentConfig>) => {
        setAgents(agents.map((a) => (a.id === id ? { ...a, ...updates } : a)));
        setHasChanges(true);
    };

    const resetAgent = (id: string) => {
        const defaultAgent = DEFAULT_AGENTS.find((a) => a.id === id);
        if (defaultAgent) {
            setAgents(agents.map((a) => (a.id === id ? { ...defaultAgent } : a)));
            setHasChanges(true);
            toast.success('Configuração resetada para padrão (não salvo)');
        }
    };

    const saveAgents = async () => {
        setIsSaving(true);
        try {
            const promises = agents.map(agent => saveAgentConfig(agent));
            await Promise.all(promises);
            toast.success('Todas as configurações foram salvas!');
            setHasChanges(false);
        } catch (error) {
            toast.error('Erro ao salvar configurações');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) return <div className="p-8 text-center text-muted-foreground">Carregando configurações...</div>;
    if (!currentAgent) return null;

    return (
        <div className="container mx-auto py-8 px-4 max-w-7xl">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        Configuração de AI Agents
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Configure provedores, prompts e parâmetros para cada agente
                    </p>
                </div>
                {hasChanges && (
                    <Button
                        onClick={saveAgents}
                        disabled={isSaving}
                        className="bg-emerald-600 hover:bg-emerald-700"
                    >
                        <Save className="w-4 h-4 mr-2" />
                        {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                    </Button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Agent List */}
                <div className="lg:col-span-1 space-y-2">
                    {agents.map((agent) => (
                        <Card
                            key={agent.id}
                            className={`cursor-pointer transition-colors ${selectedAgent === agent.id
                                ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/10'
                                : 'hover:border-gray-400'
                                }`}
                            onClick={() => setSelectedAgent(agent.id)}
                        >
                            <CardContent className="pt-4">
                                <div className="flex items-start justify-between mb-2">
                                    <Brain className="w-5 h-5 text-emerald-600" />
                                    {agent.isActive ? (
                                        <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400 text-xs">
                                            Ativo
                                        </Badge>
                                    ) : (
                                        <Badge variant="outline" className="text-xs">
                                            Inativo
                                        </Badge>
                                    )}
                                </div>
                                <h3 className="font-semibold text-sm mb-1">{agent.name}</h3>
                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                    {agent.description}
                                </p>
                                <div className="mt-2 flex items-center gap-2">
                                    <Badge variant="outline" className="text-xs">
                                        {agent.provider}
                                    </Badge>
                                    <span className="text-xs text-gray-500">{agent.model.split('-')[0]}</span>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Agent Configuration */}
                <div className="lg:col-span-3">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="flex items-center gap-2">
                                        <Brain className="w-6 h-6 text-emerald-600" />
                                        {currentAgent.name}
                                    </CardTitle>
                                    <CardDescription>{currentAgent.description}</CardDescription>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => resetAgent(currentAgent.id)}
                                >
                                    <RotateCcw className="w-4 h-4 mr-2" />
                                    Resetar
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Tabs defaultValue="provider" className="w-full">
                                <TabsList className="grid w-full grid-cols-3">
                                    <TabsTrigger value="provider">Provedor & Modelo</TabsTrigger>
                                    <TabsTrigger value="prompts">Prompts</TabsTrigger>
                                    <TabsTrigger value="parameters">Parâmetros</TabsTrigger>
                                </TabsList>

                                {/* Provider & Model Tab */}
                                <TabsContent value="provider" className="space-y-4 mt-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="provider">Provedor de IA</Label>
                                        <select
                                            id="provider"
                                            value={currentAgent.provider}
                                            onChange={(e) =>
                                                updateAgent(currentAgent.id, {
                                                    provider: e.target.value as any,
                                                    model: AVAILABLE_MODELS[e.target.value as keyof typeof AVAILABLE_MODELS][0],
                                                })
                                            }
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                                        >
                                            <option value="openai">OpenAI</option>
                                            <option value="anthropic">Anthropic (Claude)</option>
                                            <option value="google">Google (Gemini)</option>
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="model">Modelo</Label>
                                        <select
                                            id="model"
                                            value={currentAgent.model}
                                            onChange={(e) =>
                                                updateAgent(currentAgent.id, { model: e.target.value })
                                            }
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                                        >
                                            {AVAILABLE_MODELS[currentAgent.provider].map((model) => (
                                                <option key={model} value={model}>
                                                    {model}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg">
                                        <h4 className="font-semibold text-sm mb-2 text-blue-900 dark:text-blue-100">
                                            💡 Recomendações
                                        </h4>
                                        <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                                            <li>• GPT-4 Vision: Melhor para reconhecimento de imagens</li>
                                            <li>• Claude Opus: Melhor para análise complexa</li>
                                            <li>• GPT-4 Turbo: Melhor custo-benefício geral</li>
                                            <li>• Gemini Pro: Alternativa rápida e econômica</li>
                                        </ul>
                                    </div>
                                </TabsContent>

                                {/* Prompts Tab */}
                                <TabsContent value="prompts" className="space-y-4 mt-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="system-prompt">System Prompt (Papel do Agente)</Label>
                                        <Textarea
                                            id="system-prompt"
                                            value={currentAgent.systemPrompt}
                                            onChange={(e) =>
                                                updateAgent(currentAgent.id, { systemPrompt: e.target.value })
                                            }
                                            rows={12}
                                            className="font-mono text-sm"
                                            placeholder="Define o papel e comportamento do agente..."
                                        />
                                        <p className="text-xs text-gray-500">
                                            Define a personalidade, expertise e formato de resposta do agente
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="user-prompt">User Prompt Template</Label>
                                        <Textarea
                                            id="user-prompt"
                                            value={currentAgent.userPromptTemplate}
                                            onChange={(e) =>
                                                updateAgent(currentAgent.id, { userPromptTemplate: e.target.value })
                                            }
                                            rows={6}
                                            className="font-mono text-sm"
                                            placeholder="Template para as requisições do usuário..."
                                        />
                                        <p className="text-xs text-gray-500">
                                            Use variáveis como {'{target_kcal}'}, {'{preferences}'}, etc.
                                        </p>
                                    </div>
                                </TabsContent>

                                {/* Parameters Tab */}
                                <TabsContent value="parameters" className="space-y-4 mt-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="temperature">
                                            Temperature: {currentAgent.temperature}
                                        </Label>
                                        <input
                                            id="temperature"
                                            type="range"
                                            min="0"
                                            max="2"
                                            step="0.1"
                                            value={currentAgent.temperature}
                                            onChange={(e) =>
                                                updateAgent(currentAgent.id, {
                                                    temperature: parseFloat(e.target.value),
                                                })
                                            }
                                            className="w-full"
                                        />
                                        <div className="flex justify-between text-xs text-gray-500">
                                            <span>Mais Preciso (0)</span>
                                            <span>Mais Criativo (2)</span>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="max-tokens">Max Tokens</Label>
                                        <Input
                                            id="max-tokens"
                                            type="number"
                                            value={currentAgent.maxTokens}
                                            onChange={(e) =>
                                                updateAgent(currentAgent.id, {
                                                    maxTokens: parseInt(e.target.value),
                                                })
                                            }
                                            min="100"
                                            max="8000"
                                            step="100"
                                        />
                                        <p className="text-xs text-gray-500">
                                            Limite de tokens na resposta (afeta custo)
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <input
                                            id="is-active"
                                            type="checkbox"
                                            checked={currentAgent.isActive}
                                            onChange={(e) =>
                                                updateAgent(currentAgent.id, { isActive: e.target.checked })
                                            }
                                            className="w-4 h-4"
                                        />
                                        <Label htmlFor="is-active">Agente Ativo</Label>
                                    </div>

                                    <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-lg">
                                        <h4 className="font-semibold text-sm mb-2 text-amber-900 dark:text-amber-100">
                                            ⚙️ Guia de Parâmetros
                                        </h4>
                                        <ul className="text-sm text-amber-800 dark:text-amber-200 space-y-1">
                                            <li>
                                                • <strong>Temperature 0-0.3:</strong> Respostas consistentes e precisas
                                            </li>
                                            <li>
                                                • <strong>Temperature 0.7-1.0:</strong> Respostas criativas e variadas
                                            </li>
                                            <li>
                                                • <strong>Max Tokens:</strong> 1000-2000 para tarefas simples, 4000+ para
                                                complexas
                                            </li>
                                        </ul>
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
