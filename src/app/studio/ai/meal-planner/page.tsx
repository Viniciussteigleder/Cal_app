'use client';

import { useState } from 'react';
import { Sparkles, Calendar, TrendingUp, DollarSign, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

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
    'Vegetarian',
    'Vegan',
    'Low-carb',
    'High-protein',
    'Mediterranean',
    'Keto',
    'Paleo',
];

const RESTRICTIONS = [
    'Lactose-free',
    'Gluten-free',
    'Nut-free',
    'Soy-free',
    'Egg-free',
    'Shellfish-free',
];

export default function MealPlannerPage() {
    const [targetKcal, setTargetKcal] = useState(2000);
    const [macroSplit, setMacroSplit] = useState({
        protein: 30,
        carbs: 45,
        fat: 25,
    });
    const [selectedPreferences, setSelectedPreferences] = useState<string[]>([]);
    const [selectedRestrictions, setSelectedRestrictions] = useState<string[]>([]);
    const [daysCount, setDaysCount] = useState(7);
    const [isGenerating, setIsGenerating] = useState(false);
    const [result, setResult] = useState<MealPlanResult | null>(null);

    const togglePreference = (pref: string) => {
        setSelectedPreferences((prev) =>
            prev.includes(pref) ? prev.filter((p) => p !== pref) : [...prev, pref]
        );
    };

    const toggleRestriction = (rest: string) => {
        setSelectedRestrictions((prev) =>
            prev.includes(rest) ? prev.filter((r) => r !== rest) : [...prev, rest]
        );
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
            const response = await fetch('/api/ai/meal-planner', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    patientId: 'current-patient-id', // Get from context
                    tenantId: 'current-tenant-id', // Get from context
                    targetKcal,
                    macroSplit,
                    preferences: selectedPreferences,
                    restrictions: selectedRestrictions,
                    daysCount,
                }),
            });

            const data = await response.json();

            if (data.success) {
                setResult(data.data);
                toast.success('Meal plan generated successfully!');
            } else {
                toast.error(data.error || 'Failed to generate meal plan');
            }
        } catch (error) {
            console.error('Generation error:', error);
            toast.error('Failed to generate meal plan');
        } finally {
            setIsGenerating(false);
        }
    };

    const macroTotal = macroSplit.protein + macroSplit.carbs + macroSplit.fat;

    return (
        <div className="container mx-auto py-8 px-4 max-w-6xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    AI Meal Planner
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                    Generate personalized meal plans powered by AI
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Configuration Panel */}
                <div className="lg:col-span-1 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Configuration</CardTitle>
                            <CardDescription>Set your meal plan parameters</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Target Calories */}
                            <div className="space-y-2">
                                <Label>Target Calories: {targetKcal} kcal/day</Label>
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
                                <Label>Macro Split {macroTotal !== 100 && <span className="text-red-500 text-xs">(Must equal 100%)</span>}</Label>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm">Protein</span>
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
                                        <span className="text-sm">Carbs</span>
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
                                        <span className="text-sm">Fat</span>
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

                            {/* Dietary Preferences */}
                            <div className="space-y-2">
                                <Label>Dietary Preferences</Label>
                                <div className="flex flex-wrap gap-2">
                                    {DIETARY_PREFERENCES.map((pref) => (
                                        <Badge
                                            key={pref}
                                            variant={selectedPreferences.includes(pref) ? 'default' : 'outline'}
                                            className="cursor-pointer"
                                            onClick={() => togglePreference(pref)}
                                        >
                                            {pref}
                                        </Badge>
                                    ))}
                                </div>
                            </div>

                            {/* Restrictions */}
                            <div className="space-y-2">
                                <Label>Restrictions</Label>
                                <div className="flex flex-wrap gap-2">
                                    {RESTRICTIONS.map((rest) => (
                                        <Badge
                                            key={rest}
                                            variant={selectedRestrictions.includes(rest) ? 'destructive' : 'outline'}
                                            className="cursor-pointer"
                                            onClick={() => toggleRestriction(rest)}
                                        >
                                            {rest}
                                        </Badge>
                                    ))}
                                </div>
                            </div>

                            {/* Duration */}
                            <div className="space-y-2">
                                <Label htmlFor="days">Duration (days)</Label>
                                <Input
                                    id="days"
                                    type="number"
                                    value={daysCount}
                                    onChange={(e) => setDaysCount(parseInt(e.target.value) || 7)}
                                    min={1}
                                    max={30}
                                />
                            </div>

                            {/* Generate Button */}
                            <Button
                                onClick={generateMealPlan}
                                disabled={isGenerating || macroTotal !== 100}
                                className="w-full bg-emerald-600 hover:bg-emerald-700"
                            >
                                {isGenerating ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-4 h-4 mr-2" />
                                        Generate Meal Plan
                                    </>
                                )}
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Results Panel */}
                <div className="lg:col-span-2 space-y-6">
                    {!result && !isGenerating && (
                        <Card className="border-2 border-dashed">
                            <CardContent className="flex flex-col items-center justify-center py-16">
                                <Sparkles className="w-16 h-16 text-gray-400 mb-4" />
                                <p className="text-gray-600 dark:text-gray-400 text-center">
                                    Configure your parameters and click "Generate Meal Plan" to get started
                                </p>
                            </CardContent>
                        </Card>
                    )}

                    {isGenerating && (
                        <Card>
                            <CardContent className="flex flex-col items-center justify-center py-16">
                                <Loader2 className="w-16 h-16 text-emerald-600 animate-spin mb-4" />
                                <p className="text-lg font-medium">Generating your personalized meal plan...</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    This may take 10-15 seconds
                                </p>
                            </CardContent>
                        </Card>
                    )}

                    {result && (
                        <>
                            {/* Summary Card */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Meal Plan Summary</CardTitle>
                                    <CardDescription>AI-generated personalized plan</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-3 gap-4 mb-4">
                                        <div className="text-center">
                                            <Calendar className="w-6 h-6 mx-auto mb-2 text-emerald-600" />
                                            <p className="text-2xl font-bold">{result.days.length}</p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Days</p>
                                        </div>
                                        <div className="text-center">
                                            <TrendingUp className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                                            <p className="text-2xl font-bold">{targetKcal}</p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">kcal/day</p>
                                        </div>
                                        <div className="text-center">
                                            <DollarSign className="w-6 h-6 mx-auto mb-2 text-amber-600" />
                                            <p className="text-2xl font-bold">R$ {result.estimated_cost?.toFixed(2)}</p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Est. Cost</p>
                                        </div>
                                    </div>

                                    {result.reasoning && (
                                        <div className="mt-4 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                                            <p className="text-sm font-medium mb-1">AI Reasoning:</p>
                                            <p className="text-sm text-gray-700 dark:text-gray-300">
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
                                            {day.total_kcal} kcal • P: {day.macros.protein}g • C: {day.macros.carbs}g • F: {day.macros.fat}g
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {/* Breakfast */}
                                            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                                <h4 className="font-semibold mb-2">🌅 Breakfast</h4>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    {day.breakfast?.description || 'Oatmeal with berries'}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {day.breakfast?.kcal || 350} kcal
                                                </p>
                                            </div>

                                            {/* Lunch */}
                                            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                                <h4 className="font-semibold mb-2">☀️ Lunch</h4>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    {day.lunch?.description || 'Grilled salmon with quinoa'}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {day.lunch?.kcal || 520} kcal
                                                </p>
                                            </div>

                                            {/* Dinner */}
                                            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                                <h4 className="font-semibold mb-2">🌙 Dinner</h4>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    {day.dinner?.description || 'Chicken stir-fry'}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {day.dinner?.kcal || 480} kcal
                                                </p>
                                            </div>

                                            {/* Snacks */}
                                            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                                <h4 className="font-semibold mb-2">🍎 Snacks</h4>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    {day.snacks?.description || 'Greek yogurt, almonds'}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {day.snacks?.kcal || 250} kcal
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}

                            {/* Approve Button */}
                            <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                                Approve & Send to Patient
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
