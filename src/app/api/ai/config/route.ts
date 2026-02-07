import { NextRequest, NextResponse } from 'next/server';
import { getRequestClaims } from '@/lib/claims';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
    try {
        const claims = await getRequestClaims();
        if (!claims) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const agentId = searchParams.get('agentId');

        if (agentId) {
            const config = await prisma.aiAgentConfig.findUnique({
                where: { tenant_id_agent_id: { tenant_id: claims.tenant_id, agent_id: agentId } },
            });

            if (!config) {
                return NextResponse.json({
                    success: true,
                    config: { agent_id: agentId, is_active: true, model_name: 'gpt-4o', temperature: 0.7 },
                    isDefault: true,
                });
            }

            return NextResponse.json({ success: true, config });
        }

        const configs = await prisma.aiAgentConfig.findMany({
            where: { tenant_id: claims.tenant_id },
            orderBy: { agent_id: 'asc' },
        });

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
        const claims = await getRequestClaims();
        if (!claims) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
        }

        const body = await request.json();
        const { agentId, modelName, systemPrompt, temperature, isActive } = body;

        if (!agentId) {
            return NextResponse.json({ error: 'Agent ID is required' }, { status: 400 });
        }

        const config = await prisma.aiAgentConfig.upsert({
            where: { tenant_id_agent_id: { tenant_id: claims.tenant_id, agent_id: agentId } },
            update: {
                ...(modelName !== undefined && { model_name: modelName }),
                ...(systemPrompt !== undefined && { system_prompt: systemPrompt }),
                ...(temperature !== undefined && { temperature }),
                ...(isActive !== undefined && { is_active: isActive }),
            },
            create: {
                tenant_id: claims.tenant_id,
                agent_id: agentId,
                model_name: modelName || 'gpt-4o',
                system_prompt: systemPrompt || '',
                temperature: temperature ?? 0.7,
                is_active: isActive ?? true,
            },
        });

        return NextResponse.json({
            success: true,
            config,
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
        const claims = await getRequestClaims();
        if (!claims) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
        }

        const body = await request.json();
        const { agentId, action } = body;

        if (!agentId || !action) {
            return NextResponse.json(
                { error: 'Agent ID and action are required' },
                { status: 400 }
            );
        }

        switch (action) {
            case 'toggle': {
                const existing = await prisma.aiAgentConfig.findUnique({
                    where: { tenant_id_agent_id: { tenant_id: claims.tenant_id, agent_id: agentId } },
                });

                const config = await prisma.aiAgentConfig.upsert({
                    where: { tenant_id_agent_id: { tenant_id: claims.tenant_id, agent_id: agentId } },
                    update: { is_active: !(existing?.is_active ?? true) },
                    create: {
                        tenant_id: claims.tenant_id,
                        agent_id: agentId,
                        model_name: 'gpt-4o',
                        is_active: false,
                        temperature: 0.7,
                    },
                });

                return NextResponse.json({
                    success: true,
                    config,
                    message: `Agent ${config.is_active ? 'activated' : 'deactivated'}`,
                });
            }

            case 'reset': {
                await prisma.aiAgentConfig.deleteMany({
                    where: { tenant_id: claims.tenant_id, agent_id: agentId },
                });

                return NextResponse.json({
                    success: true,
                    message: 'Configuration reset to defaults',
                });
            }

            default:
                return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
        }
    } catch (error) {
        console.error('Error processing AI config action:', error);
        return NextResponse.json(
            { error: 'Failed to process action' },
            { status: 500 }
        );
    }
}
