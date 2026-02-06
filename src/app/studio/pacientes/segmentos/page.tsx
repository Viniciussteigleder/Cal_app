import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function SegmentosTagsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold">Segmentos & Tags</h1>
                <p className="text-sm text-muted-foreground mt-1">Gerenciar segmentos e tags de pacientes.</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Segmentos & Tags</CardTitle>
                    <CardDescription>Gerenciar segmentos e tags de pacientes.</CardDescription>
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
