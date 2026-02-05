
import React from 'react';
import { getAiCreditStats } from './actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Coins, TrendingUp, Zap, BarChart } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default async function AiCreditsPage() {
    const { success, data } = await getAiCreditStats();

    if (!success || !data) {
        return <div className="p-8">Erro ao carregar dados de consumo.</div>;
    }

    const { transactions, totals, breakdown } = data;

    return (
        <div className="space-y-8 p-6 animate-in fade-in">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Monitor de Consumo IA</h1>
                <p className="text-muted-foreground">Acompanhe o uso de créditos e custos da inteligência artificial.</p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-950/20 dark:to-transparent border-indigo-200 dark:border-indigo-800">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <Coins className="h-4 w-4 text-indigo-500" /> Créditos Utilizados
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{Number(totals.credits).toFixed(1)}</div>
                        <p className="text-xs text-muted-foreground mt-1">+12% este mês</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-950/20 dark:to-transparent border-emerald-200 dark:border-emerald-800">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-emerald-500" /> Custo Estimado (BRL)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">R$ {Number(totals.brl).toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground mt-1">Baseado na cotação atual</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <Zap className="h-4 w-4 text-amber-500" /> Agente Mais Ativo
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {breakdown.length > 0 ? (
                            <>
                                <div className="text-xl font-bold capitalize">
                                    {breakdown.sort((a: any, b: any) => Number(b.credits) - Number(a.credits))[0].agent.replace('_', ' ')}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">Consumiu a maior fatia de recursos</p>
                            </>
                        ) : (
                            <div className="text-lg text-muted-foreground">Nenhum uso ainda</div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Transaction History */}
                <div className="lg:col-span-2 space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <BarChart className="h-5 w-5" /> Histórico de Transações
                    </h3>
                    <Card>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Data</TableHead>
                                    <TableHead>Agente</TableHead>
                                    <TableHead>Detalhes</TableHead>
                                    <TableHead className="text-right">Créditos</TableHead>
                                    <TableHead className="text-right">Custo (R$)</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {transactions.map((tx) => (
                                    <TableRow key={tx.id}>
                                        <TableCell className="font-mono text-xs text-muted-foreground">
                                            {format(new Date(tx.created_at), "dd/MM/yy HH:mm")}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="capitalize">
                                                {tx.agent_type.replace('_', ' ')}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="max-w-[200px] truncate text-xs text-muted-foreground">
                                            {JSON.stringify(tx.metadata || {})}
                                        </TableCell>
                                        <TableCell className="text-right font-medium">
                                            {Number(tx.credits_used).toFixed(2)}
                                        </TableCell>
                                        <TableCell className="text-right text-muted-foreground text-xs">
                                            R$ {Number(tx.cost_brl).toFixed(3)}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Card>
                </div>

                {/* Breakdown Chart (Simple List for MVP) */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Distribuição por Agente</h3>
                    <Card>
                        <CardContent className="pt-6 space-y-4">
                            {breakdown.map((item: any) => (
                                <div key={item.agent} className="space-y-1">
                                    <div className="flex justify-between text-sm">
                                        <span className="capitalize">{item.agent.replace('_', ' ')}</span>
                                        <span className="font-bold">{Number(item.credits).toFixed(1)} cr</span>
                                    </div>
                                    <div className="h-2 rounded-full bg-secondary overflow-hidden">
                                        <div
                                            className="h-full bg-primary"
                                            style={{ width: `${(Number(item.credits) / Number(totals.credits)) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                            {breakdown.length === 0 && <p className="text-sm text-muted-foreground">Sem dados.</p>}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
