import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function CustosInclIaPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold">Custos (incl. IA)</h1>
                <p className="text-sm text-muted-foreground mt-1">Controle de custos operacionais e de IA.</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Custos (incl. IA)</CardTitle>
                    <CardDescription>Controle de custos operacionais e de IA.</CardDescription>
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
