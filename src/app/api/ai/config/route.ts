import { NextRequest, NextResponse } from 'next/server';

// Mock database for AI agent configurations
const mockConfigs = new Map();

// Default configurations
const defaultConfigs = [
    {
        id: 'meal-planner',
        name: 'Planejador de Refeições',
        description: 'Cria planos alimentares personalizados',
        status: 'active',
        prompt: {
            system: 'Você é um nutricionista especialista com 20 anos de experiência.',
            userTemplate: 'Crie um plano alimentar para {{patient_name}} com {{target_calories}} calorias.',
            variables: ['patient_name', 'target_calories', 'restrictions', 'goals'],
        },
        model: {
            provider: 'openai',
            modelName: 'gpt-4-turbo-preview',
            temperature: 0.7,
            maxTokens: 2000,
        },
        role: {
            persona: 'Nutricionista experiente e empático',
            expertise: ['Planejamento alimentar', 'Nutrição clínica'],
            tone: 'professional',
        },
        costControl: {
            maxCostPerExecution: 0.10,
            dailyBudget: 20.00,
            monthlyBudget: 500.00,
            alertThreshold: 0.80,
        },
        updatedAt: new Date().toISOString(),
    },
];

// Initialize with defaults
defaultConfigs.forEach(config => {
    mockConfigs.set(config.id, config);
});

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const agentId = searchParams.get('agentId');

        if (agentId) {
            const config = mockConfigs.get(agentId);
            if (!config) {
                return NextResponse.json(
                    { error: 'Agent configuration not found' },
                    { status: 404 }
                );
            }
            return NextResponse.json({
                success: true,
                config,
            });
        }

        // Return all configurations
        const configs = Array.from(mockConfigs.values());
        return NextResponse.json({
            success: true,
            configs,
            count: configs.length,
        });
    } catch (error) {
        console.error('Error fetching AI config:', error);
        return NextResponse.json(
            { error: 'Failed to fetch AI configuration' },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { agentId, ...updates } = body;

        if (!agentId) {
            return NextResponse.json(
                { error: 'Agent ID is required' },
                { status: 400 }
            );
        }

        const existingConfig = mockConfigs.get(agentId);
        if (!existingConfig) {
            return NextResponse.json(
                { error: 'Agent configuration not found' },
                { status: 404 }
            );
        }

        const updatedConfig = {
            ...existingConfig,
            ...updates,
            updatedAt: new Date().toISOString(),
        };

        mockConfigs.set(agentId, updatedConfig);

        return NextResponse.json({
            success: true,
            config: updatedConfig,
            message: 'Configuration updated successfully',
        });
    } catch (error) {
        console.error('Error updating AI config:', error);
        return NextResponse.json(
            { error: 'Failed to update AI configuration' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { agentId, action, ...data } = body;

        if (!agentId || !action) {
            return NextResponse.json(
                { error: 'Agent ID and action are required' },
                { status: 400 }
            );
        }

        const config = mockConfigs.get(agentId);
        if (!config) {
            return NextResponse.json(
                { error: 'Agent configuration not found' },
                { status: 404 }
            );
        }

        switch (action) {
            case 'test':
                // Test the agent with sample input
                const testResult = {
                    success: true,
                    response: 'Mock AI response for testing',
                    tokensUsed: 150,
                    cost: 0.0045,
                    responseTime: 2.3,
                };
                return NextResponse.json({
                    success: true,
                    testResult,
                });

            case 'toggle':
                // Toggle agent status
                const newStatus = config.status === 'active' ? 'inactive' : 'active';
                const toggledConfig = {
                    ...config,
                    status: newStatus,
                    updatedAt: new Date().toISOString(),
                };
                mockConfigs.set(agentId, toggledConfig);
                return NextResponse.json({
                    success: true,
                    config: toggledConfig,
                    message: `Agent ${newStatus === 'active' ? 'activated' : 'deactivated'}`,
                });

            case 'reset':
                // Reset to default configuration
                const defaultConfig = defaultConfigs.find(c => c.id === agentId);
                if (defaultConfig) {
                    mockConfigs.set(agentId, { ...defaultConfig });
                    return NextResponse.json({
                        success: true,
                        config: defaultConfig,
                        message: 'Configuration reset to defaults',
                    });
                }
                return NextResponse.json(
                    { error: 'Default configuration not found' },
                    { status: 404 }
                );

            default:
                return NextResponse.json(
                    { error: 'Invalid action' },
                    { status: 400 }
                );
        }
    } catch (error) {
        console.error('Error processing AI config action:', error);
        return NextResponse.json(
            { error: 'Failed to process action' },
            { status: 500 }
        );
    }
}
