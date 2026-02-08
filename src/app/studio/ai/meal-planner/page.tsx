'use client';

import { useState } from 'react';
import { Sparkles, Calendar, TrendingUp, DollarSign, Loader2, Plus, X, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { ptBR } from '@/i18n/pt-BR';
import { MedicalDisclaimer } from '@/components/ui/medical-disclaimer';
import { generateMealPlanAction } from './actions';

interface MealPlanDay {
    day: string;
    breakfast: any;
    lunch: any;
    dinner: any;
    snacks: any;
    total_kcal: number;
    macros: {
        protein: number;
        carbs: number;
        fat: number;
    };
}

interface MealPlanResult {
    days: MealPlanDay[];
    estimated_cost: number;
    reasoning: string;
}

const DIETARY_PREFERENCES = [
    { id: 'vegetarian', label: 'Vegetariano' },
    { id: 'vegan', label: 'Vegano' },
    { id: 'low-carb', label: 'Low-Carb' },
    { id: 'high-protein', label: 'Alto em Proteína' },
    { id: 'mediterranean', label: 'Mediterrânea' },
    { id: 'keto', label: 'Cetogênica' },
    { id: 'paleo', label: 'Paleo' },
];

const ALLERGIES = [
    { id: 'gluten', label: 'Glúten' },
    { id: 'lactose', label: 'Lactose' },
    { id: 'nuts', label: 'Oleaginosas' },
    { id: 'shellfish', label: 'Frutos do Mar' },
    { id: 'eggs', label: 'Ovos' },
    { id: 'soy', label: 'Soja' },
    { id: 'fish', label: 'Peixe' },
    { id: 'peanuts', label: 'Amendoim' },
];

const MEDICAL_CONDITIONS = [
    { id: 'histamine', label: 'Intolerância à Histamina' },
    { id: 'fodmap', label: 'Sensibilidade FODMAP' },
    { id: 'diabetes', label: 'Diabetes' },
    { id: 'hypertension', label: 'Hipertensão' },
    { id: 'kidney', label: 'Doença Renal' },
    { id: 'liver', label: 'Doença Hepática' },
    { id: 'ibs', label: 'Síndrome do Intestino Irritável' },
    { id: 'crohn', label: 'Doença de Crohn' },
];

export default function MealPlannerPage() {
    const [targetKcal, setTargetKcal] = useState(2000);
    const [macroSplit, setMacroSplit] = useState({
        protein: 30,
        carbs: 45,
        fat: 25,
    });
    const [selectedPreferences, setSelectedPreferences] = useState<string[]>([]);
    const [selectedAllergies, setSelectedAllergies] = useState<string[]>([]);
    const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
    const [includeFoods, setIncludeFoods] = useState<string[]>([]);
    const [excludeFoods, setExcludeFoods] = useState<string[]>([]);
    const [currentIncludeFood, setCurrentIncludeFood] = useState('');
    const [currentExcludeFood, setCurrentExcludeFood] = useState('');
    const [customCondition, setCustomCondition] = useState('');
    const [daysCount, setDaysCount] = useState(7);
    const [isGenerating, setIsGenerating] = useState(false);
    const [result, setResult] = useState<MealPlanResult | null>(null);

    const togglePreference = (pref: string) => {
        setSelectedPreferences((prev) =>
            prev.includes(pref) ? prev.filter((p) => p !== pref) : [...prev, pref]
        );
    };

    const toggleAllergy = (allergy: string) => {
        setSelectedAllergies((prev) =>
            prev.includes(allergy) ? prev.filter((a) => a !== allergy) : [...prev, allergy]
        );
    };

    const toggleCondition = (condition: string) => {
        setSelectedConditions((prev) =>
            prev.includes(condition) ? prev.filter((c) => c !== condition) : [...prev, condition]
        );
    };

    const addIncludeFood = () => {
        if (currentIncludeFood.trim()) {
            setIncludeFoods([...includeFoods, currentIncludeFood.trim()]);
            setCurrentIncludeFood('');
        }
    };

    const addExcludeFood = () => {
        if (currentExcludeFood.trim()) {
            setExcludeFoods([...excludeFoods, currentExcludeFood.trim()]);
            setCurrentExcludeFood('');
        }
    };

    const removeIncludeFood = (food: string) => {
        setIncludeFoods(includeFoods.filter(f => f !== food));
    };

    const removeExcludeFood = (food: string) => {
        setExcludeFoods(excludeFoods.filter(f => f !== food));
    };

    const handleMacroChange = (macro: 'protein' | 'carbs' | 'fat', value: number) => {
        const newSplit = { ...macroSplit, [macro]: value };
        const total = newSplit.protein + newSplit.carbs + newSplit.fat;

        // Auto-adjust other macros to maintain 100%
        if (total !== 100) {
            const diff = 100 - total;
            const others = Object.keys(newSplit).filter((k) => k !== macro) as ('protein' | 'carbs' | 'fat')[];
            const adjustment = diff / others.length;
            others.forEach((other) => {
                newSplit[other] = Math.max(0, Math.min(100, newSplit[other] + adjustment));
            });
        }

        setMacroSplit(newSplit);
    };

    const generateMealPlan = async () => {
        setIsGenerating(true);
        setResult(null);

        try {
            const response = await generateMealPlanAction({
                targetKcal,
                macroSplit,
                preferences: selectedPreferences,
                allergies: selectedAllergies,
                conditions: selectedConditions,
                includeFoods,
                excludeFoods,
                customCondition,
                daysCount,
            });

            if (response.success) {
                setResult(response.data);
                toast.success('Plano alimentar gerado com sucesso!');
            } else {
                toast.error(response.error || 'Falha ao gerar plano alimentar');
            }
        } catch (error) {
            console.error('Generation error:', error);
            toast.error('Falha ao gerar plano alimentar');
        } finally {
            setIsGenerating(false);
        }
    };

    const macroTotal = macroSplit.protein + macroSplit.carbs + macroSplit.fat;

    return (
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <Sparkles className="h-8 w-8 text-primary" />
                        Gerador de Planos Alimentares com IA
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Crie planos alimentares personalizados com inteligência artificial
                    </p>
                </div>

                <MedicalDisclaimer />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Configuration Panel */}
                    <div className="lg:col-span-1 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Configuração</CardTitle>
                                <CardDescription>Defina os parâmetros do plano</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Target Calories */}
                                <div className="space-y-2">
                                    <Label>Meta Calórica: {targetKcal} kcal/dia</Label>
                                    <Slider
                                        value={[targetKcal]}
                                        onValueChange={([value]) => setTargetKcal(value)}
                                        min={1200}
                                        max={4000}
                                        step={100}
                                        className="w-full"
                                    />
                                </div>

                                {/* Macro Split */}
                                <div className="space-y-4">
                                    <Label>
                                        Distribuição de Macros{' '}
                                        {macroTotal !== 100 && (
                                            <span className="text-red-500 text-xs">(Deve somar 100%)</span>
                                        )}
                                    </Label>

                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm">Proteína</span>
                                            <span className="text-sm font-medium">{macroSplit.protein}%</span>
                                        </div>
                                        <Slider
                                            value={[macroSplit.protein]}
                                            onValueChange={([value]) => handleMacroChange('protein', value)}
                                            min={10}
                                            max={50}
                                            step={5}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm">Carboidratos</span>
                                            <span className="text-sm font-medium">{macroSplit.carbs}%</span>
                                        </div>
                                        <Slider
                                            value={[macroSplit.carbs]}
                                            onValueChange={([value]) => handleMacroChange('carbs', value)}
                                            min={20}
                                            max={65}
                                            step={5}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm">Gordura</span>
                                            <span className="text-sm font-medium">{macroSplit.fat}%</span>
                                        </div>
                                        <Slider
                                            value={[macroSplit.fat]}
                                            onValueChange={([value]) => handleMacroChange('fat', value)}
                                            min={15}
                                            max={45}
                                            step={5}
                                        />
                                    </div>
                                </div>

                                {/* Duration */}
                                <div className="space-y-2">
                                    <Label htmlFor="days">Duração (dias)</Label>
                                    <Input
                                        id="days"
                                        type="number"
                                        value={daysCount}
                                        onChange={(e) => setDaysCount(parseInt(e.target.value) || 7)}
                                        min={1}
                                        max={30}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Dietary Preferences */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Preferências Alimentares</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {DIETARY_PREFERENCES.map((pref) => (
                                    <div key={pref.id} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={pref.id}
                                            checked={selectedPreferences.includes(pref.id)}
                                            onCheckedChange={() => togglePreference(pref.id)}
                                        />
                                        <label
                                            htmlFor={pref.id}
                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                        >
                                            {pref.label}
                                        </label>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        {/* Allergies */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <AlertCircle className="h-5 w-5 text-red-500" />
                                    Alergias e Intolerâncias
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {ALLERGIES.map((allergy) => (
                                    <div key={allergy.id} className="flex items-center space-x-2">
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
                            </CardContent>
                        </Card>

                        {/* Medical Conditions */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Condições Médicas</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {MEDICAL_CONDITIONS.map((condition) => (
                                    <div key={condition.id} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={condition.id}
                                            checked={selectedConditions.includes(condition.id)}
                                            onCheckedChange={() => toggleCondition(condition.id)}
                                        />
                                        <label
                                            htmlFor={condition.id}
                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                        >
                                            {condition.label}
                                        </label>
                                    </div>
                                ))}
                                <div className="space-y-2">
                                    <Label htmlFor="custom-condition">Outra Condição</Label>
                                    <Textarea
                                        id="custom-condition"
                                        placeholder="Descreva outras condições médicas relevantes..."
                                        value={customCondition}
                                        onChange={(e) => setCustomCondition(e.target.value)}
                                        rows={3}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Include Foods */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Alimentos para Incluir</CardTitle>
                                <CardDescription>Alimentos que devem estar no plano</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="Ex: Frango, Batata-doce..."
                                        value={currentIncludeFood}
                                        onChange={(e) => setCurrentIncludeFood(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && addIncludeFood()}
                                    />
                                    <Button onClick={addIncludeFood} size="icon">
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {includeFoods.map((food, index) => (
                                        <Badge key={index} variant="secondary" className="gap-1">
                                            {food}
                                            <X
                                                className="h-3 w-3 cursor-pointer"
                                                onClick={() => removeIncludeFood(food)}
                                            />
                                        </Badge>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Exclude Foods */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Alimentos para Excluir</CardTitle>
                                <CardDescription>Alimentos que NÃO devem estar no plano</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="Ex: Cebola, Alho..."
                                        value={currentExcludeFood}
                                        onChange={(e) => setCurrentExcludeFood(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && addExcludeFood()}
                                    />
                                    <Button onClick={addExcludeFood} size="icon" variant="destructive">
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {excludeFoods.map((food, index) => (
                                        <Badge key={index} variant="destructive" className="gap-1">
                                            {food}
                                            <X
                                                className="h-3 w-3 cursor-pointer"
                                                onClick={() => removeExcludeFood(food)}
                                            />
                                        </Badge>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Generate Button */}
                        <Button
                            onClick={generateMealPlan}
                            disabled={isGenerating || macroTotal !== 100}
                            className="w-full bg-emerald-600 hover:bg-emerald-700"
                            size="lg"
                        >
                            {isGenerating ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Gerando...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-4 h-4 mr-2" />
                                    Gerar Plano Alimentar
                                </>
                            )}
                        </Button>
                    </div>

                    {/* Results Panel */}
                    <div className="lg:col-span-2 space-y-6">
                        {!result && !isGenerating && (
                            <Card className="border-2 border-dashed">
                                <CardContent className="flex flex-col items-center justify-center py-16">
                                    <Sparkles className="w-16 h-16 text-gray-400 mb-4" />
                                    <p className="text-muted-foreground text-center">
                                        Configure os parâmetros e clique em &quot;Gerar Plano Alimentar&quot; para começar
                                    </p>
                                </CardContent>
                            </Card>
                        )}

                        {isGenerating && (
                            <Card>
                                <CardContent className="flex flex-col items-center justify-center py-16">
                                    <Loader2 className="w-16 h-16 text-emerald-600 animate-spin mb-4" />
                                    <p className="text-lg font-medium">Gerando seu plano alimentar personalizado...</p>
                                    <p className="text-sm text-muted-foreground">
                                        Isso pode levar 10-15 segundos
                                    </p>
                                </CardContent>
                            </Card>
                        )}

                        {result && (
                            <>
                                {/* Summary Card */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Resumo do Plano Alimentar</CardTitle>
                                        <CardDescription>Plano personalizado gerado por IA</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-3 gap-4 mb-4">
                                            <div className="text-center">
                                                <Calendar className="w-6 h-6 mx-auto mb-2 text-emerald-600" />
                                                <p className="text-2xl font-bold">{result.days.length}</p>
                                                <p className="text-sm text-muted-foreground">Dias</p>
                                            </div>
                                            <div className="text-center">
                                                <TrendingUp className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                                                <p className="text-2xl font-bold">{targetKcal}</p>
                                                <p className="text-sm text-muted-foreground">kcal/dia</p>
                                            </div>
                                            <div className="text-center">
                                                <DollarSign className="w-6 h-6 mx-auto mb-2 text-amber-600" />
                                                <p className="text-2xl font-bold">R$ {result.estimated_cost?.toFixed(2)}</p>
                                                <p className="text-sm text-muted-foreground">Custo Est.</p>
                                            </div>
                                        </div>

                                        {result.reasoning && (
                                            <div className="mt-4 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                                                <p className="text-sm font-medium mb-1">Raciocínio da IA:</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {result.reasoning}
                                                </p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Daily Plans */}
                                {result.days.map((day, index) => (
                                    <Card key={index}>
                                        <CardHeader>
                                            <CardTitle>{day.day}</CardTitle>
                                            <CardDescription>
                                                {day.total_kcal} kcal • P: {day.macros.protein}g • C: {day.macros.carbs}g • G: {day.macros.fat}g
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {/* Breakfast */}
                                                <div className="p-4 bg-muted/50 rounded-lg">
                                                    <h4 className="font-semibold mb-2">🌅 Café da Manhã</h4>
                                                    <p className="text-sm text-muted-foreground">
                                                        {day.breakfast?.description || 'Aveia com frutas vermelhas'}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        {day.breakfast?.kcal || 350} kcal
                                                    </p>
                                                </div>

                                                {/* Lunch */}
                                                <div className="p-4 bg-muted/50 rounded-lg">
                                                    <h4 className="font-semibold mb-2">☀️ Almoço</h4>
                                                    <p className="text-sm text-muted-foreground">
                                                        {day.lunch?.description || 'Salmão grelhado com quinoa'}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        {day.lunch?.kcal || 520} kcal
                                                    </p>
                                                </div>

                                                {/* Dinner */}
                                                <div className="p-4 bg-muted/50 rounded-lg">
                                                    <h4 className="font-semibold mb-2">🌙 Jantar</h4>
                                                    <p className="text-sm text-muted-foreground">
                                                        {day.dinner?.description || 'Frango refogado'}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        {day.dinner?.kcal || 480} kcal
                                                    </p>
                                                </div>

                                                {/* Snacks */}
                                                <div className="p-4 bg-muted/50 rounded-lg">
                                                    <h4 className="font-semibold mb-2">🍎 Lanches</h4>
                                                    <p className="text-sm text-muted-foreground">
                                                        {day.snacks?.description || 'Iogurte grego, amêndoas'}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        {day.snacks?.kcal || 250} kcal
                                                    </p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}

                                {/* Approve Button */}
                                <Button className="w-full bg-emerald-600 hover:bg-emerald-700" size="lg">
                                    Aprovar e Enviar para Paciente
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </div>
    );
}
