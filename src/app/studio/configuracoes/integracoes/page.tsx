import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function IntegraçõesPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold">Integrações</h1>
                <p className="text-sm text-muted-foreground mt-1">Configurar integrações com serviços externos.</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Integrações</CardTitle>
                    <CardDescription>Configurar integrações com serviços externos.</CardDescription>
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
