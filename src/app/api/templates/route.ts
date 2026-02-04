import { NextRequest, NextResponse } from 'next/server';

// Mock database
const mockTemplates = new Map();

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const nutritionistId = searchParams.get('nutritionistId');
        const search = searchParams.get('search');
        const type = searchParams.get('type');
        const isFavorite = searchParams.get('isFavorite');

        let templates = Array.from(mockTemplates.values());

        // Filter by nutritionist
        if (nutritionistId) {
            templates = templates.filter(
                (template: any) => template.nutritionistId === nutritionistId
            );
        }

        // Filter by search term
        if (search) {
            const searchLower = search.toLowerCase();
            templates = templates.filter((template: any) =>
                template.name?.toLowerCase().includes(searchLower) ||
                template.description?.toLowerCase().includes(searchLower)
            );
        }

        // Filter by type
        if (type && type !== 'all') {
            templates = templates.filter((template: any) => template.type === type);
        }

        // Filter by favorite status
        if (isFavorite === 'true') {
            templates = templates.filter((template: any) => template.isFavorite);
        }

        return NextResponse.json({
            success: true,
            templates,
            count: templates.length,
        });
    } catch (error) {
        console.error('Error fetching templates:', error);
        return NextResponse.json(
            { error: 'Failed to fetch templates' },
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
            type,
            description,
            content,
            fields,
            tags,
        } = body;

        if (!nutritionistId || !name || !type || !content) {
            return NextResponse.json(
                { error: 'Nutritionist ID, name, type, and content are required' },
                { status: 400 }
            );
        }

        // Validate template type
        const validTypes = ['consultation', 'anamnesis', 'progress', 'educational', 'report'];
        if (!validTypes.includes(type)) {
            return NextResponse.json(
                { error: 'Invalid template type' },
                { status: 400 }
            );
        }

        const template = {
            id: Date.now().toString(),
            nutritionistId,
            name,
            type,
            description: description || '',
            content,
            fields: fields || [],
            tags: tags || [],
            usageCount: 0,
            isFavorite: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        mockTemplates.set(template.id, template);

        return NextResponse.json({
            success: true,
            template,
            message: 'Template created successfully',
        });
    } catch (error) {
        console.error('Error creating template:', error);
        return NextResponse.json(
            { error: 'Failed to create template' },
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
                { error: 'Template ID is required' },
                { status: 400 }
            );
        }

        const existingTemplate = mockTemplates.get(id);
        if (!existingTemplate) {
            return NextResponse.json(
                { error: 'Template not found' },
                { status: 404 }
            );
        }

        const updatedTemplate = {
            ...existingTemplate,
            ...updates,
            updatedAt: new Date().toISOString(),
        };

        mockTemplates.set(id, updatedTemplate);

        return NextResponse.json({
            success: true,
            template: updatedTemplate,
            message: 'Template updated successfully',
        });
    } catch (error) {
        console.error('Error updating template:', error);
        return NextResponse.json(
            { error: 'Failed to update template' },
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
                { error: 'Template ID is required' },
                { status: 400 }
            );
        }

        const existingTemplate = mockTemplates.get(id);
        if (!existingTemplate) {
            return NextResponse.json(
                { error: 'Template not found' },
                { status: 404 }
            );
        }

        mockTemplates.delete(id);

        return NextResponse.json({
            success: true,
            message: 'Template deleted successfully',
        });
    } catch (error) {
        console.error('Error deleting template:', error);
        return NextResponse.json(
            { error: 'Failed to delete template' },
            { status: 500 }
        );
    }
}
