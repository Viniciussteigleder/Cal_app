
import { Loader2 } from 'lucide-react';

export default function Loading() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] p-4 gap-4 animate-in fade-in duration-500">
            <Loader2 className="h-10 w-10 text-emerald-600 animate-spin" />
            <p className="text-muted-foreground font-medium text-sm animate-pulse">
                Carregando dados...
            </p>
        </div>
    );
}
