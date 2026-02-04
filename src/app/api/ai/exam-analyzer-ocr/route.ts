import { NextRequest, NextResponse } from 'next/server';

// Mock AI service - replace with GPT-4 Vision for OCR
async function analyzeExamImage(imageData: any, examType: string) {
    await new Promise(resolve => setTimeout(resolve, 2500));

    return {
        extractedData: {
            examType,
            examDate: '2024-03-15',
            laboratory: 'Laboratório Central',
            patient: {
                name: 'Paciente Exemplo',
                age: 35,
                gender: 'F',
            },
            biomarkers: [
                {
                    name: 'Hemoglobina',
                    value: 13.5,
                    unit: 'g/dL',
                    referenceRange: '12.0 - 16.0',
                    status: 'normal',
                    interpretation: 'Valor dentro da normalidade',
                },
                {
                    name: 'Glicemia de Jejum',
                    value: 105,
                    unit: 'mg/dL',
                    referenceRange: '70 - 99',
                    status: 'high',
                    interpretation: 'Glicemia de jejum alterada - pré-diabetes',
                },
                {
                    name: 'Colesterol Total',
                    value: 220,
                    unit: 'mg/dL',
                    referenceRange: '< 200',
                    status: 'high',
                    interpretation: 'Colesterol total elevado',
                },
                {
                    name: 'HDL',
                    value: 45,
                    unit: 'mg/dL',
                    referenceRange: '> 40',
                    status: 'normal',
                    interpretation: 'HDL dentro da normalidade',
                },
                {
                    name: 'LDL',
                    value: 150,
                    unit: 'mg/dL',
                    referenceRange: '< 130',
                    status: 'high',
                    interpretation: 'LDL elevado - risco cardiovascular',
                },
                {
                    name: 'Triglicerídeos',
                    value: 180,
                    unit: 'mg/dL',
                    referenceRange: '< 150',
                    status: 'high',
                    interpretation: 'Triglicerídeos elevados',
                },
                {
                    name: 'Vitamina D',
                    value: 22,
                    unit: 'ng/mL',
                    referenceRange: '30 - 100',
                    status: 'low',
                    interpretation: 'Deficiência de vitamina D',
                },
            ],
        },
        aiAnalysis: {
            summary: 'Exame apresenta alterações metabólicas importantes que requerem intervenção nutricional.',
            concerns: [
                {
                    severity: 'high',
                    biomarker: 'Glicemia de Jejum',
                    description: 'Glicemia de jejum alterada indica pré-diabetes',
                    recommendation: 'Reduzir carboidratos refinados e aumentar fibras',
                },
                {
                    severity: 'high',
                    biomarker: 'LDL',
                    description: 'LDL elevado aumenta risco cardiovascular',
                    recommendation: 'Reduzir gorduras saturadas e trans',
                },
                {
                    severity: 'medium',
                    biomarker: 'Triglicerídeos',
                    description: 'Triglicerídeos elevados',
                    recommendation: 'Reduzir açúcares e álcool',
                },
                {
                    severity: 'medium',
                    biomarker: 'Vitamina D',
                    description: 'Deficiência de vitamina D',
                    recommendation: 'Suplementação de 2000-4000 UI/dia',
                },
            ],
            nutritionalRecommendations: [
                {
                    category: 'Alimentos para Aumentar',
                    items: [
                        'Vegetais folhosos verdes',
                        'Peixes ricos em ômega-3 (salmão, sardinha)',
                        'Nozes e sementes',
                        'Azeite de oliva extra virgem',
                        'Frutas com baixo índice glicêmico',
                    ],
                },
                {
                    category: 'Alimentos para Reduzir',
                    items: [
                        'Açúcares refinados e doces',
                        'Carboidratos refinados (pão branco, massas)',
                        'Gorduras saturadas (carnes gordas)',
                        'Alimentos processados',
                        'Bebidas alcoólicas',
                    ],
                },
                {
                    category: 'Suplementação Sugerida',
                    items: [
                        'Vitamina D: 2000-4000 UI/dia',
                        'Ômega-3: 1-2g/dia',
                        'Fibras solúveis',
                    ],
                },
            ],
            protocolSuggestion: 'Protocolo Anti-inflamatório + Controle Glicêmico',
            followUp: {
                examToRepeat: ['Glicemia de Jejum', 'Perfil Lipídico', 'Vitamina D'],
                timeframe: '3 meses',
            },
        },
        confidence: 0.92,
    };
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { imageData, examType, patientId } = body;

        if (!imageData || !examType) {
            return NextResponse.json(
                { error: 'Image data and exam type are required' },
                { status: 400 }
            );
        }

        const analysis = await analyzeExamImage(imageData, examType);

        return NextResponse.json({
            success: true,
            analysis,
            creditsUsed: 80,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error('Error analyzing exam:', error);
        return NextResponse.json(
            { error: 'Failed to analyze exam' },
            { status: 500 }
        );
    }
}
