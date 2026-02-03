import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
    className?: string;
}

export function Skeleton({ className, ...props }: SkeletonProps) {
    return (
        <div
            className={cn(
                "animate-pulse rounded-md bg-muted/50",
                className
            )}
            {...props}
        />
    );
}

// Preset skeleton components for common patterns
export function SkeletonCard() {
    return (
        <div className="p-6 border border-border rounded-3xl bg-card shadow-sm space-y-4">
            <div className="flex items-center gap-4">
                <Skeleton className="h-16 w-16 rounded-2xl" />
                <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-24" />
                </div>
            </div>
            <Skeleton className="h-3 w-full rounded-full" />
            <Skeleton className="h-3 w-full rounded-full" />
        </div>
    );
}

export function SkeletonDashboard() {
    return (
        <div className="flex flex-col gap-8 max-w-md mx-auto md:max-w-4xl animate-in fade-in duration-500">
            {/* Header Skeleton */}
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <Skeleton className="h-12 w-64" />
                    <Skeleton className="h-5 w-48" />
                </div>
                <Skeleton className="h-10 w-24 rounded-full" />
            </div>

            {/* Main Stats Card Skeleton */}
            <div className="p-6 border border-border rounded-3xl bg-card shadow-sm">
                <div className="flex flex-col md:flex-row items-center gap-8">
                    <Skeleton className="h-40 w-40 rounded-full" />
                    <div className="flex-1 w-full space-y-6">
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <Skeleton className="h-5 w-20" />
                                <Skeleton className="h-5 w-24" />
                            </div>
                            <Skeleton className="h-3 w-full rounded-full" />
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <Skeleton className="h-5 w-24" />
                                <Skeleton className="h-5 w-24" />
                            </div>
                            <Skeleton className="h-3 w-full rounded-full" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SkeletonCard />
                <SkeletonCard />
            </div>
        </div>
    );
}

export function SkeletonFoodList() {
    return (
        <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
                <div
                    key={i}
                    className="flex items-center justify-between p-4 rounded-2xl border border-border bg-card"
                >
                    <div className="flex items-center gap-4">
                        <Skeleton className="h-12 w-12 rounded-lg" />
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-20" />
                        </div>
                    </div>
                    <div className="text-right space-y-1">
                        <Skeleton className="h-4 w-12 ml-auto" />
                        <Skeleton className="h-3 w-8 ml-auto" />
                    </div>
                </div>
            ))}
        </div>
    );
}
