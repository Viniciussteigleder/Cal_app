'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { generateProtocolAction } from './actions';
import { Loader2, Zap, FileText, Settings2 } from 'lucide-react';
import { Label } from '@/components/ui/label';

interface Patient {
    id: string;
    name: string;
}

const PROTOCOL_TYPES = [
    "Anti-inflamatório",
    "FODMAP (Eliminação)",
    "Low Carb / Cetogênico",
    "Detox Hepático",
    "Saúde Intestinal (Disbiose)",
    "Controle Glicêmico",
    "Autoimune (AIP)",
    "Personalizado"
];

export function ProtocolGeneratorClient({ patients }: { patients: Patient[] }) {
    const [selectedPatient, setSelectedPatient] = useState('');
    const [protocolType, setProtocolType] = useState('');
    const [customNotes, setCustomNotes] = useState('');

    const [result, setResult] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleRun = async () => {
        if (!selectedPatient || !protocolType) return;
        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const res = await generateProtocolAction(selectedPatient, protocolType, customNotes);
            if (res.success && res.data) {
                setResult(res.data);
            } else {
                setError(res.error || 'Erro desconhecido');
            }
        } catch (err) {
            setError('Falha na requisição');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-4">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Settings2 className="w-5 h-5" />
                            Parâmetros
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Paciente</Label>
                            <Select value={selectedPatient} onValueChange={setSelectedPatient}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Escolha um paciente..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {patients.map(p => (
                                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Tipo de Protocolo</Label>
                            <Select value={protocolType} onValueChange={setProtocolType}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione o protocolo..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {PROTOCOL_TYPES.map(t => (
                                        <SelectItem key={t} value={t}>{t}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Notas / Foco Específico</Label>
                            <Textarea
                                placeholder="Ex: Paciente não gosta de peixe. Focar em opções vegetarianas no jantar."
                                value={customNotes}
                                onChange={(e) => setCustomNotes(e.target.value)}
                                className="min-h-[100px]"
                            />
                        </div>

                        <Button
                            className="w-full"
                            onClick={handleRun}
                            disabled={!selectedPatient || !protocolType || loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Gerando Protocolo...
                                </>
                            ) : (
                                <>
                                    <Zap className="mr-2 h-4 w-4" />
                                    Gerar Protocolo com IA
                                </>
                            )}
                        </Button>

                        <div className="bg-muted p-4 rounded-md text-xs text-muted-foreground">
                            <p>Custo estimado: <strong>2 Créditos</strong></p>
                            <p className="mt-1">A IA considerará as condições clínicas registradas no perfil do paciente automaticamente.</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="lg:col-span-2">
                <Card className="h-full min-h-[500px]">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Protocolo Gerado
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading && (
                            <div className="flex flex-col items-center justify-center h-64 space-y-4 text-muted-foreground">
                                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                                <p className="text-lg font-medium">Desenvolvendo estratégia nutricional...</p>
                                <p className="text-sm">Isso pode levar até 30 segundos.</p>
                            </div>
                        )}

                        {error && (
                            <div className="p-4 bg-destructive/10 text-destructive rounded-md">
                                {error}
                            </div>
                        )}

                        {!loading && !result && !error && (
                            <div className="flex items-center justify-center h-64 text-muted-foreground">
                                Configure os parâmetros à esquerda para gerar o protocolo.
                            </div>
                        )}

                        {result && (
                            <div className="prose dark:prose-invert max-w-none p-4 rounded-md bg-card border">
                                <div className="whitespace-pre-wrap text-sm leading-relaxed font-sans">
                                    {result}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
