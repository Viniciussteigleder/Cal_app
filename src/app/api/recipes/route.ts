import { NextRequest, NextResponse } from 'next/server';

// Mock database
const mockRecipes = new Map();

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const nutritionistId = searchParams.get('nutritionistId');
        const search = searchParams.get('search');
        const tags = searchParams.get('tags');
        const isPublic = searchParams.get('isPublic');

        let recipes = Array.from(mockRecipes.values());

        // Filter by nutritionist
        if (nutritionistId) {
            recipes = recipes.filter(
                (recipe: any) => recipe.nutritionistId === nutritionistId || recipe.isPublic
            );
        }

        // Filter by search term
        if (search) {
            const searchLower = search.toLowerCase();
            recipes = recipes.filter((recipe: any) =>
                recipe.name?.toLowerCase().includes(searchLower) ||
                recipe.description?.toLowerCase().includes(searchLower)
            );
        }

        // Filter by tags
        if (tags) {
            const tagArray = tags.split(',');
            recipes = recipes.filter((recipe: any) =>
                recipe.tags?.some((tag: string) => tagArray.includes(tag))
            );
        }

        // Filter by public status
        if (isPublic !== null && isPublic !== undefined) {
            recipes = recipes.filter((recipe: any) => recipe.isPublic === (isPublic === 'true'));
        }

        return NextResponse.json({
            success: true,
            recipes,
            count: recipes.length,
        });
    } catch (error) {
        console.error('Error fetching recipes:', error);
        return NextResponse.json(
            { error: 'Failed to fetch recipes' },
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
            ingredients,
            instructions,
            nutrition,
            prepTime,
            cookTime,
            servings,
            tags,
            isPublic,
            imageUrl,
        } = body;

        if (!nutritionistId || !name || !ingredients || !instructions) {
            return NextResponse.json(
                { error: 'Nutritionist ID, name, ingredients, and instructions are required' },
                { status: 400 }
            );
        }

        const recipe = {
            id: Date.now().toString(),
            nutritionistId,
            name,
            description: description || '',
            ingredients,
            instructions,
            nutrition: nutrition || {
                calories: 0,
                protein: 0,
                carbs: 0,
                fat: 0,
            },
            prepTime: prepTime || 0,
            cookTime: cookTime || 0,
            servings: servings || 1,
            tags: tags || [],
            isPublic: isPublic || false,
            imageUrl: imageUrl || null,
            rating: 0,
            ratingCount: 0,
            usageCount: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        mockRecipes.set(recipe.id, recipe);

        return NextResponse.json({
            success: true,
            recipe,
            message: 'Recipe created successfully',
        });
    } catch (error) {
        console.error('Error creating recipe:', error);
        return NextResponse.json(
            { error: 'Failed to create recipe' },
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
                { error: 'Recipe ID is required' },
                { status: 400 }
            );
        }

        const existingRecipe = mockRecipes.get(id);
        if (!existingRecipe) {
            return NextResponse.json(
                { error: 'Recipe not found' },
                { status: 404 }
            );
        }

        const updatedRecipe = {
            ...existingRecipe,
            ...updates,
            updatedAt: new Date().toISOString(),
        };

        mockRecipes.set(id, updatedRecipe);

        return NextResponse.json({
            success: true,
            recipe: updatedRecipe,
            message: 'Recipe updated successfully',
        });
    } catch (error) {
        console.error('Error updating recipe:', error);
        return NextResponse.json(
            { error: 'Failed to update recipe' },
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
                { error: 'Recipe ID is required' },
                { status: 400 }
            );
        }

        const existingRecipe = mockRecipes.get(id);
        if (!existingRecipe) {
            return NextResponse.json(
                { error: 'Recipe not found' },
                { status: 404 }
            );
        }

        mockRecipes.delete(id);

        return NextResponse.json({
            success: true,
            message: 'Recipe deleted successfully',
        });
    } catch (error) {
        console.error('Error deleting recipe:', error);
        return NextResponse.json(
            { error: 'Failed to delete recipe' },
            { status: 500 }
        );
    }
}
