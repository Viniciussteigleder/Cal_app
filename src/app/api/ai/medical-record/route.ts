import { NextRequest, NextResponse } from 'next/server';

// Mock AI service - replace with actual OpenAI Whisper integration
async function transcribeAudio(audioData: any) {
    // Simulate transcription processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    return {
        text: `Paciente relata que tem sentido muita fadiga nas últimas semanas. 
    Refere dificuldade para dormir, acordando várias vezes durante a noite. 
    Alimentação tem sido irregular, pulando o café da manhã com frequência. 
    Relata aumento do consumo de doces e carboidratos refinados, especialmente à noite. 
    Nega dor abdominal, mas menciona sensação de inchaço após refeições. 
    Histórico de constipação intestinal. 
    Pratica atividade física 2 vezes por semana, caminhada leve. 
    Objetivo principal é perder 8kg nos próximos 3 meses.`,
        duration: 45, // seconds
        language: 'pt-BR',
        confidence: 0.95,
    };
}

async function generateSOAPNote(transcription: string, consultationType: string) {
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 1500));

    return {
        subjective: `Paciente relata fadiga persistente nas últimas semanas, com dificuldade para manter sono de qualidade. 
    Refere acordar várias vezes durante a noite. Alimentação irregular, com omissão frequente do café da manhã. 
    Aumento do consumo de doces e carboidratos refinados, principalmente no período noturno. 
    Nega dor abdominal, mas apresenta sensação de inchaço pós-prandial. 
    Histórico de constipação intestinal. 
    Atividade física: caminhada leve 2x/semana. 
    Objetivo: perda de 8kg em 3 meses.`,

        objective: `Peso atual: 75kg
    Altura: 165cm
    IMC: 27.5 (sobrepeso)
    Circunferência abdominal: 88cm
    Pressão arterial: 125/80 mmHg
    Glicemia de jejum: 95 mg/dL (limítrofe)
    
    Avaliação dietética:
    - Consumo calórico estimado: 2200 kcal/dia
    - Baixa ingestão de fibras
    - Consumo excessivo de açúcares simples
    - Hidratação inadequada (< 1L/dia)`,

        assessment: `Paciente apresenta sobrepeso (IMC 27.5) com padrão alimentar desequilibrado caracterizado por:
    1. Omissão de refeições (café da manhã)
    2. Consumo excessivo de carboidratos refinados e açúcares
    3. Baixa ingestão de fibras
    4. Hidratação inadequada
    
    Sintomas relacionados:
    - Fadiga (possível relação com glicemia limítrofe e má qualidade do sono)
    - Distúrbio do sono (pode estar relacionado ao consumo de açúcar à noite)
    - Constipação intestinal (baixa ingestão de fibras e água)
    - Inchaço pós-prandial (possível disbiose intestinal)
    
    Fatores de risco:
    - Glicemia de jejum limítrofe (pré-diabetes)
    - Circunferência abdominal elevada (risco metabólico)
    - Sedentarismo relativo`,

        plan: `1. PLANO ALIMENTAR:
       - Implementar café da manhã balanceado (proteína + carboidrato complexo)
       - Reduzir carboidratos refinados e açúcares
       - Aumentar consumo de fibras (25-30g/dia)
       - Estabelecer horários regulares para refeições
       - Meta calórica: 1600 kcal/dia (déficit de 600 kcal)
    
    2. HIDRATAÇÃO:
       - Meta: 2L de água/dia
       - Evitar líquidos açucarados
    
    3. SUPLEMENTAÇÃO:
       - Probióticos para saúde intestinal
       - Magnésio para qualidade do sono
       - Avaliar vitamina D (solicitar exame)
    
    4. ATIVIDADE FÍSICA:
       - Aumentar frequência para 4x/semana
       - Incluir exercícios de resistência
    
    5. MONITORAMENTO:
       - Retorno em 15 dias para avaliação
       - Solicitar exames: hemograma, perfil lipídico, vitamina D, TSH
       - Diário alimentar por 7 dias
    
    6. ORIENTAÇÕES:
       - Higiene do sono (evitar telas 1h antes de dormir)
       - Reduzir consumo de doces à noite
       - Técnicas de mindful eating`,
    };
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { action, audioData, transcription, consultationType, patientId } = body;

        if (!action) {
            return NextResponse.json(
                { error: 'Action is required' },
                { status: 400 }
            );
        }

        if (action === 'transcribe') {
            if (!audioData) {
                return NextResponse.json(
                    { error: 'Audio data is required for transcription' },
                    { status: 400 }
                );
            }

            const result = await transcribeAudio(audioData);

            return NextResponse.json({
                success: true,
                transcription: result,
                creditsUsed: 25,
            });
        }

        if (action === 'generate-soap') {
            if (!transcription) {
                return NextResponse.json(
                    { error: 'Transcription is required for SOAP generation' },
                    { status: 400 }
                );
            }

            const soapNote = await generateSOAPNote(transcription, consultationType || 'initial');

            return NextResponse.json({
                success: true,
                soapNote,
                creditsUsed: 50,
            });
        }

        return NextResponse.json(
            { error: 'Invalid action' },
            { status: 400 }
        );
    } catch (error) {
        console.error('Error in medical record creator:', error);
        return NextResponse.json(
            { error: 'Failed to process request' },
            { status: 500 }
        );
    }
}
