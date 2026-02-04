'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { FileText, Upload, Brain, TrendingUp, AlertCircle, CheckCircle, Activity, Droplet, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { MedicalDisclaimer } from '@/components/ui/medical-disclaimer';

interface Biomarker {
    name: string;
    value: number;
    unit: string;
    referenceRange: string;
    status: 'normal' | 'low' | 'high' | 'critical';
}

interface ExamAnalysis {
    id: string;
    examType: string;
    examDate: string;
    uploadDate: string;
    status: 'processing' | 'completed' | 'failed';
    biomarkers: Biomarker[];
    aiSummary?: string;
    concerns?: string[];
    recommendations?: string[];
    nutritionalImplications?: {
        dietaryAdjustments: string[];
        supplementSuggestions: string[];
    };
}

// Mock data
const mockExams: ExamAnalysis[] = [
    {
        id: '1',
        examType: 'Hemograma Completo',
        examDate: '2026-01-15',
        uploadDate: '2026-01-16',
        status: 'completed',
        biomarkers: [
            {
                name: 'Glicose',
                value: 95,
                unit: 'mg/dL',
                referenceRange: '70-100',
                status: 'normal',
            },
            {
                name: 'Hemoglobina',
                value: 13.5,
                unit: 'g/dL',
                referenceRange: '12-16',
                status: 'normal',
            },
            {
                name: 'Ferro Sérico',
                value: 45,
                unit: 'µg/dL',
                referenceRange: '60-170',
                status: 'low',
            },
            {
                name: 'Vitamina D',
                value: 22,
                unit: 'ng/mL',
                referenceRange: '30-100',
                status: 'low',
            },
        ],
        aiSummary: 'Exame mostra níveis adequados de glicose e hemoglobina. Identificados níveis baixos de ferro e vitamina D que requerem atenção.',
        concerns: [
            'Ferro sérico abaixo do ideal - pode indicar deficiência de ferro',
            'Vitamina D insuficiente - comum em ambientes com pouca exposição solar',
        ],
        recommendations: [
            'Aumentar consumo de alimentos ricos em ferro (carnes vermelhas, feijão, lentilha)',
            'Considerar suplementação de vitamina D após consulta médica',
            'Incluir alimentos ricos em vitamina C para melhorar absorção de ferro',
        ],
        nutritionalImplications: {
            dietaryAdjustments: [
                'Adicionar carnes vermelhas magras 2-3x por semana',
                'Incluir vegetais verde-escuros diariamente',
                'Combinar fontes de ferro com vitamina C (ex: feijão com laranja)',
            ],
            supplementSuggestions: [
                'Vitamina D3: 2000 UI/dia (consultar médico)',
                'Ferro quelado: 30mg/dia com vitamina C',
            ],
        },
    },
];

