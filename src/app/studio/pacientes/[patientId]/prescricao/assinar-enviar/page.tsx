import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function AssinarEnviarPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold">Assinar & Enviar</h1>
                <p className="text-sm text-muted-foreground mt-1">Assinar e enviar prescrição.</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Assinar & Enviar</CardTitle>
                    <CardDescription>Assinar e enviar prescrição.</CardDescription>
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
