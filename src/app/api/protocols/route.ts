import { NextRequest, NextResponse } from 'next/server';

// Mock database
const mockProtocols = new Map();

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const nutritionistId = searchParams.get('nutritionistId');
        const search = searchParams.get('search');
        const type = searchParams.get('type');
        const isPublic = searchParams.get('isPublic');

        let protocols = Array.from(mockProtocols.values());

        // Filter by nutritionist
        if (nutritionistId) {
            protocols = protocols.filter(
                (protocol: any) => protocol.nutritionistId === nutritionistId || protocol.isPublic
            );
        }

        // Filter by search term
        if (search) {
            const searchLower = search.toLowerCase();
            protocols = protocols.filter((protocol: any) =>
                protocol.name?.toLowerCase().includes(searchLower) ||
                protocol.description?.toLowerCase().includes(searchLower)
            );
        }

        // Filter by type
        if (type && type !== 'all') {
            protocols = protocols.filter((protocol: any) => protocol.type === type);
        }

        // Filter by public status
        if (isPublic !== null && isPublic !== undefined) {
            protocols = protocols.filter((protocol: any) => protocol.isPublic === (isPublic === 'true'));
        }

        return NextResponse.json({
            success: true,
            protocols,
            count: protocols.length,
        });
    } catch (error) {
        console.error('Error fetching protocols:', error);
        return NextResponse.json(
            { error: 'Failed to fetch protocols' },
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
            description,
            type,
            phases,
            foodLists,
            scientificBasis,
            contraindications,
            warnings,
            isPublic,
        } = body;

        if (!nutritionistId || !name || !phases) {
            return NextResponse.json(
                { error: 'Nutritionist ID, name, and phases are required' },
                { status: 400 }
            );
        }

        const protocol = {
            id: Date.now().toString(),
            nutritionistId,
            name,
            description: description || '',
            type: type || 'custom',
            phases,
            foodLists: foodLists || {},
            scientificBasis: scientificBasis || {
                references: [],
                evidenceLevel: 'moderate',
                lastUpdated: new Date().toISOString(),
            },
            contraindications: contraindications || [],
            warnings: warnings || [],
            isPublic: isPublic || false,
            expertReviewScore: 0,
            usageCount: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        mockProtocols.set(protocol.id, protocol);

        return NextResponse.json({
            success: true,
            protocol,
            message: 'Protocol created successfully',
        });
    } catch (error) {
        console.error('Error creating protocol:', error);
        return NextResponse.json(
            { error: 'Failed to create protocol' },
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
                { error: 'Protocol ID is required' },
                { status: 400 }
            );
        }

        const existingProtocol = mockProtocols.get(id);
        if (!existingProtocol) {
            return NextResponse.json(
                { error: 'Protocol not found' },
                { status: 404 }
            );
        }

        const updatedProtocol = {
            ...existingProtocol,
            ...updates,
            updatedAt: new Date().toISOString(),
        };

        mockProtocols.set(id, updatedProtocol);

        return NextResponse.json({
            success: true,
            protocol: updatedProtocol,
            message: 'Protocol updated successfully',
        });
    } catch (error) {
        console.error('Error updating protocol:', error);
        return NextResponse.json(
            { error: 'Failed to update protocol' },
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
                { error: 'Protocol ID is required' },
                { status: 400 }
            );
        }

        const existingProtocol = mockProtocols.get(id);
        if (!existingProtocol) {
            return NextResponse.json(
                { error: 'Protocol not found' },
                { status: 404 }
            );
        }

        mockProtocols.delete(id);

        return NextResponse.json({
            success: true,
            message: 'Protocol deleted successfully',
        });
    } catch (error) {
        console.error('Error deleting protocol:', error);
        return NextResponse.json(
            { error: 'Failed to delete protocol' },
            { status: 500 }
        );
    }
}
