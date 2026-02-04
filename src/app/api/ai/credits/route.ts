import { NextRequest, NextResponse } from 'next/server';

// Mock AI Credits database
const mockCredits = new Map();
const mockTransactions = new Map();

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const nutritionistId = searchParams.get('nutritionistId');
        const type = searchParams.get('type'); // 'balance' or 'transactions'

        if (!nutritionistId) {
            return NextResponse.json(
                { error: 'Nutritionist ID is required' },
                { status: 400 }
            );
        }

        if (type === 'balance') {
            // Get current balance
            const balance = mockCredits.get(nutritionistId) || {
                nutritionistId,
                balance: 1000, // Starting balance
                totalPurchased: 1000,
                totalUsed: 0,
                lastUpdated: new Date().toISOString(),
            };

            return NextResponse.json({
                success: true,
                balance: balance.balance,
                totalPurchased: balance.totalPurchased,
                totalUsed: balance.totalUsed,
                lastUpdated: balance.lastUpdated,
            });
        }

        // Get transactions
        const transactions = Array.from(mockTransactions.values())
            .filter((tx: any) => tx.nutritionistId === nutritionistId)
            .sort((a: any, b: any) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );

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
        const body = await request.json();
        const {
            nutritionistId,
            transactionType,
            agentType,
            creditsAmount,
            costBrl,
            metadata,
        } = body;

        if (!nutritionistId || !transactionType || !creditsAmount) {
            return NextResponse.json(
                { error: 'Nutritionist ID, transaction type, and credits amount are required' },
                { status: 400 }
            );
        }

        // Validate transaction type
        const validTypes = ['purchase', 'usage', 'refund'];
        if (!validTypes.includes(transactionType)) {
            return NextResponse.json(
                { error: 'Invalid transaction type' },
                { status: 400 }
            );
        }

        // Get current balance
        let creditRecord = mockCredits.get(nutritionistId) || {
            nutritionistId,
            balance: 1000,
            totalPurchased: 1000,
            totalUsed: 0,
        };

        // Calculate new balance
        let newBalance = creditRecord.balance;
        if (transactionType === 'purchase' || transactionType === 'refund') {
            newBalance += creditsAmount;
            creditRecord.totalPurchased += creditsAmount;
        } else if (transactionType === 'usage') {
            if (newBalance < creditsAmount) {
                return NextResponse.json(
                    { error: 'Insufficient credits' },
                    { status: 400 }
                );
            }
            newBalance -= creditsAmount;
            creditRecord.totalUsed += creditsAmount;
        }

        // Update balance
        creditRecord.balance = newBalance;
        creditRecord.lastUpdated = new Date().toISOString();
        mockCredits.set(nutritionistId, creditRecord);

        // Create transaction record
        const transaction = {
            id: Date.now().toString(),
            nutritionistId,
            transactionType,
            agentType: agentType || null,
            creditsAmount,
            costBrl: costBrl || 0,
            balanceAfter: newBalance,
            metadata: metadata || {},
            createdAt: new Date().toISOString(),
        };

        mockTransactions.set(transaction.id, transaction);

        return NextResponse.json({
            success: true,
            transaction,
            newBalance,
            message: 'Transaction completed successfully',
        });
    } catch (error) {
        console.error('Error processing AI credits transaction:', error);
        return NextResponse.json(
            { error: 'Failed to process transaction' },
            { status: 500 }
        );
    }
}
