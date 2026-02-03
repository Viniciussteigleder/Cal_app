"use client";

import { useState } from "react";
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, Clock, Users, Star, ChefHat, Wand2, Calculator, Save, Undo, Redo, Type, Grid, X } from "lucide-react";

const SAMPLE_RECIPES = [
  {
    id: "1",
    name: "Frango Grelhado com Legumes",
    description: "Peito de frango grelhado com mix de vegetais salteados",
    prepTime: 15,
    cookTime: 25,
    servings: 2,
    tags: ["high_protein", "low_carb"],
    isFavorite: true,
    isPublic: true,
    nutrients: { energy_kcal: 350, protein_g: 42, carbs_g: 12, fat_g: 14 },
  },
  {
    id: "2",
    name: "Salada Caesar Light",
    description: "Salada com alface romana, croutons integrais e molho light",
    prepTime: 10,
    cookTime: 0,
    servings: 1,
    tags: ["low_fodmap", "vegetarian"],
    isFavorite: false,
    isPublic: true,
    nutrients: { energy_kcal: 220, protein_g: 8, carbs_g: 18, fat_g: 12 },
  },
  {
    id: "3",
    name: "Bowl de Quinoa com Salmão",
    description: "Quinoa com salmão grelhado, abacate e vegetais",
    prepTime: 20,
    cookTime: 15,
    servings: 1,
    tags: ["omega3", "high_protein", "gluten_free"],
    isFavorite: true,
    isPublic: true,
    nutrients: { energy_kcal: 520, protein_g: 38, carbs_g: 32, fat_g: 26 },
  },
];

const TAG_LABELS: Record<string, string> = {
  high_protein: "Alto Proteína",
  low_carb: "Low Carb",
  low_fodmap: "Low FODMAP",
  vegetarian: "Vegetariano",
  gluten_free: "Sem Glúten",
  lactose_free: "Sem Lactose",
  omega3: "Rico em Ômega 3",
};

function RecipeCard({ recipe }: { recipe: any }) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg">{recipe.name}</CardTitle>
              {recipe.isFavorite && (
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              )}
            </div>
            <CardDescription className="mt-1 line-clamp-1">{recipe.description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-1">
            {recipe.tags.map((tag: string) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {TAG_LABELS[tag] || tag}
              </Badge>
            ))}
          </div>

          <div className="grid grid-cols-4 gap-2 text-center text-xs bg-muted/50 rounded-lg p-2">
            <div>
              <div className="font-semibold">{recipe.nutrients.energy_kcal}</div>
              <div className="text-muted-foreground">kcal</div>
            </div>
            <div>
              <div className="font-semibold">{recipe.nutrients.protein_g}g</div>
              <div className="text-muted-foreground">prot</div>
            </div>
            <div>
              <div className="font-semibold">{recipe.nutrients.carbs_g}g</div>
              <div className="text-muted-foreground">carb</div>
            </div>
            <div>
              <div className="font-semibold">{recipe.nutrients.fat_g}g</div>
              <div className="text-muted-foreground">gord</div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t text-sm text-muted-foreground">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {recipe.prepTime + recipe.cookTime} min
              </span>
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {recipe.servings}
              </span>
            </div>
            {recipe.isPublic && (
              <Badge variant="outline" className="text-xs">Publicada</Badge>
            )}
          </div>

          <Button variant="outline" className="w-full" size="sm">
            Ver Receita
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function RecipesPage() {
  const [isNewRecipeOpen, setIsNewRecipeOpen] = useState(false);
  const [recipeType, setRecipeType] = useState<"calculated" | "common">("calculated");
  const [unitType, setUnitType] = useState<"solid" | "liquid">("solid");
  const [description, setDescription] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateDescription = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setDescription(`Receita saudável e equilibrada, perfeita para o dia a dia. 
      
Ingredientes:
- 1 xícara de...
- 2 colheres de...

Modo de Preparo:
1. Misture tudo...
2. Leve ao forno...`);
      setIsGenerating(false);
    }, 1500);
  };

  return (
    <DashboardLayout role="nutritionist">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <ChefHat className="h-8 w-8 text-primary" />
            Receitas Culinárias
          </h1>
          <p className="text-muted-foreground mt-1">
            Crie e gerencie receitas com cálculos nutricionais e geração automática com IA
          </p>
        </div>

        {/* Search and Actions */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar receitas..." className="pl-9" />
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Star className="h-4 w-4 mr-2" />
              Favoritos
            </Button>

            <Dialog open={isNewRecipeOpen} onOpenChange={setIsNewRecipeOpen}>
              <DialogTrigger asChild>
                <Button className="bg-emerald-600 hover:bg-emerald-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Receita
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Receitas culinárias</DialogTitle>
                  <DialogDescription className="hidden">Editor de receitas</DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                  {/* General Data */}
                  <div className="space-y-3 bg-card rounded-lg border p-4 shadow-sm">
                    <h3 className="font-semibold text-sm flex items-center justify-between cursor-pointer">
                      Dados gerais da receita
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="col-span-2">
                        <Input placeholder="Nome da receita (exibido para seu paciente)" />
                      </div>
                      <div>
                        <Input placeholder="Rendimento (porções)" type="number" />
                      </div>
                    </div>

                    <div className="flex items-center gap-0 w-full bg-muted p-1 rounded-lg">
                      <Button
                        variant={recipeType === "calculated" ? "default" : "ghost"}
                        className={`flex-1 rounded-md ${recipeType === "calculated" ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm" : "hover:bg-background"}`}
                        onClick={() => setRecipeType("calculated")}
                      >
                        receita calculada
                      </Button>
                      <Button
                        variant={recipeType === "common" ? "secondary" : "ghost"}
                        className={`flex-1 rounded-md ${recipeType === "common" ? "bg-muted-foreground/20 shadow-inner" : "hover:bg-background"}`}
                        onClick={() => setRecipeType("common")}
                      >
                        receita comum
                      </Button>
                    </div>
                  </div>

                  {/* Description & AI */}
                  <div className="space-y-3 bg-card rounded-lg border p-4 shadow-sm">
                    <h3 className="font-semibold text-sm flex items-center justify-between">
                      Descrição
                    </h3>

                    <div className="space-y-2">
                      <Label className="text-sm text-muted-foreground">Ingredientes, modo e dicas de preparo:</Label>

                      <div className="border rounded-md">
                        <div className="flex items-center gap-1 p-1 border-b bg-muted/20">
                          <div className="ml-auto">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 text-xs text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                              onClick={handleGenerateDescription}
                              disabled={isGenerating}
                            >
                              <Wand2 className={`h-3 w-3 mr-2 ${isGenerating ? "animate-spin" : ""}`} />
                              {isGenerating ? "Gerando com IA..." : "Gerar com IA"}
                            </Button>
                          </div>
                        </div>
                        <Textarea
                          className="border-0 focus-visible:ring-0 min-h-[150px] resize-y"
                          placeholder="Digite ou gere com IA..."
                          value={description}
                          onChange={e => setDescription(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsNewRecipeOpen(false)}>Cancelar</Button>
                  <Button className="bg-emerald-600 hover:bg-emerald-700 text-white w-full sm:w-auto">
                    <Save className="h-4 w-4 mr-2" />
                    Salvar Receita
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Filter Tags */}
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="cursor-pointer hover:bg-secondary">Todas</Badge>
          {Object.values(TAG_LABELS).map(label => (
            <Badge key={label} variant="outline" className="cursor-pointer hover:bg-secondary">{label}</Badge>
          ))}
        </div>

        {/* Recipe Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {SAMPLE_RECIPES.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
