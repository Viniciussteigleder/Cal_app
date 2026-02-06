'use client';

import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toggleTenantAi } from './actions';
import { toast } from 'sonner';

interface TenantListProps {
    tenants: any[];
}

export function TenantList({ tenants }: TenantListProps) {
    const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({});

    const handleToggle = async (id: string, currentVal: boolean) => {
        setLoadingMap(prev => ({ ...prev, [id]: true }));
        const newVal = !currentVal;

        const res = await toggleTenantAi(id, newVal);

        if (res.success) {
            toast.success(`AI ${newVal ? 'entabled' : 'disabled'} for tenant.`);
        } else {
            toast.error("Failed to update settings");
        }
        setLoadingMap(prev => ({ ...prev, [id]: false }));
    };

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Tenant</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Pacientes / Users</TableHead>
                    <TableHead>AI Features</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {tenants.map(t => {
                    const settings = t.settings as any || {};
                    const aiEnabled = settings.ai_enabled === true;

                    return (
                        <TableRow key={t.id}>
                            <TableCell className="font-medium">{t.name}</TableCell>
                            <TableCell>
                                <Badge variant={t.status === 'active' ? 'default' : 'secondary'}>
                                    {t.status}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                {t._count?.patients || 0} Pacientes / {t._count?.users || 0} Users
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    <Switch
                                        checked={aiEnabled}
                                        disabled={loadingMap[t.id]}
                                        onCheckedChange={() => handleToggle(t.id, aiEnabled)}
                                    />
                                    <span className="text-sm text-muted-foreground">{aiEnabled ? 'On' : 'Off'}</span>
                                </div>
                            </TableCell>
                        </TableRow>
                    )
                })}
                {tenants.length === 0 && (
                    <TableRow>
                        <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                            Nenhum tenant encontrado.
                        </TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>
    );
}
