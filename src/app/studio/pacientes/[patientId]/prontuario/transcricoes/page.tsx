import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function TranscriçõesPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold">Transcrições</h1>
                <p className="text-sm text-muted-foreground mt-1">Transcrições de consultas.</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Transcrições</CardTitle>
                    <CardDescription>Transcrições de consultas.</CardDescription>
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
