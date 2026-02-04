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
import { Mic, Loader2 } from 'lucide-react';

export function ProntuarioActions() {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [audioProcessing, setAudioProcessing] = useState(false);
    const params = useParams();
    const patientId = params.patientId as string;

    const [formData, setFormData] = useState({
        type: 'note' as EntryType,
        text: '',
    });

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
            // Reset input if needed, but simple re-render might suffice or use key logic
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const result = await createProntuarioEntry(patientId, {
                entryType: formData.type,
                // If type is consultation, we might want to structure content differently, 
                // but for now simple text object is fine as per schema flexible Json
                content: {
                    text: formData.text,
                    isAiGenerated: formData.type === 'consultation' && formData.text.includes('Transcrição Original')
                },
            });

            if (result.success) {
                setOpen(false);
                setFormData({ type: 'note', text: '' });
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

                    <div className="space-y-2">
                        <Label htmlFor="text">Conteúdo</Label>
                        <Textarea
                            id="text"
                            placeholder="Digite suas anotações aqui..."
                            className="h-64 resize-none"
                            value={formData.text}
                            onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                            required
                        />
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
        </Dialog>
    );
}
