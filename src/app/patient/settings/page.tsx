'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    Clock,
    ShieldCheck,
    Download,
    Trash2,
    Smartphone,
} from "lucide-react";
import { toast } from "sonner";
import DashboardLayout from "@/components/layout/dashboard-layout";

export default function PatientSettingsPage() {
    const handleExportData = () => {
        toast.promise(
            new Promise((resolve) => setTimeout(resolve, 2000)),
            {
                loading: 'Preparando seu arquivo (JSON/CSV)...',
                success: 'Seus dados foram exportados com sucesso!',
                error: 'Erro ao exportar dados.',
            }
        );
    };

    const handleDeleteAccount = () => {
        toast.error("Funcionalidade de exclusão desabilitada para demonstração.");
    };

    return (
        <DashboardLayout role="patient">
            <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div>
                    <h1 className="text-3xl font-bold text-foreground tracking-tight">Configurações</h1>
                    <p className="text-muted-foreground mt-1">Gerencie seu perfil, preferências de dieta e privacidade.</p>
                </div>

                <div className="grid gap-6">
                    {/* Clinical Context Settings */}
                    <Card className="border-none shadow-card">
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Clock className="w-5 h-5 text-primary" />
                                <CardTitle>Rotina Clínica</CardTitle>
                            </div>
                            <CardDescription>Ajuste como o app sincroniza com seu dia-a-dia.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid gap-2">
                                <Label htmlFor="day-start">Início do Dia (Customizado)</Label>
                                <div className="flex gap-4">
                                    <Select defaultValue="06:00">
                                        <SelectTrigger className="w-[180px]">
                                            <SelectValue placeholder="Selecione o horário" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="04:00">04:00 AM</SelectItem>
                                            <SelectItem value="05:00">05:00 AM</SelectItem>
                                            <SelectItem value="06:00">06:00 AM</SelectItem>
                                            <SelectItem value="07:00">07:00 AM</SelectItem>
                                            <SelectItem value="08:00">08:00 AM</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <div className="text-xs text-muted-foreground flex items-center bg-muted/40 px-3 rounded-md border border-border italic">
                                        Útil para trabalhadores noturnos ou regime de plantão.
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-4 rounded-xl bg-purple-50 border border-purple-100 dark:bg-purple-950/20 dark:border-purple-900/40">
                                <div className="space-y-0.5">
                                    <Label className="text-purple-900 dark:text-purple-100">Push de Histamina</Label>
                                    <p className="text-xs text-purple-700 dark:text-purple-300">Notificar quando reaquecer alimentos com alto risco.</p>
                                </div>
                                <Switch defaultChecked />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Privacy & GDPR */}
                    <Card className="border-none shadow-card overflow-hidden">
                        <CardHeader className="bg-slate-900 text-white">
                            <div className="flex items-center gap-2">
                                <ShieldCheck className="w-5 h-5" />
                                <CardTitle className="text-white">Privacidade e Dados (GDPR)</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-6">
                            <div className="flex items-start justify-between">
                                <div className="space-y-1">
                                    <h4 className="text-sm font-bold text-foreground">Exportar Meus Dados</h4>
                                    <p className="text-xs text-muted-foreground leading-relaxed max-w-md">
                                        Baixe uma cópia completa de todos os seus registros alimentares, sintomas e notas em formato legível por máquina (JSON/CSV).
                                    </p>
                                </div>
                                <Button variant="outline" size="sm" onClick={handleExportData}>
                                    <Download className="w-4 h-4 mr-2" />
                                    Solicitar Cópia
                                </Button>
                            </div>

                            <div className="border-t border-border pt-6 flex items-start justify-between">
                                <div className="space-y-1">
                                    <h4 className="text-sm font-bold text-red-600">Excluir Conta e Dados</h4>
                                    <p className="text-xs text-muted-foreground leading-relaxed max-w-md">
                                        Remoção definitiva de todos os dados clínicos dos nossos servidores. Esta ação não pode ser desfeita.
                                    </p>
                                </div>
                                <Button variant="ghost" size="sm" className="text-red-500 hover:bg-red-50 hover:text-red-600" onClick={handleDeleteAccount}>
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Remover Dados
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* App Info */}
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between text-[11px] text-slate-400 px-2 uppercase font-bold tracking-widest">
                        <div className="flex gap-6">
                            <span className="hover:text-slate-600 cursor-pointer transition-colors">Termos de Uso</span>
                            <span className="hover:text-slate-600 cursor-pointer transition-colors">Privacidade</span>
                            <span className="hover:text-slate-600 cursor-pointer transition-colors">Segurança</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Smartphone className="w-3 h-3" />
                            <span>Versão 2.4.0 (Build 50-Persona-Audit)</span>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
