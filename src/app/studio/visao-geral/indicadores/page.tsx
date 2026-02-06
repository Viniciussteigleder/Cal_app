import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function IndicadoresPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold">Indicadores</h1>
                <p className="text-sm text-muted-foreground mt-1">KPIs e métricas da clínica.</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Indicadores</CardTitle>
                    <CardDescription>KPIs e métricas da clínica.</CardDescription>
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
