'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
    LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
    BarChart, Bar, Legend, PieChart, Pie, Cell
} from 'recharts';
import { formatCurrency } from '@/lib/utils'; // Assuming this exists, or I'll implement inline

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export function CreditsDashboardView({ data }: { data: any }) {
    const { totalCredits, totalCostBrl, byAgent, byPatient, history } = data;

    // Formatting helper
    const toBRL = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

    return (
        <div className="space-y-6">
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Créditos Totais</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{Number(totalCredits).toFixed(0)}</div>
                        <p className="text-xs text-muted-foreground">Consumidos este mês</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Custo Total</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{toBRL(Number(totalCostBrl))}</div>
                        <p className="text-xs text-muted-foreground">Custo estimado OpenAI</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Custo / Paciente</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {byPatient.length > 0
                                ? toBRL(Number(totalCostBrl) / byPatient.length)
                                : 'R$ 0,00'}
                        </div>
                        <p className="text-xs text-muted-foreground">Média estimada</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Agente Mais Ativo</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold truncate">
                            {byAgent.length > 0 ? byAgent[0].agent : '-'}
                        </div>
                        <p className="text-xs text-muted-foreground">Maior consumo</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* History Chart */}
                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle>Histórico de Consumo (30 dias)</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={history}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis
                                    dataKey="date"
                                    tickFormatter={(val) => new Date(val).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                                    tick={{ fontSize: 12 }}
                                />
                                <YAxis tick={{ fontSize: 12 }} />
                                <Tooltip
                                    labelFormatter={(val) => new Date(val).toLocaleDateString('pt-BR')}
                                    formatter={(value: any) => [value, 'Créditos']}
                                />
                                <Line type="monotone" dataKey="credits" stroke="#2563eb" strokeWidth={2} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Agents Pie */}
                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle>Consumo por Agente</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={byAgent}
                                    dataKey="credits"
                                    nameKey="agent"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={80}
                                    label={(entry) => entry.agent}
                                >
                                    {byAgent.map((entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(val: number) => [Number(val).toFixed(2), 'Créditos']} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Top Patients Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Top Pacientes por Consumo</CardTitle>
                    <CardDescription>Pacientes que mais utilizam recursos de IA.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {byPatient.map((p: any, i: number) => (
                            <div key={p.patientId} className="flex items-center justify-between border-b pb-2 last:border-0">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted font-bold text-xs">
                                        {i + 1}
                                    </div>
                                    <div>
                                        <p className="font-medium text-sm">{p.name}</p>
                                        <p className="text-xs text-muted-foreground">ID: {p.patientId.substring(0, 8)}...</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-sm">{Number(p.credits).toFixed(2)} créditos</p>
                                    <p className="text-xs text-muted-foreground">{toBRL(Number(p.cost))}</p>
                                </div>
                            </div>
                        ))}
                        {byPatient.length === 0 && (
                            <div className="text-center text-muted-foreground text-sm py-4">Nenhum dado encontrado.</div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