export default function ExamAnalyzerPage() {
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [examType, setExamType] = useState('');
    const [examDate, setExamDate] = useState('');

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleAnalyzeExam = () => {
        setIsAnalyzing(true);
        setTimeout(() => {
            toast.success('Exame analisado com sucesso!');
            setIsAnalyzing(false);
            setIsUploadOpen(false);
            setSelectedFile(null);
        }, 3000);
    };

    const getStatusBadge = (status: Biomarker['status']) => {
        const config = {
            normal: { color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400', icon: CheckCircle },
            low: { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400', icon: TrendingUp },
            high: { color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400', icon: AlertCircle },
            critical: { color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400', icon: AlertCircle },
        };

        const { color, icon: Icon } = config[status];
        const label = {
            normal: 'Normal',
            low: 'Baixo',
            high: 'Alto',
            critical: 'Crítico',
        }[status];

        return (
            <Badge className={color}>
                <Icon className="w-3 h-3 mr-1" />
                {label}
            </Badge>
        );
    };

    return (
        <DashboardLayout role="nutritionist">
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <FileText className="h-8 w-8 text-primary" />
                        Analisador de Exames com IA
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Faça upload de exames laboratoriais e receba análise automática com IA
                    </p>
                </div>

                <MedicalDisclaimer />

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Exames Analisados</p>
                                    <p className="text-2xl font-bold">24</p>
                                </div>
                                <FileText className="w-8 h-8 text-emerald-600 opacity-20" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Este Mês</p>
                                    <p className="text-2xl font-bold">8</p>
                                </div>
                                <Activity className="w-8 h-8 text-blue-600 opacity-20" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Alertas Ativos</p>
                                    <p className="text-2xl font-bold text-amber-600">3</p>
                                </div>
                                <AlertCircle className="w-8 h-8 text-amber-600 opacity-20" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Taxa de Sucesso</p>
                                    <p className="text-2xl font-bold text-emerald-600">98%</p>
                                </div>
                                <CheckCircle className="w-8 h-8 text-emerald-600 opacity-20" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Upload Button */}
                <div className="flex justify-end">
                    <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-emerald-600 hover:bg-emerald-700">
                                <Upload className="h-4 w-4 mr-2" />
                                Novo Exame
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                            <DialogHeader>
                                <DialogTitle>Analisar Novo Exame</DialogTitle>
                                <DialogDescription>
                                    Faça upload da imagem do exame para análise automática com IA
                                </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-6 py-4">
                                {/* Exam Type */}
                                <div className="space-y-2">
                                    <Label>Tipo de Exame</Label>
                                    <Select value={examType} onValueChange={setExamType}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione o tipo de exame" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="blood_test">Hemograma Completo</SelectItem>
                                            <SelectItem value="glucose">Glicemia</SelectItem>
                                            <SelectItem value="lipid_profile">Perfil Lipídico</SelectItem>
                                            <SelectItem value="thyroid">Função Tireoidiana</SelectItem>
                                            <SelectItem value="vitamins">Vitaminas e Minerais</SelectItem>
                                            <SelectItem value="liver">Função Hepática</SelectItem>
                                            <SelectItem value="kidney">Função Renal</SelectItem>
                                            <SelectItem value="other">Outro</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Exam Date */}
                                <div className="space-y-2">
                                    <Label>Data do Exame</Label>
                                    <Input
                                        type="date"
                                        value={examDate}
                                        onChange={(e) => setExamDate(e.target.value)}
                                    />
                                </div>

                                {/* File Upload */}
                                <div className="space-y-2">
                                    <Label>Arquivo do Exame</Label>
                                    <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-emerald-500 transition-colors">
                                        <input
                                            type="file"
                                            accept="image/*,.pdf"
                                            onChange={handleFileSelect}
                                            className="hidden"
                                            id="exam-upload"
                                        />
                                        <label htmlFor="exam-upload" className="cursor-pointer">
                                            <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                                            {selectedFile ? (
                                                <div>
                                                    <p className="font-medium">{selectedFile.name}</p>
                                                    <p className="text-sm text-muted-foreground mt-1">
                                                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                                    </p>
                                                </div>
                                            ) : (
                                                <div>
                                                    <p className="font-medium">Clique para selecionar</p>
                                                    <p className="text-sm text-muted-foreground mt-1">
                                                        ou arraste o arquivo aqui
                                                    </p>
                                                    <p className="text-xs text-muted-foreground mt-2">
                                                        PNG, JPG ou PDF até 10MB
                                                    </p>
                                                </div>
                                            )}
                                        </label>
                                    </div>
                                </div>

                                {/* AI Processing Info */}
                                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg p-4">
                                    <div className="flex gap-3">
                                        <Brain className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <h4 className="font-medium text-blue-900 dark:text-blue-100 text-sm">
                                                Análise com IA
                                            </h4>
                                            <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                                                Nossa IA irá extrair os biomarcadores, comparar com valores de referência,
                                                identificar preocupações e gerar recomendações nutricionais personalizadas.
                                            </p>
                                            <p className="text-xs text-blue-600 dark:text-blue-400 mt-2 font-medium">
                                                Custo: 40 créditos (R$ 0,80)
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsUploadOpen(false)}>
                                    Cancelar
                                </Button>
                                <Button
                                    className="bg-emerald-600 hover:bg-emerald-700"
                                    onClick={handleAnalyzeExam}
                                    disabled={!selectedFile || !examType || !examDate || isAnalyzing}
                                >
                                    {isAnalyzing ? (
                                        <>
                                            <Brain className="h-4 w-4 mr-2 animate-spin" />
                                            Analisando...
                                        </>
                                    ) : (
                                        <>
                                            <Brain className="h-4 w-4 mr-2" />
                                            Analisar Exame
                                        </>
                                    )}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Exams List */}
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold">Exames Analisados</h2>
                    {mockExams.map((exam) => (
                        <Card key={exam.id} className="overflow-hidden">
                            <CardHeader className="bg-muted/50">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <CardTitle className="text-lg">{exam.examType}</CardTitle>
                                        <CardDescription className="mt-1">
                                            Data do exame: {new Date(exam.examDate).toLocaleDateString('pt-BR')} •
                                            Analisado em: {new Date(exam.uploadDate).toLocaleDateString('pt-BR')}
                                        </CardDescription>
                                    </div>
                                    <Badge className="bg-emerald-100 text-emerald-800">
                                        <CheckCircle className="w-3 h-3 mr-1" />
                                        Concluído
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <Tabs defaultValue="biomarkers" className="w-full">
                                    <TabsList className="grid w-full grid-cols-4">
                                        <TabsTrigger value="biomarkers">
                                            <Activity className="w-4 h-4 mr-2" />
                                            Biomarcadores
                                        </TabsTrigger>
                                        <TabsTrigger value="summary">
                                            <Brain className="w-4 h-4 mr-2" />
                                            Resumo IA
                                        </TabsTrigger>
                                        <TabsTrigger value="concerns">
                                            <AlertCircle className="w-4 h-4 mr-2" />
                                            Preocupações
                                        </TabsTrigger>
                                        <TabsTrigger value="nutrition">
                                            <Heart className="w-4 h-4 mr-2" />
                                            Nutrição
                                        </TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="biomarkers" className="space-y-4 mt-4">
                                        {exam.biomarkers.map((biomarker, idx) => (
                                            <div
                                                key={idx}
                                                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                                            >
                                                <div className="flex-1">
                                                    <h4 className="font-medium">{biomarker.name}</h4>
                                                    <p className="text-sm text-muted-foreground mt-1">
                                                        Referência: {biomarker.referenceRange} {biomarker.unit}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <div className="text-right">
                                                        <p className="text-2xl font-bold">
                                                            {biomarker.value}
                                                            <span className="text-sm font-normal text-muted-foreground ml-1">
                                                                {biomarker.unit}
                                                            </span>
                                                        </p>
                                                    </div>
                                                    {getStatusBadge(biomarker.status)}
                                                </div>
                                            </div>
                                        ))}
                                    </TabsContent>

                                    <TabsContent value="summary" className="mt-4">
                                        <div className="p-4 bg-muted/50 rounded-lg">
                                            <p className="text-sm leading-relaxed">{exam.aiSummary}</p>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="concerns" className="space-y-3 mt-4">
                                        {exam.concerns?.map((concern, idx) => (
                                            <div
                                                key={idx}
                                                className="flex gap-3 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-lg"
                                            >
                                                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                                <p className="text-sm text-amber-900 dark:text-amber-100">{concern}</p>
                                            </div>
                                        ))}
                                        <div className="mt-6">
                                            <h4 className="font-medium mb-3">Recomendações:</h4>
                                            <ul className="space-y-2">
                                                {exam.recommendations?.map((rec, idx) => (
                                                    <li key={idx} className="flex gap-2 text-sm">
                                                        <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                                                        <span>{rec}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="nutrition" className="space-y-6 mt-4">
                                        <div>
                                            <h4 className="font-medium mb-3">Ajustes Dietéticos:</h4>
                                            <ul className="space-y-2">
                                                {exam.nutritionalImplications?.dietaryAdjustments.map((adj, idx) => (
                                                    <li key={idx} className="flex gap-2 text-sm p-3 bg-emerald-50 dark:bg-emerald-950/20 rounded-lg">
                                                        <Droplet className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                                                        <span>{adj}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                        <div>
                                            <h4 className="font-medium mb-3">Suplementação Sugerida:</h4>
                                            <ul className="space-y-2">
                                                {exam.nutritionalImplications?.supplementSuggestions.map((supp, idx) => (
                                                    <li key={idx} className="flex gap-2 text-sm p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                                                        <Heart className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                                                        <span>{supp}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </TabsContent>
                                </Tabs>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </DashboardLayout>
    );
}
