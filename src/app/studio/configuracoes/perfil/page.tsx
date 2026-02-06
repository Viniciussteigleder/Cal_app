import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function PerfilPreferênciasPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold">Perfil & Preferências</h1>
                <p className="text-sm text-muted-foreground mt-1">Configurações do perfil e preferências pessoais.</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Perfil & Preferências</CardTitle>
                    <CardDescription>Configurações do perfil e preferências pessoais.</CardDescription>
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
