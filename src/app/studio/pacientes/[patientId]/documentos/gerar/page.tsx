import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function GerarDocumentoPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold">Gerar Documento</h1>
                <p className="text-sm text-muted-foreground mt-1">Gerar documento personalizado.</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Gerar Documento</CardTitle>
                    <CardDescription>Gerar documento personalizado.</CardDescription>
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
