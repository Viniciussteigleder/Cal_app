import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function LâminasEducativasPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold">Lâminas Educativas</h1>
                <p className="text-sm text-muted-foreground mt-1">Material educativo para pacientes.</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Lâminas Educativas</CardTitle>
                    <CardDescription>Material educativo para pacientes.</CardDescription>
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
