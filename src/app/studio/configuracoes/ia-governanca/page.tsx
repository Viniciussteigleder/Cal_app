import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function IaGovernançaPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold">IA (Governança)</h1>
                <p className="text-sm text-muted-foreground mt-1">Limites, logs, templates de prompts e auditoria de IA.</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>IA (Governança)</CardTitle>
                    <CardDescription>Limites, logs, templates de prompts e auditoria de IA.</CardDescription>
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
