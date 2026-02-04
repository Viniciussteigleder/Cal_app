'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { generateAiRecipe } from '../actions';
import { Loader2, ChefHat, Sparkles, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function NewRecipePage() {
    const router = useRouter();
    const [prompt, setPrompt] = useState('');
    const [loading, setLoading] = useState(false);

    const handleGenerate = async () => {
        if (!prompt) return;
        setLoading(true);
        const res = await generateAiRecipe(prompt);
        setLoading(false);

        if (res.success) {
            toast.success("Receita criada com sucesso!");
            router.push('/studio/recipes');
        } else {
            toast.error(res.error || "Erro ao gerar receita");
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Nova Receita com IA</h1>
                    <p className="text-muted-foreground">Descreva o prato e deixe nossa IA criar a ficha técnica completa.</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-yellow-500" />
                        O que vamos cozinhar hoje?
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Textarea
                        placeholder="Ex: Panqueca de banana fit com whey protein, sem glúten, para café da manhã."
                        className="min-h-[150px] text-lg"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                    />

                    <div className="bg-muted p-4 rounded-md text-sm text-muted-foreground">
                        <p>A IA irá gerar:</p>
                        <ul className="list-disc list-inside mt-2 space-y-1">
                            <li>Lista de ingredientes formatada</li>
                            <li>Modo de preparo passo a passo</li>
                            <li>Estimativa nutricional (Calorias e Macros)</li>
                            <li>Tempos de preparo</li>
                        </ul>
                    </div>

                    <Button
                        className="w-full text-lg h-12"
                        onClick={handleGenerate}
                        disabled={!prompt || loading}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Criando Receita...
                            </>
                        ) : (
                            <>
                                <ChefHat className="mr-2 h-5 w-5" />
                                Gerar Receita
                            </>
                        )}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
