import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function AssinaturaDigitalPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold">Assinatura Digital</h1>
                <p className="text-sm text-muted-foreground mt-1">Configurar certificado de assinatura digital.</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Assinatura Digital</CardTitle>
                    <CardDescription>Configurar certificado de assinatura digital.</CardDescription>
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
