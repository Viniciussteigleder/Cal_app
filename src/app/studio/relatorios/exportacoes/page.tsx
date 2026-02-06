import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function ExportaçõesPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold">Exportações</h1>
                <p className="text-sm text-muted-foreground mt-1">Exportar dados e relatórios.</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Exportações</CardTitle>
                    <CardDescription>Exportar dados e relatórios.</CardDescription>
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
