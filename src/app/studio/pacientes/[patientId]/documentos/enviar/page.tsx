import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function EnviarPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold">Enviar</h1>
                <p className="text-sm text-muted-foreground mt-1">Enviar documento ao paciente.</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Enviar</CardTitle>
                    <CardDescription>Enviar documento ao paciente.</CardDescription>
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
