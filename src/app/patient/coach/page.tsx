'use client';

import { useState, useRef, useEffect } from 'react';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { MessageCircle, Send, Bot, User, Sparkles, TrendingUp, Heart, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    type?: 'motivational' | 'educational' | 'behavioral' | 'answer';
}

const quickQuestions = [
    'Posso comer chocolate no meu plano?',
    'Como lidar com compulsão alimentar?',
    'Quais lanches saudáveis posso fazer?',
    'Estou com vontade de doce, o que fazer?',
    'Como aumentar minha ingestão de proteínas?',
    'Posso substituir arroz por batata doce?',
];

const motivationalMessages = [
    'Você está indo muito bem! Continue assim! 💪',
    'Cada pequeno progresso conta. Celebre suas vitórias! 🎉',
    'Lembre-se: consistência é mais importante que perfeição! ⭐',
    'Você é mais forte do que pensa! Continue firme! 🔥',
];

export default function NutritionCoachChatbotPage() {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'assistant',
            content: 'Olá! Sou seu Coach Nutricional com IA, disponível 24/7 para ajudar você! 🌟\n\nPosso responder suas dúvidas sobre nutrição, dar dicas motivacionais, sugerir substituições de alimentos e muito mais. Como posso ajudar você hoje?',
            timestamp: new Date(),
            type: 'answer',
        },
    ]);
    const [inputMessage, setInputMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const generateAIResponse = (userMessage: string): Message => {
        const lowerMessage = userMessage.toLowerCase();

        // Motivational responses
        if (lowerMessage.includes('desistir') || lowerMessage.includes('difícil') || lowerMessage.includes('cansad')) {
            return {
                id: Date.now().toString(),
                role: 'assistant',
                content: `Entendo que você está passando por um momento desafiador. 💙

Lembre-se de que mudanças reais levam tempo e é completamente normal ter dias difíceis. Aqui estão algumas dicas para você:

1. **Seja gentil consigo mesmo** - Você está fazendo o seu melhor
2. **Foque no progresso, não na perfeição** - Cada dia é uma nova oportunidade
3. **Celebre pequenas vitórias** - Cada refeição saudável conta!
4. **Peça apoio** - Converse com seu nutricionista sobre como está se sentindo

Você não está sozinho(a) nessa jornada. Estou aqui para apoiar você! 🌟`,
                timestamp: new Date(),
                type: 'motivational',
            };
        }

        // Chocolate question
        if (lowerMessage.includes('chocolate')) {
            return {
                id: Date.now().toString(),
                role: 'assistant',
                content: `Sim, você pode incluir chocolate no seu plano! 🍫

**Dicas para consumir chocolate de forma saudável:**

1. **Escolha chocolate amargo** (70% cacau ou mais)
   - Menos açúcar
   - Mais antioxidantes
   - Mais saciedade

2. **Porção adequada**: 20-30g por dia
   - Equivale a 2-3 quadradinhos

3. **Momento ideal**: Após o almoço
   - Ajuda a controlar a vontade de doce
   - Melhor digestão

4. **Alternativas saudáveis**:
   - Cacau em pó 100% + banana
   - Mousse de chocolate com abacate
   - Brigadeiro fit com tâmaras

Lembre-se: o segredo está no equilíbrio! 😊`,
                timestamp: new Date(),
                type: 'educational',
            };
        }

        // Compulsão alimentar
        if (lowerMessage.includes('compulsão') || lowerMessage.includes('compulsiv')) {
            return {
                id: Date.now().toString(),
                role: 'assistant',
                content: `A compulsão alimentar é um desafio real e você não está sozinho(a). 💚

**Estratégias para lidar com a compulsão:**

1. **Identifique gatilhos emocionais**
   - Estresse, ansiedade, tédio?
   - Mantenha um diário emocional

2. **Pratique alimentação consciente**
   - Coma devagar, sem distrações
   - Preste atenção nos sinais de fome e saciedade

3. **Não pule refeições**
   - Coma a cada 3-4 horas
   - Evite chegar com muita fome

4. **Tenha opções saudáveis disponíveis**
   - Frutas, castanhas, iogurte
   - Remova tentações de casa

5. **Busque apoio profissional**
   - Nutricionista + psicólogo
   - Tratamento multidisciplinar

**Técnica de emergência:**
Quando sentir vontade de comer compulsivamente:
- Beba 1 copo de água
- Espere 10 minutos
- Faça 5 respirações profundas
- Pergunte-se: "Estou com fome física ou emocional?"

Você é capaz de superar isso! 🌟`,
                timestamp: new Date(),
                type: 'behavioral',
            };
        }

        // Lanches saudáveis
        if (lowerMessage.includes('lanche')) {
            return {
                id: Date.now().toString(),
                role: 'assistant',
                content: `Aqui estão ótimas opções de lanches saudáveis! 🥗

**Lanches Rápidos (5 minutos):**
1. Iogurte natural + granola + frutas vermelhas
2. Banana + pasta de amendoim
3. Mix de castanhas (30g)
4. Queijo branco + tomate cereja
5. Ovo cozido + sal rosa

**Lanches para Preparar (15 minutos):**
1. Panqueca de banana e aveia
2. Tapioca com queijo e tomate
3. Vitamina de frutas com aveia
4. Pão integral com abacate
5. Crepioca com frango desfiado

**Lanches Doces Saudáveis:**
1. Maçã assada com canela
2. Chocolate 70% (2 quadradinhos)
3. Brigadeiro de tâmaras
4. Mousse de abacate com cacau
5. Frozen de banana

**Dica profissional:** Prepare lanches no domingo para a semana toda! 📦

Qual desses você gostaria de experimentar primeiro?`,
                timestamp: new Date(),
                type: 'educational',
            };
        }

        // Vontade de doce
        if (lowerMessage.includes('vontade') && lowerMessage.includes('doce')) {
            return {
                id: Date.now().toString(),
                role: 'assistant',
                content: `Vontade de doce é super normal! Vamos resolver isso de forma saudável. 🍰

**Por que temos vontade de doce?**
- Oscilação de glicemia
- Falta de sono
- Estresse
- Hábito/rotina

**Soluções imediatas:**

1. **Frutas doces naturais:**
   - Banana congelada (parece sorvete!)
   - Manga
   - Uvas congeladas
   - Tâmaras (super doces!)

2. **Receitas rápidas (5 min):**
   - Banana amassada + cacau em pó
   - Iogurte + mel + canela
   - Pasta de amendoim + cacau

3. **Estratégia dos 15 minutos:**
   - Beba água
   - Espere 15 minutos
   - Se a vontade persistir, coma algo doce saudável

4. **Prevenção:**
   - Não pule refeições
   - Inclua proteína em todas as refeições
   - Durma bem (7-8h)
   - Gerencie o estresse

**Lembre-se:** Não há problema em comer um doce às vezes! O importante é o equilíbrio. 😊`,
                timestamp: new Date(),
                type: 'educational',
            };
        }

        // Proteínas
        if (lowerMessage.includes('proteína') || lowerMessage.includes('proteina')) {
            return {
                id: Date.now().toString(),
                role: 'assistant',
                content: `Ótima pergunta! Proteínas são essenciais para seus resultados. 💪

**Fontes de Proteína de Alta Qualidade:**

**Animais:**
- Frango (26g/100g)
- Peixe (20-25g/100g)
- Carne vermelha magra (26g/100g)
- Ovos (6g/unidade)
- Iogurte grego (10g/100g)
- Queijo cottage (11g/100g)

**Vegetais:**
- Lentilha (9g/100g cozida)
- Grão de bico (8g/100g cozido)
- Tofu (8g/100g)
- Quinoa (4g/100g cozida)
- Edamame (11g/100g)

**Dicas para aumentar proteína:**

1. **Café da manhã:**
   - Adicione ovos
   - Use iogurte grego
   - Inclua pasta de amendoim

2. **Lanches:**
   - Queijo branco
   - Atum
   - Castanhas

3. **Almoço/Jantar:**
   - Palma da mão de proteína
   - Combine fontes (arroz + feijão)

4. **Suplementação:**
   - Whey protein (se necessário)
   - Consulte seu nutricionista

**Meta diária:** 1.6-2.2g/kg de peso corporal para hipertrofia

Precisa de receitas ricas em proteína?`,
                timestamp: new Date(),
                type: 'educational',
            };
        }

        // Substituições
        if (lowerMessage.includes('substituir') || lowerMessage.includes('substitui')) {
            return {
                id: Date.now().toString(),
                role: 'assistant',
                content: `Sim! Arroz e batata doce são ótimas fontes de carboidratos. 🍠

**Comparação Nutricional (100g):**

**Arroz branco:**
- Calorias: 130
- Carboidratos: 28g
- Índice glicêmico: Alto

**Batata doce:**
- Calorias: 86
- Carboidratos: 20g
- Índice glicêmico: Médio
- Fibras: 3g
- Vitamina A: Alta

**Vantagens da batata doce:**
✅ Mais fibras
✅ Mais vitaminas
✅ Libera energia gradualmente
✅ Maior saciedade

**Outras substituições de carboidratos:**

1. **Arroz → Quinoa**
   - Mais proteína
   - Completa em aminoácidos

2. **Arroz → Arroz integral**
   - Mais fibras
   - Mais nutrientes

3. **Arroz → Purê de couve-flor**
   - Menos calorias
   - Low carb

4. **Macarrão → Abobrinha em espiral**
   - Muito menos calorias
   - Mais vitaminas

**Dica:** Varie suas fontes de carboidratos durante a semana para obter diferentes nutrientes!

Quer saber mais substituições?`,
                timestamp: new Date(),
                type: 'educational',
            };
        }

        // Default response
        return {
            id: Date.now().toString(),
            role: 'assistant',
            content: `Entendi sua pergunta! 🤔

Embora eu seja uma IA treinada em nutrição, para questões muito específicas sobre seu plano alimentar, recomendo consultar diretamente seu nutricionista.

Enquanto isso, posso ajudar com:
- Dúvidas gerais sobre nutrição
- Sugestões de receitas saudáveis
- Dicas de motivação
- Substituições de alimentos
- Estratégias comportamentais

O que você gostaria de saber mais?`,
            timestamp: new Date(),
            type: 'answer',
        };
    };

    const handleSendMessage = () => {
        if (!inputMessage.trim()) return;

        // Add user message
        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: inputMessage,
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInputMessage('');
        setIsTyping(true);

        // Simulate AI thinking
        setTimeout(() => {
            const aiResponse = generateAIResponse(inputMessage);
            setMessages((prev) => [...prev, aiResponse]);
            setIsTyping(false);
        }, 1500);
    };

    const handleQuickQuestion = (question: string) => {
        setInputMessage(question);
    };

    const getMessageIcon = (type?: string) => {
        switch (type) {
            case 'motivational':
                return <Heart className="h-4 w-4 text-pink-600" />;
            case 'educational':
                return <Lightbulb className="h-4 w-4 text-amber-600" />;
            case 'behavioral':
                return <TrendingUp className="h-4 w-4 text-blue-600" />;
            default:
                return <Sparkles className="h-4 w-4 text-emerald-600" />;
        }
    };

    return (
        <DashboardLayout role="patient">
            <div className="h-[calc(100vh-8rem)] flex flex-col space-y-4">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <MessageCircle className="h-8 w-8 text-primary" />
                        Coach Nutricional com IA
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Suporte 24/7 para suas dúvidas sobre nutrição e motivação
                    </p>
                </div>

                {/* Chat Container */}
                <Card className="flex-1 flex flex-col">
                    <CardHeader className="border-b">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10 bg-emerald-100">
                                    <AvatarFallback>
                                        <Bot className="h-6 w-6 text-emerald-600" />
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <CardTitle className="text-lg">NutriCoach IA</CardTitle>
                                    <CardDescription className="flex items-center gap-2">
                                        <span className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></span>
                                        Online 24/7
                                    </CardDescription>
                                </div>
                            </div>
                            <Badge variant="outline" className="bg-emerald-50 text-emerald-700">
                                Grátis
                            </Badge>
                        </div>
                    </CardHeader>

                    {/* Messages */}
                    <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
                        <div className="space-y-4">
                            {messages.map((message) => (
                                <div
                                    key={message.id}
                                    className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
                                >
                                    <Avatar className={`h-8 w-8 ${message.role === 'user' ? 'bg-blue-100' : 'bg-emerald-100'}`}>
                                        <AvatarFallback>
                                            {message.role === 'user' ? (
                                                <User className="h-5 w-5 text-blue-600" />
                                            ) : (
                                                <Bot className="h-5 w-5 text-emerald-600" />
                                            )}
                                        </AvatarFallback>
                                    </Avatar>

                                    <div className={`flex-1 max-w-[80%] ${message.role === 'user' ? 'items-end' : ''}`}>
                                        <div
                                            className={`rounded-lg p-3 ${message.role === 'user'
                                                    ? 'bg-blue-600 text-white ml-auto'
                                                    : 'bg-muted'
                                                }`}
                                        >
                                            {message.role === 'assistant' && message.type && (
                                                <div className="flex items-center gap-2 mb-2">
                                                    {getMessageIcon(message.type)}
                                                    <span className="text-xs font-medium capitalize">
                                                        {message.type === 'motivational' && 'Motivação'}
                                                        {message.type === 'educational' && 'Educação'}
                                                        {message.type === 'behavioral' && 'Comportamento'}
                                                        {message.type === 'answer' && 'Resposta'}
                                                    </span>
                                                </div>
                                            )}
                                            <p className="text-sm whitespace-pre-line">{message.content}</p>
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1 px-1">
                                            {message.timestamp.toLocaleTimeString('pt-BR', {
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </p>
                                    </div>
                                </div>
                            ))}

                            {isTyping && (
                                <div className="flex gap-3">
                                    <Avatar className="h-8 w-8 bg-emerald-100">
                                        <AvatarFallback>
                                            <Bot className="h-5 w-5 text-emerald-600" />
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="bg-muted rounded-lg p-3">
                                        <div className="flex gap-1">
                                            <div className="h-2 w-2 bg-emerald-600 rounded-full animate-bounce"></div>
                                            <div className="h-2 w-2 bg-emerald-600 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                                            <div className="h-2 w-2 bg-emerald-600 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                    </ScrollArea>

                    {/* Quick Questions */}
                    <div className="border-t p-4">
                        <p className="text-sm font-medium mb-2">Perguntas Rápidas:</p>
                        <div className="flex flex-wrap gap-2">
                            {quickQuestions.map((question, idx) => (
                                <Button
                                    key={idx}
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleQuickQuestion(question)}
                                    className="text-xs"
                                >
                                    {question}
                                </Button>
                            ))}
                        </div>
                    </div>

                    {/* Input */}
                    <div className="border-t p-4">
                        <div className="flex gap-2">
                            <Input
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                placeholder="Digite sua pergunta..."
                                className="flex-1"
                            />
                            <Button
                                onClick={handleSendMessage}
                                disabled={!inputMessage.trim() || isTyping}
                                className="bg-emerald-600 hover:bg-emerald-700"
                            >
                                <Send className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </Card>
            </div>
        </DashboardLayout>
    );
}
