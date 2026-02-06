import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function HistóricoPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold">Histórico</h1>
                <p className="text-sm text-muted-foreground mt-1">Histórico completo do prontuário.</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Histórico</CardTitle>
                    <CardDescription>Histórico completo do prontuário.</CardDescription>
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
