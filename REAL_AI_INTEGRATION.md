# 🤖 REAL AI INTEGRATION GUIDE
## OpenAI API Integration - Complete Implementation

**Estimated Time**: 2-3 hours  
**Difficulty**: Medium  
**Prerequisites**: OpenAI API account

---

## 📋 **STEP-BY-STEP INTEGRATION**

### **Step 1: Get OpenAI API Key** (5 minutes)

1. Go to [platform.openai.com](https://platform.openai.com)
2. Sign up or log in
3. Go to **API Keys** section
4. Click "Create new secret key"
5. Name it: "nutriplan-production"
6. Copy the key (starts with `sk-...`)
7. **IMPORTANT**: Save it securely - you won't see it again!

---

### **Step 2: Install OpenAI SDK** (2 minutes)

```bash
cd /Users/viniciussteigleder/Documents/Web\ apps\ -\ vide\ coding/Cal_app
npm install openai
```

---

### **Step 3: Add API Key to Environment** (2 minutes)

Add to `.env.local`:

```bash
# OpenAI Configuration
OPENAI_API_KEY=sk-your-actual-api-key-here
OPENAI_ORGANIZATION=org-your-org-id # Optional
```

---

### **Step 4: Update OpenAI Helper** (10 minutes)

The file `/src/lib/openai.ts` is already prepared. Just uncomment the real implementations:

```typescript
// File: /src/lib/openai.ts

import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  organization: process.env.OPENAI_ORGANIZATION, // Optional
});

/**
 * Generate chat completion using GPT-4
 */
export async function generateChatCompletion(
  systemPrompt: string,
  userPrompt: string,
  options?: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
  }
) {
  try {
    const completion = await openai.chat.completions.create({
      model: options?.model || 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: options?.temperature || 0.7,
      max_tokens: options?.maxTokens || 2000,
    });
    
    return {
      content: completion.choices[0].message.content,
      usage: completion.usage,
    };
  } catch (error) {
    console.error('Error in OpenAI chat completion:', error);
    throw error;
  }
}

/**
 * Transcribe audio using Whisper AI
 */
export async function transcribeAudio(audioFile: File) {
  try {
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
      language: 'pt', // Portuguese
    });
    
    return {
      text: transcription.text,
    };
  } catch (error) {
    console.error('Error in Whisper transcription:', error);
    throw error;
  }
}

/**
 * Analyze image using GPT-4 Vision
 */
export async function analyzeImage(
  imageData: string, // base64 or URL
  prompt: string,
  options?: {
    model?: string;
    maxTokens?: number;
  }
) {
  try {
    const response = await openai.chat.completions.create({
      model: options?.model || 'gpt-4-vision-preview',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            {
              type: 'image_url',
              image_url: {
                url: imageData,
              },
            },
          ],
        },
      ],
      max_tokens: options?.maxTokens || 1000,
    });
    
    return {
      content: response.choices[0].message.content,
      usage: response.usage,
    };
  } catch (error) {
    console.error('Error in GPT-4 Vision analysis:', error);
    throw error;
  }
}

// ... rest of the file stays the same
```

---

### **Step 5: Update AI Agent APIs** (30-45 minutes)

Update each AI agent API to use real OpenAI. Here's the pattern:

#### **Example: Meal Planner API**

```typescript
// File: /src/app/api/ai/meal-planner/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { generateChatCompletion, PROMPT_TEMPLATES, calculateCreditsCost } from '@/lib/openai';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { patientData, days = 1 } = body;

    // Validate input
    if (!patientData || !patientData.targetCalories) {
      return NextResponse.json(
        { error: 'Patient data with target calories is required' },
        { status: 400 }
      );
    }

    // Generate prompt
    const systemPrompt = PROMPT_TEMPLATES.mealPlanner(patientData);
    const userPrompt = `Crie um plano alimentar de ${days} dia(s).`;

    // Call OpenAI
    const result = await generateChatCompletion(
      systemPrompt,
      userPrompt,
      {
        model: 'gpt-4-turbo-preview',
        temperature: 0.7,
        maxTokens: 2000,
      }
    );

    // Calculate credits used
    const creditsUsed = calculateCreditsCost(result.usage?.total_tokens || 0);

    // Parse AI response (assuming JSON format)
    let mealPlan;
    try {
      mealPlan = JSON.parse(result.content || '{}');
    } catch {
      // If not JSON, wrap in object
      mealPlan = { plan: result.content };
    }

    return NextResponse.json({
      success: true,
      mealPlan,
      creditsUsed,
      tokensUsed: result.usage?.total_tokens,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error generating meal plan:', error);
    return NextResponse.json(
      { error: 'Failed to generate meal plan' },
      { status: 500 }
    );
  }
}
```

#### **Apply Same Pattern to All AI APIs**:

1. `/api/ai/patient-analyzer/route.ts`
2. `/api/ai/supplement-advisor/route.ts`
3. `/api/ai/medical-record/route.ts`
4. `/api/ai/chatbot/route.ts`
5. `/api/ai/shopping-list/route.ts`
6. `/api/ai/report-generator/route.ts`
7. `/api/ai/protocol-generator-ai/route.ts`
8. `/api/ai/symptom-correlator-ai/route.ts`

#### **For Vision APIs** (Food Recognition, Exam Analyzer):

```typescript
// File: /src/app/api/ai/food-recognition/route.ts

import { analyzeImage } from '@/lib/openai';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { imageData, patientId } = body;

    const prompt = `Analise esta foto de refeição e identifique:
1. Todos os alimentos visíveis
2. Quantidade estimada de cada alimento (em gramas)
3. Informações nutricionais de cada item

Forneça a resposta em JSON com o seguinte formato:
{
  "foods": [
    {
      "name": "nome do alimento",
      "quantity_grams": 150,
      "confidence": 0.95,
      "nutrition": {
        "calories": 200,
        "protein": 25,
        "carbs": 10,
        "fat": 8
      }
    }
  ],
  "warnings": ["avisos"],
  "suggestions": ["sugestões"]
}`;

    const result = await analyzeImage(imageData, prompt, {
      model: 'gpt-4-vision-preview',
      maxTokens: 1500,
    });

    const analysis = JSON.parse(result.content || '{}');

    return NextResponse.json({
      success: true,
      analysis,
      creditsUsed: 40,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error recognizing food:', error);
    return NextResponse.json(
      { error: 'Failed to recognize food' },
      { status: 500 }
    );
  }
}
```

---

### **Step 6: Update AI Credits Tracking** (15 minutes)

Update the credits API to track real usage:

```typescript
// File: /src/app/api/ai/credits/route.ts

// After each AI call, deduct credits:
async function deductCredits(nutritionistId: string, creditsUsed: number, agentType: string) {
  const { data: creditRecord } = await supabase
    .from('ai_credits')
    .select('*')
    .eq('nutritionist_id', nutritionistId)
    .single();

  if (!creditRecord || creditRecord.balance < creditsUsed) {
    throw new Error('Insufficient credits');
  }

  const newBalance = creditRecord.balance - creditsUsed;

  // Update balance
  await supabase
    .from('ai_credits')
    .update({
      balance: newBalance,
      total_used: creditRecord.total_used + creditsUsed,
      last_updated: new Date().toISOString(),
    })
    .eq('nutritionist_id', nutritionistId);

  // Create transaction
  await supabase
    .from('ai_credit_transactions')
    .insert({
      nutritionist_id: nutritionistId,
      transaction_type: 'usage',
      agent_type: agentType,
      credits_amount: creditsUsed,
      balance_after: newBalance,
      created_at: new Date().toISOString(),
    });

  return newBalance;
}
```

---

### **Step 7: Test AI Integration** (20 minutes)

Create a test script:

```typescript
// test-ai.ts
import { generateChatCompletion, analyzeImage, transcribeAudio } from '@/lib/openai';

async function testAI() {
  console.log('🧪 Testing OpenAI Integration...\n');

  // Test 1: Chat Completion
  console.log('1️⃣ Testing Chat Completion...');
  try {
    const result = await generateChatCompletion(
      'Você é um nutricionista experiente.',
      'Liste 3 alimentos ricos em proteína.',
      { model: 'gpt-4-turbo-preview', temperature: 0.7 }
    );
    console.log('✅ Chat Completion:', result.content?.substring(0, 100));
    console.log('   Tokens used:', result.usage?.total_tokens);
  } catch (error) {
    console.error('❌ Chat Completion failed:', error);
  }

  // Test 2: Vision (if you have an image URL)
  console.log('\n2️⃣ Testing Vision...');
  try {
    const imageUrl = 'https://example.com/food-image.jpg';
    const result = await analyzeImage(
      imageUrl,
      'Identifique os alimentos nesta imagem.',
      { model: 'gpt-4-vision-preview' }
    );
    console.log('✅ Vision:', result.content?.substring(0, 100));
  } catch (error) {
    console.error('❌ Vision failed:', error);
  }

  console.log('\n✅ AI Integration tests complete!');
}

testAI();
```

Run: `npx tsx test-ai.ts`

---

### **Step 8: Monitor Usage and Costs** (10 minutes)

1. Go to [platform.openai.com/usage](https://platform.openai.com/usage)
2. Monitor your API usage
3. Set up billing alerts:
   - Go to **Settings** → **Billing**
   - Set monthly budget limit
   - Enable email alerts at 50%, 75%, 90%

**Estimated Costs**:
- GPT-4 Turbo: ~$0.01 per 1K tokens (input) + $0.03 per 1K tokens (output)
- GPT-4 Vision: ~$0.01 per image + tokens
- Whisper: ~$0.006 per minute

**Example Monthly Cost** (100 patients, active usage):
- 500 meal plans: ~$25
- 200 patient analyses: ~$20
- 300 food recognitions: ~$30
- 100 exam analyses: ~$15
- **Total**: ~$90/month

---

## ✅ **VERIFICATION CHECKLIST**

- [ ] OpenAI API key obtained
- [ ] `openai` package installed
- [ ] API key added to `.env.local`
- [ ] `/lib/openai.ts` updated with real implementations
- [ ] All 11 AI agent APIs updated
- [ ] Credits tracking integrated
- [ ] Test script run successfully
- [ ] Usage monitoring set up
- [ ] Billing alerts configured

---

## 🎯 **INTEGRATION COMPLETE!**

Your AI features are now powered by real OpenAI APIs:

- ✅ GPT-4 for text generation
- ✅ GPT-4 Vision for image analysis
- ✅ Whisper for audio transcription
- ✅ Credits tracking
- ✅ Cost monitoring

---

## 🚨 **IMPORTANT SECURITY NOTES**

1. **NEVER** commit `.env.local` to git
2. **NEVER** expose `OPENAI_API_KEY` to client-side
3. **ALWAYS** validate user input before sending to OpenAI
4. **ALWAYS** implement rate limiting
5. **ALWAYS** monitor costs and set budgets

---

**AI Integration complete! Ready for production use.** 🚀
