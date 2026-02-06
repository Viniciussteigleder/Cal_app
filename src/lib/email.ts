import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

type EmailPayload = {
    to: string;
    subject: string;
    html: string;
    from?: string;
};

export async function sendEmail({ to, subject, html, from }: EmailPayload) {
    // If API key is not present, mock the sending (useful for dev without keys)
    if (!process.env.RESEND_API_KEY) {
        console.warn('RESEND_API_KEY is missing. Mocking email send:', { to, subject });
        // Simulate delay
        await new Promise(resolve => setTimeout(resolve, 500));
        return { success: true, id: `mock_${Date.now()}`, simulated: true };
    }

    try {
        const { data, error } = await resend.emails.send({
            from: from || 'NutriPlan <onboarding@resend.dev>', // Update this with verified domain in production
            to,
            subject,
            html,
        });

        if (error) {
            console.error('Resend API Error:', error);
            return { success: false, error };
        }

        return { success: true, data };
    } catch (error) {
        console.error('Email Service Error:', error);
        return { success: false, error };
    }
}
