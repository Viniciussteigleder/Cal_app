'use client';

import { useParams, useSearchParams } from 'next/navigation';
import { ConsultationWizard } from '@/components/studio/ConsultationWizard';

export default function IniciarConsultaPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const patientId = params.patientId as string;
    const etapa = searchParams.get('etapa') as 'pre' | 'durante' | 'plano' | 'fechamento' | null;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold">Iniciar Consulta</h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Wizard guiado para conduzir a consulta de forma estruturada.
                </p>
            </div>
            <ConsultationWizard
                patientId={patientId}
                initialStep={etapa || 'pre'}
            />
        </div>
    );
}
