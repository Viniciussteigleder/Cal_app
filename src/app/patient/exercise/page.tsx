'use client';

import { useState } from 'react';
import { Dumbbell, Plus, Clock, Flame, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { toast } from 'sonner';

interface Exercise {
    id: string;
    type: string;
    duration_minutes: number;
    intensity: 'light' | 'moderate' | 'vigorous';
    calories_burned: number;
    logged_at: Date;
}

const EXERCISE_TYPES = [
    { value: 'walking', label: 'Caminhada', calories: 4 },
    { value: 'running', label: 'Corrida', calories: 10 },
    { value: 'cycling', label: 'Ciclismo', calories: 8 },
    { value: 'swimming', label: 'Natação', calories: 9 },
    { value: 'gym', label: 'Academia', calories: 6 },
    { value: 'yoga', label: 'Yoga', calories: 3 },
    { value: 'dancing', label: 'Dança', calories: 5 },
    { value: 'sports', label: 'Esportes', calories: 7 },
];

const INTENSITY_MULTIPLIERS = {
    light: 0.7,
    moderate: 1.0,
    vigorous: 1.3,
};

export default function ExerciseTrackingPage() {
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [isAdding, setIsAdding] = useState(false);
    const [formData, setFormData] = useState({
        type: '',
        duration: '',
        intensity: 'moderate' as 'light' | 'moderate' | 'vigorous',
    });

    const calculateCalories = (type: string, duration: number, intensity: string) => {
        const exerciseType = EXERCISE_TYPES.find((e) => e.value === type);
        if (!exerciseType) return 0;

        const baseCalories = exerciseType.calories * duration;
        const multiplier = INTENSITY_MULTIPLIERS[intensity as keyof typeof INTENSITY_MULTIPLIERS];
        return Math.round(baseCalories * multiplier);
    };

    const addExercise = async () => {
        if (!formData.type || !formData.duration) {
            toast.error('Preencha todos os campos');
            return;
        }

        const duration = parseInt(formData.duration);
        const calories = calculateCalories(formData.type, duration, formData.intensity);

        const newExercise: Exercise = {
            id: Date.now().toString(),
            type: formData.type,
            duration_minutes: duration,
            intensity: formData.intensity,
            calories_burned: calories,
            logged_at: new Date(),
        };

        // TODO: Call API to save exercise
        setExercises([newExercise, ...exercises]);
        setFormData({ type: '', duration: '', intensity: 'moderate' });
        setIsAdding(false);
        toast.success('Exercício registrado!');
    };

    const totalCalories = exercises.reduce((sum, ex) => sum + ex.calories_burned, 0);
    const totalMinutes = exercises.reduce((sum, ex) => sum + ex.duration_minutes, 0);

    const getIntensityColor = (intensity: string) => {
        switch (intensity) {
            case 'light':
                return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
            case 'moderate':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
            case 'vigorous':
                return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
        }
    };

    const getIntensityLabel = (intensity: string) => {
        switch (intensity) {
            case 'light':
                return 'Leve';
            case 'moderate':
                return 'Moderado';
            case 'vigorous':
                return 'Intenso';
            default:
                return intensity;
        }
    };

    return (
        <DashboardLayout role="patient">
            <div className="container mx-auto py-8 px-4 max-w-4xl">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        Exercícios
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Registre suas atividades físicas
                    </p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Hoje</p>
                                <p className="text-2xl font-bold">{exercises.length}</p>
                                <p className="text-xs text-gray-500">exercício{exercises.length !== 1 ? 's' : ''}</p>
                            </div>
                            <Dumbbell className="w-10 h-10 text-purple-600 opacity-20" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Duração</p>
                                <p className="text-2xl font-bold text-blue-600">{totalMinutes}</p>
                                <p className="text-xs text-gray-500">minutos</p>
                            </div>
                            <Clock className="w-10 h-10 text-blue-600 opacity-20" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Calorias</p>
                                <p className="text-2xl font-bold text-orange-600">{totalCalories}</p>
                                <p className="text-xs text-gray-500">queimadas</p>
                            </div>
                            <Flame className="w-10 h-10 text-orange-600 opacity-20" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Add Exercise Form */}
            {!isAdding ? (
                <Button
                    onClick={() => setIsAdding(true)}
                    className="w-full mb-6 bg-purple-600 hover:bg-purple-700"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Exercício
                </Button>
            ) : (
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>Novo Exercício</CardTitle>
                        <CardDescription>Registre sua atividade física</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="type">Tipo de Exercício</Label>
                            <Select
                                value={formData.type}
                                onValueChange={(value) => setFormData({ ...formData, type: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione o tipo" />
                                </SelectTrigger>
                                <SelectContent>
                                    {EXERCISE_TYPES.map((type) => (
                                        <SelectItem key={type.value} value={type.value}>
                                            {type.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="duration">Duração (minutos)</Label>
                            <Input
                                id="duration"
                                type="number"
                                value={formData.duration}
                                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                placeholder="30"
                                min="1"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="intensity">Intensidade</Label>
                            <Select
                                value={formData.intensity}
                                onValueChange={(value: any) => setFormData({ ...formData, intensity: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="light">Leve</SelectItem>
                                    <SelectItem value="moderate">Moderado</SelectItem>
                                    <SelectItem value="vigorous">Intenso</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {formData.type && formData.duration && (
                            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                                <p className="text-sm text-gray-600 dark:text-gray-400">Calorias estimadas:</p>
                                <p className="text-2xl font-bold text-purple-600">
                                    {calculateCalories(formData.type, parseInt(formData.duration) || 0, formData.intensity)} kcal
                                </p>
                            </div>
                        )}

                        <div className="flex gap-2">
                            <Button onClick={addExercise} className="flex-1 bg-purple-600 hover:bg-purple-700">
                                Salvar
                            </Button>
                            <Button
                                onClick={() => {
                                    setIsAdding(false);
                                    setFormData({ type: '', duration: '', intensity: 'moderate' });
                                }}
                                variant="outline"
                                className="flex-1"
                            >
                                Cancelar
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Exercise History */}
            <Card>
                <CardHeader>
                    <CardTitle>Histórico de Hoje</CardTitle>
                    <CardDescription>
                        {exercises.length} atividade{exercises.length !== 1 ? 's' : ''} registrada{exercises.length !== 1 ? 's' : ''}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {exercises.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <Dumbbell className="w-12 h-12 mx-auto mb-2 opacity-50" />
                            <p>Nenhum exercício registrado hoje</p>
                            <p className="text-sm">Clique em "Adicionar Exercício" para começar</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {exercises.map((exercise) => {
                                const exerciseType = EXERCISE_TYPES.find((e) => e.value === exercise.type);
                                return (
                                    <div
                                        key={exercise.id}
                                        className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                                                <Dumbbell className="w-6 h-6 text-purple-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium">{exerciseType?.label}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                                        {exercise.duration_minutes} min
                                                    </span>
                                                    <span className="text-gray-400">•</span>
                                                    <Badge className={getIntensityColor(exercise.intensity)}>
                                                        {getIntensityLabel(exercise.intensity)}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg font-bold text-orange-600">
                                                {exercise.calories_burned}
                                            </p>
                                            <p className="text-xs text-gray-500">kcal</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Weekly Stats (Mock) */}
            <Card className="mt-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-emerald-600" />
                        Estatísticas da Semana
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                            <p className="text-2xl font-bold text-purple-600">12</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Exercícios</p>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-blue-600">360min</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Duração Total</p>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-orange-600">2,400</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Calorias</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
        </DashboardLayout>
    );
}
