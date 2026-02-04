'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { Check, Edit2, X, AlertTriangle, Eye } from 'lucide-react';
import { updateExamResult } from '../actions';
import { toast } from 'sonner';

interface ExamResult {
    id: string;
    raw_name: string;
    value: number | null;
    unit: string | null;
    reference_range: string | null;
    is_abnormal: boolean;
    validation_status: string;
    canonical_exam?: { common_name: string } | null;
}

interface ExamUpload {
    id: string;
    file_url: string;
    file_name: string;
    exam_date: Date;
    lab_name: string | null;
    extraction_status: string;
    results: ExamResult[];
}

export function ExamDetailView({ upload }: { upload: any }) {
    // Cast to typed interface locally
    const data = upload as ExamUpload;
    const [results, setResults] = useState(data.results);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<Partial<ExamResult>>({});

    const handleEdit = (result: ExamResult) => {
        setEditingId(result.id);
        setEditForm({
            raw_name: result.raw_name,
            value: result.value,
            unit: result.unit,
            reference_range: result.reference_range
        });
    };

    const handleCancel = () => {
        setEditingId(null);
        setEditForm({});
    };

    const handleSave = async (id: string) => {
        try {
            const res = await updateExamResult(id, editForm);
            if (res.success) {
                setResults(results.map(r => r.id === id ? { ...r, ...editForm, validation_status: 'validated' } as ExamResult : r));
                setEditingId(null);
                toast.success("Resultado atualizado");
            } else {
                toast.error("Erro ao atualizar");
            }
        } catch (e) {
            toast.error("Erro inesperado");
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left/Top: Info and Document Link */}
            <div className="lg:col-span-1 space-y-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Detalhes do Documento</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <span className="text-sm font-medium text-muted-foreground block">Arquivo</span>
                            <span className="text-sm">{data.file_name}</span>
                        </div>
                        <div>
                            <span className="text-sm font-medium text-muted-foreground block">Data do Exame</span>
                            <span className="text-sm">{format(new Date(data.exam_date), "dd/MM/yyyy")}</span>
                        </div>
                        <div>
                            <span className="text-sm font-medium text-muted-foreground block">Laboratório</span>
                            <span className="text-sm">{data.lab_name || '-'}</span>
                        </div>
                        <div>
                            <span className="text-sm font-medium text-muted-foreground block">Status Extração</span>
                            <Badge variant={data.extraction_status === 'completed' ? 'default' : 'secondary'}>
                                {data.extraction_status}
                            </Badge>
                        </div>
                        <div className="pt-4">
                            <a href={data.file_url} target="_blank" rel="noopener noreferrer">
                                <Button className="w-full" variant="outline">
                                    <Eye className="w-4 h-4 mr-2" />
                                    Visualizar Original
                                </Button>
                            </a>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Right/Bottom: Results Table */}
            <div className="lg:col-span-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Resultados Extraídos ({results.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Biomarcador</TableHead>
                                    <TableHead>Valor</TableHead>
                                    <TableHead>Unidade</TableHead>
                                    <TableHead>Ref.</TableHead>
                                    <TableHead className="w-[100px]">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {results.map(result => (
                                    <TableRow key={result.id}>
                                        {editingId === result.id ? (
                                            /* Editing Mode */
                                            <>
                                                <TableCell>
                                                    <Input
                                                        value={editForm.raw_name || ''}
                                                        onChange={e => setEditForm({ ...editForm, raw_name: e.target.value })}
                                                    />
                                                    <span className="text-xs text-muted-foreground">Original: {result.raw_name}</span>
                                                </TableCell>
                                                <TableCell>
                                                    <Input
                                                        type="number"
                                                        step="0.01"
                                                        value={editForm.value || ''}
                                                        onChange={e => setEditForm({ ...editForm, value: parseFloat(e.target.value) })}
                                                        className="w-24"
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Input
                                                        value={editForm.unit || ''}
                                                        onChange={e => setEditForm({ ...editForm, unit: e.target.value })}
                                                        className="w-20"
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Input
                                                        value={editForm.reference_range || ''}
                                                        onChange={e => setEditForm({ ...editForm, reference_range: e.target.value })}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex gap-2">
                                                        <Button size="icon" variant="ghost" className="text-green-600" onClick={() => handleSave(result.id)}>
                                                            <Check className="w-4 h-4" />
                                                        </Button>
                                                        <Button size="icon" variant="ghost" className="text-red-500" onClick={handleCancel}>
                                                            <X className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </>
                                        ) : (
                                            /* View Mode */
                                            <>
                                                <TableCell>
                                                    <div className="font-medium">{result.canonical_exam?.common_name || result.raw_name}</div>
                                                    {result.canonical_exam && result.raw_name !== result.canonical_exam.common_name && (
                                                        <div className="text-xs text-muted-foreground">Doc: {result.raw_name}</div>
                                                    )}
                                                    {!result.canonical_exam && <Badge variant="secondary" className="text-[10px]">Não mapeado</Badge>}
                                                </TableCell>
                                                <TableCell className={result.is_abnormal ? 'text-red-600 font-bold' : ''}>
                                                    {result.value}
                                                </TableCell>
                                                <TableCell className="text-muted-foreground">{result.unit}</TableCell>
                                                <TableCell className="text-xs text-muted-foreground max-w-[150px] truncate" title={result.reference_range || ''}>
                                                    {result.reference_range}
                                                </TableCell>
                                                <TableCell>
                                                    <Button size="icon" variant="ghost" onClick={() => handleEdit(result)}>
                                                        <Edit2 className="w-4 h-4 text-muted-foreground" />
                                                    </Button>
                                                    {result.is_abnormal && <AlertTriangle className="w-4 h-4 text-amber-500 inline ml-2" />}
                                                </TableCell>
                                            </>
                                        )}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
