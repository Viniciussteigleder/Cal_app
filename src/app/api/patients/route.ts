import { NextRequest, NextResponse } from 'next/server';

// Mock database - replace with Supabase
const mockPatients = new Map();

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const nutritionistId = searchParams.get('nutritionistId');
        const search = searchParams.get('search');
        const status = searchParams.get('status');

        if (!nutritionistId) {
            return NextResponse.json(
                { error: 'Nutritionist ID is required' },
                { status: 400 }
            );
        }

        // Get all patients for nutritionist
        let patients = Array.from(mockPatients.values()).filter(
            (patient: any) => patient.nutritionistId === nutritionistId
        );

        // Filter by search term
        if (search) {
            const searchLower = search.toLowerCase();
            patients = patients.filter((patient: any) =>
                patient.name?.toLowerCase().includes(searchLower) ||
                patient.email?.toLowerCase().includes(searchLower)
            );
        }

        // Filter by status
        if (status && status !== 'all') {
            patients = patients.filter((patient: any) => patient.status === status);
        }

        return NextResponse.json({
            success: true,
            patients,
            count: patients.length,
        });
    } catch (error) {
        console.error('Error fetching patients:', error);
        return NextResponse.json(
            { error: 'Failed to fetch patients' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            nutritionistId,
            name,
            email,
            phone,
            dateOfBirth,
            gender,
            height,
            weight,
            targetWeight,
            medicalConditions,
            allergies,
            dietaryRestrictions,
            goals,
        } = body;

        // Validate required fields
        if (!nutritionistId || !name || !email) {
            return NextResponse.json(
                { error: 'Nutritionist ID, name, and email are required' },
                { status: 400 }
            );
        }

        // Create new patient
        const patient = {
            id: Date.now().toString(),
            nutritionistId,
            name,
            email,
            phone: phone || '',
            dateOfBirth: dateOfBirth || null,
            gender: gender || '',
            height: height || null,
            initialWeight: weight || null,
            currentWeight: weight || null,
            targetWeight: targetWeight || null,
            medicalConditions: medicalConditions || [],
            allergies: allergies || [],
            dietaryRestrictions: dietaryRestrictions || [],
            goals: goals || [],
            status: 'active',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        mockPatients.set(patient.id, patient);

        return NextResponse.json({
            success: true,
            patient,
            message: 'Patient created successfully',
        });
    } catch (error) {
        console.error('Error creating patient:', error);
        return NextResponse.json(
            { error: 'Failed to create patient' },
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
                { error: 'Patient ID is required' },
                { status: 400 }
            );
        }

        const existingPatient = mockPatients.get(id);
        if (!existingPatient) {
            return NextResponse.json(
                { error: 'Patient not found' },
                { status: 404 }
            );
        }

        const updatedPatient = {
            ...existingPatient,
            ...updates,
            updatedAt: new Date().toISOString(),
        };

        mockPatients.set(id, updatedPatient);

        return NextResponse.json({
            success: true,
            patient: updatedPatient,
            message: 'Patient updated successfully',
        });
    } catch (error) {
        console.error('Error updating patient:', error);
        return NextResponse.json(
            { error: 'Failed to update patient' },
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
                { error: 'Patient ID is required' },
                { status: 400 }
            );
        }

        const existingPatient = mockPatients.get(id);
        if (!existingPatient) {
            return NextResponse.json(
                { error: 'Patient not found' },
                { status: 404 }
            );
        }

        mockPatients.delete(id);

        return NextResponse.json({
            success: true,
            message: 'Patient deleted successfully',
        });
    } catch (error) {
        console.error('Error deleting patient:', error);
        return NextResponse.json(
            { error: 'Failed to delete patient' },
            { status: 500 }
        );
    }
}
