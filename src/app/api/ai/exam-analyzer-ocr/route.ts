import { NextRequest } from 'next/server';
import { executeAIRoute } from '@/lib/ai/route-helper';

export async function POST(request: NextRequest) {
    const body = await request.json();
    const { imageData, imageUrl, examType, patientId } = body;

    if (!imageData && !imageUrl) {
        return Response.json(
            { error: 'Image data or image URL is required' },
            { status: 400 }
        );
    }

    if (!examType) {
        return Response.json(
            { error: 'Exam type is required' },
            { status: 400 }
        );
    }

    return executeAIRoute('exam_analyzer', {
        imageData,
        imageUrl,
        examType,
        patientId,
    });
}
