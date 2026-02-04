import { NextRequest, NextResponse } from 'next/server';

// Mock email service - replace with SendGrid/Resend
async function sendEmail(data: any) {
    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log('Email sent:', {
        to: data.to,
        subject: data.subject,
        type: data.type,
    });

    return {
        messageId: `msg_${Date.now()}`,
        status: 'sent',
    };
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { to, type, data } = body;

        if (!to || !type) {
            return NextResponse.json(
                { error: 'Recipient email and type are required' },
                { status: 400 }
            );
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(to)) {
            return NextResponse.json(
                { error: 'Invalid email format' },
                { status: 400 }
            );
        }

        let subject = '';
        let template = '';

        // Determine email template based on type
        switch (type) {
            case 'meal_plan':
                subject = 'Seu Novo Plano Alimentar - NutriPlan';
                template = 'meal-plan-email';
                break;
            case 'shopping_list':
                subject = 'Lista de Compras - NutriPlan';
                template = 'shopping-list-email';
                break;
            case 'progress_report':
                subject = 'Relatório de Progresso - NutriPlan';
                template = 'progress-report-email';
                break;
            case 'appointment_reminder':
                subject = 'Lembrete de Consulta - NutriPlan';
                template = 'appointment-reminder-email';
                break;
            case 'welcome':
                subject = 'Bem-vindo ao NutriPlan!';
                template = 'welcome-email';
                break;
            case 'password_reset':
                subject = 'Redefinir Senha - NutriPlan';
                template = 'password-reset-email';
                break;
            default:
                subject = 'Notificação - NutriPlan';
                template = 'generic-email';
        }

        const result = await sendEmail({
            to,
            subject,
            template,
            data,
        });

        return NextResponse.json({
            success: true,
            messageId: result.messageId,
            message: 'Email sent successfully',
        });
    } catch (error) {
        console.error('Error sending email:', error);
        return NextResponse.json(
            { error: 'Failed to send email' },
            { status: 500 }
        );
    }
}
