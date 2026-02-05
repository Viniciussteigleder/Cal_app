
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { createDailyLog } from './actions';
import {
    Utensils, Activity, FileText, Plus, Clock, Droplets, Dumbbell,
    AlertCircle, CheckCircle2, X
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';

interface LogEntry {
    id: string;
    entry_type: string;
    timestamp: Date | string;
    content: any;
}

interface Recipe {
    id: string;
    name: string;
    description: string | null;
}

const COMMON_SYMPTOMS = [
    "Dor de cabeça", "Inchaço", "Gases", "Azia", "Cansaço",
    "Ansiedade", "Compulsão", "Constipação", "Diarreia"
];

export function DailyLogTimeline({ initialLogs, patientId, recipes = [] }: { initialLogs: LogEntry[], patientId: string, recipes?: Recipe[] }) {
    const [logs, setLogs] = useState(initialLogs);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form States
    const [noteContent, setNoteContent] = useState('');

    // Meal
    const [mealContent, setMealContent] = useState('');
    const [mealType, setMealType] = useState('Café da Manhã');
    const [mealImage, setMealImage] = useState<string | null>(null);

    // Symptom
    const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
    const [symptomSeverity, setSymptomSeverity] = useState([5]);
    const [symptomNote, setSymptomNote] = useState('');

    // Water
    const [waterAmount, setWaterAmount] = useState([250]);

    // Exercise
    const [exerciseType, setExerciseType] = useState('');
    const [exerciseDuration, setExerciseDuration] = useState('');
    const groupedLogs = groupLogsByDate(logs);

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
            resetForms();
        } else {
            toast.error("Erro ao registrar");
        }
    };

    const resetForms = () => {
        setNoteContent('');
        setMealContent('');
        setMealImage(null);
        setSelectedSymptoms([]);
        setSymptomSeverity([5]);
        setSymptomNote('');
        setExerciseType('');
        setExerciseDuration('');
    };

    const toggleSymptom = (symptom: string) => {
        if (selectedSymptoms.includes(symptom)) {
            setSelectedSymptoms(selectedSymptoms.filter(s => s !== symptom));
        } else {
            setSelectedSymptoms([...selectedSymptoms, symptom]);
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
            case 'meal': return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800';
            case 'symptom': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800';
            case 'water': return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800';
            case 'exercise': return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800';
            default: return 'bg-zinc-100 text-zinc-800 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700';
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Input Column */}
            <div className="lg:col-span-1 space-y-4">
                <Card className="border-2 border-primary/10 shadow-lg">
                    <CardHeader className="pb-3 bg-muted/30">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Plus className="h-5 w-5 text-primary" /> Novo Registro
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <Tabs defaultValue="meal" className="w-full">
                            <TabsList className="grid w-full grid-cols-5 mb-4 p-1">
                                <TabsTrigger value="meal" title="Refeição"><Utensils className="h-4 w-4" /></TabsTrigger>
                                <TabsTrigger value="water" title="Água"><Droplets className="h-4 w-4" /></TabsTrigger>
                                <TabsTrigger value="symptom" title="Sintoma"><Activity className="h-4 w-4" /></TabsTrigger>
                                <TabsTrigger value="exercise" title="Exercício"><Dumbbell className="h-4 w-4" /></TabsTrigger>
                                <TabsTrigger value="note" title="Nota"><FileText className="h-4 w-4" /></TabsTrigger>
                            </TabsList>

                            {/* MEAL TAB */}
                            <TabsContent value="meal" className="space-y-4 animate-in fade-in-50">
                                <Select value={mealType} onValueChange={setMealType}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Tipo de Refeição" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {['Café da Manhã', 'Lanche da Manhã', 'Almoço', 'Lanche da Tarde', 'Jantar', 'Ceia'].map(t => (
                                            <SelectItem key={t} value={t}>{t}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                {recipes.length > 0 && (
                                    <Select onValueChange={(recipeId) => {
                                        const r = recipes.find(rec => rec.id === recipeId);
                                        if (r) setMealContent(prev => (prev ? prev + '\n' : '') + `${r.name}`);
                                    }}>
                                        <SelectTrigger className="border-dashed">
                                            <SelectValue placeholder="Adicionar Receita Salva" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {recipes.map(r => (
                                                <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}

                                <Textarea
                                    placeholder="Descreva o que comeu..."
                                    value={mealContent}
                                    onChange={e => setMealContent(e.target.value)}
                                    className="min-h-[100px]"
                                />

                                <Button
                                    className="w-full"
                                    disabled={!mealContent || isSubmitting}
                                    onClick={() => handleAddEntry('meal', { type: mealType, description: mealContent })}
                                >
                                    <Utensils className="mr-2 h-4 w-4" /> Registrar Refeição
                                </Button>
                            </TabsContent>

                            {/* WATER TAB */}
                            <TabsContent value="water" className="space-y-6 pt-2 text-center animate-in fade-in-50">
                                <div className="space-y-2">
                                    <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                                        {waterAmount[0]} ml
                                    </span>
                                    <Slider
                                        value={waterAmount}
                                        onValueChange={setWaterAmount}
                                        max={1000}
                                        step={50}
                                        className="py-4"
                                    />
                                </div>
                                <div className="flex justify-center gap-2">
                                    <Button variant="outline" size="sm" onClick={() => setWaterAmount([250])}>250ml</Button>
                                    <Button variant="outline" size="sm" onClick={() => setWaterAmount([500])}>500ml</Button>
                                </div>
                                <Button
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                                    disabled={isSubmitting}
                                    onClick={() => handleAddEntry('water', { amount: waterAmount[0], unit: 'ml' })}
                                >
                                    <Droplets className="mr-2 h-4 w-4" /> Beber Água
                                </Button>
                            </TabsContent>

                            {/* SYMPTOM TAB */}
                            <TabsContent value="symptom" className="space-y-4 animate-in fade-in-50">
                                <div className="flex flex-wrap gap-2">
                                    {COMMON_SYMPTOMS.map(s => (
                                        <Badge
                                            key={s}
                                            variant={selectedSymptoms.includes(s) ? "default" : "outline"}
                                            className="cursor-pointer hover:bg-primary/20"
                                            onClick={() => toggleSymptom(s)}
                                        >
                                            {s}
                                        </Badge>
                                    ))}
                                </div>

                                <div className="space-y-2 pt-2">
                                    <div className="flex justify-between text-xs text-muted-foreground">
                                        <span>Leve</span>
                                        <span>Moderado</span>
                                        <span>Severo</span>
                                    </div>
                                    <Slider
                                        value={symptomSeverity}
                                        onValueChange={setSymptomSeverity}
                                        min={1}
                                        max={10}
                                        step={1}
                                    />
                                    <div className="text-center font-bold text-sm">Nível: {symptomSeverity[0]}</div>
                                </div>

                                <Textarea
                                    placeholder="Outros detalhes..."
                                    value={symptomNote}
                                    onChange={e => setSymptomNote(e.target.value)}
                                />

                                <Button
                                    className="w-full bg-red-600 hover:bg-red-700 text-white"
                                    disabled={(selectedSymptoms.length === 0 && !symptomNote) || isSubmitting}
                                    onClick={() => handleAddEntry('symptom', {
                                        symptoms: selectedSymptoms,
                                        severity: symptomSeverity[0],
                                        note: symptomNote
                                    })}
                                >
                                    <Activity className="mr-2 h-4 w-4" /> Registrar Sintoma
                                </Button>
                            </TabsContent>

                            {/* EXERCISE TAB */}
                            <TabsContent value="exercise" className="space-y-4 animate-in fade-in-50">
                                <Input
                                    placeholder="Atividade (ex: Corrida, Musculação)"
                                    value={exerciseType}
                                    onChange={e => setExerciseType(e.target.value)}
                                />
                                <div className="flex items-center gap-2">
                                    <Input
                                        type="number"
                                        placeholder="Duração (min)"
                                        value={exerciseDuration}
                                        onChange={e => setExerciseDuration(e.target.value)}
                                    />
                                    <span className="text-sm text-muted-foreground">min</span>
                                </div>
                                <Button
                                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                                    disabled={!exerciseType || !exerciseDuration || isSubmitting}
                                    onClick={() => handleAddEntry('exercise', {
                                        activity: exerciseType,
                                        duration_min: exerciseDuration
                                    })}
                                >
                                    <Dumbbell className="mr-2 h-4 w-4" /> Registrar Treino
                                </Button>
                            </TabsContent>

                            {/* NOTE TAB */}
                            <TabsContent value="note" className="space-y-4 animate-in fade-in-50">
                                <Textarea
                                    placeholder="Escreva uma observação..."
                                    value={noteContent}
                                    onChange={e => setNoteContent(e.target.value)}
                                    className="min-h-[120px]"
                                />
                                <Button
                                    className="w-full"
                                    disabled={!noteContent || isSubmitting}
                                    onClick={() => handleAddEntry('note', { text: noteContent })}
                                >
                                    <FileText className="mr-2 h-4 w-4" /> Registrar Nota
                                </Button>
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            </div>

            {/* Timeline Column */}
            <div className="lg:col-span-2 space-y-8">
                {Object.entries(groupedLogs).map(([dateLabel, dateLogs]) => (
                    <div key={dateLabel} className="relative">
                        <div className="flex items-center gap-4 mb-4">
                            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground bg-background z-10 pr-2">
                                {dateLabel}
                            </h3>
                            <div className="h-px bg-border flex-1" />
                        </div>

                        <div className="space-y-6 relative ml-2">
                            {/* Vertical Line */}
                            <div className="absolute left-4 top-2 bottom-4 w-0.5 bg-border -z-10" />

                            {dateLogs.map((log) => (
                                <div key={log.id} className="relative pl-10 group animate-in slide-in-from-bottom-2 duration-300">
                                    {/* Dot */}
                                    <div className={`absolute left-[10px] top-4 w-4 h-4 rounded-full border-2 border-background z-10 ${getColor(log.entry_type).split(' ')[0]}`} />

                                    <Card className={`border shadow-sm transition-all hover:shadow-md ${getColor(log.entry_type).split(' ')[2]}`}>
                                        <CardContent className="p-4">
                                            <div className="flex items-start justify-between">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Badge variant="secondary" className={`${getColor(log.entry_type).split(' ').slice(0, 2).join(' ')} border-none`}>
                                                            {getIcon(log.entry_type)}
                                                            <span className="ml-1 uppercase text-xs tracking-wider">{log.entry_type}</span>
                                                        </Badge>
                                                        <span className="text-xs text-muted-foreground font-mono">
                                                            {format(new Date(log.timestamp), "HH:mm")}
                                                        </span>
                                                    </div>

                                                    <div className="text-sm">
                                                        {renderLogContent(log)}
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                {logs.length === 0 && (
                    <div className="text-center py-16 text-muted-foreground bg-muted/30 rounded-lg border border-dashed">
                        <Clock className="h-8 w-8 mx-auto mb-2 opacity-20" />
                        <p>O dia está começando. Faça seu primeiro registro!</p>
                    </div>
                )}
            </div>
        </div>
    );
}

// Helper to group logs
function groupLogsByDate(logs: LogEntry[]) {
    const groups: Record<string, LogEntry[]> = {};

    logs.forEach(log => {
        let dateLabel = format(new Date(log.timestamp), "d 'de' MMMM", { locale: ptBR });
        const today = format(new Date(), "d 'de' MMMM", { locale: ptBR });
        const yesterday = format(new Date(Date.now() - 86400000), "d 'de' MMMM", { locale: ptBR });

        if (dateLabel === today) dateLabel = "Hoje";
        if (dateLabel === yesterday) dateLabel = "Ontem";

        if (!groups[dateLabel]) groups[dateLabel] = [];
        groups[dateLabel].push(log);
    });

    return groups;
}

function renderLogContent(log: LogEntry) {
    const c = log.content;
    if (typeof c !== 'object') return String(c);

    switch (log.entry_type) {
        case 'meal':
            return (
                <div>
                    <div className="font-semibold">{c.type}</div>
                    <div className="text-muted-foreground">{c.description}</div>
                </div>
            );
        case 'water':
            return (
                <div className="font-bold text-lg flex items-center gap-1 text-blue-600 dark:text-blue-400">
                    {c.amount} ml
                </div>
            );
        case 'exercise':
            return (
                <div>
                    <span className="font-medium">{c.activity}</span> for <span className="font-bold">{c.duration_min} min</span>
                </div>
            );
        case 'symptom':
            return (
                <div className="space-y-1">
                    <div className="flex flex-wrap gap-1">
                        {c.symptoms?.map((s: string) => <Badge key={s} variant="outline" className="bg-background/50 border-red-200">{s}</Badge>)}
                    </div>
                    {c.severity && <div className="text-xs">Intensidade: {c.severity}/10</div>}
                    {c.note && <div className="text-xs italic mt-1">"{c.note}"</div>}
                </div>
            );
        default:
            return c.text || JSON.stringify(c);
    }
}
