import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function DosagensPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold">Dosagens</h1>
                <p className="text-sm text-muted-foreground mt-1">Dosagens e posologia.</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Dosagens</CardTitle>
                    <CardDescription>Dosagens e posologia.</CardDescription>
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
