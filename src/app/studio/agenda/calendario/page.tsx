import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function CalendárioPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold">Calendário</h1>
                <p className="text-sm text-muted-foreground mt-1">Eventos e consultas agendadas.</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Calendário</CardTitle>
                    <CardDescription>Eventos e consultas agendadas.</CardDescription>
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
