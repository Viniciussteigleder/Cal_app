import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function CenáriosPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold">Cenários</h1>
                <p className="text-sm text-muted-foreground mt-1">Cenários de cálculo comparativos.</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Cenários</CardTitle>
                    <CardDescription>Cenários de cálculo comparativos.</CardDescription>
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
