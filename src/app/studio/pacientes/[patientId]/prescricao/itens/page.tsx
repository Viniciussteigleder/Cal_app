import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function ItensPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold">Itens</h1>
                <p className="text-sm text-muted-foreground mt-1">Suplementos e itens prescritos.</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Itens</CardTitle>
                    <CardDescription>Suplementos e itens prescritos.</CardDescription>
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
