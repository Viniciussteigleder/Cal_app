import { NextRequest, NextResponse } from 'next/server';

// Mock AI service
async function correlateSymptoms(data: any) {
    await new Promise(resolve => setTimeout(resolve, 2000));

    return {
        analysis: {
            period: data.period || '30 dias',
            totalSymptoms: 45,
            totalMeals: 90,
            correlationsFound: 8,
        },
        correlations: [
            {
                symptom: 'Inchaço abdominal',
                frequency: 18,
                severity: 'medium',
                triggerFoods: [
                    {
                        food: 'Laticínios',
                        occurrences: 12,
                        confidence: 0.89,
                        timingPattern: '30-60 minutos após consumo',
                    },
                    {
                        food: 'Leguminosas (feijão)',
                        occurrences: 8,
                        confidence: 0.76,
                        timingPattern: '1-2 horas após consumo',
                    },
                    {
                        food: 'Crucíferas (brócolis, couve-flor)',
                        occurrences: 6,
                        confidence: 0.68,
                        timingPattern: '2-3 horas após consumo',
                    },
                ],
                recommendations: [
                    'Eliminar laticínios por 2-3 semanas',
                    'Testar intolerância à lactose',
                    'Introduzir probióticos',
                    'Reduzir porções de leguminosas',
                ],
            },
            {
                symptom: 'Dor de cabeça',
                frequency: 12,
                severity: 'high',
                triggerFoods: [
                    {
                        food: 'Alimentos com glutamato monossódico',
                        occurrences: 7,
                        confidence: 0.85,
                        timingPattern: '1-3 horas após consumo',
                    },
                    {
                        food: 'Queijos envelhecidos',
                        occurrences: 5,
                        confidence: 0.72,
                        timingPattern: '2-4 horas após consumo',
                    },
                    {
                        food: 'Chocolate',
                        occurrences: 4,
                        confidence: 0.65,
                        timingPattern: '1-2 horas após consumo',
                    },
                ],
                recommendations: [
                    'Evitar alimentos processados com MSG',
                    'Reduzir consumo de queijos envelhecidos',
                    'Manter diário de enxaqueca',
                    'Avaliar sensibilidade à histamina',
                ],
            },
            {
                symptom: 'Fadiga pós-prandial',
                frequency: 15,
                severity: 'medium',
                triggerFoods: [
                    {
                        food: 'Carboidratos refinados',
                        occurrences: 11,
                        confidence: 0.92,
                        timingPattern: '30-90 minutos após consumo',
                    },
                    {
                        food: 'Refeições muito volumosas',
                        occurrences: 8,
                        confidence: 0.78,
                        timingPattern: 'Imediatamente após',
                    },
                ],
                recommendations: [
                    'Substituir carboidratos refinados por integrais',
                    'Reduzir tamanho das porções',
                    'Aumentar proteína nas refeições',
                    'Fazer caminhada leve após refeições',
                ],
            },
            {
                symptom: 'Refluxo',
                frequency: 10,
                severity: 'medium',
                triggerFoods: [
                    {
                        food: 'Café',
                        occurrences: 6,
                        confidence: 0.81,
                        timingPattern: 'Durante ou logo após consumo',
                    },
                    {
                        food: 'Alimentos ácidos (tomate, cítricos)',
                        occurrences: 5,
                        confidence: 0.74,
                        timingPattern: '30-60 minutos após',
                    },
                    {
                        food: 'Alimentos gordurosos',
                        occurrences: 4,
                        confidence: 0.69,
                        timingPattern: '1-2 horas após',
                    },
                ],
                recommendations: [
                    'Reduzir ou eliminar café',
                    'Evitar alimentos ácidos',
                    'Não deitar logo após refeições',
                    'Elevar cabeceira da cama',
                ],
            },
        ],
        patterns: [
            {
                type: 'Temporal',
                description: 'Sintomas mais frequentes no período noturno',
                insight: 'Pode indicar digestão lenta ou escolhas alimentares inadequadas à noite',
            },
            {
                type: 'Semanal',
                description: 'Maior incidência de sintomas aos finais de semana',
                insight: 'Relacionado a mudanças na rotina e escolhas alimentares',
            },
            {
                type: 'Combinação',
                description: 'Laticínios + glúten = sintomas mais intensos',
                insight: 'Possível sensibilidade combinada',
            },
        ],
        recommendations: {
            immediate: [
                'Protocolo de eliminação: laticínios por 3 semanas',
                'Diário alimentar detalhado com horários',
                'Reduzir alimentos processados',
            ],
            shortTerm: [
                'Exames: teste de intolerância à lactose',
                'Avaliação de sensibilidade ao glúten',
                'Consulta com gastroenterologista se sintomas persistirem',
            ],
            longTerm: [
                'Reintrodução gradual de alimentos eliminados',
                'Manutenção de diário alimentar mensal',
                'Acompanhamento nutricional regular',
            ],
        },
        predictiveAlerts: [
            {
                trigger: 'Laticínios',
                probability: 0.89,
                message: 'Alta probabilidade de inchaço se consumir laticínios',
            },
            {
                trigger: 'Carboidratos refinados no jantar',
                probability: 0.85,
                message: 'Provável fadiga matinal se consumir carboidratos refinados à noite',
            },
        ],
    };
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { patientId, startDate, endDate, period } = body;

        if (!patientId) {
            return NextResponse.json(
                { error: 'Patient ID is required' },
                { status: 400 }
            );
        }

        const analysis = await correlateSymptoms({
            patientId,
            startDate,
            endDate,
            period,
        });

        return NextResponse.json({
            success: true,
            analysis,
            creditsUsed: 90,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error('Error correlating symptoms:', error);
        return NextResponse.json(
            { error: 'Failed to correlate symptoms' },
            { status: 500 }
        );
    }
}
