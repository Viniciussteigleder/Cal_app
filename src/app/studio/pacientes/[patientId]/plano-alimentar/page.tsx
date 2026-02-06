import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function PlanoAlimentarPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold">Plano Alimentar</h1>
                <p className="text-sm text-muted-foreground mt-1">Plano atual, montar, aplicar modelo e versões.</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Plano Alimentar</CardTitle>
                    <CardDescription>Plano atual, montar, aplicar modelo e versões.</CardDescription>
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
