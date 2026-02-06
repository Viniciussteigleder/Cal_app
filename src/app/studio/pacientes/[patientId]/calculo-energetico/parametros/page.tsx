import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function ParâmetrosPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold">Parâmetros</h1>
                <p className="text-sm text-muted-foreground mt-1">Dados e parâmetros para cálculo.</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Parâmetros</CardTitle>
                    <CardDescription>Dados e parâmetros para cálculo.</CardDescription>
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
