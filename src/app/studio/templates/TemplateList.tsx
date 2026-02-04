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
        <Card>
            <CardContent className="p-0">
                <div className="flex justify-end p-4">
                    <Button onClick={() => router.push('/studio/templates/new')}>
                        <Plus className="mr-2 h-4 w-4" /> Novo Template
                    </Button>
                </div>

                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Título</TableHead>
                            <TableHead>Tipo</TableHead>
                            <TableHead>Origem</TableHead>
                            <TableHead>Criado em</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {templates.map((template) => (
                            <TableRow key={template.id}>
                                <TableCell className="font-medium">
                                    <div className="flex items-center gap-2">
                                        <FileText className="h-4 w-4 text-muted-foreground" />
                                        {template.title}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline">{template.type}</Badge>
                                </TableCell>
                                <TableCell>
                                    {template.is_system ?
                                        <Badge>Sistema</Badge> :
                                        <span className="text-muted-foreground text-sm">Personalizado</span>
                                    }
                                </TableCell>
                                <TableCell className="text-muted-foreground text-sm">
                                    {new Date(template.created_at).toLocaleDateString()}
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="sm">Editar</Button>
                                </TableCell>
                            </TableRow>
                        ))}
                        {templates.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                    Nenhum modelo encontrado.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
