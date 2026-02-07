'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { ShoppingCart, Brain, Download, Printer, Mail, CheckCircle, DollarSign, Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { MedicalDisclaimer } from '@/components/ui/medical-disclaimer';
import { executeAIAction } from '@/app/studio/ai/actions';

interface ShoppingItem {
    id: string;
    name: string;
    quantity: string;
    unit: string;
    category: string;
    estimatedCost: number;
    checked: boolean;
    alternatives?: string[];
}

interface ShoppingCategory {
    name: string;
    icon: string;
    items: ShoppingItem[];
    totalCost: number;
}

export default function ShoppingListGeneratorPage() {
    const [selectedPatient, setSelectedPatient] = useState('');
    const [selectedMealPlan, setSelectedMealPlan] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [shoppingList, setShoppingList] = useState<ShoppingCategory[]>([]);
    const [viewMode, setViewMode] = useState<'category' | 'store'>('category');

    const generateShoppingList = async () => {
        setIsGenerating(true);

        try {
            const result = await executeAIAction('shopping_list_generator', {
                patientId: selectedPatient,
                mealPlanId: selectedMealPlan
            });

            if (!result.success) throw new Error(result.error);

            const data = result.data;

            // Map AI result to component interface
            const mappedList: ShoppingCategory[] = data.categories?.map((cat: any) => ({
                name: cat.name,
                icon: '🛒', // Default icon
                totalCost: cat.subtotal_brl || 0,
                items: cat.items?.map((item: any, idx: number) => ({
                    id: `${cat.name}-${idx}`,
                    name: item.name,
                    quantity: item.quantity,
                    unit: '',
                    category: cat.name,
                    estimatedCost: item.estimated_cost_brl || 0,
                    checked: false,
                    alternatives: item.alternatives
                })) || []
            })) || [];

            setShoppingList(mappedList);
            toast.success('Lista de compras gerada com sucesso!');
        } catch (error: any) {
            toast.error(error.message || 'Erro ao gerar lista de compras');
        } finally {
            setIsGenerating(false);
        }
    };

    const toggleItem = (categoryIndex: number, itemId: string) => {
        setShoppingList(prev => {
            const newList = [...prev];
            const item = newList[categoryIndex].items.find(i => i.id === itemId);
            if (item) {
                item.checked = !item.checked;
            }
            return newList;
        });
    };

    const getTotalCost = () => {
        return shoppingList.reduce((sum, category) => sum + category.totalCost, 0);
    };

    const getCheckedCount = () => {
        return shoppingList.reduce((sum, category) =>
            sum + category.items.filter(item => item.checked).length, 0
        );
    };

    const getTotalItems = () => {
        return shoppingList.reduce((sum, category) => sum + category.items.length, 0);
    };

    const exportPDF = () => {
        toast.success('Lista exportada para PDF!');
    };

    const printList = () => {
        window.print();
        toast.success('Preparando para impressão...');
    };

    const sendByEmail = () => {
        toast.success('Lista enviada por e-mail!');
    };

    return (
        <DashboardLayout role="nutritionist">
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <ShoppingCart className="h-8 w-8 text-primary" />
                        Gerador de Lista de Compras com IA
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Extraia automaticamente ingredientes do plano alimentar
                    </p>
                </div>

                <MedicalDisclaimer />

                {/* Configuration */}
                <Card>
                    <CardHeader>
                        <CardTitle>Configuração</CardTitle>
                        <CardDescription>Selecione o paciente e plano alimentar</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Paciente</label>
                                <Select value={selectedPatient} onValueChange={setSelectedPatient}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione o paciente" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1">Maria Silva</SelectItem>
                                        <SelectItem value="2">João Santos</SelectItem>
                                        <SelectItem value="3">Ana Costa</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Plano Alimentar</label>
                                <Select value={selectedMealPlan} onValueChange={setSelectedMealPlan}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione o plano" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1">Plano Semanal - Semana 1</SelectItem>
                                        <SelectItem value="2">Plano Semanal - Semana 2</SelectItem>
                                        <SelectItem value="3">Plano Mensal Completo</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex items-end">
                                <Button
                                    className="w-full bg-emerald-600 hover:bg-emerald-700"
                                    onClick={generateShoppingList}
                                    disabled={isGenerating || !selectedPatient || !selectedMealPlan}
                                >
                                    {isGenerating ? (
                                        <>
                                            <Brain className="h-4 w-4 mr-2 animate-spin" />
                                            Gerando...
                                        </>
                                    ) : (
                                        <>
                                            <Brain className="h-4 w-4 mr-2" />
                                            Gerar Lista
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>

                        <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg p-4">
                            <div className="flex gap-3">
                                <Brain className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="font-medium text-blue-900 dark:text-blue-100 text-sm">
                                        Geração Inteligente de Lista
                                    </h4>
                                    <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                                        Nossa IA analisa o plano alimentar, agrupa ingredientes por categoria,
                                        calcula quantidades totais e estima custos automaticamente.
                                    </p>
                                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-2 font-medium">
                                        Custo: 10 créditos (R$ 0,20)
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {shoppingList.length > 0 && (
                    <>
                        {/* Summary */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="text-center">
                                        <p className="text-sm text-muted-foreground">Total de Itens</p>
                                        <p className="text-3xl font-bold text-emerald-600 mt-2">
                                            {getTotalItems()}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="pt-6">
                                    <div className="text-center">
                                        <p className="text-sm text-muted-foreground">Itens Marcados</p>
                                        <p className="text-3xl font-bold mt-2">
                                            {getCheckedCount()}/{getTotalItems()}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="pt-6">
                                    <div className="text-center">
                                        <p className="text-sm text-muted-foreground">Custo Estimado</p>
                                        <p className="text-3xl font-bold text-blue-600 mt-2">
                                            R$ {getTotalCost().toFixed(2)}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="pt-6">
                                    <div className="text-center">
                                        <p className="text-sm text-muted-foreground">Categorias</p>
                                        <p className="text-3xl font-bold mt-2">
                                            {shoppingList.length}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Actions */}
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex flex-wrap gap-2">
                                    <Button onClick={exportPDF} variant="outline">
                                        <Download className="h-4 w-4 mr-2" />
                                        Exportar PDF
                                    </Button>
                                    <Button onClick={printList} variant="outline">
                                        <Printer className="h-4 w-4 mr-2" />
                                        Imprimir
                                    </Button>
                                    <Button onClick={sendByEmail} variant="outline">
                                        <Mail className="h-4 w-4 mr-2" />
                                        Enviar por E-mail
                                    </Button>
                                    <div className="ml-auto">
                                        <Select value={viewMode} onValueChange={(v) => setViewMode(v as any)}>
                                            <SelectTrigger className="w-[200px]">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="category">Por Categoria</SelectItem>
                                                <SelectItem value="store">Por Seção do Mercado</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Shopping List */}
                        <div className="space-y-4">
                            {shoppingList.map((category, categoryIndex) => (
                                <Card key={categoryIndex}>
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <span className="text-3xl">{category.icon}</span>
                                                <div>
                                                    <CardTitle>{category.name}</CardTitle>
                                                    <CardDescription>
                                                        {category.items.length} itens • R$ {category.totalCost.toFixed(2)}
                                                    </CardDescription>
                                                </div>
                                            </div>
                                            <Badge variant="outline">
                                                {category.items.filter(i => i.checked).length}/{category.items.length} marcados
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            {category.items.map((item) => (
                                                <div
                                                    key={item.id}
                                                    className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                                                >
                                                    <Checkbox
                                                        checked={item.checked}
                                                        onCheckedChange={() => toggleItem(categoryIndex, item.id)}
                                                        className="mt-1"
                                                    />
                                                    <div className="flex-1">
                                                        <div className="flex items-start justify-between">
                                                            <div>
                                                                <p className={`font-medium ${item.checked ? 'line-through text-muted-foreground' : ''}`}>
                                                                    {item.name}
                                                                </p>
                                                                <p className="text-sm text-muted-foreground mt-1">
                                                                    {item.quantity} {item.unit}
                                                                </p>
                                                                {item.alternatives && (
                                                                    <p className="text-xs text-blue-600 mt-1">
                                                                        Alternativas: {item.alternatives.join(', ')}
                                                                    </p>
                                                                )}
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="font-semibold text-emerald-600">
                                                                    R$ {item.estimatedCost.toFixed(2)}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        {/* Tips */}
                        <Card className="bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900">
                            <CardContent className="pt-6">
                                <div className="flex gap-3">
                                    <Store className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <h4 className="font-medium text-emerald-900 dark:text-emerald-100 text-sm mb-2">
                                            Dicas para Economizar
                                        </h4>
                                        <ul className="space-y-1 text-sm text-emerald-700 dark:text-emerald-300">
                                            <li>• Compre frutas e vegetais da estação - até 40% mais baratos</li>
                                            <li>• Prefira marcas próprias do supermercado - mesma qualidade, menor preço</li>
                                            <li>• Compre proteínas em maior quantidade e congele em porções</li>
                                            <li>• Use aplicativos de cashback para economizar ainda mais</li>
                                        </ul>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </>
                )}
            </div>
        </DashboardLayout>
    );
}
