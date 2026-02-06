import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function AlertasPendênciasPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold">Alertas & Pendências</h1>
                <p className="text-sm text-muted-foreground mt-1">Fila de pendências: exames aguardando, documentos sem assinatura, retornos vencidos.</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Alertas & Pendências</CardTitle>
                    <CardDescription>Fila de pendências: exames aguardando, documentos sem assinatura, retornos vencidos.</CardDescription>
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
