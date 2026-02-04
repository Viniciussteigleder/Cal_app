import React from 'react';
import { getRecipes } from './actions';
import { RecipeList } from './RecipeList';

export default async function RecipesPage() {
  const { success, data } = await getRecipes();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Livro de Receitas</h1>
        <p className="text-muted-foreground">Gerencie suas receitas e crie novas variações culinárias com IA.</p>
      </div>

      <RecipeList recipes={data || []} />
    </div>
  );
}
