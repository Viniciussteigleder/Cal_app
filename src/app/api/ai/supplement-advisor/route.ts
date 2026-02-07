import { NextRequest, NextResponse } from 'next/server';
import { executeAIRoute } from '@/lib/ai/route-helper';
import { getRequestClaims } from '@/lib/claims';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
    try {
        // Auth check BEFORE any DB queries
        const claims = await getRequestClaims();
        if (!claims) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
        }

        const body = await request.json();
        const { patientId, examData } = body;

        if (!patientId) {
            return NextResponse.json({ error: 'Patient ID is required' }, { status: 400 });
        }

        const examResults = await prisma.examResultExtracted.findMany({
            where: { patient_id: patientId },
            orderBy: { created_at: 'desc' },
            take: 20,
            select: {
                raw_name: true,
                value: true,
                unit: true,
                reference_range: true,
                is_abnormal: true,
                created_at: true,
            },
        });

        const examContext = examResults.length
            ? `Resultados de exames do paciente:\n${JSON.stringify(examResults)}`
            : examData
                ? `Dados de exames fornecidos:\n${JSON.stringify(examData)}`
                : 'Sem dados de exames disponíveis. Forneça recomendações gerais de suplementação.';

        const prompt = `Analise os dados laboratoriais e recomende suplementação baseada em evidências.\n${examContext}`;

        return executeAIRoute('supplement_advisor', {
            userMessage: prompt,
            patientId,
        });
    } catch (error) {
        console.error('Supplement advisor error:', error);
        return NextResponse.json(
            { error: 'Falha ao gerar recomendações de suplementação' },
            { status: 500 }
        );
    }
}
