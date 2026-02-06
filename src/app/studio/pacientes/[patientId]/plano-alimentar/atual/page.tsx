import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function PlanoAtualPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold">Plano Atual</h1>
                <p className="text-sm text-muted-foreground mt-1">Plano alimentar vigente.</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Plano Atual</CardTitle>
                    <CardDescription>Plano alimentar vigente.</CardDescription>
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
