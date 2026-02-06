import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function PublicarNoEasyPatientPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold">Publicar no Easy Patient</h1>
                <p className="text-sm text-muted-foreground mt-1">Publicar plano no app do paciente.</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Publicar no Easy Patient</CardTitle>
                    <CardDescription>Publicar plano no app do paciente.</CardDescription>
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
