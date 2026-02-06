import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function MacrosPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold">Macros</h1>
                <p className="text-sm text-muted-foreground mt-1">Distribuição de macronutrientes.</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Macros</CardTitle>
                    <CardDescription>Distribuição de macronutrientes.</CardDescription>
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
