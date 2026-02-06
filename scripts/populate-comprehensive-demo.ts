
import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const prisma = new PrismaClient();

const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'];
const SYMPTOM_TYPES = ['bloating', 'gas', 'abdominal_pain', 'nausea', 'diarrhea'];

// Comprehensive Food Database for Mocking
const FOOD_DB = {
    proteins: [
        { name: "Frango Grelhado", calories: 165, p: 31, c: 0, f: 3.6, group: "protein" },
        { name: "Ovo Cozido", calories: 155, p: 13, c: 1.1, f: 11, group: "protein" },
        { name: "Salmão Assado", calories: 208, p: 20, c: 0, f: 13, group: "protein" },
        { name: "Whey Protein", calories: 120, p: 24, c: 3, f: 1, group: "protein" },
        { name: "Carne Moída Magra", calories: 250, p: 26, c: 0, f: 15, group: "protein" },
    ],
    carbs: [
        { name: "Arroz Integral", calories: 112, p: 2.6, c: 23, f: 0.9, group: "grains" },
        { name: "Batata Doce", calories: 86, p: 1.6, c: 20, f: 0.1, group: "vegetables" },
        { name: "Aveia", calories: 389, p: 16.9, c: 66, f: 6.9, group: "grains" },
        { name: "Pão Integral", calories: 250, p: 12, c: 43, f: 3, group: "grains" },
        { name: "Macarrão", calories: 131, p: 5, c: 25, f: 1.1, group: "grains" },
    ],
    fats: [
        { name: "Azeite de Oliva", calories: 884, p: 0, c: 0, f: 100, group: "oils" },
        { name: "Abacate", calories: 160, p: 2, c: 8.5, f: 14.7, group: "fruits" },
        { name: "Castanhas", calories: 600, p: 15, c: 20, f: 55, group: "other" },
    ],
    vegetables: [
        { name: "Brócolis", calories: 34, p: 2.8, c: 7, f: 0.4, group: "vegetables" },
        { name: "Espinafre", calories: 23, p: 2.9, c: 3.6, f: 0.4, group: "vegetables" },
        { name: "Salada Mista", calories: 20, p: 1, c: 4, f: 0.2, group: "vegetables" },
    ],
    processed: [
        { name: "Pizza", calories: 266, p: 11, c: 33, f: 10, group: "other" },
        { name: "Hambúrguer", calories: 295, p: 17, c: 30, f: 14, group: "other" },
        { name: "Sorvete", calories: 207, p: 3.5, c: 24, f: 11, group: "sweets" },
    ],
    dairy: [ // High FODMAP potential
        { name: "Leite Integral", calories: 61, p: 3.2, c: 4.8, f: 3.3, group: "dairy" },
        { name: "Iogurte Natural", calories: 59, p: 10, c: 3.6, f: 0.4, group: "dairy" },
        { name: "Queijo", calories: 402, p: 25, c: 1.3, f: 33, group: "dairy" },
    ]
};

async function createComprehensiveDataset() {
    console.log('🚀 Starting Comprehensive Data Population (3 Months)...');

    // 1. Setup Tenant
    const tenantName = 'Clínica Demo NutriPlan';
    let tenant = await prisma.tenant.findFirst({ where: { name: tenantName } });
    if (!tenant) {
        tenant = await prisma.tenant.create({
            data: { name: tenantName, type: 'B2C', status: 'active' }
        });
    }
    const tenantId = tenant.id;
    console.log(`✓ Tenant: ${tenantId}`);

    // Helpers
    const passwordHash = await hash('demo123', 10);

    // Dataset Release for Snapshots
    let dataset = await prisma.datasetRelease.findFirst({ where: { tenant_id: tenantId } });
    if (!dataset) {
        dataset = await prisma.datasetRelease.create({
            data: { tenant_id: tenantId, region: 'BR', source_name: 'MockDB', version_label: '1.0', status: 'published' }
        });
    }

    // --- PATIENT 1: Maria Silva (Weight Loss, High Performance) ---
    await createPatientScenario({
        tenantId, passwordHash, datasetId: dataset.id,
        user: { name: "Maria Silva", email: "maria@demo.nutriplan.com" },
        profile: {
            sex: 'female', birth_date: new Date('1985-04-12'), height: 165,
            startWeight: 75, targetWeight: 60, currentWeight: 64, // Lost 11kg
            goal: 'loss', activity: 'moderate'
        },
        behavior: {
            consistency: 0.9, // Very consistent
            mealPattern: 'healthy_balanced', // Focus on protein/veg
            symptomFreq: 0.05, // Rarely sick
            startOffset: 90
        }
    });

    // --- PATIENT 2: João Santos (Hypertrophy, High Protein) ---
    await createPatientScenario({
        tenantId, passwordHash, datasetId: dataset.id,
        user: { name: "João Santos", email: "joao@demo.nutriplan.com" },
        profile: {
            sex: 'male', birth_date: new Date('1992-08-20'), height: 180,
            startWeight: 78, targetWeight: 85, currentWeight: 82, // Gained 4kg muscle
            goal: 'gain', activity: 'very_active'
        },
        behavior: {
            consistency: 0.8,
            mealPattern: 'high_protein_surplus',
            symptomFreq: 0.1,
            startOffset: 90
        }
    });

    // --- PATIENT 3: Ana Costa (IBS, Symptomatic) ---
    await createPatientScenario({
        tenantId, passwordHash, datasetId: dataset.id,
        user: { name: "Ana Costa", email: "ana@demo.nutriplan.com" },
        profile: {
            sex: 'female', birth_date: new Date('1995-02-15'), height: 162,
            startWeight: 65, targetWeight: 60, currentWeight: 63,
            goal: 'loss', activity: 'sedentary'
        },
        behavior: {
            consistency: 0.6, // Misses logging when sick
            mealPattern: 'mixed_trigger', // Eats dairy/processed sometimes
            symptomFreq: 0.4, // Frequent symptoms
            startOffset: 90
        }
    });

    console.log('\n✅ All Demo Data Populated Successfully!');
}

