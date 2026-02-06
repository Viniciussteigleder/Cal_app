import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function ResumoDoPacientePage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold">Resumo do Paciente</h1>
                <p className="text-sm text-muted-foreground mt-1">Visão rápida, pendências, linha do tempo e metas.</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Resumo do Paciente</CardTitle>
                    <CardDescription>Visão rápida, pendências, linha do tempo e metas.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">
                        Esta seção está em desenvolvimento. O conteúdo será implementado em breve.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
