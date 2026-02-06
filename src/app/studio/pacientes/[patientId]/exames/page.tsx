import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function ExamesLaboratoriaisPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold">Exames Laboratoriais</h1>
                <p className="text-sm text-muted-foreground mt-1">Upload, resultados, evolução e notas clínicas.</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Exames Laboratoriais</CardTitle>
                    <CardDescription>Upload, resultados, evolução e notas clínicas.</CardDescription>
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
