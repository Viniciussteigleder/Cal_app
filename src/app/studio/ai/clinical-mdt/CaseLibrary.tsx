import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen } from 'lucide-react';

const CASES = [
    { title: 'SIBO Recorrente', category: 'Gastro', difficulty: 'Hard' },
    { title: 'Hashimoto & Dieta', category: 'Autoimmune', difficulty: 'Medium' },
    { title: 'SOP & Resistência Insulínica', category: 'Endocrine', difficulty: 'Medium' },
];

export function CaseLibrary() {
    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-blue-500" />
                    Biblioteca de Casos
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    {CASES.map((c, i) => (
                        <div key={i} className="flex items-center justify-between p-2 hover:bg-muted rounded text-sm group cursor-pointer border border-transparent hover:border-border">
                            <div>
                                <span className="font-medium mr-2">{c.title}</span>
                                <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{c.category}</span>
                            </div>
                            <Button variant="ghost" size="sm" className="h-6 text-xs opacity-0 group-hover:opacity-100">Carregar</Button>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
