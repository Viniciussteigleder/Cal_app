"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface CircularProgressProps extends React.HTMLAttributes<HTMLDivElement> {
    value: number;
    max: number;
    size?: "sm" | "md" | "lg";
    label?: string;
    sublabel?: string;
}

export function CircularProgress({
    value,
    max,
    size = "md",
    label,
    sublabel,
    className,
    ...props
}: CircularProgressProps) {
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        // Small delay to ensure transition triggers after render
        const timer = setTimeout(() => setMounted(true), 100);
        return () => clearTimeout(timer);
    }, []);

    // If not mounted, show 0 progress, otherwise show actual value
    const displayValue = mounted ? value : 0;

    const percentage = Math.min(100, Math.max(0, (displayValue / max) * 100));
    const radius = size === "sm" ? 28 : size === "md" ? 54 : 80;
    const strokeWidth = size === "sm" ? 6 : size === "md" ? 10 : 12;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    const sizeClass = size === "sm" ? "w-[64px] h-[64px]" : size === "md" ? "w-[120px] h-[120px]" : "w-[180px] h-[180px]";
    const textSize = size === "sm" ? "text-xs" : size === "md" ? "text-2xl" : "text-3xl";

    return (
        <div className={cn("relative flex items-center justify-center", sizeClass, className)} {...props}>
            <svg className="w-full h-full -rotate-90 transform">
                {/* Track */}
                <circle
                    cx="50%"
                    cy="50%"
                    r={radius}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    className="text-slate-100"
                />
                {/* Progress */}
                <circle
                    cx="50%"
                    cy="50%"
                    r={radius}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    className="text-primary transition-all duration-1000 ease-out"
                />
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
                {label && <span className={cn("font-bold text-foreground", textSize)}>{label}</span>}
                {sublabel && <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{sublabel}</span>}
            </div>
        </div>
    );
}
