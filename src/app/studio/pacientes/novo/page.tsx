import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function NovoPacientePage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold">Novo Paciente</h1>
                <p className="text-sm text-muted-foreground mt-1">Cadastrar novo paciente.</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Novo Paciente</CardTitle>
                    <CardDescription>Cadastrar novo paciente.</CardDescription>
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
