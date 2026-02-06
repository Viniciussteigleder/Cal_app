import React from 'react';
import { getExamDetails } from '../actions';
import { ExamDetailView } from './ExamDetailView';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function ExamDetailsPage({
    params,
}: {
    params: Promise<{ patientId: string; uploadId: string }>;
}) {
    const { patientId, uploadId } = await params;
    const { data: upload, error } = await getExamDetails(uploadId);

    if (error || !upload) {
        return (
            <div className="p-8 text-center text-destructive">
                <h2 className="text-xl font-bold">Erro ao carregar exame</h2>
                <p>{error || 'Exame não encontrado.'}</p>
                <Link href={`/studio/patients/${patientId}/exames`}>
                    <Button variant="link">Voltar</Button>
                </Link>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href={`/studio/patients/${patientId}/exames`}>
                    <Button variant="ghost" size="icon">
                        <ChevronLeft className="w-5 h-5" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Detalhes do Exame</h1>
                    <p className="text-muted-foreground mr-2">{upload.lab_name || 'Laboratório Desconhecido'}</p>
                </div>
            </div>

            <ExamDetailView upload={upload} />
        </div>
    );
}
