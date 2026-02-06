import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function DocumentosPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold">Documentos</h1>
                <p className="text-sm text-muted-foreground mt-1">Gerar, assinar, enviar e histórico.</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Documentos</CardTitle>
                    <CardDescription>Gerar, assinar, enviar e histórico.</CardDescription>
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
