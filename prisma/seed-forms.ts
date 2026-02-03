import { PrismaClient, FormType } from '@prisma/client';

const prisma = new PrismaClient();

const FORM_TEMPLATES: Array<{
    title: string;
    type: FormType;
    description: string;
    structure_json: any;
    is_system: boolean;
}> = [
        {
            title: "Anamnese Nutricional Completa",
            type: "system",
            description: "Histórico clínico, social e alimentar detalhado.",
            structure_json: {
                sections: [
                    {
                        title: "Dados Pessoais",
                        fields: [
                            { id: "age", label: "Idade", type: "number" },
                            { id: "occupation", label: "Profissão", type: "text" },
                            { id: "family_history", label: "Histórico Familiar", type: "textarea" },
                        ]
                    },
                    {
                        title: "Histórico Clínico",
                        fields: [
                            { id: "medications", label: "Medicamentos em uso", type: "textarea" },
                            { id: "allergies", label: "Alergias", type: "textarea" },
                            { id: "chronic_conditions", label: "Condições crônicas", type: "textarea" },
                        ]
                    }
                ]
            },
            is_system: true,
        },
        {
            title: "Rastreamento Metabólico",
            type: "system",
            description: "Identificação de sinais e sintomas sistêmicos.",
            structure_json: {
                sections: [
                    {
                        title: "Sintomas Metabólicos",
                        fields: [
                            { id: "energy_levels", label: "Níveis de energia", type: "scale", min: 1, max: 10 },
                            { id: "sleep_quality", label: "Qualidade do sono", type: "scale", min: 1, max: 10 },
                            { id: "weight_changes", label: "Mudanças de peso recentes", type: "textarea" },
                        ]
                    }
                ]
            },
            is_system: true,
        },
        {
            title: "Risco de Disbiose",
            type: "system",
            description: "Avaliação da saúde intestinal e microbiota.",
            structure_json: {
                sections: [
                    {
                        title: "Saúde Intestinal",
                        fields: [
                            { id: "bowel_frequency", label: "Frequência de evacuação", type: "select", options: ["1x/dia", "2-3x/dia", "Irregular"] },
                            { id: "bristol_scale", label: "Escala de Bristol", type: "select", options: ["Tipo 1", "Tipo 2", "Tipo 3", "Tipo 4", "Tipo 5", "Tipo 6", "Tipo 7"] },
                            { id: "bloating", label: "Inchaço abdominal", type: "boolean" },
                        ]
                    }
                ]
            },
            is_system: true,
        },
        {
            title: "Frequência Alimentar",
            type: "system",
            description: "Registro de hábitos de consumo habitual.",
            structure_json: {
                sections: [
                    {
                        title: "Consumo Habitual",
                        fields: [
                            { id: "dairy", label: "Laticínios", type: "select", options: ["Nunca", "Raro", "Semanal", "Diário"] },
                            { id: "grains", label: "Grãos/Cereais", type: "select", options: ["Nunca", "Raro", "Semanal", "Diário"] },
                            { id: "vegetables", label: "Vegetais", type: "select", options: ["Nunca", "Raro", "Semanal", "Diário"] },
                        ]
                    }
                ]
            },
            is_system: true,
        },
        {
            title: "Sinais e Sintomas",
            type: "system",
            description: "Checklist de queixas físicas recorrentes.",
            structure_json: {
                sections: [
                    {
                        title: "Sintomas Gerais",
                        fields: [
                            { id: "headaches", label: "Dores de cabeça", type: "boolean" },
                            { id: "fatigue", label: "Fadiga crônica", type: "boolean" },
                            { id: "joint_pain", label: "Dores articulares", type: "boolean" },
                        ]
                    }
                ]
            },
            is_system: true,
        },
        {
            title: "Qualidade do Sono",
            type: "system",
            description: "Avaliação de higiene e padrões de sono.",
            structure_json: {
                sections: [
                    {
                        title: "Padrões de Sono",
                        fields: [
                            { id: "sleep_hours", label: "Horas de sono por noite", type: "number" },
                            { id: "sleep_quality", label: "Qualidade do sono", type: "scale", min: 1, max: 10 },
                            { id: "wake_ups", label: "Acorda durante a noite?", type: "boolean" },
                        ]
                    }
                ]
            },
            is_system: true,
        },
        {
            title: "Estresse e Ansiedade",
            type: "system",
            description: "Monitoramento de saúde mental e cortisol.",
            structure_json: {
                sections: [
                    {
                        title: "Níveis de Estresse",
                        fields: [
                            { id: "stress_level", label: "Nível de estresse", type: "scale", min: 1, max: 10 },
                            { id: "anxiety_symptoms", label: "Sintomas de ansiedade", type: "textarea" },
                            { id: "coping_mechanisms", label: "Estratégias de enfrentamento", type: "textarea" },
                        ]
                    }
                ]
            },
            is_system: true,
        },
        {
            title: "Saúde Digestiva (Bristol)",
            type: "system",
            description: "Diário de evacuação e escala de Bristol.",
            structure_json: {
                sections: [
                    {
                        title: "Função Digestiva",
                        fields: [
                            { id: "bristol_type", label: "Tipo de fezes (Bristol)", type: "select", options: ["Tipo 1", "Tipo 2", "Tipo 3", "Tipo 4", "Tipo 5", "Tipo 6", "Tipo 7"] },
                            { id: "frequency", label: "Frequência diária", type: "number" },
                            { id: "discomfort", label: "Desconforto ao evacuar", type: "boolean" },
                        ]
                    }
                ]
            },
            is_system: true,
        },
        {
            title: "Histórico de Atividade Física",
            type: "system",
            description: "Nível de sedentarismo e rotina de treinos.",
            structure_json: {
                sections: [
                    {
                        title: "Atividade Física",
                        fields: [
                            { id: "exercise_frequency", label: "Frequência de exercícios", type: "select", options: ["Sedentário", "1-2x/semana", "3-4x/semana", "5+x/semana"] },
                            { id: "exercise_type", label: "Tipo de exercício", type: "textarea" },
                            { id: "exercise_duration", label: "Duração média (minutos)", type: "number" },
                        ]
                    }
                ]
            },
            is_system: true,
        },
        {
            title: "Metas e Preferências",
            type: "system",
            description: "Alinhamento de objetivos e aversões alimentares.",
            structure_json: {
                sections: [
                    {
                        title: "Objetivos",
                        fields: [
                            { id: "primary_goal", label: "Objetivo principal", type: "textarea" },
                            { id: "food_aversions", label: "Aversões alimentares", type: "textarea" },
                            { id: "dietary_restrictions", label: "Restrições dietéticas", type: "textarea" },
                        ]
                    }
                ]
            },
            is_system: true,
        },
    ];

async function main() {
    console.log('🌱 Starting seed...');

    // Get the first tenant (or create one if needed)
    const tenant = await prisma.tenant.findFirst();

    if (!tenant) {
        console.error('❌ No tenant found. Please create a tenant first.');
        return;
    }

    console.log(`📋 Seeding form templates for tenant: ${tenant.name}`);

    for (const template of FORM_TEMPLATES) {
        const existing = await prisma.formTemplate.findFirst({
            where: {
                tenant_id: tenant.id,
                title: template.title,
            },
        });

        if (existing) {
            console.log(`⏭️  Skipping "${template.title}" (already exists)`);
            continue;
        }

        await prisma.formTemplate.create({
            data: {
                tenant_id: tenant.id,
                title: template.title,
                type: template.type as any,
                structure_json: template.structure_json,
                is_system: template.is_system,
            },
        });

        console.log(`✅ Created template: "${template.title}"`);
    }

    console.log('🎉 Seed completed!');
}

main()
    .catch((e) => {
        console.error('❌ Seed failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
