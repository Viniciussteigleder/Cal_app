'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Search, Filter, Phone, FileText, HelpCircle, MessageSquare, X } from 'lucide-react';

export function ProntuarioFilters() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [search, setSearch] = React.useState(searchParams.get('search') || '');
    const [types, setTypes] = React.useState<string[]>(searchParams.get('types')?.split(',') || []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        applyFilters(search, types);
    };

    const handleTypeChange = (value: string[]) => {
        setTypes(value);
        applyFilters(search, value);
    };

    const applyFilters = (term: string, typeList: string[]) => {
        const params = new URLSearchParams(window.location.search);

        if (term) params.set('search', term);
        else params.delete('search');

        if (typeList.length > 0) params.set('types', typeList.join(','));
        else params.delete('types');

        router.push(`?${params.toString()}`);
    };

    const clearFilters = () => {
        setSearch('');
        setTypes([]);
        router.push('?');
    };

    return (
        <Card>
            <CardContent className="p-4 space-y-4 md:space-y-0 md:flex md:items-center md:gap-4">
                {/* Search */}
                <form onSubmit={handleSearch} className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Buscar no prontuário..."
                        className="pl-8"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </form>

                {/* Type Filter */}
                <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-muted-foreground hidden md:block" />
                    <ToggleGroup type="multiple" value={types} onValueChange={handleTypeChange} variant="outline">
                        <ToggleGroupItem value="consultation" aria-label="Consultas" title="Consultas">
                            <FileText className="w-4 h-4" />
                        </ToggleGroupItem>
                        <ToggleGroupItem value="call" aria-label="Ligações" title="Ligações">
                            <Phone className="w-4 h-4" />
                        </ToggleGroupItem>
                        <ToggleGroupItem value="question" aria-label="Dúvidas" title="Dúvidas">
                            <HelpCircle className="w-4 h-4" />
                        </ToggleGroupItem>
                        <ToggleGroupItem value="note" aria-label="Notas" title="Notas">
                            <MessageSquare className="w-4 h-4" />
                        </ToggleGroupItem>
                    </ToggleGroup>
                </div>

                {(search || types.length > 0) && (
                    <Button variant="ghost" size="sm" onClick={clearFilters} title="Limpar Filtros">
                        <X className="w-4 h-4 mr-2" />
                        Limpar
                    </Button>
                )}
            </CardContent>
        </Card>
    );
}
