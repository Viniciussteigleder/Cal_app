import { NextRequest, NextResponse } from 'next/server';

// Mock AI service
async function generateProtocol(data: any) {
    await new Promise(resolve => setTimeout(resolve, 2000));

    const { goal, conditions, restrictions, duration } = data;

    return {
        protocol: {
            name: `Protocolo ${goal}`,
            description: `Protocolo personalizado para ${goal.toLowerCase()} considerando condições específicas`,
            type: goal.toLowerCase().replace(/\s+/g, '_'),
            duration: duration || '12 semanas',
            phases: [
                {
                    name: 'Fase 1: Adaptação',
                    duration: '2 semanas',
                    goals: [
                        'Adaptar o organismo às mudanças alimentares',
                        'Reduzir inflamação inicial',
                        'Estabelecer rotina alimentar',
                    ],
                    allowedFoods: [
                        'Vegetais folhosos (espinafre, couve, rúcula)',
                        'Proteínas magras (frango, peixe, ovos)',
                        'Gorduras boas (abacate, azeite, castanhas)',
                        'Frutas com baixo índice glicêmico (morango, mirtilo)',
                        'Grãos integrais (quinoa, arroz integral)',
                    ],
                    forbiddenFoods: [
                        'Açúcares refinados',
                        'Alimentos processados',
                        'Glúten',
                        'Laticínios',
                        'Álcool',
                    ],
                    supplements: [
                        'Probióticos (10 bilhões UFC)',
                        'Ômega-3 (1-2g/dia)',
                        'Vitamina D (2000 UI/dia)',
                    ],
                    expectedOutcomes: [
                        'Redução de inchaço',
                        'Melhora na energia',
                        'Regulação intestinal',
                    ],
                },
                {
                    name: 'Fase 2: Consolidação',
                    duration: '4 semanas',
                    goals: [
                        'Consolidar hábitos alimentares',
                        'Otimizar composição corporal',
                        'Melhorar marcadores metabólicos',
                    ],
                    allowedFoods: [
                        'Todos da Fase 1',
                        'Leguminosas (feijão, lentilha, grão-de-bico)',
                        'Tubérculos (batata doce, inhame)',
                        'Mais variedade de frutas',
                    ],
                    forbiddenFoods: [
                        'Açúcares refinados',
                        'Alimentos ultraprocessados',
                        'Frituras',
                    ],
                    supplements: [
                        'Probióticos (manutenção)',
                        'Ômega-3',
                        'Magnésio (300mg/dia)',
                        'Vitamina D',
                    ],
                    expectedOutcomes: [
                        'Perda de peso consistente',
                        'Melhora nos exames',
                        'Aumento de disposição',
                    ],
                },
                {
                    name: 'Fase 3: Manutenção',
                    duration: '6 semanas',
                    goals: [
                        'Manter resultados alcançados',
                        'Introduzir flexibilidade controlada',
                        'Estabelecer estilo de vida sustentável',
                    ],
                    allowedFoods: [
                        'Todos das fases anteriores',
                        'Laticínios fermentados (iogurte, kefir) - se tolerado',
                        'Grãos com glúten (se tolerado)',
                        '1-2 refeições livres por semana',
                    ],
                    forbiddenFoods: [
                        'Açúcares em excesso',
                        'Alimentos ultraprocessados frequentes',
                    ],
                    supplements: [
                        'Probióticos (opcional)',
                        'Ômega-3 (manutenção)',
                        'Vitamina D (conforme exames)',
                    ],
                    expectedOutcomes: [
                        'Manutenção do peso',
                        'Exames normalizados',
                        'Autonomia alimentar',
                    ],
                },
            ],
            scientificBasis: {
                references: [
                    'Dieta anti-inflamatória baseada em evidências (Harvard Medical School)',
                    'Protocolo de eliminação para sensibilidades alimentares (IFM)',
                    'Nutrição funcional aplicada (ASBRAN)',
                ],
                evidenceLevel: 'high',
                lastUpdated: new Date().toISOString(),
            },
            contraindications: [
                'Gestantes e lactantes (requer adaptação)',
                'Pessoas com transtornos alimentares',
                'Condições médicas graves sem acompanhamento',
            ],
            warnings: [
                'Acompanhamento médico recomendado',
                'Ajustar conforme resposta individual',
                'Monitorar sintomas de deficiências nutricionais',
            ],
            monitoringRequirements: [
                'Peso semanal',
                'Medidas corporais quinzenais',
                'Exames laboratoriais a cada 3 meses',
                'Diário alimentar diário (primeiras 4 semanas)',
            ],
        },
    };
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { patientId, goal, conditions, restrictions, duration } = body;

        if (!goal) {
            return NextResponse.json(
                { error: 'Goal is required' },
                { status: 400 }
            );
        }

        const result = await generateProtocol({
            patientId,
            goal,
            conditions: conditions || [],
            restrictions: restrictions || [],
            duration,
        });

        return NextResponse.json({
            success: true,
            ...result,
            creditsUsed: 70,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error('Error generating protocol:', error);
        return NextResponse.json(
            { error: 'Failed to generate protocol' },
            { status: 500 }
        );
    }
}
