
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { analyzeExamAction } from './actions';
import * as aiConfig from '@/lib/ai-config';

// Mock dependencies
vi.mock('@ai-sdk/openai', () => ({
    createOpenAI: vi.fn(() => vi.fn()),
}));

vi.mock('ai', () => ({
    generateObject: vi.fn().mockResolvedValue({
        object: {
            examType: 'Hemograma',
            examDate: '2025-01-01',
            biomarkers: [],
            aiSummary: 'Test Summary',
            concerns: [],
            recommendations: [],
            nutritionalImplications: { dietaryAdjustments: [], supplementSuggestions: [] }
        }
    }),
}));

describe('analyzeExamAction', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return error if no file is provided', async () => {
        const formData = new FormData();
        const result = await analyzeExamAction(formData);
        expect(result.success).toBe(false);
        expect(result.error).toBe('No file provided');
    });

    it('should call OpenAI and return data when file is provided', async () => {
        // Mock Config
        vi.spyOn(aiConfig, 'getAgentConfig').mockResolvedValue({
            systemPrompt: 'test prompt',
            model: 'gpt-4o',
            temperature: 0,
        });

        // Mock File
        const blob = new Blob(['fake content'], { type: 'image/png' });
        const file = new File([blob], 'test.png', { type: 'image/png' });
        const formData = new FormData();
        formData.append('file', file);
        formData.append('examType', 'blood_test');

        const result = await analyzeExamAction(formData);

        expect(result.success).toBe(true);
        expect(result.data).toBeDefined();
        expect(result.data?.examType).toBe('Hemograma');
        expect(aiConfig.getAgentConfig).toHaveBeenCalledWith('exam_analyzer');
    });
});
