import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function ResultadosPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold">Resultados</h1>
                <p className="text-sm text-muted-foreground mt-1">Resultados de exames com interpretação.</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Resultados</CardTitle>
                    <CardDescription>Resultados de exames com interpretação.</CardDescription>
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
