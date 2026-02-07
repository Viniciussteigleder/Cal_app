'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale'; // Ensure local import or generic
import { Plus, FileText, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import Link from 'next/link';
import { deleteExamUpload } from './actions';
import { toast } from 'sonner';

interface ExamUpload {
    id: string;
    file_name: string;
    exam_date: Date;
    lab_name?: string | null;
    extraction_status: string;
    _count: { results: number };
}

export function ExamsListView({ uploads, patientId }: { uploads: any[], patientId: string }) {

    const handleDelete = async (id: string) => {
        if (!confirm("Deletar este exame?")) return;
        await deleteExamUpload(id, patientId);
        toast.success("Exame removido.");
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'completed': return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200"><CheckCircle className="w-3 h-3 mr-1" /> Processado</Badge>;
            case 'processing': return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200"><Clock className="w-3 h-3 mr-1 animate-spin" /> Processando</Badge>;
            case 'failed': return <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1" /> Erro</Badge>;
            default: return <Badge variant="secondary">Pendente</Badge>;
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Exames Realizados</h2>
                <Link href={`/studio/patients/${patientId}/exames/upload`}>
                    <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Novo Exame
                    </Button>
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {uploads.length === 0 && (
                    <div className="col-span-full py-12 text-center text-muted-foreground border border-dashed rounded-lg">
                        Nenhum exame cadastrado. Clique em &quot;Novo Exame&quot; para começar.
                    </div>
                )}

                {uploads.map(upload => (
                    <Card key={upload.id} className="hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium truncate" title={upload.file_name}>
                                {upload.lab_name || 'Laboratório não ident.'}
                            </CardTitle>
                            {getStatusBadge(upload.extraction_status)}
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-4">
                                <FileText className="w-4 h-4" />
                                <span className="truncate max-w-[150px]">{upload.file_name}</span>
                            </div>

                            <div className="text-2xl font-bold">
                                {upload._count.results} <span className="text-xs font-normal text-muted-foreground">biomarcadores</span>
                            </div>

                            <p className="text-xs text-muted-foreground mt-1">
                                Data do Exame: {format(new Date(upload.exam_date), "dd/MM/yyyy")}
                            </p>

                            <div className="mt-4 flex gap-2">
                                <Button variant="outline" size="sm" className="w-full">Ver Detalhes</Button>
                                <Button variant="ghost" size="sm" className="text-destructive px-2" onClick={() => handleDelete(upload.id)}>X</Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
