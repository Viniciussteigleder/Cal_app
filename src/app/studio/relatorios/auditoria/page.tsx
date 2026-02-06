import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function AuditoriaQualidadePage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold">Auditoria & Qualidade</h1>
                <p className="text-sm text-muted-foreground mt-1">Logs de auditoria e controle de qualidade.</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Auditoria & Qualidade</CardTitle>
                    <CardDescription>Logs de auditoria e controle de qualidade.</CardDescription>
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
