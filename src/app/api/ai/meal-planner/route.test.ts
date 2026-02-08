
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';
import { NextRequest } from 'next/server';
import * as aiConfig from '@/lib/ai-config';
import { withSession } from '@/lib/db';

// Mock Dependencies
vi.mock('@ai-sdk/openai', () => ({
    createOpenAI: vi.fn(() => vi.fn()),
}));

vi.mock('ai', () => ({
    generateObject: vi.fn().mockResolvedValue({
        object: {
            days: [],
            estimated_cost: 150,
            reasoning: 'Test plan'
        },
        usage: { totalTokens: 100 }
    }),
}));

vi.mock('@/lib/supabase/server', () => ({
    createSupabaseServerClient: vi.fn().mockResolvedValue({
        auth: {
            getUser: vi.fn().mockResolvedValue({
                data: {
                    user: {
                        id: '00000000-0000-0000-0000-000000000902',
                        app_metadata: { tenant_id: '00000000-0000-0000-0000-000000000901', role: 'TENANT_ADMIN' }
                    }
                },
                error: null
            })
        },
        from: vi.fn(() => ({
            insert: vi.fn(() => ({ select: vi.fn(() => ({ single: vi.fn().mockResolvedValue({ data: { id: 'plan1' }, error: null }) })) }))
        }))
    })
}));

describe('Meal Planner API', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should generate plan and track usage', async () => {
        // Spies
        const configSpy = vi.spyOn(aiConfig, 'getAgentConfig').mockResolvedValue({
            systemPrompt: 'sys', model: 'gpt-4o', temperature: 0.7
        });

        const tenantId = '00000000-0000-0000-0000-000000000901';
        const userId = '00000000-0000-0000-0000-000000000902';
        const patientId = '00000000-0000-0000-0000-000000000903';

        // Seed DB entities required by the handler (RLS-safe via OWNER+ownerMode).
        await withSession(
            { user_id: '00000000-0000-0000-0000-000000000999', tenant_id: tenantId, role: 'OWNER' },
            async (tx) => {
                await tx.tenant.create({ data: { id: tenantId, name: 'Tenant', type: 'B2C', status: 'active' } });
                await tx.user.create({
                    data: {
                        id: userId,
                        email: 'u@test.com',
                        name: 'User',
                        role: 'TENANT_ADMIN',
                        tenant_id: tenantId,
                        status: 'active',
                    },
                });
                await tx.patient.create({ data: { id: patientId, tenant_id: tenantId, status: 'active' } });
            },
            { ownerMode: true }
        );

        // Request
        const req = new NextRequest('http://localhost/api/ai/meal-planner', {
            method: 'POST',
            body: JSON.stringify({
                patientId,
                targetKcal: 2000,
                macroSplit: { protein: 30, carbs: 40, fat: 30 }
            })
        });

        const res = await POST(req);
        const body = await res.json();

        expect(body.success).toBe(true);
        expect(configSpy).toHaveBeenCalledWith('meal_planner');
    });
});
