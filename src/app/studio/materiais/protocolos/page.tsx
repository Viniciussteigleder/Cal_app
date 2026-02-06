import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function ProtocolosPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold">Protocolos</h1>
                <p className="text-sm text-muted-foreground mt-1">Protocolos clínicos organizados por objetivo.</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Protocolos</CardTitle>
                    <CardDescription>Protocolos clínicos organizados por objetivo.</CardDescription>
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
