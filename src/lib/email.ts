import { Resend } from 'resend';

type EmailPayload = {
    to: string;
    subject: string;
    html: string;
    from?: string;
};

let resend: Resend | null = null;

function getResendClient(): Resend | null {
    if (resend) return resend;
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) return null;
    resend = new Resend(apiKey);
    return resend;
}

export async function sendEmail({ to, subject, html, from }: EmailPayload) {
    // If API key is not present, mock the sending (useful for dev without keys)
    const resendClient = getResendClient();
    if (!resendClient) {
        console.warn('RESEND_API_KEY is missing. Mocking email send:', { to, subject });
        // Simulate delay
        await new Promise(resolve => setTimeout(resolve, 500));
        return { success: true, id: `mock_${Date.now()}`, simulated: true };
    }

    try {
        const { data, error } = await resendClient.emails.send({
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
