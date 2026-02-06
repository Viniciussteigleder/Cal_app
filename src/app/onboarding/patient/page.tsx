'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Check, Salad, Weight, Activity, Heart, Flame, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import Link from 'next/link';

// === COMPONENTS ===

const StepIndicator = ({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) => {
    return (
        <div className="flex items-center justify-center gap-2 mb-8">
            {Array.from({ length: totalSteps }).map((_, i) => (
                <div
                    key={i}
                    className={cn(
                        "h-2 rounded-full transition-all duration-300",
                        i === currentStep ? "w-8 bg-emerald-500" : i < currentStep ? "w-2 bg-emerald-800" : "w-2 bg-white/20"
                    )}
                />
            ))}
        </div>
    );
};

const OptionCard = ({
    icon: Icon,
    title,
    description,
    selected,
    onClick
}: {
    icon: any;
    title: string;
    description: string;
    selected: boolean;
    onClick: () => void;
}) => (
    <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        className={cn(
            "cursor-pointer p-6 rounded-xl border transition-all duration-200 flex flex-col items-center text-center gap-4",
            selected
                ? "bg-emerald-500/20 border-emerald-500 shadow-[0_0_30px_-5px_rgba(16,185,129,0.3)]"
                : "bg-white/5 border-white/10 hover:bg-white/10"
        )}
    >
        <div className={cn(
            "p-4 rounded-full transition-colors",
            selected ? "bg-emerald-500 text-white" : "bg-white/10 text-slate-400"
        )}>
            <Icon className="w-8 h-8" />
        </div>
        <div>
            <h3 className={cn("font-semibold text-lg", selected ? "text-white" : "text-slate-200")}>{title}</h3>
            <p className="text-sm text-slate-400 mt-1">{description}</p>
        </div>
    </motion.div>
);

// === MAIN PAGE ===

export default function PatientOnboarding() {
    const [step, setStep] = useState(0);
    const [formData, setFormData] = useState({
        name: '',
        age: '',
        goal: '',
        activityLevel: '',
        diet: [] as string[]
    });

    const nextStep = () => setStep(s => s + 1);
    const prevStep = () => setStep(s => s - 1);

    const toggleDiet = (item: string) => {
        setFormData(prev => ({
            ...prev,
            diet: prev.diet.includes(item)
                ? prev.diet.filter(i => i !== item)
                : [...prev.diet, item]
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
                    {step === 0 && "Vamos começar pelo básico"}
                    {step === 1 && "Qual é seu objetivo principal?"}
                    {step === 2 && "Alguma restrição alimentar?"}
                    {step === 3 && "Tudo pronto!"}
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
                            <div className="space-y-2">
                                <Label className="text-slate-200">Como prefere ser chamado?</Label>
                                <Input
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Seu nome"
                                    className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 h-12 text-lg focus:border-emerald-500"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-slate-200">Quantos anos você tem?</Label>
                                <Input
                                    type="number"
                                    value={formData.age}
                                    onChange={e => setFormData({ ...formData, age: e.target.value })}
                                    placeholder="25"
                                    className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 h-12 text-lg focus:border-emerald-500"
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
                            className="grid grid-cols-1 md:grid-cols-2 gap-4"
                        >
                            <OptionCard
                                icon={Weight}
                                title="Perder Peso"
                                description="Queimar gordura de forma saudável"
                                selected={formData.goal === 'weight_loss'}
                                onClick={() => setFormData({ ...formData, goal: 'weight_loss' })}
                            />
                            <OptionCard
                                icon={Zap}
                                title="Ganhar Massa"
                                description="Hipertrofia e força muscular"
                                selected={formData.goal === 'muscle_gain'}
                                onClick={() => setFormData({ ...formData, goal: 'muscle_gain' })}
                            />
                            <OptionCard
                                icon={Heart}
                                title="Saúde & Bem-estar"
                                description="Melhorar hábitos e longevidade"
                                selected={formData.goal === 'health'}
                                onClick={() => setFormData({ ...formData, goal: 'health' })}
                            />
                            <OptionCard
                                icon={Activity}
                                title="Performance"
                                description="Melhorar rendimento esportivo"
                                selected={formData.goal === 'performance'}
                                onClick={() => setFormData({ ...formData, goal: 'performance' })}
                            />
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div
                            key="step2"
                            variants={variants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            className="grid grid-cols-2 md:grid-cols-3 gap-4"
                        >
                            {['Glúten', 'Lactose', 'Amendoim', 'Frutos do Mar', 'Ovos', 'Soja', 'Vegano', 'Vegetariano'].map((item) => (
                                <motion.div
                                    key={item}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => toggleDiet(item)}
                                    className={cn(
                                        "cursor-pointer p-4 rounded-lg border text-center transition-all",
                                        formData.diet.includes(item)
                                            ? "bg-emerald-500/20 border-emerald-500 text-emerald-400"
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
                            <div className="w-24 h-24 rounded-full bg-emerald-500/20 text-emerald-500 mx-auto flex items-center justify-center animate-pulse">
                                <Check className="w-12 h-12" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-2xl font-semibold text-white">Perfil Criado!</h3>
                                <p className="text-slate-400">
                                    Sua IA já está analisando seus dados para criar o plano perfeito.
                                </p>
                            </div>

                            <div className="p-6 bg-white/5 rounded-xl border border-white/10 text-left space-y-3 max-w-sm mx-auto">
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Nome:</span>
                                    <span className="text-white">{formData.name}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Objetivo:</span>
                                    <span className="text-white capitalize">{formData.goal?.replace('_', ' ')}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Restrições:</span>
                                    <span className="text-white">{formData.diet.length > 0 ? formData.diet.join(', ') : 'Nenhuma'}</span>
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
                        className="bg-emerald-500 hover:bg-emerald-600 text-white px-8"
                    >
                        Continuar
                        <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                ) : (
                    <Button
                        asChild
                        className="bg-white text-emerald-900 hover:bg-slate-200 px-8 font-semibold"
                    >
                        <Link href="/patient/dashboard">
                            Ir para Dashboard
                        </Link>
                    </Button>
                )}
            </div>
        </div>
    );
}
