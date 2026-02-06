import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function ConfiguraçõesPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold">Configurações</h1>
                <p className="text-sm text-muted-foreground mt-1">Configurações gerais do sistema.</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Configurações</CardTitle>
                    <CardDescription>Configurações gerais do sistema.</CardDescription>
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
