/**
 * Demo Data Population Script
 * Creates 3 demo patients with 3 months of realistic data
 * 
 * Scenarios:
 * 1. Maria Silva - Excellent adherence, steady progress
 * 2. João Santos - Moderate adherence, plateaued progress
 * 3. Ana Costa - Poor adherence, high dropout risk
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Helper: Generate dates for last 90 days
function getLast90Days(): Date[] {
    const dates: Date[] = [];
    const today = new Date();
    for (let i = 89; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        dates.push(date);
    }
    return dates;
}

// Helper: Random number in range
function randomInRange(min: number, max: number): number {
    return Math.random() * (max - min) + min;
}

// Helper: Random boolean with probability
function randomBool(probability: number = 0.5): boolean {
    return Math.random() < probability;
}

// SCENARIO 1: Maria Silva - Excellent Patient
async function createMariaSilva(tenantId: string) {
    console.log('Creating Maria Silva (Excellent Patient)...');

    // Create patient
    const { data: patient, error: patientError } = await supabase
        .from('patients')
        .insert({
            tenant_id: tenantId,
            name: 'Maria Silva',
            email: 'maria.silva@demo.com',
            phone: '+55 11 98765-4321',
            birth_date: '1985-03-15',
            gender: 'female',
            initial_weight: 78.5,
            current_weight: 68.2,
            height: 165,
            goals: ['weight_loss', 'improve_health'],
            status: 'active',
            created_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        })
        .select()
        .single();

    if (patientError) {
        console.error('Error creating Maria:', patientError);
        return;
    }

    console.log('✓ Maria Silva created');

    // Assign FODMAP protocol
    await supabase.from('patient_protocols').insert({
        patient_id: patient.id,
        protocol_code: 'FODMAP',
        current_phase: 2,
        started_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    });

    const dates = getLast90Days();

    // Create daily logs (95% adherence)
    for (const date of dates) {
        if (randomBool(0.95)) {
            // Weight progression (steady loss)
            const daysAgo = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
            const weight = 78.5 - (daysAgo / 90) * 10.3; // Lost 10.3kg over 90 days

            await supabase.from('daily_logs').insert({
                patient_id: patient.id,
                tenant_id: tenantId,
                date: date.toISOString().split('T')[0],
                log_type: 'patient',
                weight: parseFloat(weight.toFixed(1)),
                water_intake: randomInRange(2000, 2500),
                exercise_minutes: randomInRange(30, 60),
                sleep_hours: randomInRange(7, 8.5),
                mood: randomBool(0.9) ? 'good' : 'neutral',
                meals: [
                    {
                        mealType: 'breakfast',
                        time: '08:00',
                        foods: ['Omelete com vegetais', 'Pão integral', 'Café'],
                        totalCalories: randomInRange(300, 400),
                    },
                    {
                        mealType: 'lunch',
                        time: '12:30',
                        foods: ['Frango grelhado', 'Arroz integral', 'Salada'],
                        totalCalories: randomInRange(500, 600),
                    },
                    {
                        mealType: 'snack',
                        time: '16:00',
                        foods: ['Iogurte natural', 'Frutas'],
                        totalCalories: randomInRange(150, 200),
                    },
                    {
                        mealType: 'dinner',
                        time: '19:30',
                        foods: ['Peixe assado', 'Legumes'],
                        totalCalories: randomInRange(400, 500),
                    },
                ],
                symptoms: randomBool(0.1) ? [
                    {
                        type: 'bloating',
                        severity: 1,
                        time: '14:00',
                        notes: 'Leve desconforto',
                    },
                ] : [],
                notes: randomBool(0.3) ? 'Dia produtivo, me sinto bem!' : '',
            });
        }
    }

    // Create AI analyses (weekly)
    for (let week = 0; week < 12; week++) {
        const analysisDate = new Date(Date.now() - (11 - week) * 7 * 24 * 60 * 60 * 1000);
        await supabase.from('ai_analyses').insert({
            patient_id: patient.id,
            tenant_id: tenantId,
            analysis_type: 'patient_analyzer',
            analysis_date: analysisDate.toISOString().split('T')[0],
            adherence_score: randomInRange(85, 95),
            progress_score: randomInRange(80, 90),
            dropout_risk: 'low',
            insights: [
                'Excelente consistência no registro de refeições',
                'Progresso constante e sustentável',
                'Boa hidratação e sono adequado',
            ],
            recommended_actions: [
                {
                    action: 'Manter acompanhamento regular',
                    priority: 'low',
                    description: 'Paciente está indo muito bem',
                },
            ],
            credits_used: 20,
        });
    }

    // Create food recognitions (2-3 per week)
    for (let week = 0; week < 12; week++) {
        const recognitionsPerWeek = Math.floor(randomInRange(2, 4));
        for (let i = 0; i < recognitionsPerWeek; i++) {
            const recognitionDate = new Date(Date.now() - (11 - week) * 7 * 24 * 60 * 60 * 1000 - i * 2 * 24 * 60 * 60 * 1000);
            await supabase.from('food_recognitions').insert({
                patient_id: patient.id,
                tenant_id: tenantId,
                recognition_date: recognitionDate.toISOString(),
                image_url: 'https://placeholder.com/food.jpg',
                recognized_foods: [
                    {
                        food_name: 'Frango Grelhado',
                        confidence: 0.95,
                        portion_grams: 150,
                    },
                    {
                        food_name: 'Arroz Integral',
                        confidence: 0.92,
                        portion_grams: 100,
                    },
                ],
                confidence_score: 0.93,
                confirmed: true,
                credits_used: 20,
            });
        }
    }

    console.log('✓ Maria Silva data populated (95% adherence, excellent progress)');
}

// SCENARIO 2: João Santos - Moderate Patient
async function createJoaoSantos(tenantId: string) {
    console.log('Creating João Santos (Moderate Patient)...');

    const { data: patient, error: patientError } = await supabase
        .from('patients')
        .insert({
            tenant_id: tenantId,
            name: 'João Santos',
            email: 'joao.santos@demo.com',
            phone: '+55 11 98765-1234',
            birth_date: '1978-07-22',
            gender: 'male',
            initial_weight: 92.0,
            current_weight: 88.5,
            height: 178,
            goals: ['weight_loss', 'control_diabetes'],
            status: 'active',
            created_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        })
        .select()
        .single();

    if (patientError) {
        console.error('Error creating João:', patientError);
        return;
    }

    console.log('✓ João Santos created');

    // Assign LACTOSE protocol
    await supabase.from('patient_protocols').insert({
        patient_id: patient.id,
        protocol_code: 'LACTOSE',
        current_phase: 1,
        started_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    });

    const dates = getLast90Days();

    // Create daily logs (65% adherence - moderate)
    for (const date of dates) {
        if (randomBool(0.65)) {
            const daysAgo = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
            // Plateaued after initial loss
            const weight = daysAgo > 45 ? 92.0 - (daysAgo - 45) / 45 * 3.5 : 88.5;

            await supabase.from('daily_logs').insert({
                patient_id: patient.id,
                tenant_id: tenantId,
                date: date.toISOString().split('T')[0],
                log_type: 'patient',
                weight: parseFloat(weight.toFixed(1)),
                water_intake: randomInRange(1500, 2000),
                exercise_minutes: randomInRange(0, 30),
                sleep_hours: randomInRange(6, 7.5),
                mood: randomBool(0.6) ? 'neutral' : randomBool(0.5) ? 'good' : 'bad',
                meals: randomBool(0.7) ? [
                    {
                        mealType: 'breakfast',
                        time: '07:30',
                        foods: ['Café', 'Pão'],
                        totalCalories: randomInRange(250, 350),
                    },
                    {
                        mealType: 'lunch',
                        time: '13:00',
                        foods: ['Comida caseira'],
                        totalCalories: randomInRange(600, 800),
                    },
                ] : [],
                symptoms: randomBool(0.3) ? [
                    {
                        type: 'bloating',
                        severity: randomInRange(2, 4),
                        time: '15:00',
                        notes: 'Desconforto após refeição',
                    },
                ] : [],
                notes: randomBool(0.2) ? 'Dia corrido, difícil manter rotina' : '',
            });
        }
    }

    // Create AI analyses (every 2 weeks)
    for (let analysis = 0; analysis < 6; analysis++) {
        const analysisDate = new Date(Date.now() - (5 - analysis) * 14 * 24 * 60 * 60 * 1000);
        await supabase.from('ai_analyses').insert({
            patient_id: patient.id,
            tenant_id: tenantId,
            analysis_type: 'patient_analyzer',
            analysis_date: analysisDate.toISOString().split('T')[0],
            adherence_score: randomInRange(60, 70),
            progress_score: randomInRange(50, 65),
            dropout_risk: 'medium',
            insights: [
                'Adesão moderada ao plano',
                'Progresso estagnado nas últimas semanas',
                'Necessita mais suporte e motivação',
            ],
            recommended_actions: [
                {
                    action: 'Agendar consulta de acompanhamento',
                    priority: 'medium',
                    description: 'Revisar estratégias e motivação',
                },
            ],
            credits_used: 20,
        });
    }

    console.log('✓ João Santos data populated (65% adherence, plateaued progress)');
}

// SCENARIO 3: Ana Costa - Struggling Patient
async function createAnaCosta(tenantId: string) {
    console.log('Creating Ana Costa (Struggling Patient)...');

    const { data: patient, error: patientError } = await supabase
        .from('patients')
        .insert({
            tenant_id: tenantId,
            name: 'Ana Costa',
            email: 'ana.costa@demo.com',
            phone: '+55 11 98765-5678',
            birth_date: '1992-11-08',
            gender: 'female',
            initial_weight: 85.0,
            current_weight: 84.2,
            height: 160,
            goals: ['weight_loss', 'improve_energy'],
            status: 'active',
            created_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        })
        .select()
        .single();

    if (patientError) {
        console.error('Error creating Ana:', patientError);
        return;
    }

    console.log('✓ Ana Costa created');

    // Assign GLUTEN protocol
    await supabase.from('patient_protocols').insert({
        patient_id: patient.id,
        protocol_code: 'GLUTEN',
        current_phase: 1,
        started_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    });

    const dates = getLast90Days();

    // Create daily logs (35% adherence - poor)
    // More logs in first 30 days, then drops off
    for (const date of dates) {
        const daysAgo = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
        const adherenceProbability = daysAgo > 60 ? 0.5 : daysAgo > 30 ? 0.3 : 0.15;

        if (randomBool(adherenceProbability)) {
            const weight = 85.0 - randomInRange(-0.5, 1.5); // Minimal/no progress

            await supabase.from('daily_logs').insert({
                patient_id: patient.id,
                tenant_id: tenantId,
                date: date.toISOString().split('T')[0],
                log_type: 'patient',
                weight: parseFloat(weight.toFixed(1)),
                water_intake: randomInRange(800, 1500),
                exercise_minutes: randomInRange(0, 15),
                sleep_hours: randomInRange(5, 6.5),
                mood: randomBool(0.3) ? 'neutral' : 'bad',
                meals: randomBool(0.5) ? [
                    {
                        mealType: 'lunch',
                        time: '14:00',
                        foods: ['Fast food'],
                        totalCalories: randomInRange(800, 1200),
                    },
                ] : [],
                symptoms: randomBool(0.5) ? [
                    {
                        type: 'fatigue',
                        severity: randomInRange(3, 5),
                        time: '16:00',
                        notes: 'Muito cansada',
                    },
                    {
                        type: 'bloating',
                        severity: randomInRange(3, 5),
                        time: '15:00',
                        notes: 'Desconforto frequente',
                    },
                ] : [],
                notes: randomBool(0.4) ? 'Difícil seguir o plano, muito estresse' : '',
            });
        }
    }

    // Create AI analyses (monthly)
    for (let month = 0; month < 3; month++) {
        const analysisDate = new Date(Date.now() - (2 - month) * 30 * 24 * 60 * 60 * 1000);
        await supabase.from('ai_analyses').insert({
            patient_id: patient.id,
            tenant_id: tenantId,
            analysis_type: 'patient_analyzer',
            analysis_date: analysisDate.toISOString().split('T')[0],
            adherence_score: randomInRange(25, 40),
            progress_score: randomInRange(15, 30),
            dropout_risk: 'high',
            insights: [
                'Baixa adesão ao plano alimentar',
                'Registro inconsistente de refeições',
                'Alto risco de abandono do tratamento',
                'Sintomas frequentes não controlados',
            ],
            recommended_actions: [
                {
                    action: 'Intervenção urgente necessária',
                    priority: 'high',
                    description: 'Agendar consulta imediata para revisar abordagem',
                },
                {
                    action: 'Considerar suporte psicológico',
                    priority: 'high',
                    description: 'Paciente pode estar enfrentando barreiras emocionais',
                },
            ],
            credits_used: 20,
        });
    }

    console.log('✓ Ana Costa data populated (35% adherence, high dropout risk)');
}

// Main execution
async function populateDemoData() {
    console.log('🚀 Starting demo data population...\n');

    // Get or create demo tenant
    const { data: tenant, error: tenantError } = await supabase
        .from('tenants')
        .select()
        .eq('email', 'demo@nutriplan.com')
        .single();

    let tenantId: string;

    if (tenantError || !tenant) {
        console.log('Creating demo tenant...');
        const { data: newTenant, error: createError } = await supabase
            .from('tenants')
            .insert({
                name: 'Clínica Demo NutriPlan',
                email: 'demo@nutriplan.com',
                plan: 'professional',
                ai_credits: 50000,
            })
            .select()
            .single();

        if (createError) {
            console.error('Error creating tenant:', createError);
            return;
        }
        tenantId = newTenant.id;
        console.log('✓ Demo tenant created\n');
    } else {
        tenantId = tenant.id;
        console.log('✓ Using existing demo tenant\n');
    }

    // Create all three patient scenarios
    await createMariaSilva(tenantId);
    console.log('');
    await createJoaoSantos(tenantId);
    console.log('');
    await createAnaCosta(tenantId);

    console.log('\n✅ Demo data population complete!');
    console.log('\n📊 Summary:');
    console.log('   • 3 patients created with different scenarios');
    console.log('   • 90 days of historical data');
    console.log('   • Daily logs, AI analyses, food recognitions');
    console.log('   • Realistic adherence patterns and progress');
    console.log('\n🎭 Patient Scenarios:');
    console.log('   1. Maria Silva - Excellent (95% adherence, steady progress)');
    console.log('   2. João Santos - Moderate (65% adherence, plateaued)');
    console.log('   3. Ana Costa - Struggling (35% adherence, high dropout risk)');
}

// Run the script
populateDemoData().catch(console.error);

export { populateDemoData };
