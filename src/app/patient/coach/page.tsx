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
import { useChat } from 'ai/react';
import ReactMarkdown from 'react-markdown';

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
    const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
        api: '/api/ai/coach',
        initialMessages: [
            {
                id: '1',
                role: 'assistant',
                content: 'Olá! Sou seu Coach Nutricional com IA, disponível 24/7 para ajudar você! 🌟\n\nPosso responder suas dúvidas sobre nutrição, dar dicas motivacionais, sugerir substituições de alimentos e muito mais. Como posso ajudar você hoje?',
            },
        ],
    });

    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleQuickQuestion = (question: string) => {
        // Simplified for brevity, would normally trigger a form submit
        const event = {
            target: { value: question },
            preventDefault: () => { }
        } as any;
        handleInputChange(event);
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
                                                : 'bg-muted prose dark:prose-invert max-w-none'
                                                }`}
                                        >
                                            <ReactMarkdown className="text-sm prose-p:leading-relaxed prose-li:my-0 pb-1">
                                                {message.content}
                                            </ReactMarkdown>
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1 px-1">
                                            {message.createdAt?.toLocaleTimeString('pt-BR', {
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            }) || new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                            ))}

                            {isLoading && (
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
                                placeholder="Digite sua dúvida aqui..."
                                value={input}
                                onChange={handleInputChange}
                                disabled={isLoading}
                                className="flex-1"
                            />
                            <Button type="submit" disabled={isLoading || !input.trim()} size="icon">
                                <Send className="h-4 w-4" />
                            </Button>
                        </div>
                    </form>
                </Card>
            </div>
        </DashboardLayout>
    );
}
