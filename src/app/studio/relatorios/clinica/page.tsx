import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function RelatóriosDaClínicaPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold">Relatórios da Clínica</h1>
                <p className="text-sm text-muted-foreground mt-1">Métricas e análises da clínica.</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Relatórios da Clínica</CardTitle>
                    <CardDescription>Métricas e análises da clínica.</CardDescription>
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
