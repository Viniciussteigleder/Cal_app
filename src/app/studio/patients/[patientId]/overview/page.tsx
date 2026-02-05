
import React from 'react';
import { getPatient } from '@/app/studio/patients/actions';
import { getDailyLogs } from '@/app/studio/patients/[patientId]/log/actions';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
    Activity, Calendar, Clock, ArrowRight, User,
    Utensils, FileText, Bot, AlertTriangle
} from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default async function PatientOverviewPage({
    params
}: {
    params: Promise<{ patientId: string }>;
}) {
    const { patientId } = await params;
    const patientRes = await getPatient(patientId);
    const logsRes = await getDailyLogs(patientId);

    if (!patientRes.success || !patientRes.data) {
        return <div className="p-8">Paciente não encontrado.</div>;
    }

    const patient = patientRes.data;
    const profile = patient.profile;
    const conditions = patient.conditions || [];
    const logs = logsRes.success ? logsRes.data : [];

    // Calculate basic stats for demo
    const bmi = profile?.height_cm && profile?.current_weight_kg
        ? (Number(profile.current_weight_kg) / ((Number(profile.height_cm) / 100) ** 2)).toFixed(1)
        : 'N/A';

    return (
        <div className="space-y-6 animate-in fade-in-50">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{patient.name}</h1>
                    <div className="flex items-center gap-2 text-muted-foreground mt-1">
                        <Badge variant="outline" className={patient.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : ''}>
                            {patient.status === 'active' ? 'Ativo' : 'Inativo'}
                        </Badge>
                        <span className="text-sm">•</span>
                        <span className="text-sm">Última consulta: 15 Jan 2026 (Simulado)</span>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" asChild>
                        <Link href={`/studio/patients/${patientId}/prontuario`}>
                            <FileText className="mr-2 h-4 w-4" /> Prontuário
                        </Link>
                    </Button>
                    <Button asChild>
                        <Link href={`/studio/patients/${patientId}/log`}>
                            <Activity className="mr-2 h-4 w-4" /> Ver Diário
                        </Link>
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left Column: Profile & Stats */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base font-medium flex items-center gap-2">
                                <User className="h-4 w-4" /> Perfil Biométrico
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-muted-foreground">Idade</p>
                                    <p className="font-medium">
                                        {profile?.birth_date
                                            ? new Date().getFullYear() - new Date(profile.birth_date).getFullYear()
                                            : '-'} anos
                                    </p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Sexo</p>
                                    <p className="font-medium">{profile?.sex === 'male' ? 'Masculino' : 'Feminino'}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Peso Atual</p>
                                    <p className="font-medium">{Number(profile?.current_weight_kg || 0)} kg</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Altura</p>
                                    <p className="font-medium">{Number(profile?.height_cm || 0)} cm</p>
                                </div>
                                <div className="col-span-2 pt-2 border-t mt-2">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-muted-foreground">IMC</span>
                                        <span className="font-bold">{bmi}</span>
                                    </div>
                                    <Progress value={Number(bmi) > 0 ? (Number(bmi) / 40) * 100 : 0} className="h-2" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base font-medium flex items-center gap-2 text-amber-600">
                                <AlertTriangle className="h-4 w-4" /> Condições Clínicas
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {conditions.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {conditions.map(c => (
                                        <Badge key={c.id} variant="secondary">
                                            {c.name}
                                        </Badge>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">Nenhuma condição registrada.</p>
                            )}
                            <Button variant="ghost" size="sm" className="w-full mt-4 text-xs">
                                Gerenciar Condições com IA
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Middle Column: Recent Activity & Logs */}
                <div className="md:col-span-2 space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Card className="bg-primary/5 border-primary/20">
                            <CardContent className="p-4 flex items-center gap-4">
                                <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                                    <Bot className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium">Análise de IA Disponível</p>
                                    <p className="text-xs text-muted-foreground">Baseado nos últimos 3 dias de registro</p>
                                </div>
                                <Button size="sm" variant="outline" className="ml-auto">
                                    Gerar
                                </Button>
                            </CardContent>
                        </Card>
                        <Card className="bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-900">
                            <CardContent className="p-4 flex items-center gap-4">
                                <div className="h-10 w-10 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center text-orange-600">
                                    <Utensils className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium">Plano Alimentar</p>
                                    <p className="text-xs text-muted-foreground">Em fase de Manutenção</p>
                                </div>
                                <Button size="sm" variant="ghost" className="ml-auto hover:bg-orange-200/50">
                                    Ver
                                </Button>
                            </CardContent>
                        </Card>
                    </div>

                    <Card className="h-full">
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <span>Atividade Recente</span>
                                <Link href={`/studio/patients/${patientId}/log`} className="text-xs text-primary hover:underline">
                                    Ver tudo
                                </Link>
                            </CardTitle>
                            <CardDescription>Resumo dos últimos registros do paciente</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {logs.slice(0, 5).map((log: any) => (
                                    <div key={log.id} className="flex gap-4 items-start pb-4 border-b last:border-0 last:pb-0">
                                        <div className="mt-1">
                                            {log.entry_type === 'meal' && <div className="h-2 w-2 rounded-full bg-orange-500" />}
                                            {log.entry_type === 'symptom' && <div className="h-2 w-2 rounded-full bg-red-500" />}
                                            {log.entry_type === 'water' && <div className="h-2 w-2 rounded-full bg-blue-500" />}
                                            {log.entry_type === 'exercise' && <div className="h-2 w-2 rounded-full bg-green-500" />}
                                            {log.entry_type === 'note' && <div className="h-2 w-2 rounded-full bg-gray-500" />}
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <p className="text-sm font-medium leading-none">
                                                {log.entry_type.charAt(0).toUpperCase() + log.entry_type.slice(1)}
                                                <span className="ml-2 text-xs text-muted-foreground font-normal">
                                                    {format(new Date(log.timestamp), "d MMM, HH:mm", { locale: ptBR })}
                                                </span>
                                            </p>
                                            <p className="text-xs text-muted-foreground line-clamp-1">
                                                {typeof log.content === 'object'
                                                    ? (log.content as any).description || (log.content as any).text || JSON.stringify(log.content)
                                                    : String(log.content)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                                {logs.length === 0 && (
                                    <div className="text-center py-8 text-muted-foreground">
                                        Nenhuma atividade registrada recentemente.
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
