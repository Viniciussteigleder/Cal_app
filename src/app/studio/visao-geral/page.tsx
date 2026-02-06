import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function VisãoGeralPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold">Visão Geral</h1>
                <p className="text-sm text-muted-foreground mt-1">Painel principal da clínica com KPIs, alertas e pendências.</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Visão Geral</CardTitle>
                    <CardDescription>Painel principal da clínica com KPIs, alertas e pendências.</CardDescription>
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
