import { NextRequest, NextResponse } from 'next/server';

// Mock analytics database
const mockAnalytics = new Map();

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const nutritionistId = searchParams.get('nutritionistId');
        const type = searchParams.get('type');
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');

        if (!nutritionistId) {
            return NextResponse.json(
                { error: 'Nutritionist ID is required' },
                { status: 400 }
            );
        }

        // Mock analytics data
        const analytics = {
            overview: {
                totalPatients: 45,
                activePatients: 38,
                totalConsultations: 156,
                aiCreditsUsed: 12450,
                aiCreditsCost: 1245.00,
                averageAdherence: 76,
            },
            aiUsage: {
                byAgent: [
                    { agent: 'Meal Planner', usage: 3200, cost: 320, percentage: 25.7 },
                    { agent: 'Patient Analyzer', usage: 2800, cost: 280, percentage: 22.5 },
                    { agent: 'Report Generator', usage: 1900, cost: 190, percentage: 15.3 },
                    { agent: 'Supplement Advisor', usage: 1500, cost: 150, percentage: 12.0 },
                    { agent: 'Medical Record Creator', usage: 1200, cost: 120, percentage: 9.6 },
                    { agent: 'Shopping List', usage: 950, cost: 95, percentage: 7.6 },
                    { agent: 'Chatbot', usage: 600, cost: 60, percentage: 4.8 },
                    { agent: 'Others', usage: 300, cost: 30, percentage: 2.4 },
                ],
                trend: 'increasing',
                monthlyGrowth: 15.5,
            },
            patientOutcomes: {
                weightLoss: {
                    successful: 32,
                    inProgress: 10,
                    unsuccessful: 3,
                    averageLoss: 5.8,
                },
                adherence: {
                    high: 18, // >80%
                    medium: 15, // 60-80%
                    low: 7, // <60%
                },
                satisfaction: {
                    veryHappy: 25,
                    happy: 15,
                    neutral: 4,
                    unhappy: 1,
                },
            },
            revenue: {
                monthly: 15600.00,
                quarterly: 45200.00,
                yearly: 175000.00,
                averagePerPatient: 346.67,
            },
            efficiency: {
                averageConsultationTime: 45, // minutes
                timeSavedByAI: 120, // hours per month
                patientsPerDay: 8,
                utilizationRate: 85, // percentage
            },
            trends: {
                newPatients: [
                    { month: 'Jan', count: 8 },
                    { month: 'Feb', count: 12 },
                    { month: 'Mar', count: 15 },
                    { month: 'Apr', count: 10 },
                ],
                retention: [
                    { month: 'Jan', rate: 92 },
                    { month: 'Feb', rate: 94 },
                    { month: 'Mar', rate: 91 },
                    { month: 'Apr', rate: 95 },
                ],
                aiUsage: [
                    { month: 'Jan', credits: 8500 },
                    { month: 'Feb', credits: 10200 },
                    { month: 'Mar', credits: 11800 },
                    { month: 'Apr', credits: 12450 },
                ],
            },
            topPerformingProtocols: [
                { name: 'Emagrecimento Saudável', patients: 18, successRate: 89 },
                { name: 'Anti-inflamatório', patients: 12, successRate: 92 },
                { name: 'Low Carb', patients: 10, successRate: 85 },
                { name: 'FODMAP', patients: 5, successRate: 80 },
            ],
        };

        return NextResponse.json({
            success: true,
            analytics,
            period: {
                start: startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
                end: endDate || new Date().toISOString(),
            },
        });
    } catch (error) {
        console.error('Error fetching analytics:', error);
        return NextResponse.json(
            { error: 'Failed to fetch analytics' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { nutritionistId, eventType, eventData } = body;

        if (!nutritionistId || !eventType) {
            return NextResponse.json(
                { error: 'Nutritionist ID and event type are required' },
                { status: 400 }
            );
        }

        // Track event
        const event = {
            id: Date.now().toString(),
            nutritionistId,
            eventType,
            eventData: eventData || {},
            timestamp: new Date().toISOString(),
        };

        mockAnalytics.set(event.id, event);

        return NextResponse.json({
            success: true,
            message: 'Event tracked successfully',
        });
    } catch (error) {
        console.error('Error tracking event:', error);
        return NextResponse.json(
            { error: 'Failed to track event' },
            { status: 500 }
        );
    }
}
