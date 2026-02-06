import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function CálculoEnergéticoPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold">Cálculo Energético</h1>
                <p className="text-sm text-muted-foreground mt-1">Dados, parâmetros, cenários e macros.</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Cálculo Energético</CardTitle>
                    <CardDescription>Dados, parâmetros, cenários e macros.</CardDescription>
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
