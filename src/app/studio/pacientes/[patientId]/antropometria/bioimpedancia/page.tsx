import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function BioimpedânciaPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold">Bioimpedância</h1>
                <p className="text-sm text-muted-foreground mt-1">Dados de bioimpedância.</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Bioimpedância</CardTitle>
                    <CardDescription>Dados de bioimpedância.</CardDescription>
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
