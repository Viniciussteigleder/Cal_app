'use client';

import { useState } from 'react';
import { Camera, Upload, CheckCircle, Edit, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { MedicalDisclaimer } from '@/components/ui/medical-disclaimer';
import { recognizeFoodAction } from './actions';

interface RecognizedFood {
    food_name: string;
    food_id?: string;
    confidence: number;
    portion_grams: number;
    notes?: string;
}

interface RecognitionResult {
    recognized_foods: RecognizedFood[];
    confidence_score: number;
}

export default function FoodRecognitionPage() {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState<RecognitionResult | null>(null);
    const [recognitionId, setRecognitionId] = useState<string | null>(null);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setSelectedImage(reader.result as string);
        };
        reader.readAsDataURL(file);

        // Upload to storage and get URL
        // For now, we'll use the data URL directly
        // In production, upload to Supabase Storage first

        setIsAnalyzing(true);
        setResult(null);

        try {
            // Check if reader.result is string
            if (typeof reader.result !== 'string') return;

            const response = await recognizeFoodAction(reader.result);

            if (response.success) {
                setResult(response.data);
                // setRecognitionId(data.recognitionId); // Action doesn't return ID directly yet, maybe in future
                toast.success('Alimentos reconhecidos com sucesso!');
            } else {
                toast.error(response.error || 'Falha ao reconhecer alimentos');
            }


        } catch (error) {
            console.error('Recognition error:', error);
            toast.error('Falha ao analisar imagem');
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleConfirm = async () => {
        if (!recognitionId) return;

        try {
            const response = await fetch(`/api/ai/food-recognition/${recognitionId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    confirmed: true,
                }),
            });

            if (response.ok) {
                toast.success('Alimentos registrados no diário!');
                // Navigate to meal diary or reset
                setSelectedImage(null);
                setResult(null);
                setRecognitionId(null);
            }
        } catch (error) {
            toast.error('Falha ao confirmar');
        }
    };

    const calculateTotalMacros = () => {
        if (!result) return { kcal: 0, protein: 0, carbs: 0, fat: 0 };

        // This is a simplified calculation
        // In production, fetch actual nutritional data for each food
        const totalGrams = result.recognized_foods.reduce((sum, food) => sum + food.portion_grams, 0);

        return {
            kcal: Math.round(totalGrams * 1.5), // Rough estimate
            protein: Math.round(totalGrams * 0.15),
            carbs: Math.round(totalGrams * 0.35),
            fat: Math.round(totalGrams * 0.08),
        };
    };

    const macros = calculateTotalMacros();

    return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <Camera className="h-8 w-8 text-primary" />
                        Reconhecimento de Alimentos com IA
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Tire uma foto da refeição e deixe a IA identificar os alimentos e estimar as porções
                    </p>
                </div>

                <MedicalDisclaimer />

                {/* Upload Area */}
                {!selectedImage && (
                    <Card className="border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-emerald-500 transition-colors">
                        <CardContent className="flex flex-col items-center justify-center py-16">
                            <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center mb-4">
                                <Camera className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Tirar Foto ou Fazer Upload</h3>
                            <p className="text-muted-foreground mb-6 text-center max-w-md">
                                Envie uma foto clara da sua refeição. Certifique-se de que todos os alimentos estejam visíveis.
                            </p>
                            <div className="flex gap-4">
                                <Button
                                    onClick={() => document.getElementById('file-upload')?.click()}
                                    className="bg-emerald-600 hover:bg-emerald-700"
                                >
                                    <Upload className="w-4 h-4 mr-2" />
                                    Enviar Imagem
                                </Button>
                                <input
                                    id="file-upload"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="hidden"
                                />
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Image Preview & Results */}
                {selectedImage && (
                    <div className="space-y-6">
                        {/* Image */}
                        <Card>
                            <CardContent className="p-6">
                                <img
                                    src={selectedImage}
                                    alt="Meal"
                                    className="w-full h-64 object-cover rounded-lg"
                                />
                            </CardContent>
                        </Card>

                        {/* Loading State */}
                        {isAnalyzing && (
                            <Card>
                                <CardContent className="flex flex-col items-center justify-center py-12">
                                    <Loader2 className="w-12 h-12 text-emerald-600 animate-spin mb-4" />
                                    <p className="text-lg font-medium">Analisando sua refeição...</p>
                                    <p className="text-sm text-muted-foreground">
                                        Isso pode levar alguns segundos
                                    </p>
                                </CardContent>
                            </Card>
                        )}

                        {/* Results */}
                        {result && !isAnalyzing && (
                            <>
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Alimentos Reconhecidos</CardTitle>
                                        <CardDescription>
                                            Confiança da IA: {Math.round(result.confidence_score * 100)}%
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {result.recognized_foods.map((food, index) => (
                                            <div key={index} className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="font-medium">{food.food_name}</p>
                                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                                            {food.portion_grams}g
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-sm font-medium text-emerald-600">
                                                            {Math.round(food.confidence * 100)}%
                                                        </p>
                                                    </div>
                                                </div>
                                                <Progress
                                                    value={food.confidence * 100}
                                                    className="h-2"
                                                />
                                                {food.notes && (
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                        {food.notes}
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>

                                {/* Nutritional Summary */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Resumo Nutricional</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-4 gap-4 text-center">
                                            <div>
                                                <p className="text-3xl font-bold">
                                                    {macros.kcal}
                                                </p>
                                                <p className="text-sm text-muted-foreground">kcal</p>
                                            </div>
                                            <div>
                                                <p className="text-3xl font-bold text-emerald-600">
                                                    {macros.protein}g
                                                </p>
                                                <p className="text-sm text-muted-foreground">proteína</p>
                                            </div>
                                            <div>
                                                <p className="text-3xl font-bold text-blue-600">
                                                    {macros.carbs}g
                                                </p>
                                                <p className="text-sm text-muted-foreground">carboidratos</p>
                                            </div>
                                            <div>
                                                <p className="text-3xl font-bold text-amber-600">
                                                    {macros.fat}g
                                                </p>
                                                <p className="text-sm text-muted-foreground">gordura</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Actions */}
                                <div className="flex gap-4">
                                    <Button
                                        onClick={handleConfirm}
                                        className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                                    >
                                        <CheckCircle className="w-4 h-4 mr-2" />
                                        Confirmar e Registrar
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="flex-1"
                                        onClick={() => {
                                            // Open edit modal
                                            toast.info('Funcionalidade de edição em breve');
                                        }}
                                    >
                                        <Edit className="w-4 h-4 mr-2" />
                                        Editar Porções
                                    </Button>
                                </div>

                                <Button
                                    variant="ghost"
                                    onClick={() => {
                                        setSelectedImage(null);
                                        setResult(null);
                                        setRecognitionId(null);
                                    }}
                                    className="w-full"
                                >
                                    Tentar Outra Foto
                                </Button>
                            </>
                        )}
                    </div>
                )}
            </div>
    );
}
