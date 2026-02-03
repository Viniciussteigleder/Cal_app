import { NextRequest, NextResponse } from 'next/server';

// Mock AI service - replace with actual OpenAI integration
async function generateSupplementRecommendations(patientData: any) {
    await new Promise(resolve => setTimeout(resolve, 1500));

    return {
        nutrientGaps: [
            {
                nutrient: 'Vitamina D',
                currentLevel: 18,
                optimalLevel: 40,
                unit: 'ng/mL',
                severity: 'high',
                status: 'Deficiente',
            },
            {
                nutrient: 'Vitamina B12',
                currentLevel: 250,
                optimalLevel: 400,
                unit: 'pg/mL',
                severity: 'medium',
                status: 'Baixo',
            },
            {
                nutrient: 'Ferro',
                currentLevel: 35,
                optimalLevel: 70,
                unit: 'µg/dL',
                severity: 'high',
                status: 'Deficiente',
            },
            {
                nutrient: 'Ômega-3',
                currentLevel: 3.5,
                optimalLevel: 8,
                unit: '%',
                severity: 'medium',
                status: 'Baixo',
            },
            {
                nutrient: 'Magnésio',
                currentLevel: 1.6,
                optimalLevel: 2.2,
                unit: 'mg/dL',
                severity: 'low',
                status: 'Limítrofe',
            },
            {
                nutrient: 'Zinco',
                currentLevel: 65,
                optimalLevel: 90,
                unit: 'µg/dL',
                severity: 'low',
                status: 'Limítrofe',
            },
        ],
        recommendations: [
            {
                supplement: 'Vitamina D3',
                dosage: '5.000 UI',
                timing: 'Pela manhã, com refeição',
                duration: '3 meses',
                priority: 'high',
                estimatedCost: 'R$ 45/mês',
                benefits: [
                    'Melhora absorção de cálcio',
                    'Fortalece sistema imunológico',
                    'Reduz risco de doenças crônicas',
                ],
                warnings: [
                    'Não exceder 10.000 UI/dia',
                    'Monitorar níveis sanguíneos',
                ],
            },
            {
                supplement: 'Complexo B',
                dosage: '1 cápsula',
                timing: 'Pela manhã',
                duration: '2 meses',
                priority: 'medium',
                estimatedCost: 'R$ 35/mês',
                benefits: [
                    'Melhora energia e disposição',
                    'Suporte ao metabolismo',
                    'Saúde neurológica',
                ],
                warnings: [],
            },
            {
                supplement: 'Ferro Quelato',
                dosage: '30mg',
                timing: 'Em jejum ou com vitamina C',
                duration: '3 meses',
                priority: 'high',
                estimatedCost: 'R$ 40/mês',
                benefits: [
                    'Combate anemia',
                    'Melhora oxigenação',
                    'Reduz fadiga',
                ],
                warnings: [
                    'Não tomar com café ou chá',
                    'Pode causar constipação',
                    'Reavaliar após 3 meses',
                ],
            },
            {
                supplement: 'Ômega-3 (EPA/DHA)',
                dosage: '2g',
                timing: 'Com refeição principal',
                duration: 'Uso contínuo',
                priority: 'medium',
                estimatedCost: 'R$ 60/mês',
                benefits: [
                    'Anti-inflamatório natural',
                    'Saúde cardiovascular',
                    'Função cognitiva',
                ],
                warnings: [
                    'Verificar qualidade (pureza)',
                ],
            },
        ],
        interactions: [
            {
                type: 'drug-supplement',
                severity: 'medium',
                description: 'Ferro pode reduzir absorção de medicamentos para tireoide',
                recommendation: 'Tomar com intervalo de 4 horas',
            },
            {
                type: 'supplement-supplement',
                severity: 'low',
                description: 'Cálcio pode interferir na absorção de ferro',
                recommendation: 'Evitar tomar juntos',
            },
        ],
        totalEstimatedCost: 'R$ 180/mês',
    };
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { patientId, examData } = body;

        if (!patientId) {
            return NextResponse.json(
                { error: 'Patient ID is required' },
                { status: 400 }
            );
        }

        const analysis = await generateSupplementRecommendations({ patientId, examData });

        return NextResponse.json({
            success: true,
            analysis,
            creditsUsed: 75,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error('Error analyzing supplements:', error);
        return NextResponse.json(
            { error: 'Failed to analyze supplements' },
            { status: 500 }
        );
    }
}
