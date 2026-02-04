'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { uploadExam } from '../actions';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Upload, Loader2, FileType } from 'lucide-react';

export function UploadForm({ patientId }: { patientId: string }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [file, setFile] = useState<File | null>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!file) {
            toast.error("Selecione um arquivo.");
            return;
        }

        setLoading(true);
        const formData = new FormData(e.currentTarget);
        // file is already in currentTarget if input name="file"

        try {
            const result = await uploadExam(formData, patientId);

            if (result.success) {
                toast.success("Exame enviado! Processamento iniciado.");
                router.push(`/studio/patients/${patientId}/exames`);
            } else {
                toast.error("Erro ao enviar: " + result.error);
            }
        } catch (error) {
            toast.error("Erro inesperado.");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card>
            <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="file">Arquivo do Exame (PDF ou Imagem)</Label>
                        <div className="border-2 border-dashed rounded-lg p-8 text-center hover:bg-accent/50 transition-colors cursor-pointer relative">
                            <input
                                type="file"
                                name="file"
                                id="file"
                                accept="application/pdf,image/*"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                onChange={(e) => setFile(e.target.files?.[0] || null)}
                                required
                            />
                            <div className="flex flex-col items-center gap-2">
                                {file ? (
                                    <>
                                        <FileType className="w-8 h-8 text-primary" />
                                        <span className="font-medium text-primary">{file.name}</span>
                                        <span className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                                    </>
                                ) : (
                                    <>
                                        <Upload className="w-8 h-8 text-muted-foreground" />
                                        <span className="text-muted-foreground">Arraste ou clique para selecionar</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="examDate">Data do Exame</Label>
                            <Input type="date" name="examDate" id="examDate" required defaultValue={new Date().toISOString().split('T')[0]} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="labName">Laboratório</Label>
                            <Input type="text" name="labName" id="labName" placeholder="Ex: Lab. Exemplo" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="observations">Observações (Opcional)</Label>
                        <Input type="text" name="observations" id="observations" placeholder="Notas sobre o exame..." />
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="outline" onClick={() => router.back()}>Cancelar</Button>
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {loading ? 'Processando (IA)...' : 'Enviar e Processar'}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
