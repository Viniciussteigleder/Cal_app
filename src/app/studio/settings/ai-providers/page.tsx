'use client';

import { useState, useEffect } from 'react';
import { Key, Save, Eye, EyeOff, Plus, Trash2, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface AIProvider {
    id: string;
    name: string;
    type: 'openai' | 'anthropic' | 'google';
    apiKey: string;
    isActive: boolean;
    models: string[];
    defaultModel: string;
}

const PROVIDER_INFO = {
    openai: {
        name: 'OpenAI',
        logo: '🤖',
        models: ['gpt-4-turbo-preview', 'gpt-4', 'gpt-3.5-turbo', 'gpt-4-vision-preview'],
        apiKeyFormat: 'sk-proj-...',
        docsUrl: 'https://platform.openai.com/api-keys',
    },
    anthropic: {
        name: 'Anthropic (Claude)',
        logo: '🧠',
        models: ['claude-3-opus-20240229', 'claude-3-sonnet-20240229', 'claude-3-haiku-20240307'],
        apiKeyFormat: 'sk-ant-...',
        docsUrl: 'https://console.anthropic.com/',
    },
    google: {
        name: 'Google (Gemini)',
        logo: '✨',
        models: ['gemini-pro', 'gemini-pro-vision', 'gemini-ultra'],
        apiKeyFormat: 'AIza...',
        docsUrl: 'https://makersuite.google.com/app/apikey',
    },
};

export default function AIProvidersSettingsPage() {
    const [providers, setProviders] = useState<AIProvider[]>([]);
    const [showKeys, setShowKeys] = useState<{ [key: string]: boolean }>({});
    const [isSaving, setIsSaving] = useState(false);
    const [editingProvider, setEditingProvider] = useState<string | null>(null);

    useEffect(() => {
        loadProviders();
    }, []);

    const loadProviders = async () => {
        // TODO: Fetch from API
        // Mock data for now
        const mockProviders: AIProvider[] = [
            {
                id: '1',
                name: 'OpenAI',
                type: 'openai',
                apiKey: 'sk-proj-...',
                isActive: true,
                models: PROVIDER_INFO.openai.models,
                defaultModel: 'gpt-4-turbo-preview',
            },
        ];
        setProviders(mockProviders);
    };

    const addProvider = (type: 'openai' | 'anthropic' | 'google') => {
        const newProvider: AIProvider = {
            id: Date.now().toString(),
            name: PROVIDER_INFO[type].name,
            type,
            apiKey: '',
            isActive: false,
            models: PROVIDER_INFO[type].models,
            defaultModel: PROVIDER_INFO[type].models[0],
        };
        setProviders([...providers, newProvider]);
        setEditingProvider(newProvider.id);
    };

    const updateProvider = (id: string, updates: Partial<AIProvider>) => {
        setProviders(providers.map((p) => (p.id === id ? { ...p, ...updates } : p)));
    };

    const deleteProvider = (id: string) => {
        setProviders(providers.filter((p) => p.id !== id));
        toast.success('Provider removido');
    };

    const saveProviders = async () => {
        setIsSaving(true);
        try {
            // TODO: Call API to save providers
            await new Promise((resolve) => setTimeout(resolve, 1000));
            toast.success('Configurações salvas!');
            setEditingProvider(null);
        } catch (error) {
            toast.error('Erro ao salvar configurações');
        } finally {
            setIsSaving(false);
        }
    };

    const testProvider = async (provider: AIProvider) => {
        if (!provider.apiKey) {
            toast.error('Adicione uma API key primeiro');
            return;
        }

        toast.loading('Testando conexão...');
        try {
            // TODO: Call API to test provider
            await new Promise((resolve) => setTimeout(resolve, 2000));
            toast.success(`✅ ${provider.name} conectado com sucesso!`);
            updateProvider(provider.id, { isActive: true });
        } catch (error) {
            toast.error(`❌ Falha ao conectar com ${provider.name}`);
            updateProvider(provider.id, { isActive: false });
        }
    };

    const toggleShowKey = (id: string) => {
        setShowKeys({ ...showKeys, [id]: !showKeys[id] });
    };

    const maskApiKey = (key: string) => {
        if (!key) return '';
        if (key.length < 10) return '••••••••';
        return key.substring(0, 8) + '••••••••' + key.substring(key.length - 4);
    };

    return (
        <div className="container mx-auto py-8 px-4 max-w-6xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    Provedores de IA
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                    Configure suas API keys e gerencie provedores de IA
                </p>
            </div>

            {/* Add Provider Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {Object.entries(PROVIDER_INFO).map(([type, info]) => {
                    const hasProvider = providers.some((p) => p.type === type);
                    return (
                        <Card
                            key={type}
                            className={`cursor-pointer hover:border-emerald-500 transition-colors ${hasProvider ? 'opacity-50' : ''
                                }`}
                            onClick={() => !hasProvider && addProvider(type as any)}
                        >
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className="text-4xl">{info.logo}</span>
                                        <div>
                                            <p className="font-semibold">{info.name}</p>
                                            <p className="text-xs text-gray-500">{info.models.length} modelos</p>
                                        </div>
                                    </div>
                                    {hasProvider ? (
                                        <CheckCircle className="w-5 h-5 text-emerald-600" />
                                    ) : (
                                        <Plus className="w-5 h-5 text-gray-400" />
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Provider Cards */}
            <div className="space-y-6">
                {providers.map((provider) => {
                    const info = PROVIDER_INFO[provider.type];
                    const isEditing = editingProvider === provider.id;

                    return (
                        <Card key={provider.id}>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className="text-3xl">{info.logo}</span>
                                        <div>
                                            <CardTitle>{provider.name}</CardTitle>
                                            <CardDescription>
                                                {provider.isActive ? (
                                                    <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400">
                                                        ✓ Ativo
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="outline">Inativo</Badge>
                                                )}
                                            </CardDescription>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {!isEditing && (
                                            <>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setEditingProvider(provider.id)}
                                                >
                                                    Editar
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => deleteProvider(provider.id)}
                                                >
                                                    <Trash2 className="w-4 h-4 text-red-500" />
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* API Key */}
                                <div className="space-y-2">
                                    <Label htmlFor={`apikey-${provider.id}`}>API Key</Label>
                                    <div className="flex gap-2">
                                        <div className="relative flex-1">
                                            <Input
                                                id={`apikey-${provider.id}`}
                                                type={showKeys[provider.id] ? 'text' : 'password'}
                                                value={provider.apiKey}
                                                onChange={(e) =>
                                                    updateProvider(provider.id, { apiKey: e.target.value })
                                                }
                                                placeholder={info.apiKeyFormat}
                                                disabled={!isEditing}
                                            />
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="absolute right-0 top-0 h-full"
                                                onClick={() => toggleShowKey(provider.id)}
                                            >
                                                {showKeys[provider.id] ? (
                                                    <EyeOff className="w-4 h-4" />
                                                ) : (
                                                    <Eye className="w-4 h-4" />
                                                )}
                                            </Button>
                                        </div>
                                        <Button
                                            variant="outline"
                                            onClick={() => window.open(info.docsUrl, '_blank')}
                                        >
                                            <Key className="w-4 h-4 mr-2" />
                                            Obter Key
                                        </Button>
                                    </div>
                                    <p className="text-xs text-gray-500">
                                        Formato: {info.apiKeyFormat}
                                    </p>
                                </div>

                                {/* Default Model */}
                                <div className="space-y-2">
                                    <Label htmlFor={`model-${provider.id}`}>Modelo Padrão</Label>
                                    <select
                                        id={`model-${provider.id}`}
                                        value={provider.defaultModel}
                                        onChange={(e) =>
                                            updateProvider(provider.id, { defaultModel: e.target.value })
                                        }
                                        disabled={!isEditing}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                                    >
                                        {provider.models.map((model) => (
                                            <option key={model} value={model}>
                                                {model}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Actions */}
                                {isEditing && (
                                    <div className="flex gap-2 pt-4">
                                        <Button
                                            onClick={saveProviders}
                                            disabled={isSaving}
                                            className="bg-emerald-600 hover:bg-emerald-700"
                                        >
                                            <Save className="w-4 h-4 mr-2" />
                                            Salvar
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={() => testProvider(provider)}
                                            disabled={!provider.apiKey}
                                        >
                                            Testar Conexão
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            onClick={() => setEditingProvider(null)}
                                        >
                                            Cancelar
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {providers.length === 0 && (
                <Card className="border-2 border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-16">
                        <Key className="w-16 h-16 text-gray-400 mb-4" />
                        <p className="text-gray-600 dark:text-gray-400 text-center">
                            Nenhum provedor configurado
                        </p>
                        <p className="text-sm text-gray-500 mt-2">
                            Clique em um dos cards acima para adicionar um provedor
                        </p>
                    </CardContent>
                </Card>
            )}

            {/* Help Section */}
            <Card className="mt-8 bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800">
                <CardHeader>
                    <CardTitle className="text-blue-900 dark:text-blue-100">
                        💡 Dica: Múltiplos Provedores
                    </CardTitle>
                </CardHeader>
                <CardContent className="text-blue-800 dark:text-blue-200 text-sm space-y-2">
                    <p>
                        • Configure múltiplos provedores para ter redundância e escolher o melhor modelo para cada tarefa
                    </p>
                    <p>
                        • Você poderá atribuir provedores específicos para cada AI Agent na próxima seção
                    </p>
                    <p>
                        • Recomendamos ter pelo menos 2 provedores configurados para alta disponibilidade
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
