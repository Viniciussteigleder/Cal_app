import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function MontarPlanoPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold">Montar Plano</h1>
                <p className="text-sm text-muted-foreground mt-1">Construir novo plano alimentar.</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Montar Plano</CardTitle>
                    <CardDescription>Construir novo plano alimentar.</CardDescription>
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
