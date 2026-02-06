import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function AdicionarExamePage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold">Adicionar Exame</h1>
                <p className="text-sm text-muted-foreground mt-1">Upload de exame (PDF/foto).</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Adicionar Exame</CardTitle>
                    <CardDescription>Upload de exame (PDF/foto).</CardDescription>
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
