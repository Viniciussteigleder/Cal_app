import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function HistóricoDeAgendamentosPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold">Histórico de Agendamentos</h1>
                <p className="text-sm text-muted-foreground mt-1">Histórico completo de agendamentos.</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Histórico de Agendamentos</CardTitle>
                    <CardDescription>Histórico completo de agendamentos.</CardDescription>
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
