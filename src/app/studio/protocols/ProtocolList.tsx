'use client';

import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, CheckCircle, AlertTriangle, Star } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Protocol {
    id: string;
    name: string;
    description: string | null;
    expert_review_score: number | null;
    expert_reviewer: string | null;
    is_active: boolean;
}

export function ProtocolList({ protocols }: { protocols: Protocol[] }) {
    const router = useRouter();

    return (
        <Card>
            <CardContent className="p-0">
                <div className="flex justify-end p-4">
                    <Button onClick={() => router.push('/studio/protocols/new')}>
                        <Plus className="mr-2 h-4 w-4" /> Novo Protocolo
                    </Button>
                </div>

                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nome</TableHead>
                            <TableHead>Score Especialista (0-50)</TableHead>
                            <TableHead>Revisor</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {protocols.map((protocol) => (
                            <TableRow key={protocol.id}>
                                <TableCell className="font-medium">
                                    <div>{protocol.name}</div>
                                    <div className="text-xs text-muted-foreground truncate max-w-[300px]">
                                        {protocol.description}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    {protocol.expert_review_score !== null ? (
                                        <div className="flex items-center gap-1">
                                            <Star className={`h-4 w-4 ${protocol.expert_review_score >= 40 ? 'text-yellow-500 fill-yellow-500' : 'text-muted-foreground'}`} />
                                            <span className="font-bold">{protocol.expert_review_score}/50</span>
                                        </div>
                                    ) : (
                                        <Badge variant="outline">Pendente</Badge>
                                    )}
                                </TableCell>
                                <TableCell>
                                    {protocol.expert_reviewer || '-'}
                                </TableCell>
                                <TableCell>
                                    {protocol.is_active ?
                                        <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100">Ativo</Badge>
                                        :
                                        <Badge variant="secondary">Inativo</Badge>
                                    }
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => console.log('Edit', protocol.id)}
                                    >
                                        Editar
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                        {protocols.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                    Nenhum protocolo cadastrado.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
