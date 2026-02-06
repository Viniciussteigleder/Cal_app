import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function PrescriçãoPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold">Prescrição</h1>
                <p className="text-sm text-muted-foreground mt-1">Suplementos, dosagens, alertas e documentos.</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Prescrição</CardTitle>
                    <CardDescription>Suplementos, dosagens, alertas e documentos.</CardDescription>
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
