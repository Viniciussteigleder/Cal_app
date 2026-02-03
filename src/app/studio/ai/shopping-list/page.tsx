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

    const generateShoppingList = () => {
        setIsGenerating(true);

        setTimeout(() => {
            const mockList: ShoppingCategory[] = [
                {
                    name: 'Proteínas',
                    icon: '🍗',
                    totalCost: 145.50,
                    items: [
                        { id: '1', name: 'Peito de frango', quantity: '2', unit: 'kg', category: 'Proteínas', estimatedCost: 32.00, checked: false, alternatives: ['Peito de peru', 'Filé de tilápia'] },
                        { id: '2', name: 'Filé de tilápia', quantity: '1', unit: 'kg', category: 'Proteínas', estimatedCost: 38.00, checked: false },
                        { id: '3', name: 'Carne moída magra', quantity: '500', unit: 'g', category: 'Proteínas', estimatedCost: 22.50, checked: false },
                        { id: '4', name: 'Ovos', quantity: '30', unit: 'unidades', category: 'Proteínas', estimatedCost: 18.00, checked: false },
                        { id: '5', name: 'Iogurte grego natural', quantity: '4', unit: 'potes', category: 'Proteínas', estimatedCost: 35.00, checked: false },
                    ],
                },
                {
                    name: 'Carboidratos',
                    icon: '🍚',
                    totalCost: 68.00,
                    items: [
                        { id: '6', name: 'Arroz integral', quantity: '2', unit: 'kg', category: 'Carboidratos', estimatedCost: 18.00, checked: false },
                        { id: '7', name: 'Batata doce', quantity: '3', unit: 'kg', category: 'Carboidratos', estimatedCost: 15.00, checked: false, alternatives: ['Batata inglesa', 'Mandioca'] },
                        { id: '8', name: 'Aveia em flocos', quantity: '500', unit: 'g', category: 'Carboidratos', estimatedCost: 12.00, checked: false },
                        { id: '9', name: 'Pão integral', quantity: '2', unit: 'pacotes', category: 'Carboidratos', estimatedCost: 16.00, checked: false },
                        { id: '10', name: 'Macarrão integral', quantity: '500', unit: 'g', category: 'Carboidratos', estimatedCost: 7.00, checked: false },
                    ],
                },
                {
                    name: 'Vegetais',
                    icon: '🥬',
                    totalCost: 52.50,
                    items: [
                        { id: '11', name: 'Brócolis', quantity: '3', unit: 'maços', category: 'Vegetais', estimatedCost: 12.00, checked: false },
                        { id: '12', name: 'Couve-flor', quantity: '2', unit: 'unidades', category: 'Vegetais', estimatedCost: 10.00, checked: false },
                        { id: '13', name: 'Alface americana', quantity: '2', unit: 'pés', category: 'Vegetais', estimatedCost: 8.00, checked: false },
                        { id: '14', name: 'Tomate', quantity: '1', unit: 'kg', category: 'Vegetais', estimatedCost: 7.50, checked: false },
                        { id: '15', name: 'Cenoura', quantity: '1', unit: 'kg', category: 'Vegetais', estimatedCost: 5.00, checked: false },
                        { id: '16', name: 'Abobrinha', quantity: '4', unit: 'unidades', category: 'Vegetais', estimatedCost: 10.00, checked: false },
                    ],
                },
                {
                    name: 'Frutas',
                    icon: '🍎',
                    totalCost: 48.00,
                    items: [
                        { id: '17', name: 'Banana', quantity: '2', unit: 'dúzias', category: 'Frutas', estimatedCost: 12.00, checked: false },
                        { id: '18', name: 'Maçã', quantity: '1', unit: 'kg', category: 'Frutas', estimatedCost: 10.00, checked: false },
                        { id: '19', name: 'Mamão papaia', quantity: '2', unit: 'unidades', category: 'Frutas', estimatedCost: 14.00, checked: false },
                        { id: '20', name: 'Abacate', quantity: '4', unit: 'unidades', category: 'Frutas', estimatedCost: 12.00, checked: false },
                    ],
                },
                {
                    name: 'Gorduras Saudáveis',
                    icon: '🥑',
                    totalCost: 85.00,
                    items: [
                        { id: '21', name: 'Azeite extra virgem', quantity: '500', unit: 'ml', category: 'Gorduras', estimatedCost: 35.00, checked: false },
                        { id: '22', name: 'Castanha de caju', quantity: '200', unit: 'g', category: 'Gorduras', estimatedCost: 18.00, checked: false },
                        { id: '23', name: 'Amendoim', quantity: '200', unit: 'g', category: 'Gorduras', estimatedCost: 12.00, checked: false },
                        { id: '24', name: 'Pasta de amendoim integral', quantity: '1', unit: 'pote', category: 'Gorduras', estimatedCost: 20.00, checked: false },
                    ],
                },
                {
                    name: 'Temperos e Condimentos',
                    icon: '🧂',
                    totalCost: 32.00,
                    items: [
                        { id: '25', name: 'Alho', quantity: '200', unit: 'g', category: 'Temperos', estimatedCost: 6.00, checked: false },
                        { id: '26', name: 'Cebola', quantity: '1', unit: 'kg', category: 'Temperos', estimatedCost: 5.00, checked: false },
                        { id: '27', name: 'Limão', quantity: '6', unit: 'unidades', category: 'Temperos', estimatedCost: 6.00, checked: false },
                        { id: '28', name: 'Sal rosa do Himalaia', quantity: '1', unit: 'pacote', category: 'Temperos', estimatedCost: 15.00, checked: false },
                    ],
                },
            ];

            setShoppingList(mockList);
            setIsGenerating(false);
            toast.success('Lista de compras gerada com sucesso!');
        }, 2000);
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
