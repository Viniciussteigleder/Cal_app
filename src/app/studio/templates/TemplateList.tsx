'use client';

import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, FileText, Code } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Template {
    id: string;
    title: string;
    type: string;
    is_system: boolean;
    created_at: Date;
}

export function TemplateList({ templates }: { templates: Template[] }) {
    const router = useRouter();

    return (
        <div className="space-y-6">
            <div className="flex justify-end">
                <Button onClick={() => router.push('/studio/templates/new')} className="bg-emerald-600 hover:bg-emerald-700">
                    <Plus className="mr-2 h-4 w-4" /> Novo Template
                </Button>
            </div>

            {templates.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 border border-dashed rounded-lg bg-muted/40 text-muted-foreground">
                    <FileText className="w-12 h-12 mb-4 opacity-20" />
                    <p>Nenhum modelo encontrado.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {templates.map((template) => (
                        <Card key={template.id} className="group hover:shadow-md transition-shadow border-muted cursor-pointer relative overflow-hidden">
                            {template.is_system && (
                                <div className="absolute top-0 right-0 p-2">
                                    <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200">System</Badge>
                                </div>
                            )}
                            <CardContent className="p-6 space-y-4">
                                <div className="flex items-start justify-between">
                                    <div className="p-2 bg-emerald-100 dark:bg-emerald-900/20 rounded-lg text-emerald-600 dark:text-emerald-400">
                                        <FileText className="w-6 h-6" />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-emerald-600 transition-colors">{template.title}</h3>
                                    <p className="text-sm text-muted-foreground capitalize">{template.type.replace('_', ' ')}</p>
                                </div>
                                <div className="text-xs text-muted-foreground pt-2 border-t flex justify-between items-center">
                                    <span>{new Date(template.created_at).toLocaleDateString()}</span>
                                    <Button variant="ghost" size="sm" className="h-6 text-xs hover:text-emerald-600" onClick={(e) => { e.stopPropagation(); /* edit logic */ }}>
                                        Editar
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
