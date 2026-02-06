
import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const prisma = new PrismaClient();

// MOCK DATA borrowed/adapted for Prisma
const MOCK_FOODS = [
    { name: "Arroz branco cozido", group: "grains", nutrients: { energy_kcal: 128, protein_g: 2.5, carbs_g: 28, fat_g: 0.2, fiber_g: 0.4 } },
    { name: "Feijão preto cozido", group: "legumes", nutrients: { energy_kcal: 77, protein_g: 4.5, carbs_g: 14, fat_g: 0.5, fiber_g: 8.4 } },
    { name: "Frango grelhado", group: "protein", nutrients: { energy_kcal: 165, protein_g: 31, carbs_g: 0, fat_g: 3.6, fiber_g: 0 } },
    { name: "Ovo cozido", group: "protein", nutrients: { energy_kcal: 155, protein_g: 13, carbs_g: 1.1, fat_g: 11, fiber_g: 0 } },
    { name: "Banana prata", group: "fruits", nutrients: { energy_kcal: 89, protein_g: 1.1, carbs_g: 23, fat_g: 0.3, fiber_g: 2.6 } },
    { name: "Salada mista", group: "vegetables", nutrients: { energy_kcal: 20, protein_g: 1, carbs_g: 4, fat_g: 0.2, fiber_g: 2 } },
];

async function populateDemoDataPrisma() {
    console.log('🚀 Starting Demo Data Population (Prisma)...');

    // 1. Get Patient with User Link
    const userEmail = 'patient@demo.nutriplan.com';
    const user = await prisma.user.findUnique({
        where: { email: userEmail },
    });

    if (!user) {
        console.error('❌ Patient user not found. Please run "npm run setup:demo-auth" first.');
        return;
    }

    const patient = await prisma.patient.findUnique({
        where: { user_id: user.id },
    });

    if (!patient) {
        console.error('❌ Patient record not found linked to user.');
        return;
    }

    const patientId = patient.id;
    const tenantId = patient.tenant_id;
    console.log(`Working with Patient: ${patientId}`);

    // 2. Upsert Patient Profile
    console.log('Updating Patient Profile...');
    await prisma.patientProfile.upsert({
        where: { patient_id: patientId },
        update: {
            birth_date: new Date('1990-05-15'),
            sex: 'female',
            height_cm: 165,
            current_weight_kg: 68.0,
            target_weight_kg: 63.0,
            activity_level: 'moderate',
            goal: 'loss',
        },
        create: {
            tenant_id: tenantId,
            patient_id: patientId,
            birth_date: new Date('1990-05-15'),
            sex: 'female',
            height_cm: 165,
            current_weight_kg: 68.0,
            target_weight_kg: 63.0,
            activity_level: 'moderate',
            goal: 'loss',
        }
    });

    // 3. Create Dataset Release (Required for FoodSnapshot relation? Schema says `dataset_release_id` UUID)
    // We need a dummy dataset release ID.
    let datasetRelease = await prisma.datasetRelease.findFirst({
        where: { tenant_id: tenantId }
    });

    if (!datasetRelease) {
        // Create one if missing
        datasetRelease = await prisma.datasetRelease.create({
            data: {
                tenant_id: tenantId,
                region: 'BR',
                source_name: 'TBCA',
                version_label: '1.0',
                status: 'published',
                published_at: new Date()
            }
        });
    }

    // 4. Populate Meals for last 14 days
    console.log('Creating Meals...');
    const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];

    const today = new Date();

    for (let i = 0; i < 14; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        date.setHours(8, 0, 0, 0); // Reset time part for cleaner dates in logic if needed, but DB uses timestamptz

        // For each day, create 3-4 meals
        for (const type of mealTypes) {
            // Random skip snack
            if (type === 'snack' && Math.random() > 0.7) continue;

            // Check if meal already exists
            //  const existingMeal = await prisma.meal.findFirst({
            //      where: {
            //          patient_id: patientId,
            //          date: {
            //              gte: new Date(date.setHours(0,0,0,0)),
            //              lt: new Date(date.setHours(23,59,59,999)) 
            //          },
            //          type: type as any
            //      }
            //  });
            // The above check is complex with dates. Let's just create new ones and ignore if duplicates (or just clean up before?)
            // For playground, appending is fine, or we can delete old ones.
            // Let's delete all meals for this patient first to avoid dupes on re-run?
            // Maybe too destructive.

            const mealTime = new Date(date);
            if (type === 'breakfast') mealTime.setHours(8, 0, 0);
            if (type === 'lunch') mealTime.setHours(12, 30, 0);
            if (type === 'dinner') mealTime.setHours(19, 30, 0);
            if (type === 'snack') mealTime.setHours(16, 0, 0);

            const meal = await prisma.meal.create({
                data: {
                    tenant_id: tenantId,
                    patient_id: patientId,
                    date: mealTime,
                    type: type as any,
                    created_at: mealTime
                }
            });

            // Add Items
            const numItems = Math.floor(Math.random() * 3) + 1;
            for (let j = 0; j < numItems; j++) {
                const food = MOCK_FOODS[Math.floor(Math.random() * MOCK_FOODS.length)];
                const grams = Math.floor(Math.random() * 200) + 50;

                // Create Snapshot
                // We need a dummy food_id (UUID)
                const dummyFoodId = '00000000-0000-0000-0000-000000000000'.replace(/0/g, () => Math.floor(Math.random() * 16).toString(16)); // Random UUID

                const snapshot = await prisma.foodSnapshot.create({
                    data: {
                        tenant_id: tenantId,
                        patient_id: patientId,
                        food_id: dummyFoodId, // In real app, this links to CanonicalFood, but schema allows any ID?
                        // Schema: food_id String @db.Uuid. It is NOT a foreign key in the snippet I saw!
                        // Let's verify schema... `model FoodSnapshot` ... `food_id String @db.Uuid`. No @relation.
                        // So we can use random UUID.
                        snapshot_json: {
                            name: food.name,
                            group: food.group,
                            nutrients: food.nutrients
                        },
                        source: 'mock',
                        dataset_release_id: datasetRelease.id
                    }
                });

                // Create Meal Item
                await prisma.mealItem.create({
                    data: {
                        tenant_id: tenantId,
                        meal_id: meal.id,
                        food_id: dummyFoodId,
                        grams: grams,
                        snapshot_id: snapshot.id
                    }
                });
            }
        }
    }

    console.log('✅ Demo Data Population Complete!');
}

populateDemoDataPrisma()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
