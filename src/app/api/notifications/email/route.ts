import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';

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
        let htmlContent = ''; // In a real app, use React Email or compiled templates

        // Determine email template based on type
        switch (type) {
            case 'meal_plan':
                subject = 'Seu Novo Plano Alimentar - NutriPlan';
                htmlContent = `<h1>Olá!</h1><p>Seu novo plano alimentar está pronto.</p><p>Acesse o app para conferir.</p>`;
                break;
            case 'shopping_list':
                subject = 'Lista de Compras - NutriPlan';
                htmlContent = `<h1>Lista de Compras</h1><p>Aqui estão os itens para sua semana.</p>`;
                break;
            case 'progress_report':
                subject = 'Relatório de Progresso - NutriPlan';
                htmlContent = `<h1>Parabéns!</h1><p>Veja seu progresso desta semana.</p>`;
                break;
            case 'appointment_reminder':
                subject = 'Lembrete de Consulta - NutriPlan';
                htmlContent = `<h1>Lembrete</h1><p>Sua consulta está chegando.</p>`;
                break;
            case 'welcome':
                subject = 'Bem-vindo ao NutriPlan!';
                htmlContent = `<h1>Boas vindas!</h1><p>Estamos felizes em ter você conosco.</p>`;
                break;
            case 'password_reset':
                subject = 'Redefinir Senha - NutriPlan';
                htmlContent = `<h1>Recuperação de Senha</h1><p>Use este link para redefinir sua senha.</p>`;
                break;
            default:
                subject = 'Notificação - NutriPlan';
                htmlContent = `<p>Você tem uma nova notificação.</p>`;
        }

        // Use the centralized email service (handles Mock vs Real automatically)
        const result = await sendEmail({
            to,
            subject,
            html: htmlContent,
            from: 'NutriPlan <onboarding@resend.dev>' // Default, can be overridden
        });

        if (!result.success) {
            return NextResponse.json(
                { error: 'Failed to send email provider request', details: result.error },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            messageId: result?.data?.id || (result as unknown as { id?: string })?.id,
            message: 'Email sent successfully',
            simulated: (result as unknown as { simulated?: boolean })?.simulated || false
        });
    } catch (error) {
        console.error('Error sending email:', error);
        return NextResponse.json(
            { error: 'Failed to send email' },
            { status: 500 }
        );
    }
}
