'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { createProtocol, updateProtocol } from './actions';
import { useRouter } from 'next/navigation';
import { Loader2, Save, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

interface ProtocolFormProps {
    initialData?: any;
    isEditing?: boolean;
}

export function ProtocolForm({ initialData, isEditing = false }: ProtocolFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // Form State
    const [name, setName] = useState(initialData?.name || '');
    const [description, setDescription] = useState(initialData?.description || '');
    const [expertReviewer, setExpertReviewer] = useState(initialData?.expert_reviewer || '');
    const [expertScore, setExpertScore] = useState(initialData?.expert_review_score || 0);
    const [warnings, setWarnings] = useState(initialData?.warnings?.join('\n') || '');

    const handleSubmit = async () => {
        if (!name) return;
        setLoading(true);

        const payload = {
            name,
            description,
            expert_reviewer: expertReviewer,
            expert_review_score: Number(expertScore),
            warnings: warnings.split('\n').filter((w: string) => w.trim() !== '')
        };

        let res;
        if (isEditing && initialData?.id) {
            res = await updateProtocol(initialData.id, payload);
        } else {
            res = await createProtocol(payload);
        }

        setLoading(false);

        if (res.success) {
            toast.success(isEditing ? "Protocolo atualizado!" : "Protocolo criado!");
            router.push('/studio/protocols');
        } else {
            toast.error(res.error || "Erro ao salvar");
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        {isEditing ? 'Editar Protocolo' : 'Novo Protocolo'}
                    </h1>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Informações Básicas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Nome do Protocolo</Label>
                        <Input value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Protocolo Low FODMAP" />
                    </div>

                    <div className="space-y-2">
                        <Label>Descrição</Label>
                        <Textarea
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            rows={4}
                        />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Validação e Segurança (Fase 3)</CardTitle>
                    <CardDescription>Critérios de revisão por especialistas</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label>Revisor Especialista</Label>
                            <Input value={expertReviewer} onChange={e => setExpertReviewer(e.target.value)} placeholder="Nome do responsável" />
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <Label>Score de Qualidade (0-50)</Label>
                                <span className="font-bold">{expertScore}</span>
                            </div>
                            <Slider
                                value={[expertScore]}
                                min={0} max={50} step={1}
                                onValueChange={([v]) => setExpertScore(v)}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Avisos e Contraindicações (um por linha)</Label>
                        <Textarea
                            value={warnings}
                            onChange={e => setWarnings(e.target.value)}
                            placeholder="Gestantes..."
                        />
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-end">
                <Button onClick={handleSubmit} disabled={loading || !name} size="lg">
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Salvar Protocolo
                </Button>
            </div>
        </div>
    );
}