type ScenarioConfig = {
    tenantId: string;
    passwordHash: string;
    datasetId: string;
    user: { name: string; email: string };
    profile: {
        sex: string; birth_date: Date; height: number;
        startWeight: number; targetWeight: number; currentWeight: number;
        goal: string; activity: string;
    };
    behavior: {
        consistency: number;
        mealPattern: 'healthy_balanced' | 'high_protein_surplus' | 'mixed_trigger';
        symptomFreq: number;
        startOffset: number;
    };
};

async function createPatientScenario(config: ScenarioConfig) {
    console.log(`\nProcessing Scenario: ${config.user.name}...`);

    // 1. Create/Update User & Patient
    let user = await prisma.user.findUnique({ where: { email: config.user.email } });
    if (user) {
        user = await prisma.user.update({
            where: { id: user.id },
            data: { password_hash: config.passwordHash, tenant_id: config.tenantId, name: config.user.name }
        });
    } else {
        user = await prisma.user.create({
            data: {
                email: config.user.email, name: config.user.name, role: 'PATIENT',
                tenant_id: config.tenantId, password_hash: config.passwordHash, status: 'active'
            }
        });
    }

    let patient = await prisma.patient.findUnique({ where: { user_id: user.id } });
    if (!patient) {
        patient = await prisma.patient.create({
            data: { tenant_id: config.tenantId, user_id: user.id, status: 'active' }
        });
    }

    // 2. Profile
    await prisma.patientProfile.upsert({
        where: { patient_id: patient.id },
        update: {
            current_weight_kg: config.profile.currentWeight,
        },
        create: {
            tenant_id: config.tenantId, patient_id: patient.id,
            birth_date: config.profile.birth_date, sex: config.profile.sex as any,
            height_cm: config.profile.height, current_weight_kg: config.profile.currentWeight,
            target_weight_kg: config.profile.targetWeight, activity_level: config.profile.activity as any,
            goal: config.profile.goal as any
        }
    });

    // 3. Generate History (Daily Loop)
    const today = new Date();

    // Clear existing recent data to avoid duplicates/mess (optional, but cleaner for a 'reset')
    // await prisma.meal.deleteMany({ where: { patient_id: patient.id } }); // Too dangerous for production, ok for local demo script if user knows

    for (let i = config.behavior.startOffset; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        date.setHours(12, 0, 0, 0); // Noon base

        // Skip random days based on consistency
        if (Math.random() > config.behavior.consistency) continue;

        // Generate Meals
        const mealsToLog = ['breakfast', 'lunch', 'dinner'];
        if (Math.random() > 0.3) mealsToLog.push('snack');

        for (const type of mealsToLog) {
            const mealTime = new Date(date);
            setMealTime(mealTime, type);

            const meal = await prisma.meal.create({
                data: {
                    tenant_id: config.tenantId, patient_id: patient.id,
                    date: mealTime, type: type as any, created_at: mealTime
                }
            });

            // Add Food Items
            const items = generateMealItems(type, config.behavior.mealPattern);
            for (const item of items) {
                // Snapshot
                const snapshot = await prisma.foodSnapshot.create({
                    data: {
                        tenant_id: config.tenantId, patient_id: patient.id,
                        food_id: generateUUID(),
                        snapshot_json: {
                            name: item.food.name, group: item.food.group,
                            nutrients: {
                                energy_kcal: item.food.calories, protein_g: item.food.p,
                                carbs_g: item.food.c, fat_g: item.food.f
                            }
                        },
                        source: 'mock', dataset_release_id: config.datasetId
                    }
                });

                await prisma.mealItem.create({
                    data: {
                        tenant_id: config.tenantId, meal_id: meal.id,
                        food_id: generateUUID(), grams: item.grams,
                        snapshot_id: snapshot.id
                    }
                });
            }
        }

        // Generate Symptoms (Simulate IBS or bad digestion)
        if (Math.random() < config.behavior.symptomFreq) {
            const symptomType = SYMPTOM_TYPES[Math.floor(Math.random() * SYMPTOM_TYPES.length)];
            const severity = Math.floor(Math.random() * 3) + 1; // 1-3 (mapped to Low, Medium, High if enum allows, or int)
            // Schema check: severity is enum Severity { low, medium, high }
            const severityEnum = severity === 1 ? 'low' : severity === 2 ? 'medium' : 'high';

            await prisma.symptomLog.create({
                data: {
                    tenant_id: config.tenantId, patient_id: patient.id,
                    logged_at: new Date(date.setHours(20, 0, 0)), // Evening
                    symptoms: [symptomType as any],
                    discomfort_level: severity * 3, // 1-10 scale
                    notes: `Feeling ${symptomType} after dinner`
                }
            });
        }

        // Weight Log (Weekly)
        if (i % 7 === 0) {
            // Interpolate weight
            const progress = (config.behavior.startOffset - i) / config.behavior.startOffset;
            const weight = config.profile.startWeight + (config.profile.currentWeight - config.profile.startWeight) * progress;

            // Using DailyLogEntry for general measurements if available, or just skip if no specific table
            // Schema has Meal and SymptomLog. Weight history usually in DailyLogEntry or on Profile (current).
            // Step 24 shows: model DailyLogEntry { entry_type: string, content: Json }

            await prisma.dailyLogEntry.create({
                data: {
                    tenant_id: config.tenantId,
                    patient_id: patient.id,
                    entry_type: 'measurement',
                    timestamp: date,
                    content: {
                        type: 'weight',
                        value: Number(weight.toFixed(1)),
                        unit: 'kg'
                    }
                }
            });
        }
    }
}

