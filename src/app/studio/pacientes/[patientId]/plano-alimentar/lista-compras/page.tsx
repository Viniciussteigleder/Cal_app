import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function ListaDeComprasPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold">Lista de Compras</h1>
                <p className="text-sm text-muted-foreground mt-1">Lista de compras gerada a partir do plano.</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Lista de Compras</CardTitle>
                    <CardDescription>Lista de compras gerada a partir do plano.</CardDescription>
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
