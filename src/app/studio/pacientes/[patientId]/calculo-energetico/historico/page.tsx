import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function HistóricoDeCálculosPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold">Histórico de Cálculos</h1>
                <p className="text-sm text-muted-foreground mt-1">Histórico de cálculos realizados.</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Histórico de Cálculos</CardTitle>
                    <CardDescription>Histórico de cálculos realizados.</CardDescription>
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
