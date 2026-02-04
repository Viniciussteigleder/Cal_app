import { NextRequest, NextResponse } from 'next/server';

// Mock database
const mockExams = new Map();

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const patientId = searchParams.get('patientId');
        const examType = searchParams.get('examType');
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');

        if (!patientId) {
            return NextResponse.json(
                { error: 'Patient ID is required' },
                { status: 400 }
            );
        }

        let exams = Array.from(mockExams.values()).filter(
            (exam: any) => exam.patientId === patientId
        );

        // Filter by exam type
        if (examType && examType !== 'all') {
            exams = exams.filter((exam: any) => exam.examType === examType);
        }

        // Filter by date range
        if (startDate) {
            exams = exams.filter(
                (exam: any) => new Date(exam.examDate) >= new Date(startDate)
            );
        }
        if (endDate) {
            exams = exams.filter(
                (exam: any) => new Date(exam.examDate) <= new Date(endDate)
            );
        }

        // Sort by exam date descending
        exams.sort((a: any, b: any) =>
            new Date(b.examDate).getTime() - new Date(a.examDate).getTime()
        );

        return NextResponse.json({
            success: true,
            exams,
            count: exams.length,
        });
    } catch (error) {
        console.error('Error fetching exams:', error);
        return NextResponse.json(
            { error: 'Failed to fetch exams' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            patientId,
            examType,
            examDate,
            results,
            fileUrl,
            notes,
        } = body;

        if (!patientId || !examType || !examDate || !results) {
            return NextResponse.json(
                { error: 'Patient ID, exam type, exam date, and results are required' },
                { status: 400 }
            );
        }

        // Validate exam type
        const validTypes = [
            'hemograma',
            'perfil_lipidico',
            'glicemia',
            'funcao_hepatica',
            'funcao_renal',
            'vitaminas',
            'minerais',
            'hormonios',
            'outros',
        ];
        if (!validTypes.includes(examType)) {
            return NextResponse.json(
                { error: 'Invalid exam type' },
                { status: 400 }
            );
        }

        const exam = {
            id: Date.now().toString(),
            patientId,
            examType,
            examDate,
            results,
            fileUrl: fileUrl || null,
            notes: notes || '',
            aiAnalysis: null, // Will be populated by AI analyzer
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        mockExams.set(exam.id, exam);

        return NextResponse.json({
            success: true,
            exam,
            message: 'Exam created successfully',
        });
    } catch (error) {
        console.error('Error creating exam:', error);
        return NextResponse.json(
            { error: 'Failed to create exam' },
            { status: 500 }
        );
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const body = await request.json();
        const { id, ...updates } = body;

        if (!id) {
            return NextResponse.json(
                { error: 'Exam ID is required' },
                { status: 400 }
            );
        }

        const existingExam = mockExams.get(id);
        if (!existingExam) {
            return NextResponse.json(
                { error: 'Exam not found' },
                { status: 404 }
            );
        }

        const updatedExam = {
            ...existingExam,
            ...updates,
            updatedAt: new Date().toISOString(),
        };

        mockExams.set(id, updatedExam);

        return NextResponse.json({
            success: true,
            exam: updatedExam,
            message: 'Exam updated successfully',
        });
    } catch (error) {
        console.error('Error updating exam:', error);
        return NextResponse.json(
            { error: 'Failed to update exam' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { error: 'Exam ID is required' },
                { status: 400 }
            );
        }

        const existingExam = mockExams.get(id);
        if (!existingExam) {
            return NextResponse.json(
                { error: 'Exam not found' },
                { status: 404 }
            );
        }

        mockExams.delete(id);

        return NextResponse.json({
            success: true,
            message: 'Exam deleted successfully',
        });
    } catch (error) {
        console.error('Error deleting exam:', error);
        return NextResponse.json(
            { error: 'Failed to delete exam' },
            { status: 500 }
        );
    }
}
