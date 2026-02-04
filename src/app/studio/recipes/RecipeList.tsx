'use client';

import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, ChefHat, Clock, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Recipe {
    id: string;
    name: string;
    description: string | null;
    prep_time_min: number | null;
    cook_time_min: number | null;
    servings: number;
    nutrition_preview?: any;
}

export function RecipeList({ recipes }: { recipes: Recipe[] }) {
    const router = useRouter();

    return (
        <div className="space-y-6">
            <div className="flex justify-end">
                <Button onClick={() => router.push('/studio/recipes/new')}>
                    <Plus className="mr-2 h-4 w-4" /> Nova Receita (IA)
                </Button>
            </div>

            {recipes.length === 0 ? (
                <div className="text-center py-12 border rounded-lg border-dashed bg-muted/20">
                    <ChefHat className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium">Nenhuma receita encontrada</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                        Use nossa IA para criar sua primeira receita personalizada.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {recipes.map((recipe) => (
                        <Card key={recipe.id} className="flex flex-col">
                            <CardHeader>
                                <CardTitle className="text-lg">{recipe.name}</CardTitle>
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                    {recipe.description || 'Sem descrição'}
                                </p>
                            </CardHeader>
                            <CardContent className="flex-1 space-y-3">
                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        {(recipe.prep_time_min || 0) + (recipe.cook_time_min || 0)} min
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Users className="h-3 w-3" />
                                        {recipe.servings} porções
                                    </div>
                                </div>
                                {recipe.nutrition_preview && (
                                    <div className="flex gap-2 mt-2">
                                        <Badge variant="secondary" className="text-xs">
                                            {Number(recipe.nutrition_preview.calories || 0).toFixed(0)} kcal
                                        </Badge>
                                        <Badge variant="outline" className="text-xs">
                                            P: {Number(recipe.nutrition_preview.protein || 0).toFixed(0)}g
                                        </Badge>
                                    </div>
                                )}
                            </CardContent>
                            <CardFooter>
                                <Button variant="ghost" className="w-full text-sm">Ver Detalhes</Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
