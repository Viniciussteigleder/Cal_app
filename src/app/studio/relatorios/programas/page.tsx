import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function RelatóriosPorProgramaPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold">Relatórios por Programa</h1>
                <p className="text-sm text-muted-foreground mt-1">Análises por programa nutricional.</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Relatórios por Programa</CardTitle>
                    <CardDescription>Análises por programa nutricional.</CardDescription>
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
