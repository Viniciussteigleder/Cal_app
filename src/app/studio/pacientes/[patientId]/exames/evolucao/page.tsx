import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function EvoluçãoDeExamesPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold">Evolução de Exames</h1>
                <p className="text-sm text-muted-foreground mt-1">Gráficos evolutivos de marcadores.</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Evolução de Exames</CardTitle>
                    <CardDescription>Gráficos evolutivos de marcadores.</CardDescription>
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
