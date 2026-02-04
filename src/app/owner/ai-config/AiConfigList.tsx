'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { saveAiConfig } from './actions';
import { Loader2, Save, Bot, BrainCircuit } from 'lucide-react';
import { toast } from 'sonner';
import { Label } from '@/components/ui/label';

interface AgentConfig {
    agent_id: string;
    name: string;
    system_prompt: string;
    model_name: string;
    temperature: number;
    is_active: boolean;
}

export function AiConfigList({ agents }: { agents: AgentConfig[] }) {
    const [selectedAgentId, setSelectedAgentId] = useState(agents[0]?.agent_id);
    const [configs, setConfigs] = useState(agents);
    const [saving, setSaving] = useState(false);

    const activeConfig = configs.find(c => c.agent_id === selectedAgentId);

    const handleChange = (field: string, value: any) => {
        setConfigs(prev => prev.map(c =>
            c.agent_id === selectedAgentId ? { ...c, [field]: value } : c
        ));
    };

    const handleSave = async () => {
        if (!activeConfig) return;
        setSaving(true);
        const res = await saveAiConfig(activeConfig.agent_id, {
            system_prompt: activeConfig.system_prompt,
            model_name: activeConfig.model_name,
            temperature: activeConfig.temperature,
            is_active: activeConfig.is_active
        });
        setSaving(false);

        if (res.success) {
            toast.success("Configuração salva com sucesso!");
        } else {
            toast.error("Erro ao salvar configuração.");
        }
    };

    if (!activeConfig) return <div>Carregando...</div>;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1 space-y-2">
                {configs.map(agent => (
                    <Button
                        key={agent.agent_id}
                        variant={selectedAgentId === agent.agent_id ? "default" : "ghost"}
                        className="w-full justify-start"
                        onClick={() => setSelectedAgentId(agent.agent_id)}
                    >
                        <Bot className="mr-2 h-4 w-4" />
                        {agent.name}
                    </Button>
                ))}
            </div>

            <div className="lg:col-span-3">
                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <BrainCircuit className="h-5 w-5 text-primary" />
                                    {activeConfig.name}
                                </CardTitle>
                                <CardDescription>ID: {activeConfig.agent_id}</CardDescription>
                            </div>
                            <div className="flex items-center gap-2">
                                <Label htmlFor="active-mode">Ativo</Label>
                                <Switch
                                    id="active-mode"
                                    checked={activeConfig.is_active}
                                    onCheckedChange={(c) => handleChange('is_active', c)}
                                />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Modelo</Label>
                                <Select
                                    value={activeConfig.model_name}
                                    onValueChange={(v) => handleChange('model_name', v)}
                                >
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="gpt-4">GPT-4 (Alta Precisão)</SelectItem>
                                        <SelectItem value="gpt-4-turbo">GPT-4 Turbo (Rápido)</SelectItem>
                                        <SelectItem value="gpt-3.5-turbo">GPT-3.5 (Econômico)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <Label>Criatividade (Temperatura)</Label>
                                    <span className="text-sm font-mono">{activeConfig.temperature.toFixed(1)}</span>
                                </div>
                                <Slider
                                    value={[activeConfig.temperature]}
                                    min={0} max={1} step={0.1}
                                    onValueChange={([v]) => handleChange('temperature', v)}
                                    className="py-4"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Prompt do Sistema (Persona)</Label>
                            <Textarea
                                className="min-h-[200px] font-mono text-sm leading-relaxed"
                                value={activeConfig.system_prompt}
                                onChange={(e) => handleChange('system_prompt', e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">
                                Define como a IA deve se comportar. Use instruções claras sobre tom de voz, regras de segurança e formato de resposta.
                            </p>
                        </div>

                        <div className="flex justify-end pt-4 border-t">
                            <Button onClick={handleSave} disabled={saving}>
                                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                Salvar Alterações
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
