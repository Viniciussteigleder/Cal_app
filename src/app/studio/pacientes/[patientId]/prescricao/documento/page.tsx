import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function DocumentoPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold">Documento</h1>
                <p className="text-sm text-muted-foreground mt-1">Gerar documento de prescrição.</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Documento</CardTitle>
                    <CardDescription>Gerar documento de prescrição.</CardDescription>
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
