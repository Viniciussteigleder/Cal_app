import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function ConsultasPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold">Consultas</h1>
                <p className="text-sm text-muted-foreground mt-1">Histórico de consultas do paciente.</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Consultas</CardTitle>
                    <CardDescription>Histórico de consultas do paciente.</CardDescription>
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
