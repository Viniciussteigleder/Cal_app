import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function EvoluçãoAntropométricaPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold">Evolução Antropométrica</h1>
                <p className="text-sm text-muted-foreground mt-1">Gráficos de evolução corporal.</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Evolução Antropométrica</CardTitle>
                    <CardDescription>Gráficos de evolução corporal.</CardDescription>
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
