
import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const prisma = new PrismaClient();

async function setupDemoAuth() {
    console.log('🔧 Setting up Demo Authentication...');

    // 0. Ensure Schema has password_hash (Fix for local dev mismatch)
    try {
        console.log('Checking User schema...');
        let tableName = 'User';
        try {
            await prisma.$queryRaw`SELECT 1 FROM "User" LIMIT 1`;
        } catch {
            tableName = 'users';
        }
        await prisma.$executeRawUnsafe(`ALTER TABLE "${tableName}" ADD COLUMN IF NOT EXISTS "password_hash" TEXT;`);
        console.log('✅ User schema verified.');
    } catch (e) {
        console.log('⚠️ Could not verify schema (might already be correct or permissions issue):', e);
    }

    const password = process.env.DEMO_PASSWORD || 'demo123';
    const passwordHash = await hash(password, 10);
    console.log(`🔑 Demo password set to: ${password}`);

    // 1. Ensure Tenant Exists
    console.log('Checking Tenant...');
    let tenantId: string;
    const existingTenant = await prisma.tenant.findFirst({
        where: { name: 'Clínica Demo NutriPlan' }
    });

    if (!existingTenant) {
        console.log('Creating demo tenant...');
        const newTenant = await prisma.tenant.create({
            data: {
                name: 'Clínica Demo NutriPlan',
                type: 'B2C',
                status: 'active',
            }
        });
        tenantId = newTenant.id;
        console.log('✓ Created Tenant:', tenantId);
    } else {
        tenantId = existingTenant.id;
        console.log('✓ Found Tenant:', tenantId);
    }

    // 2. Setup Users
    await setupUser('owner@demo.nutriplan.com', 'Admin Sistema', 'OWNER', tenantId, passwordHash);
    await setupUser('nutri@demo.nutriplan.com', 'Dr. Carlos Nutricionista', 'TENANT_ADMIN', tenantId, passwordHash);
    const patientUser = await setupUser('patient@demo.nutriplan.com', 'Maria Silva', 'PATIENT', tenantId, passwordHash);

    // 3. Ensure Patient Link (Critical for Dashboard)
    if (patientUser) {
        console.log('Checking Patient record linkage...');
        const patient = await prisma.patient.findUnique({
            where: { user_id: patientUser.id }
        });

        if (patient) {
            console.log(`✅ Patient record linked: ${patient.id}`);
        } else {
            console.log('Creating Patient record...');
            // Try to find existing unlinked patient or create new
            // Note: We can't query by name easily if column missing, so we just create new linked one.
            // If duplicates exist, it's fine for demo purposes.
            const newPatient = await prisma.patient.create({
                data: {
                    tenant_id: tenantId,
                    user_id: patientUser.id,
                    status: 'active',
                }
            });
            console.log(`✅ Created linked Patient record: ${newPatient.id}`);
        }
    }

    console.log('\n✅ Demo Authentication Setup Complete!');
    console.log('You can now login with:');
    console.log(`Email: patient@demo.nutriplan.com (or owner@..., nutri@...)`);
    console.log(`Password: ${password}`);
}

async function setupUser(email: string, name: string, role: any, tenantId: string, passwordHash: string) {
    console.log(`Processing user: ${email}...`);
    const existingUser = await prisma.user.findUnique({
        where: { email },
    });

    if (existingUser) {
        return await prisma.user.update({
            where: { email },
            data: {
                password_hash: passwordHash,
                tenant_id: tenantId,
                role: role,
                status: 'active',
                name: name
            },
        });
    } else {
        return await prisma.user.create({
            data: {
                email,
                name,
                role,
                tenant_id: tenantId,
                password_hash: passwordHash,
                status: 'active',
            },
        });
    }
}

setupDemoAuth()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
