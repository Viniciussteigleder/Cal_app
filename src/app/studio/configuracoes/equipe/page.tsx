import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function EquipePermissõesPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold">Equipe & Permissões</h1>
                <p className="text-sm text-muted-foreground mt-1">Gerenciar equipe e permissões de acesso.</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Equipe & Permissões</CardTitle>
                    <CardDescription>Gerenciar equipe e permissões de acesso.</CardDescription>
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
