'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { generateAiRecipe } from '../actions';
import { Loader2, ChefHat, Sparkles, ArrowLeft, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

const ALLERGIES = [
    { id: 'gluten', label: 'Glúten' },
    { id: 'lactose', label: 'Lactose / Leite' },
    { id: 'eggs', label: 'Ovos' },
    { id: 'soy', label: 'Soja' },
    { id: 'shellfish', label: 'Frutos do Mar' },
    { id: 'peanuts', label: 'Amendoim / Castanhas' },
];

export default function NewRecipePage() {
    const router = useRouter();
    const [prompt, setPrompt] = useState('');
    const [loading, setLoading] = useState(false);

    // Constraints
    const [selectedAllergies, setSelectedAllergies] = useState<string[]>([]);
    const [includeIngredients, setIncludeIngredients] = useState('');
    const [excludeIngredients, setExcludeIngredients] = useState('');

    const toggleAllergy = (id: string) => {
        setSelectedAllergies(prev =>
            prev.includes(id)
                ? prev.filter(c => c !== id)
                : [...prev, id]
        );
    };

    const handleGenerate = async () => {
        if (!prompt) return;
        setLoading(true);

        const includeList = includeIngredients.split(',').map(s => s.trim()).filter(Boolean);
        const excludeList = excludeIngredients.split(',').map(s => s.trim()).filter(Boolean);

        const res = await generateAiRecipe({
            prompt,
            allergies: selectedAllergies,
            include: includeList,
            exclude: excludeList
        });

        setLoading(false);

        if (res.success) {
            toast.success("Receita criada com sucesso!");
            router.push('/studio/recipes');
        } else {
            toast.error(res.error || "Erro ao gerar receita");
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6 pb-12">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Nova Receita com IA</h1>
                    <p className="text-muted-foreground">Descreva o prato e personalize as restrições.</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-yellow-500" />
                        O que vamos cozinhar hoje?
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Prompt */}
                    <div className="space-y-2">
                        <Label>Descrição da Receita</Label>
                        <Textarea
                            placeholder="Ex: Panqueca de banana fit proteica para o café da manhã."
                            className="min-h-[100px] text-lg"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                        />
                    </div>

                    {/* Allergies / Restrictions */}
                    <div className="space-y-3">
                        <Label className="flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-red-500" />
                            Restrições (Sem / Free From)
                        </Label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {ALLERGIES.map((allergy) => (
                                <div key={allergy.id} className="flex items-center space-x-2 border p-3 rounded-md hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => toggleAllergy(allergy.id)}>
                                    <Checkbox
                                        id={allergy.id}
                                        checked={selectedAllergies.includes(allergy.id)}
                                        onCheckedChange={() => toggleAllergy(allergy.id)}
                                    />
                                    <label
                                        htmlFor={allergy.id}
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                    >
                                        {allergy.label}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Specific Ingredients */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label>Incluir Obrigatoriamente</Label>
                            <Input
                                placeholder="Ex: Whey, Canela, Chia"
                                value={includeIngredients}
                                onChange={(e) => setIncludeIngredients(e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">Separar por vírgulas</p>
                        </div>
                        <div className="space-y-2">
                            <Label>Evitar / Excluir</Label>
                            <Input
                                placeholder="Ex: A açúcar refinado, Farinha branca"
                                value={excludeIngredients}
                                onChange={(e) => setExcludeIngredients(e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">Separar por vírgulas</p>
                        </div>
                    </div>

                    <div className="pt-4 border-t">
                        <div className="bg-muted p-4 rounded-md text-sm text-muted-foreground mb-4">
                            <p>A IA irá gerar:</p>
                            <ul className="list-disc list-inside mt-2 space-y-1">
                                <li>Lista de ingredientes formatada</li>
                                <li>Modo de preparo passo a passo</li>
                                <li>Estimativa nutricional (Calorias e Macros)</li>
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
                                    Criando Receita Personalizada...
                                </>
                            ) : (
                                <>
                                    <ChefHat className="mr-2 h-5 w-5" />
                                    Gerar Receita
                                </>
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
