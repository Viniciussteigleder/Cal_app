import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function AnexosPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold">Anexos</h1>
                <p className="text-sm text-muted-foreground mt-1">Documentos e arquivos anexados.</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Anexos</CardTitle>
                    <CardDescription>Documentos e arquivos anexados.</CardDescription>
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
