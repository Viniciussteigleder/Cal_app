import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function NotasClínicasPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold">Notas Clínicas</h1>
                <p className="text-sm text-muted-foreground mt-1">Anotações sobre exames.</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Notas Clínicas</CardTitle>
                    <CardDescription>Anotações sobre exames.</CardDescription>
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
