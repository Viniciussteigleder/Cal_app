
'use client'; // Error components must be Client Components

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, RotateCcw } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service if available
        console.error(error);
    }, [error]);

    return (
        <div className="flex items-center justify-center min-h-[50vh] p-4">
            <Card className="w-full max-w-md border-destructive/20 shadow-lg">
                <CardHeader className="text-center pb-2">
                    <div className="mx-auto bg-destructive/10 p-3 rounded-full w-fit mb-4">
                        <AlertCircle className="h-8 w-8 text-destructive" />
                    </div>
                    <CardTitle className="text-xl text-destructive">Algo correu mal</CardTitle>
                </CardHeader>
                <CardContent className="text-center text-muted-foreground">
                    <p>
                        Encontramos um erro inesperado ao processar sua solicitação.
                        Nossa equipe foi notificada.
                    </p>
                    {process.env.NODE_ENV === 'development' && (
                        <div className="mt-4 p-2 bg-muted rounded text-xs text-left overflow-auto max-h-32">
                            {error.message}
                        </div>
                    )}
                </CardContent>
                <CardFooter className="justify-center">
                    <Button onClick={reset} variant="outline" className="gap-2">
                        <RotateCcw className="h-4 w-4" />
                        Tentar Novamente
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
