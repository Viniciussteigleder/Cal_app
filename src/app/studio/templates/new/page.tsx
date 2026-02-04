'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createTemplate } from '../actions';
import { Loader2, Save } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Label } from '@/components/ui/label';

export default function NewTemplatePage() {
    const router = useRouter();
    const [title, setTitle] = useState('');
    const [type, setType] = useState('custom');
    const [jsonStructure, setJsonStructure] = useState('{\n  "fields": []\n}');
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        if (!title) return;

        let parsedJson;
        try {
            parsedJson = JSON.parse(jsonStructure);
        } catch (e) {
            toast.error("JSON inválido");
            return;
        }

        setLoading(true);
        const res = await createTemplate({ title, type, structure_json: parsedJson });
        setLoading(false);

        if (res.success) {
            toast.success("Template salvo!");
            router.push('/studio/templates');
        } else {
            toast.error("Erro ao salvar template");
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Novo Modelo</h1>
                <p className="text-muted-foreground">Defina a estrutura do formulário.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Configuração</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Título</Label>
                        <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Ex: Anamnese Esportiva" />
                    </div>

                    <div className="space-y-2">
                        <Label>Tipo</Label>
                        <Select value={type} onValueChange={setType}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="custom">Personalizado</SelectItem>
                                <SelectItem value="anamnesis">Anamnese</SelectItem>
                                <SelectItem value="checkin">Check-in</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Estrutura JSON</Label>
                        <Textarea
                            value={jsonStructure}
                            onChange={e => setJsonStructure(e.target.value)}
                            className="font-mono text-xs min-h-[200px]"
                        />
                        <p className="text-xs text-muted-foreground">Cole a estrutura do formulário em JSON compatível.</p>
                    </div>

                    <Button className="w-full" onClick={handleSave} disabled={loading || !title}>
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        Salvar Template
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
