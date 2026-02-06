import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function TarefasPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold">Tarefas</h1>
                <p className="text-sm text-muted-foreground mt-1">Tarefas globais e por paciente.</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Tarefas</CardTitle>
                    <CardDescription>Tarefas globais e por paciente.</CardDescription>
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
