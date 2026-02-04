'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log error to console in development
        if (process.env.NODE_ENV === 'development') {
            console.error('Application error:', error);
        }

        // In production, send to error tracking service (e.g., Sentry)
        // logErrorToService(error);
    }, [error]);

    return (
        <div className="flex min-h-screen items-center justify-center p-4 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
                        <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
                    </div>
                    <CardTitle className="text-2xl">Algo deu errado!</CardTitle>
                    <CardDescription className="mt-2">
                        Desculpe, ocorreu um erro inesperado. Nossa equipe foi notificada e está trabalhando para resolver o problema.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {process.env.NODE_ENV === 'development' && (
                        <div className="rounded-lg bg-red-50 dark:bg-red-900/10 p-4">
                            <p className="text-sm font-medium text-red-800 dark:text-red-400 mb-2">
                                Detalhes do erro (apenas em desenvolvimento):
                            </p>
                            <pre className="text-xs text-red-700 dark:text-red-300 overflow-x-auto">
                                {error.message}
                            </pre>
                            {error.digest && (
                                <p className="text-xs text-red-600 dark:text-red-400 mt-2">
                                    ID do erro: {error.digest}
                                </p>
                            )}
                        </div>
                    )}

                    <div className="flex flex-col gap-2">
                        <Button
                            onClick={reset}
                            className="w-full bg-emerald-600 hover:bg-emerald-700"
                        >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Tentar novamente
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => window.location.href = '/'}
                            className="w-full"
                        >
                            <Home className="h-4 w-4 mr-2" />
                            Voltar para início
                        </Button>
                    </div>

                    <p className="text-center text-sm text-muted-foreground">
                        Se o problema persistir, entre em contato com o suporte.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
