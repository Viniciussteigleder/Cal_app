'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { assignProtocol } from './actions';
import { Loader2, Zap, CheckCircle2, AlertCircle, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface Protocol {
    id: string;
    name: string;
    description: string | null;
}

interface ActiveInstance {
    id: string;
    started_at: Date;
    protocol: Protocol | null;
}

export function DietPlanView({
    patientId,
    activeProtocol,
    availableProtocols
}: {
    patientId: string,
    activeProtocol: ActiveInstance | null,
    availableProtocols: Protocol[]
}) {
    const router = useRouter();
    const [selectedId, setSelectedId] = useState('');
    const [loading, setLoading] = useState(false);

    const handleAssign = async () => {
        if (!selectedId) return;
        setLoading(true);
        const res = await assignProtocol(patientId, selectedId);
        setLoading(false);

        if (res.success) {
            toast.success("Protocolo ativado com sucesso!");
            setSelectedId(''); // reset selection
            router.refresh();
        } else {
            toast.error("Erro ao ativar protocolo");
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="h-full">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                        Estratégia Ativa
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {activeProtocol && activeProtocol.protocol ? (
                        <div className="space-y-4">
                            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-900">
                                <h3 className="text-lg font-bold text-green-900 dark:text-green-300">
                                    {activeProtocol.protocol.name}
                                </h3>
                                <p className="text-sm text-green-700 dark:text-green-400 mt-1">
                                    Iniciado em {new Date(activeProtocol.started_at).toLocaleDateString()}
                                </p>
                            </div>
                            <p className="text-muted-foreground text-sm">
                                {activeProtocol.protocol.description || 'Sem descrição adicional.'}
                            </p>
                            <Button variant="outline" size="sm" onClick={() => router.push(`/studio/protocols/${activeProtocol.protocol?.id}`)}>
                                <FileText className="mr-2 h-4 w-4" />
                                Ver Detalhes do Protocolo
                            </Button>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground bg-muted/20 rounded-lg border border-dashed">
                            <AlertCircle className="h-10 w-10 mb-2 opacity-50" />
                            <p>Nenhum protocolo ativo.</p>
                            <p className="text-sm">Selecione uma estratégia ao lado para começar.</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card className="h-full">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Zap className="h-5 w-5 text-yellow-500" />
                        Definir Nova Estratégia
                    </CardTitle>
                    <CardDescription>
                        Substituirá o protocolo atual (se houver).
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Selecionar Protocolo</label>
                        <Select value={selectedId} onValueChange={setSelectedId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Escolha um protocolo..." />
                            </SelectTrigger>
                            <SelectContent>
                                {availableProtocols.map(p => (
                                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="pt-4">
                        <Button
                            className="w-full"
                            disabled={!selectedId || loading}
                            onClick={handleAssign}
                        >
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Ativar Estratégia"}
                        </Button>
                        <p className="text-xs text-muted-foreground mt-2 text-center">
                            Esta ação arquiva a estratégia anterior no histórico.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
