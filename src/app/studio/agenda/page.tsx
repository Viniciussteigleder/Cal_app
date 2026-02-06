import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function AgendaPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold">Agenda</h1>
                <p className="text-sm text-muted-foreground mt-1">Calendário, tarefas e follow-up.</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Agenda</CardTitle>
                    <CardDescription>Calendário, tarefas e follow-up.</CardDescription>
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
