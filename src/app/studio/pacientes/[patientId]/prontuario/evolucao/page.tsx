import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function EvoluçãoPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold">Evolução</h1>
                <p className="text-sm text-muted-foreground mt-1">Registro de evolução clínica.</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Evolução</CardTitle>
                    <CardDescription>Registro de evolução clínica.</CardDescription>
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
