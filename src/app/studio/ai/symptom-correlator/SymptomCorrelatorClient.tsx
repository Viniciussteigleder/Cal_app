'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { runSymptomCorrelation } from './actions';
import { Loader2, Sparkles, Activity } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface Patient {
    id: string;
    name: string;
}

export function SymptomCorrelatorClient({ patients }: { patients: Patient[] }) {
    const [selectedPatient, setSelectedPatient] = useState('');
    const [result, setResult] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleRun = async () => {
        if (!selectedPatient) return;
        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const res = await runSymptomCorrelation(selectedPatient);
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
                        <CardTitle>Configuração da Análise</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Selecione o Paciente</label>
                            <Select value={selectedPatient} onValueChange={setSelectedPatient}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Escolha um paciente..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {patients.map(p => (
                                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                    ))}
                                    {patients.length === 0 && <SelectItem value="none" disabled>Nenhum paciente encontrado</SelectItem>}
                                </SelectContent>
                            </Select>
                        </div>

                        <Button
                            className="w-full"
                            onClick={handleRun}
                            disabled={!selectedPatient || loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Analisando...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="mr-2 h-4 w-4" />
                                    Identificar Padrões
                                </>
                            )}
                        </Button>

                        <div className="bg-muted p-4 rounded-md text-xs text-muted-foreground">
                            <p>Esta análise consome <strong>1 Crédito de IA</strong>.</p>
                            <p className="mt-2">O algoritmo examinará os últimos 30 dias de logs de sintomas e anotações clínicas para encontrar correlações.</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="lg:col-span-2">
                <Card className="h-full min-h-[400px]">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Activity className="h-5 w-5" />
                            Relatório de Inteligência
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading && (
                            <div className="flex flex-col items-center justify-center h-64 space-y-4 text-muted-foreground">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                <p>Analisando dados clínicos...</p>
                            </div>
                        )}

                        {error && (
                            <div className="p-4 bg-destructive/10 text-destructive rounded-md">
                                {error}
                            </div>
                        )}

                        {!loading && !result && !error && (
                            <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">
                                Selecione um paciente e inicie a análise para ver os resultados.
                            </div>
                        )}

                        {result && (
                            <div className="prose dark:prose-invert max-w-none">
                                <ReactMarkdown>{result}</ReactMarkdown>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
