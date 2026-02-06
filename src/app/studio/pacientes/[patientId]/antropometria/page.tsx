import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function AntropometriaPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold">Antropometria</h1>
                <p className="text-sm text-muted-foreground mt-1">Medidas, bioimpedância, evolução e metas.</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Antropometria</CardTitle>
                    <CardDescription>Medidas, bioimpedância, evolução e metas.</CardDescription>
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
