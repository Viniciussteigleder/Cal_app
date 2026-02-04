import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function NewProtocolPage() {
    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Novo Protocolo</h1>
                <p className="text-muted-foreground">Crie um novo protocolo clínico e submeta para revisão.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Detalhes do Protocolo</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="p-8 text-center border mr-2 border-dashed rounded-lg bg-muted/50">
                        <p className="text-muted-foreground">O formulário de criação de protocolos (incluindo fases, alimentos permitidos e revisão de especialistas) será implementado na próxima etapa da Fase 3.</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
