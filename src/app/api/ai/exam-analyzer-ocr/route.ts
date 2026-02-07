import { NextRequest, NextResponse } from 'next/server';
import { executeAIRoute } from '@/lib/ai/route-helper';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { imageData, imageUrl, examType, patientId } = body;

        if (!imageData && !imageUrl) {
            return NextResponse.json(
                { error: 'Image data or image URL is required' },
                { status: 400 }
            );
        }

        if (!examType) {
            return NextResponse.json(
                { error: 'Exam type is required' },
                { status: 400 }
            );
        }

        // Validate base64 size limit (~10MB)
        if (imageData && imageData.length > 13_700_000) {
            return NextResponse.json(
                { error: 'Image data exceeds 10MB limit' },
                { status: 413 }
            );
        }

        return executeAIRoute('exam_analyzer', {
            imageData,
            imageUrl,
            examType,
            patientId,
        });
    } catch (error) {
        console.error('Exam analyzer error:', error);
        return NextResponse.json(
            { error: 'Falha ao analisar exame' },
            { status: 500 }
        );
    }
}
