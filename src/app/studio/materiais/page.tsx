import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function MateriaisPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold">Materiais</h1>
                <p className="text-sm text-muted-foreground mt-1">Acervo reutilizável: planos, receitas, protocolos, formulários e modelos.</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Materiais</CardTitle>
                    <CardDescription>Acervo reutilizável: planos, receitas, protocolos, formulários e modelos.</CardDescription>
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
