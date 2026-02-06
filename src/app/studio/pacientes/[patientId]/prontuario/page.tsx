import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function ProntuárioPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold">Prontuário</h1>
                <p className="text-sm text-muted-foreground mt-1">Consultas, evolução, histórico, anexos e transcrições.</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Prontuário</CardTitle>
                    <CardDescription>Consultas, evolução, histórico, anexos e transcrições.</CardDescription>
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
