'use client';

import { motion } from 'framer-motion';
import React from 'react';

export default function OnboardingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen w-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900 via-slate-950 to-black text-white overflow-hidden relative selection:bg-emerald-500/30">
            {/* Ambient Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <motion.div
                    animate={{
                        opacity: [0.3, 0.5, 0.3],
                        scale: [1, 1.1, 1],
                    }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-emerald-500/10 rounded-full blur-[120px]"
                />
                <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-blue-500/10 rounded-full blur-[100px]" />
                <div className="absolute -bottom-[10%] left-[20%] w-[40%] h-[40%] bg-purple-500/5 rounded-full blur-[120px]" />
            </div>

            {/* Content Container */}
            <main className="relative z-10 flex min-h-screen flex-col items-center justify-center p-4 md:p-8">
                <div className="w-full max-w-5xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
