
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';
import { NextRequest } from 'next/server';
import * as aiConfig from '@/lib/ai-config';
import * as usage from '@/lib/ai/usage';

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
                data: { user: { id: 'user1', app_metadata: { tenant_id: 'tenant1' } } },
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
        const usageSpy = vi.spyOn(usage, 'recordAiUsage').mockResolvedValue(true);

        // Request
        const req = new NextRequest('http://localhost/api/ai/meal-planner', {
            method: 'POST',
            body: JSON.stringify({
                patientId: 'pat1',
                targetKcal: 2000,
                macroSplit: { protein: 30, carbs: 40, fat: 30 }
            })
        });

        const res = await POST(req);
        const body = await res.json();

        expect(body.success).toBe(true);
        expect(configSpy).toHaveBeenCalledWith('meal_planner');
        expect(usageSpy).toHaveBeenCalledWith(expect.objectContaining({
            tenantId: 'tenant1',
            creditsUsed: 1
        }));
    });
});
