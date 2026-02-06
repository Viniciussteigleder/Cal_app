import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function PacientesPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold">Pacientes</h1>
                <p className="text-sm text-muted-foreground mt-1">Lista de pacientes, segmentos e tags.</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Pacientes</CardTitle>
                    <CardDescription>Lista de pacientes, segmentos e tags.</CardDescription>
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
