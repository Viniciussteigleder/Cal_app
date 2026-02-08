
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createDailyLog } from './actions';
import { getSupabaseClaims } from '@/lib/auth';
import { withSession } from '@/lib/db';

// Mock Dependencies
vi.mock('@/lib/auth', () => ({
    getSupabaseClaims: vi.fn()
}));

vi.mock('@/lib/db', () => ({
    withSession: vi.fn()
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

        const mockCreate = vi.fn().mockResolvedValue({
            id: 'log1',
            entry_type: 'meal'
        });
        (withSession as any).mockImplementation(async (_claims: any, fn: any) => fn({ dailyLogEntry: { create: mockCreate } }));

        // Execute
        const result = await createDailyLog('patient1', {
            entry_type: 'meal',
            timestamp: new Date().toISOString(),
            content: { description: 'Salad' }
        });

        // Verify
        expect(result.success).toBe(true);
        expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({
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
