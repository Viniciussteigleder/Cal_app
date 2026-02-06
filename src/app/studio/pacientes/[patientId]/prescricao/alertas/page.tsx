import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function AlertasPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold">Alertas</h1>
                <p className="text-sm text-muted-foreground mt-1">Alertas de interações e contraindicações.</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Alertas</CardTitle>
                    <CardDescription>Alertas de interações e contraindicações.</CardDescription>
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
