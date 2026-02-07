import { NextRequest } from 'next/server';
import { executeAIRoute } from '@/lib/ai/route-helper';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
    const body = await request.json();
    const { patientId, examData } = body;

    if (!patientId) {
        return Response.json({ error: 'Patient ID is required' }, { status: 400 });
    }

    // Fetch real exam results from DB
    const examResults = await prisma.examResultExtracted.findMany({
        where: { patient_id: patientId },
        orderBy: { extracted_at: 'desc' },
        take: 20,
        select: { biomarker_name: true, value: true, unit: true, reference_range: true, status: true, extracted_at: true },
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
}
