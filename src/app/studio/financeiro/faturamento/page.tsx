import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function FaturamentoPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold">Faturamento</h1>
                <p className="text-sm text-muted-foreground mt-1">Gestão de faturamento e notas.</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Faturamento</CardTitle>
                    <CardDescription>Gestão de faturamento e notas.</CardDescription>
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
