
import React from 'react';
import { getPatientProtocols } from './actions';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, BookOpen, Calendar, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ProtocolTimeline } from '@/components/studio/protocol-timeline';

// This is the new page to list protocols assigned to a patient
export default async function PatientProtocolsPage({
    params
}: {
    params: Promise<{ patientId: string }>;
}) {
    const { patientId } = await params;
    const { success, data } = await getPatientProtocols(patientId);

    return (
        <div className="space-y-6 animate-in fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Protocolos Terapêuticos</h1>
                    <p className="text-muted-foreground">Histórico e gestão de protocolos atribuídos.</p>
                </div>
                {/* 
                     Ideally this goes to the Protocol Generator 
                     We can link to /studio/ai/protocol-generator?patientId=...
                */}
                <Button asChild>
                    <Link href={`/studio/ai/protocol-generator?patientId=${patientId}`}>
                        <Plus className="mr-2 h-4 w-4" /> Gerar Novo (IA)
                    </Link>
                </Button>
            </div>

            {!success || !data || data.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 border rounded-lg border-dashed bg-muted/10">
                    <div className="bg-primary/10 p-4 rounded-full mb-4">
                        <BookOpen className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-lg font-medium">Nenhum protocolo ativo</h3>
                    <p className="text-sm text-muted-foreground mt-1 max-w-sm text-center">
                        Este paciente ainda não possui nenhum protocolo terapêutico iniciado.
                        Use a IA para criar um plano personalizado.
                    </p>
                    <Button className="mt-6" asChild>
                        <Link href={`/studio/ai/protocol-generator?patientId=${patientId}`}>
                            Começar
                        </Link>
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {data.map((instance) => (
                        <Card key={instance.id} className="overflow-hidden border-indigo-100 dark:border-indigo-900/50">
                            <CardHeader className="bg-indigo-50/30 dark:bg-indigo-950/20 pb-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle className="text-lg text-indigo-950 dark:text-indigo-100">{instance.protocol.name}</CardTitle>
                                        <CardDescription className="line-clamp-1 mt-1">
                                            {instance.protocol.description || 'Protocolo Clínico Personalizado'}
                                        </CardDescription>
                                    </div>
                                    <Badge variant={instance.is_active ? 'default' : 'secondary'} className={instance.is_active ? "bg-indigo-500 hover:bg-indigo-600" : ""}>
                                        {instance.is_active ? 'Em Andamento' : 'Concluído'}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-8">
                                <ProtocolTimeline instance={instance as any} />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
