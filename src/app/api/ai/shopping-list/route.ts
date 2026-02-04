import { NextRequest, NextResponse } from 'next/server';

// Mock AI service - replace with actual OpenAI integration
async function generateShoppingList(mealPlanData: any) {
    await new Promise(resolve => setTimeout(resolve, 1500));

    return {
        items: [
            {
                category: 'Proteínas',
                icon: 'Drumstick',
                items: [
                    {
                        name: 'Peito de frango',
                        quantity: '1kg',
                        estimatedCost: 18.90,
                        alternatives: ['Peito de peru', 'Filé de peixe'],
                        checked: false,
                    },
                    {
                        name: 'Ovos',
                        quantity: '2 dúzias',
                        estimatedCost: 16.00,
                        alternatives: ['Ovos orgânicos'],
                        checked: false,
                    },
                    {
                        name: 'Salmão',
                        quantity: '500g',
                        estimatedCost: 45.00,
                        alternatives: ['Tilápia', 'Atum'],
                        checked: false,
                    },
                ],
                totalCost: 79.90,
            },
            {
                category: 'Carboidratos',
                icon: 'Wheat',
                items: [
                    {
                        name: 'Arroz integral',
                        quantity: '1kg',
                        estimatedCost: 8.50,
                        alternatives: ['Arroz branco', 'Quinoa'],
                        checked: false,
                    },
                    {
                        name: 'Batata doce',
                        quantity: '2kg',
                        estimatedCost: 12.00,
                        alternatives: ['Batata inglesa', 'Mandioca'],
                        checked: false,
                    },
                    {
                        name: 'Pão integral',
                        quantity: '2 unidades',
                        estimatedCost: 14.00,
                        alternatives: ['Pão de forma integral'],
                        checked: false,
                    },
                    {
                        name: 'Aveia',
                        quantity: '500g',
                        estimatedCost: 6.50,
                        alternatives: ['Granola'],
                        checked: false,
                    },
                ],
                totalCost: 41.00,
            },
            {
                category: 'Vegetais',
                icon: 'Leaf',
                items: [
                    {
                        name: 'Brócolis',
                        quantity: '500g',
                        estimatedCost: 7.00,
                        alternatives: ['Couve-flor', 'Espinafre'],
                        checked: false,
                    },
                    {
                        name: 'Tomate',
                        quantity: '1kg',
                        estimatedCost: 8.00,
                        alternatives: ['Tomate cereja'],
                        checked: false,
                    },
                    {
                        name: 'Alface',
                        quantity: '2 unidades',
                        estimatedCost: 6.00,
                        alternatives: ['Rúcula', 'Agrião'],
                        checked: false,
                    },
                    {
                        name: 'Cenoura',
                        quantity: '500g',
                        estimatedCost: 4.00,
                        alternatives: ['Beterraba'],
                        checked: false,
                    },
                ],
                totalCost: 25.00,
            },
            {
                category: 'Frutas',
                icon: 'Apple',
                items: [
                    {
                        name: 'Banana',
                        quantity: '1 dúzia',
                        estimatedCost: 8.00,
                        alternatives: ['Banana prata', 'Banana nanica'],
                        checked: false,
                    },
                    {
                        name: 'Maçã',
                        quantity: '1kg',
                        estimatedCost: 10.00,
                        alternatives: ['Pera'],
                        checked: false,
                    },
                    {
                        name: 'Morango',
                        quantity: '500g',
                        estimatedCost: 12.00,
                        alternatives: ['Framboesa', 'Mirtilo'],
                        checked: false,
                    },
                ],
                totalCost: 30.00,
            },
            {
                category: 'Laticínios',
                icon: 'Milk',
                items: [
                    {
                        name: 'Iogurte grego',
                        quantity: '1kg',
                        estimatedCost: 18.00,
                        alternatives: ['Iogurte natural'],
                        checked: false,
                    },
                    {
                        name: 'Queijo cottage',
                        quantity: '500g',
                        estimatedCost: 15.00,
                        alternatives: ['Ricota'],
                        checked: false,
                    },
                ],
                totalCost: 33.00,
            },
            {
                category: 'Outros',
                icon: 'ShoppingBasket',
                items: [
                    {
                        name: 'Azeite de oliva',
                        quantity: '500ml',
                        estimatedCost: 25.00,
                        alternatives: ['Óleo de coco'],
                        checked: false,
                    },
                    {
                        name: 'Feijão',
                        quantity: '1kg',
                        estimatedCost: 8.00,
                        alternatives: ['Lentilha', 'Grão-de-bico'],
                        checked: false,
                    },
                    {
                        name: 'Pasta de amendoim',
                        quantity: '500g',
                        estimatedCost: 18.00,
                        alternatives: ['Pasta de amêndoa'],
                        checked: false,
                    },
                ],
                totalCost: 51.00,
            },
        ],
        totalEstimatedCost: 259.90,
        tips: [
            'Compre frutas e vegetais da estação para economizar',
            'Prefira produtos a granel quando possível',
            'Verifique promoções antes de comprar',
            'Considere comprar em atacado para itens não perecíveis',
        ],
    };
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { mealPlanId, patientId } = body;

        if (!mealPlanId && !patientId) {
            return NextResponse.json(
                { error: 'Meal plan ID or patient ID is required' },
                { status: 400 }
            );
        }

        const shoppingList = await generateShoppingList({ mealPlanId, patientId });

        return NextResponse.json({
            success: true,
            shoppingList,
            creditsUsed: 30,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error('Error generating shopping list:', error);
        return NextResponse.json(
            { error: 'Failed to generate shopping list' },
            { status: 500 }
        );
    }
}
