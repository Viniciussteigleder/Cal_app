import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function MedidasPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold">Medidas</h1>
                <p className="text-sm text-muted-foreground mt-1">Registro de medidas corporais.</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Medidas</CardTitle>
                    <CardDescription>Registro de medidas corporais.</CardDescription>
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
