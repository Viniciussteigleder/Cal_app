'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';

interface ConsolidatedEntry {
    identifier: string;
    name: string;
    unit: string;
    history: { date: Date; value: number }[];
}

export function ConsolidatedHistory({ data }: { data: any[] }) {
    const entries = data as ConsolidatedEntry[];

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {entries.map(entry => {
                    const sortedHistory = [...entry.history].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
                    const latest = sortedHistory[sortedHistory.length - 1];
                    const chartData = sortedHistory.map(h => ({
                        date: format(new Date(h.date), 'dd/MM'),
                        fullDate: format(new Date(h.date), 'dd/MM/yyyy'),
                        value: h.value
                    }));

                    return (
                        <Card key={entry.identifier} className="overflow-hidden">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    {entry.name}
                                </CardTitle>
                                <div className="text-2xl font-bold">
                                    {latest?.value} <span className="text-xs font-normal text-muted-foreground">{entry.unit}</span>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[100px] w-full">
                                    {chartData.length > 1 ? (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={chartData}>
                                                <XAxis dataKey="date" hide />
                                                <YAxis hide domain={['auto', 'auto']} />
                                                <Tooltip
                                                    labelFormatter={(label, payload) => payload[0]?.payload.fullDate}
                                                />
                                                <Line
                                                    type="monotone"
                                                    dataKey="value"
                                                    stroke="#2563eb"
                                                    strokeWidth={2}
                                                    dot={{ r: 3 }}
                                                />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <div className="h-full flex items-center justify-center text-xs text-muted-foreground bg-muted/20 rounded">
                                            Histórico insuficiente para gráfico
                                        </div>
                                    )}
                                </div>

                                {/* Mini Table last 3 */}
                                <div className="mt-4 space-y-1">
                                    {sortedHistory.slice(-3).reverse().map((h, i) => (
                                        <div key={i} className="flex justify-between text-xs">
                                            <span className="text-muted-foreground">{format(new Date(h.date), 'dd/MM/yy')}</span>
                                            <span className="font-medium">{h.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {entries.length === 0 && (
                <div className="py-12 text-center text-muted-foreground border border-dashed rounded-lg">
                    Nenhum dado consolidado disponível. Faça upload de exames e valide os resultados.
                </div>
            )}
        </div>
    );
}
