import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function ModelosDeDocumentosPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold">Modelos de Documentos</h1>
                <p className="text-sm text-muted-foreground mt-1">Templates de pedido de exame, prescrição e orientações.</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Modelos de Documentos</CardTitle>
                    <CardDescription>Templates de pedido de exame, prescrição e orientações.</CardDescription>
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
