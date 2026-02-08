
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/app/studio/ai/actions', () => ({
    executeAIAction: vi.fn().mockResolvedValue({
        success: true,
        data: {
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
        vi.resetModules();
        vi.clearAllMocks();
    });

    it('should return error if no file is provided', async () => {
        const { analyzeExamAction } = await import('./actions');
        const formData = new FormData();
        const result = await analyzeExamAction(formData);
        expect(result.success).toBe(false);
        expect(result.error).toBe('No file provided');
    });

    it('should call OpenAI and return data when file is provided', async () => {
        const { analyzeExamAction } = await import('./actions');
        const { executeAIAction } = await import('@/app/studio/ai/actions');

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
        expect(executeAIAction).toHaveBeenCalledWith(
            'exam_analyzer',
            expect.objectContaining({ imageUrl: expect.stringContaining('data:image/png;base64,') })
        );
    });
});
