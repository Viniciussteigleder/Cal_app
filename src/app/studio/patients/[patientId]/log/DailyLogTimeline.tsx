'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { createDailyLog } from './actions';
import {
    Utensils, Activity, FileText, Plus, Clock, Droplets, Dumbbell,
    Smile, Frown, Meh, AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface LogEntry {
    id: string;
    entry_type: string;
    timestamp: Date | string;
    content: any;
}

export function DailyLogTimeline({ initialLogs, patientId }: { initialLogs: LogEntry[], patientId: string }) {
    const [logs, setLogs] = useState(initialLogs);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form States
    const [noteContent, setNoteContent] = useState('');
    const [mealContent, setMealContent] = useState('');
    const [mealType, setMealType] = useState('Café da Manhã');

    const handleAddEntry = async (type: string, content: any) => {
        setIsSubmitting(true);
        const res = await createDailyLog(patientId, {
            entry_type: type,
            timestamp: new Date(),
            content
        });
        setIsSubmitting(false);

        if (res.success && res.data) {
            setLogs([res.data, ...logs]);
            toast.success("Registro adicionado!");
            // Reset forms
            setNoteContent('');
            setMealContent('');
        } else {
            toast.error("Erro ao registrar");
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'meal': return <Utensils className="h-4 w-4" />;
            case 'symptom': return <Activity className="h-4 w-4" />;
            case 'water': return <Droplets className="h-4 w-4" />;
            case 'exercise': return <Dumbbell className="h-4 w-4" />;
            default: return <FileText className="h-4 w-4" />;
        }
    };

    const getColor = (type: string) => {
        switch (type) {
            case 'meal': return 'bg-orange-100 text-orange-800 dark:bg-orange-900';
            case 'symptom': return 'bg-red-100 text-red-800 dark:bg-red-900';
            case 'water': return 'bg-blue-100 text-blue-800 dark:bg-blue-900';
            case 'exercise': return 'bg-green-100 text-green-800 dark:bg-green-900';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800';
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Input Column */}
            <div className="lg:col-span-1 space-y-4">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Novo Registro</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Tabs defaultValue="note" className="w-full">
                            <TabsList className="grid w-full grid-cols-3 mb-4">
                                <TabsTrigger value="note">Nota</TabsTrigger>
                                <TabsTrigger value="meal">Refeição</TabsTrigger>
                                <TabsTrigger value="symptom">Sintoma</TabsTrigger>
                            </TabsList>

                            <TabsContent value="note" className="space-y-4">
                                <Textarea
                                    placeholder="Escreva uma observação..."
                                    value={noteContent}
                                    onChange={e => setNoteContent(e.target.value)}
                                />
                                <Button
                                    className="w-full"
                                    disabled={!noteContent || isSubmitting}
                                    onClick={() => handleAddEntry('note', { text: noteContent })}
                                >
                                    <Plus className="mr-2 h-4 w-4" /> Registrar Nota
                                </Button>
                            </TabsContent>

                            <TabsContent value="meal" className="space-y-4">
                                <Input
                                    value={mealType}
                                    onChange={e => setMealType(e.target.value)}
                                    placeholder="Tipo (ex: Almoço)"
                                />
                                <Textarea
                                    placeholder="O que o paciente comeu?"
                                    value={mealContent}
                                    onChange={e => setMealContent(e.target.value)}
                                />
                                <Button
                                    className="w-full"
                                    disabled={!mealContent || isSubmitting}
                                    onClick={() => handleAddEntry('meal', { type: mealType, description: mealContent })}
                                >
                                    <Utensils className="mr-2 h-4 w-4" /> Registrar Refeição
                                </Button>
                            </TabsContent>

                            <TabsContent value="symptom" className="space-y-4 text-center py-8">
                                <p className="text-sm text-muted-foreground">O registro detalhado de sintomas será implementado com a escala visual na próxima atualização.</p>
                                <Button variant="outline" onClick={() => handleAddEntry('symptom', { type: 'Generic', severity: 'Medium' })}>
                                    Teste: Registrar Sintoma
                                </Button>
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            </div>

            {/* Timeline Column */}
            <div className="lg:col-span-2 space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Clock className="h-5 w-5" /> Linha do Tempo
                </h3>

                <div className="space-y-4">
                    {logs.map((log) => (
                        <Card key={log.id} className="relative overflow-hidden">
                            <div className={`absolute left-0 top-0 bottom-0 w-1 ${getColor(log.entry_type).split(' ')[0].replace('bg-', 'bg-')}`} />
                            <CardContent className="p-4 pl-6">
                                <div className="flex items-start justify-between">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 ${getColor(log.entry_type)}`}>
                                                {getIcon(log.entry_type)}
                                                {log.entry_type.toUpperCase()}
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                                {format(new Date(log.timestamp), "d MMM, HH:mm", { locale: ptBR })}
                                            </span>
                                        </div>

                                        <div className="text-sm mt-2">
                                            {typeof log.content === 'object' && log.content !== null ? (
                                                <div className="space-y-1">
                                                    {(log.content as any).type && <strong>{(log.content as any).type}: </strong>}
                                                    {(log.content as any).description || (log.content as any).text || JSON.stringify(log.content)}
                                                </div>
                                            ) : String(log.content)}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    {logs.length === 0 && (
                        <div className="text-center py-12 text-muted-foreground bg-muted/20 rounded-lg border border-dashed">
                            <p>Nenhum registro no diário ainda.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
