'use client';

import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogTrigger
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createProntuarioEntry, EntryType, processConsultationAudio } from './actions';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';
import { Mic, Loader2, Plus, X } from 'lucide-react';

export function ProntuarioActions({ templates = [] }: { templates?: any[] }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [audioProcessing, setAudioProcessing] = useState(false);
    const params = useParams();
    const patientId = params.patientId as string;

    const [formData, setFormData] = useState({
        type: 'note' as EntryType,
        text: '',
    });

    const [tasks, setTasks] = useState<{ text: string; done: boolean }[]>([]);
    const [newTaskText, setNewTaskText] = useState('');

    const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setAudioProcessing(true);
        const audioData = new FormData();
        audioData.append('file', file);

        try {
            const result = await processConsultationAudio(audioData);
            if (result.success && result.data) {
                const { summary, transcription } = result.data;
                const formattedText = `${summary}\n\n---\nTranscrição Original:\n${transcription}`;
                setFormData(prev => ({ ...prev, text: formattedText }));
                toast.success("Áudio processado e resumido com sucesso!");
            } else {
                toast.error("Falha ao processar áudio: " + result.error);
            }
        } catch (error) {
            console.error(error);
            toast.error("Erro ao enviar áudio");
        } finally {
            setAudioProcessing(false);
        }
    };

    const handleAddTask = () => {
        if (!newTaskText.trim()) return;
        setTasks([...tasks, { text: newTaskText, done: false }]);
        setNewTaskText('');
    };

    const handleRemoveTask = (index: number) => {
        setTasks(tasks.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const result = await createProntuarioEntry(patientId, {
                entryType: formData.type,
                content: {
                    text: formData.text,
                    isAiGenerated: formData.type === 'consultation' && formData.text.includes('Transcrição Original'),
                    tasks: tasks
                },
            });

            if (result.success) {
                setOpen(false);
                setFormData({ type: 'note', text: '' });
                setTasks([]);
                toast.success("Entrada criada com sucesso!");
            } else {
                toast.error("Erro ao criar entrada");
            }
        } catch (error) {
            console.error(error);
            toast.error("Erro inesperado");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>Nova Entrada</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px]">
                <DialogHeader>
                    <DialogTitle>Nova Entrada no Prontuário</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="type">Tipo de Entrada</Label>
                            <Select
                                value={formData.type}
                                onValueChange={(value: EntryType) => setFormData({ ...formData, type: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione o tipo" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="consultation">Consulta</SelectItem>
                                    <SelectItem value="call">Ligação</SelectItem>
                                    <SelectItem value="question">Dúvida</SelectItem>
                                    <SelectItem value="note">Nota Livre</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {formData.type === 'consultation' && (
                            <div className="space-y-2">
                                <Label>Importar Áudio (IA)</Label>
                                <div className="flex items-center gap-2">
                                    <Input
                                        type="file"
                                        accept="audio/*"
                                        onChange={handleAudioUpload}
                                        disabled={audioProcessing}
                                        className="cursor-pointer"
                                    />
                                    {audioProcessing && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                                </div>
                                <p className="text-xs text-muted-foreground">O áudio será transcrito e resumido automaticamente.</p>
                            </div>

                        )}
                    </div>

                    {templates.length > 0 && (
                        <div className="space-y-2">
                            <Label>Carregar Template</Label>
                            <Select onValueChange={(tId) => {
                                const tmpl = templates.find(t => t.id === tId);
                                if (tmpl) {
                                    const fields = tmpl.structure_json?.fields || [];
                                    const text = fields.map((f: any) => `**${f.label || f.name}:** `).join('\n\n');
                                    setFormData(prev => ({ ...prev, text: prev.text + '\n' + text }));
                                    toast.success("Template aplicado!");
                                }
                            }}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Escolher modelo..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {templates.map(t => (
                                        <SelectItem key={t.id} value={t.id}>{t.title}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="text">Conteúdo</Label>
                        <Textarea
                            id="text"
                            placeholder="Digite suas anotações aqui..."
                            className="h-48 resize-none"
                            value={formData.text}
                            onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                            required
                        />
                    </div>

                    {/* Tasks Section */}
                    <div className="space-y-2 border-t pt-2">
                        <Label>Tarefas e Checklist</Label>
                        <div className="flex gap-2">
                            <Input
                                placeholder="Nova tarefa (ex: Solicitar Exame TSH)"
                                value={newTaskText}
                                onChange={(e) => setNewTaskText(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleAddTask();
                                    }
                                }}
                            />
                            <Button type="button" size="icon" onClick={handleAddTask} variant="secondary">
                                <Plus className="w-4 h-4" />
                            </Button>
                        </div>
                        <ul className="space-y-2 mt-2">
                            {tasks.map((task, idx) => (
                                <li key={idx} className="flex items-center justify-between bg-muted/50 p-2 rounded-md text-sm">
                                    <span>{task.text}</span>
                                    <Button
                                        type="button"
                                        size="icon"
                                        variant="ghost"
                                        className="h-6 w-6 text-muted-foreground hover:text-destructive"
                                        onClick={() => handleRemoveTask(idx)}
                                    >
                                        <X className="w-3 h-3" />
                                    </Button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={loading || audioProcessing}>
                            {loading ? 'Salvando...' : 'Salvar Entrada'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog >
    );
}
