import { NextRequest, NextResponse } from 'next/server';

// Mock AI chatbot - replace with actual OpenAI integration
async function generateChatResponse(message: string, history: any[]) {
    await new Promise(resolve => setTimeout(resolve, 1000));

    const messageLower = message.toLowerCase();

    // Categorize and respond based on message content
    let category: 'motivational' | 'educational' | 'behavioral' | 'general' = 'general';
    let response = '';

    if (messageLower.includes('desanima') || messageLower.includes('difícil') ||
        messageLower.includes('cansad') || messageLower.includes('desistir')) {
        category = 'motivational';
        response = `Entendo que você está passando por um momento desafiador, mas lembre-se: 
    cada pequeno passo conta! 💪 Você já chegou até aqui, e isso mostra sua determinação. 
    
    Que tal focarmos em uma pequena vitória de hoje? Mesmo que seja beber mais água ou 
    fazer uma caminhada de 10 minutos. Pequenas conquistas se transformam em grandes resultados!
    
    Estou aqui para te apoiar em cada etapa dessa jornada. Você não está sozinho(a)! 🌟`;
    }
    else if (messageLower.includes('como') || messageLower.includes('o que') ||
        messageLower.includes('por que') || messageLower.includes('quando')) {
        category = 'educational';

        if (messageLower.includes('proteína') || messageLower.includes('proteina')) {
            response = `Ótima pergunta sobre proteínas! 🥚
      
      As proteínas são essenciais para:
      - Construção e reparação muscular
      - Saciedade (te mantém satisfeito por mais tempo)
      - Metabolismo saudável
      
      Fontes de qualidade:
      • Animais: frango, peixe, ovos, laticínios
      • Vegetais: feijão, lentilha, grão-de-bico, tofu
      
      Recomendação geral: 1,6-2,2g por kg de peso corporal para quem treina.
      
      Quer saber mais sobre alguma fonte específica?`;
        } else if (messageLower.includes('água') || messageLower.includes('hidrat')) {
            response = `Excelente pergunta sobre hidratação! 💧
      
      A água é fundamental para:
      - Metabolismo eficiente
      - Eliminação de toxinas
      - Controle do apetite
      - Energia e disposição
      
      Meta diária: 35ml por kg de peso
      Exemplo: 70kg = 2,45L/dia
      
      Dicas práticas:
      ✓ Comece o dia com 1 copo
      ✓ Tenha uma garrafa sempre por perto
      ✓ Configure lembretes no celular
      ✓ Beba antes de sentir sede
      
      Está conseguindo atingir sua meta de água?`;
        } else {
            response = `Essa é uma ótima pergunta! 📚
      
      Para te dar a melhor resposta possível, preciso entender melhor o contexto. 
      Pode me dar mais detalhes sobre o que você gostaria de saber?
      
      Enquanto isso, aqui estão alguns tópicos que posso te ajudar:
      • Nutrição e macronutrientes
      • Hidratação e metabolismo
      • Planejamento de refeições
      • Dicas para aderência ao plano
      • Exercícios e alimentação`;
        }
    }
    else if (messageLower.includes('compuls') || messageLower.includes('ansiedade') ||
        messageLower.includes('emocional')) {
        category = 'behavioral';
        response = `Reconhecer esses padrões já é um grande passo! 🧠
    
    A alimentação emocional é muito comum e podemos trabalhar isso juntos:
    
    **Estratégias práticas:**
    1. **Pause antes de comer**: Pergunte-se "Estou com fome física ou emocional?"
    2. **Identifique gatilhos**: O que aconteceu antes da vontade de comer?
    3. **Alternativas saudáveis**: 
       - Caminhe 5 minutos
       - Beba água
       - Respire profundamente
       - Ligue para alguém
    
    **Mindful eating:**
    - Coma sem distrações (TV, celular)
    - Mastigue devagar
    - Perceba sabores e texturas
    
    Lembre-se: não se trata de perfeição, mas de progresso! 💚
    
    Quer conversar mais sobre alguma situação específica?`;
    }
    else if (messageLower.includes('obrigad') || messageLower.includes('valeu')) {
        category = 'motivational';
        response = `Por nada! 😊 Estou aqui sempre que precisar!
    
    Lembre-se: você está fazendo um trabalho incrível cuidando da sua saúde. 
    Continue assim! 💪✨`;
    }
    else {
        response = `Olá! Estou aqui para te ajudar! 👋
    
    Posso te auxiliar com:
    • Dúvidas sobre nutrição
    • Motivação e apoio
    • Dicas práticas para o dia a dia
    • Estratégias comportamentais
    
    Como posso te ajudar hoje?`;
    }

    return {
        message: response,
        category,
        timestamp: new Date().toISOString(),
    };
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { message, history, patientId } = body;

        if (!message) {
            return NextResponse.json(
                { error: 'Message is required' },
                { status: 400 }
            );
        }

        const response = await generateChatResponse(message, history || []);

        return NextResponse.json({
            success: true,
            response,
            creditsUsed: 10,
        });
    } catch (error) {
        console.error('Error in chatbot:', error);
        return NextResponse.json(
            { error: 'Failed to generate response' },
            { status: 500 }
        );
    }
}
