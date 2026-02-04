# 📧 EMAIL INTEGRATION GUIDE
## Resend Email Service - Complete Implementation

**Estimated Time**: 1-2 hours  
**Difficulty**: Easy  
**Prerequisites**: Resend account

---

## 📋 **STEP-BY-STEP INTEGRATION**

### **Step 1: Create Resend Account** (5 minutes)

1. Go to [resend.com](https://resend.com)
2. Sign up with GitHub or email
3. Verify your email
4. Go to **API Keys**
5. Click "Create API Key"
6. Name it: "nutriplan-production"
7. Copy the key (starts with `re_...`)

---

### **Step 2: Install Resend SDK** (2 minutes)

```bash
cd /Users/viniciussteigleder/Documents/Web\ apps\ -\ vide\ coding/Cal_app
npm install resend
```

---

### **Step 3: Add API Key to Environment** (2 minutes)

Add to `.env.local`:

```bash
# Resend Configuration
RESEND_API_KEY=re_your_actual_api_key_here
RESEND_FROM_EMAIL=nutriplan@yourdomain.com
RESEND_FROM_NAME=NutriPlan
```

---

### **Step 4: Verify Domain** (10 minutes)

**Option A: Use Resend's Test Domain** (Quick):
- Use `onboarding@resend.dev` for testing
- Limited to 100 emails/day
- Can only send to your verified email

**Option B: Add Your Own Domain** (Recommended for production):

1. In Resend dashboard, go to **Domains**
2. Click "Add Domain"
3. Enter your domain (e.g., `nutriplan.com`)
4. Add DNS records to your domain provider:

```
Type: TXT
Name: @
Value: [provided by Resend]

Type: CNAME  
Name: resend._domainkey
Value: [provided by Resend]

Type: MX
Name: @
Value: [provided by Resend]
```

5. Wait for verification (5-30 minutes)

---

### **Step 5: Create Email Templates** (20 minutes)

Create template files:

```typescript
// File: /src/lib/email-templates.ts

export const emailTemplates = {
  welcome: (data: { name: string; loginUrl: string }) => ({
    subject: 'Bem-vindo ao NutriPlan! 🎉',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #10b981, #14b8a6); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Bem-vindo ao NutriPlan!</h1>
            </div>
            <div class="content">
              <p>Olá <strong>${data.name}</strong>,</p>
              <p>Estamos muito felizes em tê-lo(a) conosco! 🎉</p>
              <p>O NutriPlan é sua plataforma completa de nutrição com inteligência artificial para ajudá-lo(a) a alcançar seus objetivos de saúde.</p>
              <p>Para começar, faça login na plataforma:</p>
              <a href="${data.loginUrl}" class="button">Acessar NutriPlan</a>
              <p>Se você tiver alguma dúvida, estamos aqui para ajudar!</p>
              <p>Atenciosamente,<br>Equipe NutriPlan</p>
            </div>
            <div class="footer">
              <p>© 2024 NutriPlan. Todos os direitos reservados.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  }),

  mealPlan: (data: { patientName: string; planName: string; planUrl: string }) => ({
    subject: `Seu Plano Alimentar: ${data.planName}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #10b981, #14b8a6); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🍽️ Novo Plano Alimentar</h1>
            </div>
            <div class="content">
              <p>Olá <strong>${data.patientName}</strong>,</p>
              <p>Seu nutricionista preparou um novo plano alimentar para você:</p>
              <h2>${data.planName}</h2>
              <p>Acesse a plataforma para ver todos os detalhes, receitas e dicas:</p>
              <a href="${data.planUrl}" class="button">Ver Plano Alimentar</a>
              <p>Lembre-se: a consistência é a chave para o sucesso! 💪</p>
              <p>Bom apetite!<br>Equipe NutriPlan</p>
            </div>
          </div>
        </body>
      </html>
    `,
  }),

  shoppingList: (data: { patientName: string; items: string[]; listUrl: string }) => ({
    subject: 'Sua Lista de Compras Semanal 🛒',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #10b981, #14b8a6); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .items { background: white; padding: 20px; border-radius: 6px; margin: 20px 0; }
            .item { padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
            .button { display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🛒 Lista de Compras</h1>
            </div>
            <div class="content">
              <p>Olá <strong>${data.patientName}</strong>,</p>
              <p>Aqui está sua lista de compras para esta semana:</p>
              <div class="items">
                ${data.items.map(item => `<div class="item">✓ ${item}</div>`).join('')}
              </div>
              <p>Acesse a plataforma para ver a lista completa organizada por categorias:</p>
              <a href="${data.listUrl}" class="button">Ver Lista Completa</a>
              <p>Boas compras!<br>Equipe NutriPlan</p>
            </div>
          </div>
        </body>
      </html>
    `,
  }),

  progressReport: (data: { patientName: string; reportUrl: string; highlights: string[] }) => ({
    subject: 'Seu Relatório de Progresso 📊',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #10b981, #14b8a6); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .highlights { background: white; padding: 20px; border-radius: 6px; margin: 20px 0; }
            .highlight { padding: 12px; margin: 8px 0; background: #ecfdf5; border-left: 4px solid #10b981; }
            .button { display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📊 Relatório de Progresso</h1>
            </div>
            <div class="content">
              <p>Olá <strong>${data.patientName}</strong>,</p>
              <p>Parabéns pelo seu progresso! Aqui estão alguns destaques:</p>
              <div class="highlights">
                ${data.highlights.map(h => `<div class="highlight">🎯 ${h}</div>`).join('')}
              </div>
              <p>Acesse o relatório completo para ver gráficos detalhados e análises:</p>
              <a href="${data.reportUrl}" class="button">Ver Relatório Completo</a>
              <p>Continue assim! 💪<br>Equipe NutriPlan</p>
            </div>
          </div>
        </body>
      </html>
    `,
  }),

  appointmentReminder: (data: { patientName: string; date: string; time: string; nutritionistName: string }) => ({
    subject: `Lembrete: Consulta amanhã às ${data.time}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #10b981, #14b8a6); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .appointment { background: white; padding: 20px; border-radius: 6px; margin: 20px 0; text-align: center; }
            .date { font-size: 24px; font-weight: bold; color: #10b981; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📅 Lembrete de Consulta</h1>
            </div>
            <div class="content">
              <p>Olá <strong>${data.patientName}</strong>,</p>
              <p>Este é um lembrete da sua consulta:</p>
              <div class="appointment">
                <div class="date">${data.date}</div>
                <div style="font-size: 20px; margin: 10px 0;">${data.time}</div>
                <div>com ${data.nutritionistName}</div>
              </div>
              <p>Nos vemos em breve!<br>Equipe NutriPlan</p>
            </div>
          </div>
        </body>
      </html>
    `,
  }),

  passwordReset: (data: { name: string; resetUrl: string }) => ({
    subject: 'Redefinir sua senha - NutriPlan',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #10b981, #14b8a6); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Redefinir Senha</h1>
            </div>
            <div class="content">
              <p>Olá <strong>${data.name}</strong>,</p>
              <p>Recebemos uma solicitação para redefinir sua senha.</p>
              <p>Clique no botão abaixo para criar uma nova senha:</p>
              <a href="${data.resetUrl}" class="button">Redefinir Senha</a>
              <div class="warning">
                <strong>⚠️ Importante:</strong> Este link expira em 1 hora. Se você não solicitou esta redefinição, ignore este email.
              </div>
              <p>Atenciosamente,<br>Equipe NutriPlan</p>
            </div>
          </div>
        </body>
      </html>
    `,
  }),
};
```

---

### **Step 6: Update Email API** (15 minutes)

```typescript
// File: /src/app/api/notifications/email/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { emailTemplates } from '@/lib/email-templates';

const resend = new Resend(process.env.RESEND_API_KEY);

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

    // Get template
    const template = emailTemplates[type as keyof typeof emailTemplates];
    if (!template) {
      return NextResponse.json(
        { error: 'Invalid email type' },
        { status: 400 }
      );
    }

    const { subject, html } = template(data);

    // Send email with Resend
    const result = await resend.emails.send({
      from: `${process.env.RESEND_FROM_NAME} <${process.env.RESEND_FROM_EMAIL}>`,
      to: [to],
      subject,
      html,
    });

    return NextResponse.json({
      success: true,
      messageId: result.data?.id,
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
```

---

### **Step 7: Test Email Sending** (10 minutes)

Create a test script:

```typescript
// test-email.ts
async function testEmail() {
  const response = await fetch('http://localhost:3000/api/notifications/email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      to: 'your-email@example.com', // Your email
      type: 'welcome',
      data: {
        name: 'João Silva',
        loginUrl: 'https://nutriplan.com/login',
      },
    }),
  });

  const result = await response.json();
  console.log('Email sent:', result);
}

testEmail();
```

Run: `npx tsx test-email.ts`

---

## ✅ **VERIFICATION CHECKLIST**

- [ ] Resend account created
- [ ] API key obtained
- [ ] `resend` package installed
- [ ] API key added to `.env.local`
- [ ] Domain verified (or using test domain)
- [ ] Email templates created
- [ ] Email API updated
- [ ] Test email sent successfully
- [ ] Email received in inbox

---

## 🎯 **EMAIL LIMITS**

**Free Tier**:
- 100 emails/day
- 3,000 emails/month
- Test domain only

**Pro Tier** ($20/month):
- 50,000 emails/month
- Custom domain
- Analytics
- Webhooks

**Estimated Usage** (100 active patients):
- Welcome emails: ~10/month
- Meal plans: ~100/month
- Shopping lists: ~100/month
- Progress reports: ~50/month
- Appointment reminders: ~200/month
- **Total**: ~460/month (fits in free tier!)

---

## 🚨 **BEST PRACTICES**

1. **Always use templates** for consistency
2. **Always include unsubscribe link** (legal requirement)
3. **Always test emails** before sending to patients
4. **Never send spam** or unsolicited emails
5. **Always respect user preferences**

---

**Email integration complete! Ready for production use.** 🚀