function setMealTime(date: Date, type: string) {
    if (type === 'breakfast') date.setHours(8, 0, 0);
    if (type === 'lunch') date.setHours(12, 30, 0);
    if (type === 'snack') date.setHours(16, 0, 0);
    if (type === 'dinner') date.setHours(19, 30, 0);
}

function generateMealItems(type: string, pattern: string) {
    const items: { food: any, grams: number }[] = [];

    // Logic to select foods based on pattern
    const isHealthy = pattern === 'healthy_balanced';
    const isGain = pattern === 'high_protein_surplus';
    const isTrigger = pattern === 'mixed_trigger';

    if (type === 'breakfast') {
        if (isGain) {
            items.push({ food: FOOD_DB.proteins[1], grams: 150 }); // Eggs
            items.push({ food: FOOD_DB.carbs[2], grams: 80 }); // Oats
        } else {
            items.push({ food: FOOD_DB.proteins[1], grams: 100 }); // Eggs
            items.push({ food: FOOD_DB.fats[1], grams: 50 }); // Avocado
        }
    } else if (type === 'lunch' || type === 'dinner') {
        const protein = isGain ? FOOD_DB.proteins[0] : (isTrigger && Math.random() > 0.7 ? FOOD_DB.processed[1] : FOOD_DB.proteins[0]);
        items.push({ food: protein, grams: isGain ? 200 : 120 });

        const carb = isHealthy ? FOOD_DB.carbs[1] : (isTrigger ? FOOD_DB.carbs[4] : FOOD_DB.carbs[0]);
        items.push({ food: carb, grams: isGain ? 250 : 100 });

        items.push({ food: FOOD_DB.vegetables[0], grams: 80 });
    } else { // snack
        if (isTrigger && Math.random() > 0.5) {
            items.push({ food: FOOD_DB.dairy[2], grams: 50 }); // Cheese
        } else {
            items.push({ food: FOOD_DB.fats[2], grams: 30 }); // Nuts
        }
    }

    return items;
}

function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

createComprehensiveDataset()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
