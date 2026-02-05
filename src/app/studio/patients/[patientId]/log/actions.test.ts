
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createDailyLog } from './actions';
import { prisma } from '@/lib/prisma';
import { getSupabaseClaims } from '@/lib/auth';

// Mock Dependencies
vi.mock('@/lib/prisma', () => ({
    prisma: {
        dailyLogEntry: {
            create: vi.fn(),
            findMany: vi.fn(),
        }
    }
}));

vi.mock('@/lib/auth', () => ({
    getSupabaseClaims: vi.fn()
}));

vi.mock('next/cache', () => ({
    revalidatePath: vi.fn()
}));

describe('Daily Log Actions', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should create a log entry when authorized', async () => {
        // Setup
        (getSupabaseClaims as any).mockResolvedValue({
            tenant_id: 'tenant1',
            user_id: 'user1',
            role: 'NUTRITIONIST'
        });

        (prisma.dailyLogEntry.create as any).mockResolvedValue({
            id: 'log1',
            entry_type: 'meal'
        });

        // Execute
        const result = await createDailyLog('patient1', {
            entry_type: 'meal',
            timestamp: new Date().toISOString(),
            content: { description: 'Salad' }
        });

        // Verify
        expect(result.success).toBe(true);
        expect(prisma.dailyLogEntry.create).toHaveBeenCalledWith(expect.objectContaining({
            data: expect.objectContaining({
                patient_id: 'patient1',
                entry_type: 'meal',
                tenant_id: 'tenant1'
            })
        }));
    });

    it('should fail if unauthorized', async () => {
        (getSupabaseClaims as any).mockResolvedValue(null);
        const result = await createDailyLog('patient1', {});
        expect(result.success).toBe(false);
    });
});
