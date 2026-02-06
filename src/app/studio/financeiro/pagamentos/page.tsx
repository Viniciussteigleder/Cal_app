import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function PagamentosPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold">Pagamentos</h1>
                <p className="text-sm text-muted-foreground mt-1">Controle de pagamentos recebidos.</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Pagamentos</CardTitle>
                    <CardDescription>Controle de pagamentos recebidos.</CardDescription>
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
