import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function RetornosPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold">Retornos</h1>
                <p className="text-sm text-muted-foreground mt-1">Fila de follow-up e retornos agendados.</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Retornos</CardTitle>
                    <CardDescription>Fila de follow-up e retornos agendados.</CardDescription>
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
