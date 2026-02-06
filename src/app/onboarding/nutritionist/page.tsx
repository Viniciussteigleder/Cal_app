'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Check, Stethoscope, Building2, GraduationCap, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Textarea } from '@/components/ui/textarea';

// === COMPONENTS (Reused pattern but Blue Theme) ===

const StepIndicator = ({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) => {
    return (
        <div className="flex items-center justify-center gap-2 mb-8">
            {Array.from({ length: totalSteps }).map((_, i) => (
                <div
                    key={i}
                    className={cn(
                        "h-2 rounded-full transition-all duration-300",
                        i === currentStep ? "w-8 bg-blue-500" : i < currentStep ? "w-2 bg-blue-800" : "w-2 bg-white/20"
                    )}
                />
            ))}
        </div>
    );
};

// === MAIN PAGE ===

export default function NutritionistOnboarding() {
    const [step, setStep] = useState(0);
    const [formData, setFormData] = useState({
        name: '',
        crn: '',
        clinicName: '',
        bio: '',
        specialties: [] as string[]
    });

    const nextStep = () => setStep(s => s + 1);
    const prevStep = () => setStep(s => s - 1);

    const toggleSpecialty = (item: string) => {
        setFormData(prev => ({
            ...prev,
            specialties: prev.specialties.includes(item)
                ? prev.specialties.filter(i => i !== item)
                : [...prev.specialties, item]
        }));
    };

    const variants = {
        enter: { opacity: 0, x: 20 },
        center: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -20 }
    };

    return (
        <div className="w-full max-w-2xl mx-auto">
            {/* Header */}
            <div className="text-center mb-10 space-y-2">
                <motion.h1
                    key={step}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-3xl md:text-4xl font-bold text-white"
                >
                    {step === 0 && "Dados Profissionais"}
                    {step === 1 && "Configure sua Clínica"}
                    {step === 2 && "Suas Especialidades"}
                    {step === 3 && "Ambiente Configurado!"}
                </motion.h1>
                <StepIndicator currentStep={step} totalSteps={4} />
            </div>

            {/* Content */}
            <div className="min-h-[400px]">
                <AnimatePresence mode="wait">
                    {step === 0 && (
                        <motion.div
                            key="step0"
                            variants={variants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            className="space-y-6"
                        >
                            <div className="p-6 bg-blue-500/10 border border-blue-500/20 rounded-xl mb-6">
                                <div className="flex items-center gap-4">
                                    <div className="bg-blue-500 p-3 rounded-full text-white">
                                        <GraduationCap className="w-6 h-6" />
                                    </div>
                                    <p className="text-sm text-blue-200">
                                        Precisamos validar suas credenciais para liberar as funções de prescrição.
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-slate-200">Nome Completo</Label>
                                <Input
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Dra. Ana Silva"
                                    className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 h-12 text-lg focus:border-blue-500"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-slate-200">Número do CRN</Label>
                                <Input
                                    value={formData.crn}
                                    onChange={e => setFormData({ ...formData, crn: e.target.value })}
                                    placeholder="CRN-3 12345"
                                    className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 h-12 text-lg focus:border-blue-500"
                                />
                            </div>
                        </motion.div>
                    )}

                    {step === 1 && (
                        <motion.div
                            key="step1"
                            variants={variants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            className="space-y-6"
                        >
                            <div className="space-y-2">
                                <Label className="text-slate-200">Nome da Clínica / Consultório</Label>
                                <div className="relative">
                                    <Building2 className="absolute left-3 top-3.5 w-5 h-5 text-slate-500" />
                                    <Input
                                        value={formData.clinicName}
                                        onChange={e => setFormData({ ...formData, clinicName: e.target.value })}
                                        placeholder="Clínica Vida Saudável"
                                        className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-slate-500 h-12 text-lg focus:border-blue-500"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-slate-200">Minibiografia (para pacientes)</Label>
                                <Textarea
                                    value={formData.bio}
                                    onChange={e => setFormData({ ...formData, bio: e.target.value })}
                                    placeholder="Especialista em nutrição esportiva com foco em..."
                                    className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 min-h-[120px] text-lg focus:border-blue-500"
                                />
                            </div>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div
                            key="step2"
                            variants={variants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            className="grid grid-cols-2 gap-4"
                        >
                            {[
                                'Nutrição Esportiva',
                                'Emagrecimento',
                                'Clínica Geral',
                                'Oncologia',
                                'Pediatria',
                                'Diabetes',
                                'Saúde da Mulher',
                                'Vegetarianismo'
                            ].map((item) => (
                                <motion.div
                                    key={item}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => toggleSpecialty(item)}
                                    className={cn(
                                        "cursor-pointer p-4 rounded-xl border text-center transition-all flex items-center justify-center min-h-[80px]",
                                        formData.specialties.includes(item)
                                            ? "bg-blue-500/20 border-blue-500 text-blue-300 font-semibold shadow-[0_0_20px_-5px_rgba(59,130,246,0.3)]"
                                            : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10"
                                    )}
                                >
                                    {item}
                                </motion.div>
                            ))}
                        </motion.div>
                    )}

                    {step === 3 && (
                        <motion.div
                            key="step3"
                            variants={variants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            className="text-center space-y-8 py-8"
                        >
                            <div className="w-24 h-24 rounded-full bg-blue-500/20 text-blue-500 mx-auto flex items-center justify-center animate-pulse">
                                <Check className="w-12 h-12" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-2xl font-semibold text-white">NutriPlan Studio Pronto!</h3>
                                <p className="text-slate-400">
                                    Seu ambiente profissional foi configurado com sucesso.
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-left max-w-lg mx-auto">
                                <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                                    <div className="text-slate-400 text-sm mb-1">Clínica</div>
                                    <div className="text-white font-medium">{formData.clinicName}</div>
                                </div>
                                <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                                    <div className="text-slate-400 text-sm mb-1">Especialidades</div>
                                    <div className="text-white font-medium">{formData.specialties.length} selecionadas</div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Actions */}
            <div className="flex justify-between mt-10">
                <Button
                    variant="ghost"
                    onClick={prevStep}
                    disabled={step === 0}
                    className="text-slate-400 hover:text-white"
                >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Voltar
                </Button>

                {step < 3 ? (
                    <Button
                        onClick={nextStep}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-8"
                    >
                        Continuar
                        <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                ) : (
                    <Button
                        asChild
                        className="bg-white text-blue-900 hover:bg-slate-200 px-8 font-semibold"
                    >
                        <Link href="/studio/dashboard">
                            Acessar Studio
                        </Link>
                    </Button>
                )}
            </div>
        </div>
    );
}
