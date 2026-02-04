import { NextRequest, NextResponse } from 'next/server';

// Mock AI service
async function generateProgressReport(data: any) {
    await new Promise(resolve => setTimeout(resolve, 1500));

    return {
        summary: {
            period: data.period || '90 dias',
            overallProgress: 85,
            adherenceScore: 78,
            goalAchievement: 'Em progresso',
        },
        metrics: [
            {
                name: 'Peso',
                current: 72.5,
                initial: 78.0,
                target: 68.0,
                unit: 'kg',
                change: -5.5,
                changePercent: -7.1,
                trend: 'down',
                status: 'good',
                chartData: [
                    { date: '2024-01-01', value: 78.0 },
                    { date: '2024-01-15', value: 76.5 },
                    { date: '2024-02-01', value: 75.0 },
                    { date: '2024-02-15', value: 74.0 },
                    { date: '2024-03-01', value: 73.0 },
                    { date: '2024-03-15', value: 72.5 },
                ],
            },
            {
                name: 'IMC',
                current: 25.2,
                initial: 27.1,
                target: 23.5,
                unit: '',
                change: -1.9,
                changePercent: -7.0,
                trend: 'down',
                status: 'good',
            },
            {
                name: 'Circunferência Abdominal',
                current: 82,
                initial: 92,
                target: 75,
                unit: 'cm',
                change: -10,
                changePercent: -10.9,
                trend: 'down',
                status: 'excellent',
            },
            {
                name: 'Gordura Corporal',
                current: 28,
                initial: 34,
                target: 22,
                unit: '%',
                change: -6,
                changePercent: -17.6,
                trend: 'down',
                status: 'excellent',
            },
            {
                name: 'Massa Muscular',
                current: 52,
                initial: 48,
                target: 55,
                unit: 'kg',
                change: +4,
                changePercent: +8.3,
                trend: 'up',
                status: 'good',
            },
        ],
        achievements: [
            {
                title: 'Perda de Peso Consistente',
                description: 'Perdeu 5.5kg em 90 dias, mantendo ritmo saudável de 0.6kg/semana',
                icon: 'TrendingDown',
                date: '2024-03-15',
            },
            {
                title: 'Redução de Gordura Corporal',
                description: 'Reduziu 6% de gordura corporal, superando a meta inicial',
                icon: 'Target',
                date: '2024-03-10',
            },
            {
                title: 'Ganho de Massa Muscular',
                description: 'Ganhou 4kg de massa muscular através de treino e alimentação adequada',
                icon: 'TrendingUp',
                date: '2024-03-05',
            },
            {
                title: 'Aderência ao Plano',
                description: '78% de aderência ao plano alimentar nos últimos 90 dias',
                icon: 'CheckCircle',
                date: '2024-03-01',
            },
        ],
        challenges: [
            {
                title: 'Fins de Semana',
                description: 'Aderência cai para 45% aos finais de semana',
                severity: 'medium',
                recommendation: 'Planejar refeições de fim de semana com antecedência',
            },
            {
                title: 'Hidratação',
                description: 'Meta de água atingida em apenas 60% dos dias',
                severity: 'low',
                recommendation: 'Configurar lembretes no celular a cada 2 horas',
            },
            {
                title: 'Sono Irregular',
                description: 'Padrão de sono inconsistente afetando recuperação',
                severity: 'medium',
                recommendation: 'Estabelecer rotina de sono com horário fixo',
            },
        ],
        recommendations: [
            {
                category: 'Nutrição',
                priority: 'high',
                items: [
                    'Aumentar consumo de proteína no café da manhã',
                    'Incluir mais vegetais nas refeições principais',
                    'Reduzir carboidratos refinados à noite',
                ],
            },
            {
                category: 'Exercício',
                priority: 'medium',
                items: [
                    'Aumentar frequência de treino de força para 4x/semana',
                    'Incluir 20min de cardio pós-treino',
                    'Adicionar alongamento diário',
                ],
            },
            {
                category: 'Comportamento',
                priority: 'high',
                items: [
                    'Preparar marmitas para o fim de semana',
                    'Praticar mindful eating',
                    'Registrar emoções no diário alimentar',
                ],
            },
            {
                category: 'Próximos Passos',
                priority: 'high',
                items: [
                    'Agendar consulta de acompanhamento em 15 dias',
                    'Solicitar novos exames (perfil lipídico, glicemia)',
                    'Ajustar meta calórica para próxima fase',
                ],
            },
        ],
    };
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { patientId, period, reportType } = body;

        if (!patientId) {
            return NextResponse.json(
                { error: 'Patient ID is required' },
                { status: 400 }
            );
        }

        const report = await generateProgressReport({ patientId, period, reportType });

        return NextResponse.json({
            success: true,
            report,
            creditsUsed: 60,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error('Error generating report:', error);
        return NextResponse.json(
            { error: 'Failed to generate report' },
            { status: 500 }
        );
    }
}
