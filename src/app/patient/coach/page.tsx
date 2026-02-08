'use client';

import { useState, useRef, useEffect, FormEvent } from 'react';
import { MessageCircle, Send, Bot, User, Sparkles, TrendingUp, Heart, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    type?: 'motivational' | 'educational' | 'behavioral' | 'answer' | 'general';
}

const quickQuestions = [
    'Posso comer chocolate no meu plano?',
    'Como lidar com compulsão alimentar?',
    'Quais lanches saudáveis posso fazer?',
    'Estou com vontade de doce, o que fazer?',
    'Como aumentar minha ingestão de proteínas?',
    'Posso substituir arroz por batata doce?',
];

export default function NutritionCoachChatbotPage() {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'assistant',
            content: 'Olá! Sou seu Coach Nutricional com IA, disponível 24/7 para ajudar você!\n\nPosso responder suas dúvidas sobre nutrição, dar dicas motivacionais, sugerir substituições de alimentos e muito mais. Como posso ajudar você hoje?',
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

    const handleSendMessage = async () => {
        if (!inputMessage.trim() || isTyping) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: inputMessage,
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        const currentInput = inputMessage;
        setInputMessage('');
        setIsTyping(true);

        try {
            const history = messages.slice(-10).map((m) => ({
                role: m.role,
                content: m.content,
            }));

            const response = await fetch('/api/ai/chatbot', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: currentInput,
                    history,
                }),
            });

            if (!response.ok) {
                throw new Error('Falha na comunicação com a IA');
            }

            const data = await response.json();

            const aiMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: data.data?.message || data.data?.raw_response || 'Desculpe, não consegui processar sua mensagem. Tente novamente.',
                timestamp: new Date(),
                type: data.data?.category || 'answer',
            };

            setMessages((prev) => [...prev, aiMessage]);
        } catch (error) {
            console.error('Error calling chatbot API:', error);
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: 'Desculpe, ocorreu um erro ao processar sua mensagem. Verifique sua conexão e tente novamente.',
                timestamp: new Date(),
                type: 'answer',
            };
            setMessages((prev) => [...prev, errorMessage]);
            toast.error('Erro ao comunicar com o coach de IA');
        } finally {
            setIsTyping(false);
        }
    };

  const handleQuickQuestion = (question: string) => {
        setInputMessage(question);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    handleSendMessage();
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
                                IA
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
                                            className={`rounded-lg p-3 text-sm pb-1 ${message.role === 'user'
                                                ? 'bg-blue-600 text-white ml-auto'
                                                : 'bg-muted prose dark:prose-invert max-w-none prose-p:leading-relaxed prose-li:my-0'
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
                                                        {message.type === 'general' && 'Resposta'}
                                                    </span>
                                                </div>
                                            )}
                                            <p className="text-sm whitespace-pre-line">{message.content}</p>
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1 px-1">
                                            {(message as any).createdAt?.toLocaleTimeString('pt-BR', {
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            }) || new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
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
                    <form onSubmit={handleSubmit} className="p-4 border-t bg-muted/30">
                        <div className="flex gap-2">
                            <Input
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                placeholder="Digite sua pergunta..."
                                className="flex-1"
                            />
                            <Button type="submit" disabled={isTyping || !inputMessage.trim()} size="icon">
                                <Send className="h-4 w-4" />
                            </Button>
                        </div>
                    </form>
                </Card>
            </div>
    );
}
