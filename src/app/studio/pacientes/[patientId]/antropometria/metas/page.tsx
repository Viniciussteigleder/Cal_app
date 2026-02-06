import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function MetasPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold">Metas</h1>
                <p className="text-sm text-muted-foreground mt-1">Metas antropométricas do paciente.</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Metas</CardTitle>
                    <CardDescription>Metas antropométricas do paciente.</CardDescription>
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
