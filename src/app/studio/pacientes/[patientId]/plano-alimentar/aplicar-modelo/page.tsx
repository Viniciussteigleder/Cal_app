import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function AplicarModeloPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold">Aplicar Modelo</h1>
                <p className="text-sm text-muted-foreground mt-1">Aplicar modelo de plano dos materiais.</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Aplicar Modelo</CardTitle>
                    <CardDescription>Aplicar modelo de plano dos materiais.</CardDescription>
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
