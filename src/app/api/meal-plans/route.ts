import { NextRequest, NextResponse } from 'next/server';

// Mock database
const mockMealPlans = new Map();

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const patientId = searchParams.get('patientId');
        const nutritionistId = searchParams.get('nutritionistId');
        const status = searchParams.get('status');

        let mealPlans = Array.from(mockMealPlans.values());

        // Filter by patient
        if (patientId) {
            mealPlans = mealPlans.filter((plan: any) => plan.patientId === patientId);
        }

        // Filter by nutritionist
        if (nutritionistId) {
            mealPlans = mealPlans.filter((plan: any) => plan.nutritionistId === nutritionistId);
        }

        // Filter by status
        if (status && status !== 'all') {
            mealPlans = mealPlans.filter((plan: any) => plan.status === status);
        }

        // Sort by creation date descending
        mealPlans.sort((a: any, b: any) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        return NextResponse.json({
            success: true,
            mealPlans,
            count: mealPlans.length,
        });
    } catch (error) {
        console.error('Error fetching meal plans:', error);
        return NextResponse.json(
            { error: 'Failed to fetch meal plans' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            patientId,
            nutritionistId,
            name,
            targetCalories,
            startDate,
            endDate,
            meals,
            macros,
            notes,
        } = body;

        if (!patientId || !nutritionistId || !name || !meals) {
            return NextResponse.json(
                { error: 'Patient ID, nutritionist ID, name, and meals are required' },
                { status: 400 }
            );
        }

        const mealPlan = {
            id: Date.now().toString(),
            patientId,
            nutritionistId,
            name,
            targetCalories: targetCalories || 0,
            startDate: startDate || new Date().toISOString().split('T')[0],
            endDate: endDate || null,
            meals,
            macros: macros || { protein: 0, carbs: 0, fat: 0 },
            notes: notes || '',
            status: 'active',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        mockMealPlans.set(mealPlan.id, mealPlan);

        return NextResponse.json({
            success: true,
            mealPlan,
            message: 'Meal plan created successfully',
        });
    } catch (error) {
        console.error('Error creating meal plan:', error);
        return NextResponse.json(
            { error: 'Failed to create meal plan' },
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
                { error: 'Meal plan ID is required' },
                { status: 400 }
            );
        }

        const existingPlan = mockMealPlans.get(id);
        if (!existingPlan) {
            return NextResponse.json(
                { error: 'Meal plan not found' },
                { status: 404 }
            );
        }

        const updatedPlan = {
            ...existingPlan,
            ...updates,
            updatedAt: new Date().toISOString(),
        };

        mockMealPlans.set(id, updatedPlan);

        return NextResponse.json({
            success: true,
            mealPlan: updatedPlan,
            message: 'Meal plan updated successfully',
        });
    } catch (error) {
        console.error('Error updating meal plan:', error);
        return NextResponse.json(
            { error: 'Failed to update meal plan' },
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
                { error: 'Meal plan ID is required' },
                { status: 400 }
            );
        }

        const existingPlan = mockMealPlans.get(id);
        if (!existingPlan) {
            return NextResponse.json(
                { error: 'Meal plan not found' },
                { status: 404 }
            );
        }

        mockMealPlans.delete(id);

        return NextResponse.json({
            success: true,
            message: 'Meal plan deleted successfully',
        });
    } catch (error) {
        console.error('Error deleting meal plan:', error);
        return NextResponse.json(
            { error: 'Failed to delete meal plan' },
            { status: 500 }
        );
    }
}
