'use client';

import { Suspense } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { User, Stethoscope, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function OnboardingPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] text-center space-y-12">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="space-y-4"
            >
                <h1 className="text-5xl md:text-7xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400">
                    Bem-vindo ao NutriPlan
                </h1>
                <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto">
                    A plataforma de nutrição mais avançada do mundo, impulsionada por IA.
                    <br />
                    Para começar, diga-nos quem você é.
                </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl">
                {/* Patient Card */}
                <Link href="/onboarding/patient" className="group">
                    <motion.div
                        whileHover={{ scale: 1.02, translateY: -5 }}
                        whileTap={{ scale: 0.98 }}
                        className="relative h-full p-8 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-emerald-500/50 backdrop-blur-sm transition-all duration-300 flex flex-col items-center gap-6"
                    >
                        <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
                            <User className="w-10 h-10 text-emerald-400" />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-2xl font-semibold text-white">Sou Paciente</h2>
                            <p className="text-slate-400 text-sm">
                                Quero alcançar meus objetivos de saúde, acompanhar minha dieta e evoluir.
                            </p>
                        </div>
                        <div className="mt-auto pt-4 flex items-center text-emerald-400 font-medium opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                            Começar Jornada <ArrowRight className="w-4 h-4 ml-2" />
                        </div>
                    </motion.div>
                </Link>

                {/* Nutritionist Card */}
                <Link href="/onboarding/nutritionist" className="group">
                    <motion.div
                        whileHover={{ scale: 1.02, translateY: -5 }}
                        whileTap={{ scale: 0.98 }}
                        className="relative h-full p-8 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-blue-500/50 backdrop-blur-sm transition-all duration-300 flex flex-col items-center gap-6"
                    >
                        <div className="w-20 h-20 rounded-full bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                            <Stethoscope className="w-10 h-10 text-blue-400" />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-2xl font-semibold text-white">Sou Nutricionista</h2>
                            <p className="text-slate-400 text-sm">
                                Quero gerenciar meus pacientes, criar planos com IA e otimizar meu tempo.
                            </p>
                        </div>
                        <div className="mt-auto pt-4 flex items-center text-blue-400 font-medium opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                            Configurar Clínica <ArrowRight className="w-4 h-4 ml-2" />
                        </div>
                    </motion.div>
                </Link>
            </div>
        </div>
    );
}
