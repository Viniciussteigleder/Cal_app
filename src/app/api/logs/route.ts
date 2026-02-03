import { NextRequest, NextResponse } from 'next/server';

// Mock database - replace with actual Supabase calls
const mockLogs = new Map();

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const patientId = searchParams.get('patientId');
        const type = searchParams.get('type');
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');

        if (!patientId) {
            return NextResponse.json(
                { error: 'Patient ID is required' },
                { status: 400 }
            );
        }

        // Get all logs for patient
        let logs = Array.from(mockLogs.values()).filter(
            (log: any) => log.patientId === patientId
        );

        // Filter by type if specified
        if (type && type !== 'all') {
            logs = logs.filter((log: any) => log.type === type);
        }

        // Filter by date range if specified
        if (startDate) {
            logs = logs.filter(
                (log: any) => new Date(log.timestamp) >= new Date(startDate)
            );
        }
        if (endDate) {
            logs = logs.filter(
                (log: any) => new Date(log.timestamp) <= new Date(endDate)
            );
        }

        // Sort by timestamp descending
        logs.sort((a: any, b: any) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );

        return NextResponse.json({
            success: true,
            logs,
            count: logs.length,
        });
    } catch (error) {
        console.error('Error fetching logs:', error);
        return NextResponse.json(
            { error: 'Failed to fetch logs' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { patientId, type, data, photos } = body;

        // Validate required fields
        if (!patientId || !type || !data) {
            return NextResponse.json(
                { error: 'Patient ID, type, and data are required' },
                { status: 400 }
            );
        }

        // Validate log type
        const validTypes = ['meal', 'symptom', 'exam', 'measurement', 'note', 'app_input'];
        if (!validTypes.includes(type)) {
            return NextResponse.json(
                { error: 'Invalid log type' },
                { status: 400 }
            );
        }

        // Create new log entry
        const logEntry = {
            id: Date.now().toString(),
            patientId,
            type,
            timestamp: new Date().toISOString(),
            data,
            photos: photos || [],
            createdAt: new Date().toISOString(),
        };

        // Store in mock database
        mockLogs.set(logEntry.id, logEntry);

        return NextResponse.json({
            success: true,
            log: logEntry,
            message: 'Log entry created successfully',
        });
    } catch (error) {
        console.error('Error creating log:', error);
        return NextResponse.json(
            { error: 'Failed to create log entry' },
            { status: 500 }
        );
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const body = await request.json();
        const { id, data } = body;

        if (!id) {
            return NextResponse.json(
                { error: 'Log ID is required' },
                { status: 400 }
            );
        }

        const existingLog = mockLogs.get(id);
        if (!existingLog) {
            return NextResponse.json(
                { error: 'Log entry not found' },
                { status: 404 }
            );
        }

        // Update log entry
        const updatedLog = {
            ...existingLog,
            data: { ...existingLog.data, ...data },
            updatedAt: new Date().toISOString(),
        };

        mockLogs.set(id, updatedLog);

        return NextResponse.json({
            success: true,
            log: updatedLog,
            message: 'Log entry updated successfully',
        });
    } catch (error) {
        console.error('Error updating log:', error);
        return NextResponse.json(
            { error: 'Failed to update log entry' },
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
                { error: 'Log ID is required' },
                { status: 400 }
            );
        }

        const existingLog = mockLogs.get(id);
        if (!existingLog) {
            return NextResponse.json(
                { error: 'Log entry not found' },
                { status: 404 }
            );
        }

        mockLogs.delete(id);

        return NextResponse.json({
            success: true,
            message: 'Log entry deleted successfully',
        });
    } catch (error) {
        console.error('Error deleting log:', error);
        return NextResponse.json(
            { error: 'Failed to delete log entry' },
            { status: 500 }
        );
    }
}
