import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function PlanosModelosPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold">Planos (Modelos)</h1>
                <p className="text-sm text-muted-foreground mt-1">Modelos de planos alimentares reutilizáveis.</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Planos (Modelos)</CardTitle>
                    <CardDescription>Modelos de planos alimentares reutilizáveis.</CardDescription>
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
