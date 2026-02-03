'use client';

import { useState, useEffect } from 'react';
import { Droplet, Plus, Minus, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import DashboardLayout from '@/components/layout/dashboard-layout';

interface WaterIntake {
    id: string;
    amount_ml: number;
    logged_at: Date;
}

export default function WaterTrackingPage() {
    const [dailyGoal, setDailyGoal] = useState(2000); // ml
    const [todayIntake, setTodayIntake] = useState(0);
    const [intakeHistory, setIntakeHistory] = useState<WaterIntake[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        loadTodayIntake();
    }, []);

    const loadTodayIntake = async () => {
        // TODO: Fetch from API
        // For now, using mock data
        const mockIntakes: WaterIntake[] = [
            { id: '1', amount_ml: 250, logged_at: new Date() },
            { id: '2', amount_ml: 500, logged_at: new Date() },
        ];
        setIntakeHistory(mockIntakes);
        setTodayIntake(mockIntakes.reduce((sum, intake) => sum + intake.amount_ml, 0));
    };

    const addWater = async (amount: number) => {
        setIsLoading(true);
        try {
            // TODO: Call API to log water intake
            const newIntake: WaterIntake = {
                id: Date.now().toString(),
                amount_ml: amount,
                logged_at: new Date(),
            };

            setIntakeHistory([...intakeHistory, newIntake]);
            setTodayIntake(todayIntake + amount);
            toast.success(`${amount}ml adicionado!`);
        } catch (error) {
            toast.error('Erro ao registrar água');
        } finally {
            setIsLoading(false);
        }
    };

    const removeLastIntake = async () => {
        if (intakeHistory.length === 0) return;

        setIsLoading(true);
        try {
            const lastIntake = intakeHistory[intakeHistory.length - 1];
            // TODO: Call API to delete intake

            setIntakeHistory(intakeHistory.slice(0, -1));
            setTodayIntake(todayIntake - lastIntake.amount_ml);
            toast.success('Último registro removido');
        } catch (error) {
            toast.error('Erro ao remover registro');
        } finally {
            setIsLoading(false);
        }
    };

    const percentage = Math.min((todayIntake / dailyGoal) * 100, 100);
    const remainingMl = Math.max(dailyGoal - todayIntake, 0);

    return (
        <DashboardLayout role="patient">
            <div className="container mx-auto py-8 px-4 max-w-4xl">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        Hidratação
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Acompanhe sua ingestão diária de água
                    </p>
                </div>

            {/* Main Progress Card */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Droplet className="w-6 h-6 text-blue-500" />
                        Progresso de Hoje
                    </CardTitle>
                    <CardDescription>
                        Meta: {dailyGoal}ml por dia
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        {/* Progress Bar */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-4xl font-bold text-blue-600">
                                    {todayIntake}ml
                                </span>
                                <span className="text-lg text-gray-600 dark:text-gray-400">
                                    {Math.round(percentage)}%
                                </span>
                            </div>
                            <Progress value={percentage} className="h-4" />
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                                {remainingMl > 0 ? `Faltam ${remainingMl}ml para atingir sua meta` : '🎉 Meta atingida!'}
                            </p>
                        </div>

                        {/* Quick Add Buttons */}
                        <div className="grid grid-cols-3 gap-3">
                            <Button
                                onClick={() => addWater(250)}
                                disabled={isLoading}
                                variant="outline"
                                className="h-20 flex flex-col gap-1"
                            >
                                <Droplet className="w-5 h-5 text-blue-500" />
                                <span className="text-lg font-bold">250ml</span>
                                <span className="text-xs text-gray-500">Copo</span>
                            </Button>
                            <Button
                                onClick={() => addWater(500)}
                                disabled={isLoading}
                                variant="outline"
                                className="h-20 flex flex-col gap-1"
                            >
                                <Droplet className="w-6 h-6 text-blue-500" />
                                <span className="text-lg font-bold">500ml</span>
                                <span className="text-xs text-gray-500">Garrafa</span>
                            </Button>
                            <Button
                                onClick={() => addWater(1000)}
                                disabled={isLoading}
                                variant="outline"
                                className="h-20 flex flex-col gap-1"
                            >
                                <Droplet className="w-7 h-7 text-blue-500" />
                                <span className="text-lg font-bold">1L</span>
                                <span className="text-xs text-gray-500">Garrafa Grande</span>
                            </Button>
                        </div>

                        {/* Remove Last */}
                        {intakeHistory.length > 0 && (
                            <Button
                                onClick={removeLastIntake}
                                disabled={isLoading}
                                variant="ghost"
                                className="w-full"
                            >
                                <Minus className="w-4 h-4 mr-2" />
                                Remover Último Registro ({intakeHistory[intakeHistory.length - 1]?.amount_ml}ml)
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Today's History */}
            <Card>
                <CardHeader>
                    <CardTitle>Histórico de Hoje</CardTitle>
                    <CardDescription>
                        {intakeHistory.length} registro{intakeHistory.length !== 1 ? 's' : ''}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {intakeHistory.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <Droplet className="w-12 h-12 mx-auto mb-2 opacity-50" />
                            <p>Nenhum registro ainda hoje</p>
                            <p className="text-sm">Clique nos botões acima para começar</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {intakeHistory.map((intake, index) => (
                                <div
                                    key={intake.id}
                                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                                >
                                    <div className="flex items-center gap-3">
                                        <Droplet className="w-5 h-5 text-blue-500" />
                                        <div>
                                            <p className="font-medium">{intake.amount_ml}ml</p>
                                            <p className="text-xs text-gray-500">
                                                {new Date(intake.logged_at).toLocaleTimeString('pt-BR', {
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                    <span className="text-xs text-gray-500">#{index + 1}</span>
                                </div>
                            ))}
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
                            <p className="text-2xl font-bold text-emerald-600">85%</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Média de Meta</p>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-blue-600">1,700ml</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Média Diária</p>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-purple-600">5/7</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Dias com Meta</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
        </DashboardLayout>
    );
}
