import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function OnboardingPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold">Onboarding</h1>
                <p className="text-sm text-muted-foreground mt-1">Fluxo de onboarding para novos pacientes.</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Onboarding</CardTitle>
                    <CardDescription>Fluxo de onboarding para novos pacientes.</CardDescription>
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
