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
        const type = searchParams.get('type'); // 'balance' or 'transactions'

        if (type === 'balance') {
            const tenant = await prisma.tenant.findUnique({
                where: { id: claims.tenant_id },
                select: { ai_credits: true, ai_usage_limit: true, ai_enabled: true },
            });

            if (!tenant) {
                return NextResponse.json({ error: 'Tenant não encontrado' }, { status: 404 });
            }

            const totals = await prisma.aiCreditTransaction.aggregate({
                where: { tenant_id: claims.tenant_id },
                _sum: { credits_used: true },
            });

            return NextResponse.json({
                success: true,
                balance: tenant.ai_credits,
                totalUsed: totals._sum.credits_used || 0,
                usageLimit: tenant.ai_usage_limit,
                aiEnabled: tenant.ai_enabled,
                lastUpdated: new Date().toISOString(),
            });
        }

        // Get transactions
        const transactions = await prisma.aiCreditTransaction.findMany({
            where: { tenant_id: claims.tenant_id },
            orderBy: { created_at: 'desc' },
            take: 50,
            select: {
                id: true,
                agent_type: true,
                credits_used: true,
                cost_brl: true,
                metadata: true,
                created_at: true,
            },
        });

        return NextResponse.json({
            success: true,
            transactions,
            count: transactions.length,
        });
    } catch (error) {
        console.error('Error fetching AI credits:', error);
        return NextResponse.json(
            { error: 'Failed to fetch AI credits' },
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
        const { transactionType, creditsAmount } = body;

        if (!transactionType || !creditsAmount) {
            return NextResponse.json(
                { error: 'Transaction type and credits amount are required' },
                { status: 400 }
            );
        }

        // Only OWNER and TENANT_ADMIN can manage credits
        if (!['OWNER', 'TENANT_ADMIN'].includes(claims.role)) {
            return NextResponse.json(
                { error: 'Acesso restrito a administradores.' },
                { status: 403 }
            );
        }

        const validTypes = ['purchase', 'refund'];
        if (!validTypes.includes(transactionType)) {
            return NextResponse.json(
                { error: 'Invalid transaction type. Only purchase and refund allowed via API.' },
                { status: 400 }
            );
        }

        if (typeof creditsAmount !== 'number' || creditsAmount <= 0) {
            return NextResponse.json(
                { error: 'Credits amount must be a positive number.' },
                { status: 400 }
            );
        }

        // Update tenant credits atomically
        const tenant = await prisma.tenant.update({
            where: { id: claims.tenant_id },
            data: { ai_credits: { increment: creditsAmount } },
            select: { ai_credits: true },
        });

        // Log the transaction
        const transaction = await prisma.aiCreditTransaction.create({
            data: {
                tenant_id: claims.tenant_id,
                nutritionist_id: claims.user_id,
                agent_type: transactionType,
                credits_used: -creditsAmount,
                cost_brl: 0,
                metadata: { type: transactionType, manual: true },
            },
        });

        return NextResponse.json({
            success: true,
            transaction: { id: transaction.id, type: transactionType, amount: creditsAmount },
            newBalance: tenant.ai_credits,
        });
    } catch (error) {
        console.error('Error processing AI credits transaction:', error);
        return NextResponse.json(
            { error: 'Failed to process transaction' },
            { status: 500 }
        );
    }
}
