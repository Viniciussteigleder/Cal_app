'use client';

import { useState } from 'react';
import { FileText, Plus, Search, Filter, Copy, Edit, Trash2, Download, Star, Clock, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

interface DocumentTemplate {
    id: string;
    name: string;
    type: 'consultation' | 'anamnesis' | 'progress' | 'educational' | 'report';
    description: string;
    content: string;
    fields: TemplateField[];
    createdBy: string;
    createdAt: Date;
    lastUsed?: Date;
    usageCount: number;
    isFavorite: boolean;
    tags: string[];
}

interface TemplateField {
    id: string;
    name: string;
    type: 'text' | 'textarea' | 'number' | 'date' | 'select';
    placeholder?: string;
    options?: string[];
    required: boolean;
}

const mockTemplates: DocumentTemplate[] = [
    {
        id: '1',
        name: 'Consulta Inicial - Anamnese Completa',
        type: 'anamnesis',
        description: 'Template completo para primeira consulta com histórico médico e nutricional',
        content: `# ANAMNESE NUTRICIONAL

## Dados Pessoais
- Nome: {{nome}}
- Idade: {{idade}}
- Profissão: {{profissao}}

## Queixa Principal
{{queixa_principal}}

## Histórico Médico
- Doenças atuais: {{doencas_atuais}}
- Medicamentos em uso: {{medicamentos}}
- Alergias: {{alergias}}

## Objetivos
{{objetivos}}

## Rotina Alimentar
- Café da manhã: {{cafe_manha}}
- Almoço: {{almoco}}
- Jantar: {{jantar}}

## Observações
{{observacoes}}`,
        fields: [
            { id: '1', name: 'nome', type: 'text', placeholder: 'Nome completo', required: true },
            { id: '2', name: 'idade', type: 'number', placeholder: 'Idade', required: true },
            { id: '3', name: 'profissao', type: 'text', placeholder: 'Profissão', required: false },
            { id: '4', name: 'queixa_principal', type: 'textarea', placeholder: 'Descreva a queixa principal', required: true },
        ],
        createdBy: 'Sistema',
        createdAt: new Date('2026-01-15'),
        usageCount: 45,
        isFavorite: true,
        tags: ['anamnese', 'primeira-consulta', 'completo'],
    },
    {
        id: '2',
        name: 'Relatório de Progresso Mensal',
        type: 'progress',
        description: 'Template para relatório mensal de evolução do paciente',
        content: `# RELATÓRIO DE PROGRESSO - {{mes}}/{{ano}}

**Paciente:** {{nome_paciente}}  
**Período:** {{data_inicio}} a {{data_fim}}

## Resumo Executivo
{{resumo}}

## Métricas de Progresso
- Peso inicial: {{peso_inicial}}kg → Peso atual: {{peso_atual}}kg
- Variação: {{variacao_peso}}kg

## Conquistas do Mês
{{conquistas}}

## Plano para Próximo Mês
{{plano_proximo_mes}}`,
        fields: [
            { id: '1', name: 'nome_paciente', type: 'text', required: true },
            { id: '2', name: 'mes', type: 'text', required: true },
        ],
        createdBy: 'Dra. Ana Silva',
        createdAt: new Date('2026-01-20'),
        lastUsed: new Date('2026-02-01'),
        usageCount: 28,
        isFavorite: true,
        tags: ['progresso', 'mensal', 'relatório'],
    },
];

export default function DocumentTemplatesPage() {
    const [templates, setTemplates] = useState<DocumentTemplate[]>(mockTemplates);
    const [filterType, setFilterType] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(null);
    const [isViewing, setIsViewing] = useState(false);

    const getTypeLabel = (type: string) => {
        const labels = {
            consultation: 'Consulta',
            anamnesis: 'Anamnese',
            progress: 'Progresso',
            educational: 'Educacional',
            report: 'Relatório',
        };
        return labels[type as keyof typeof labels] || type;
    };

    const getTypeColor = (type: string) => {
        const colors = {
            consultation: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
            anamnesis: 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400',
            progress: 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400',
            educational: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/20 dark:text-cyan-400',
            report: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400',
        };
        return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-700';
    };

    const filteredTemplates = templates
        .filter(t => filterType === 'all' || t.type === filterType)
        .filter(t => {
            if (!searchQuery) return true;
            const query = searchQuery.toLowerCase();
            return (
                t.name.toLowerCase().includes(query) ||
                t.description.toLowerCase().includes(query) ||
                t.tags.some(tag => tag.toLowerCase().includes(query))
            );
        });

    const toggleFavorite = (id: string) => {
        setTemplates(templates.map(t =>
            t.id === id ? { ...t, isFavorite: !t.isFavorite } : t
        ));
        toast.success('Favorito atualizado!');
    };

    return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-2">
                            <FileText className="h-8 w-8 text-primary" />
                            Templates de Documentos
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Templates para consultas, relatórios e documentação
                        </p>
                    </div>
                    <Button className="bg-emerald-600 hover:bg-emerald-700">
                        <Plus className="h-4 w-4 mr-2" />
                        Novo Template
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-center">
                                <p className="text-sm text-muted-foreground">Total</p>
                                <p className="text-3xl font-bold text-emerald-600 mt-2">{templates.length}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-center">
                                <p className="text-sm text-muted-foreground">Favoritos</p>
                                <p className="text-3xl font-bold mt-2">
                                    {templates.filter(t => t.isFavorite).length}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-center">
                                <p className="text-sm text-muted-foreground">Mais Usado</p>
                                <p className="text-lg font-bold mt-2 truncate">
                                    {templates.sort((a, b) => b.usageCount - a.usageCount)[0]?.name}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-center">
                                <p className="text-sm text-muted-foreground">Usos Totais</p>
                                <p className="text-3xl font-bold text-blue-600 mt-2">
                                    {templates.reduce((sum, t) => sum + t.usageCount, 0)}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Buscar templates..."
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                            <Select value={filterType} onValueChange={setFilterType}>
                                <SelectTrigger className="w-[200px]">
                                    <Filter className="h-4 w-4 mr-2" />
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos os Tipos</SelectItem>
                                    <SelectItem value="consultation">Consulta</SelectItem>
                                    <SelectItem value="anamnesis">Anamnese</SelectItem>
                                    <SelectItem value="progress">Progresso</SelectItem>
                                    <SelectItem value="educational">Educacional</SelectItem>
                                    <SelectItem value="report">Relatório</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredTemplates.map((template) => (
                        <Card key={template.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Badge className={getTypeColor(template.type)}>
                                                {getTypeLabel(template.type)}
                                            </Badge>
                                            {template.isFavorite && (
                                                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                                            )}
                                        </div>
                                        <CardTitle className="text-lg">{template.name}</CardTitle>
                                        <CardDescription className="mt-2">
                                            {template.description}
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex flex-wrap gap-1">
                                    {template.tags.map((tag, idx) => (
                                        <Badge key={idx} variant="outline" className="text-xs">
                                            {tag}
                                        </Badge>
                                    ))}
                                </div>

                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                        <User className="h-4 w-4" />
                                        {template.createdBy}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Clock className="h-4 w-4" />
                                        {template.usageCount} usos
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="flex-1"
                                        onClick={() => {
                                            setSelectedTemplate(template);
                                            setIsViewing(true);
                                        }}
                                    >
                                        Ver Template
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => toggleFavorite(template.id)}
                                    >
                                        <Star className={`h-4 w-4 ${template.isFavorite ? 'fill-amber-400 text-amber-400' : ''}`} />
                                    </Button>
                                    <Button variant="ghost" size="sm">
                                        <Copy className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="sm">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <Dialog open={isViewing} onOpenChange={setIsViewing}>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>{selectedTemplate?.name}</DialogTitle>
                            <DialogDescription>{selectedTemplate?.description}</DialogDescription>
                        </DialogHeader>

                        {selectedTemplate && (
                            <Tabs defaultValue="preview" className="w-full">
                                <TabsList className="grid w-full grid-cols-2">
                                    <TabsTrigger value="preview">Visualização</TabsTrigger>
                                    <TabsTrigger value="fields">Campos ({selectedTemplate.fields.length})</TabsTrigger>
                                </TabsList>

                                <TabsContent value="preview" className="space-y-4 mt-4">
                                    <div className="bg-muted/50 rounded-lg p-6">
                                        <pre className="whitespace-pre-wrap font-mono text-sm">
                                            {selectedTemplate.content}
                                        </pre>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700">
                                            Usar Template
                                        </Button>
                                        <Button variant="outline">
                                            <Download className="h-4 w-4 mr-2" />
                                            Exportar
                                        </Button>
                                    </div>
                                </TabsContent>

                                <TabsContent value="fields" className="space-y-4 mt-4">
                                    <div className="space-y-3">
                                        {selectedTemplate.fields.map((field) => (
                                            <Card key={field.id}>
                                                <CardContent className="pt-4">
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <p className="font-medium">{field.name}</p>
                                                            <p className="text-sm text-muted-foreground">
                                                                Tipo: {field.type} {field.required && '• Obrigatório'}
                                                            </p>
                                                        </div>
                                                        <Badge variant="outline">{field.type}</Badge>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                </TabsContent>
                            </Tabs>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
    );
}
