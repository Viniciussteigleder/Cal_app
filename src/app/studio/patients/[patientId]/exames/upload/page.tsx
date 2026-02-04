import React from 'react';
import { UploadForm } from './UploadForm';

export default async function ExamUploadPage({
    params,
}: {
    params: Promise<{ patientId: string }>;
}) {
    const { patientId } = await params;

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Novo Exame</h1>
                <p className="text-muted-foreground">
                    Envie o PDF ou imagem do exame para processamento automático via IA.
                </p>
            </div>

            <UploadForm patientId={patientId} />
        </div>
    );
}
