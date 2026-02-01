import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Clock, Users, Star, ChefHat } from "lucide-react";

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
  {
    id: "4",
    name: "Smoothie Verde Proteico",
    description: "Shake com espinafre, banana, whey e leite de amêndoas",
    prepTime: 5,
    cookTime: 0,
    servings: 1,
    tags: ["high_protein", "lactose_free"],
    isFavorite: false,
    isPublic: false,
    nutrients: { energy_kcal: 280, protein_g: 28, carbs_g: 24, fat_g: 8 },
  },
  {
    id: "5",
    name: "Omelete de Claras com Espinafre",
    description: "Omelete leve com claras de ovo e espinafre refogado",
    prepTime: 5,
    cookTime: 8,
    servings: 1,
    tags: ["high_protein", "low_carb", "low_fodmap"],
    isFavorite: true,
    isPublic: true,
    nutrients: { energy_kcal: 180, protein_g: 24, carbs_g: 4, fat_g: 8 },
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

function RecipeCard({ recipe }: { recipe: typeof SAMPLE_RECIPES[0] }) {
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
            <CardDescription className="mt-1">{recipe.description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Tags */}
          <div className="flex flex-wrap gap-1">
            {recipe.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {TAG_LABELS[tag] || tag}
              </Badge>
            ))}
          </div>

          {/* Nutrients Summary */}
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

          {/* Meta Info */}
          <div className="flex items-center justify-between pt-2 border-t text-sm text-muted-foreground">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {recipe.prepTime + recipe.cookTime} min
              </span>
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {recipe.servings} {recipe.servings === 1 ? "porção" : "porções"}
              </span>
            </div>
            {recipe.isPublic && (
              <Badge variant="outline" className="text-xs">Compartilhada</Badge>
            )}
          </div>

          <Button variant="outline" className="w-full" size="sm">
            Ver Receita Completa
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function RecipesPage() {
  return (
    <div className="space-y-6">
      {/* Header with search and actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar receitas..."
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Star className="h-4 w-4 mr-2" />
            Favoritos
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nova Receita
          </Button>
        </div>
      </div>

      {/* Filter Tags */}
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline" className="cursor-pointer hover:bg-secondary">
          Todas
        </Badge>
        <Badge variant="outline" className="cursor-pointer hover:bg-secondary">
          Alto Proteína
        </Badge>
        <Badge variant="outline" className="cursor-pointer hover:bg-secondary">
          Low FODMAP
        </Badge>
        <Badge variant="outline" className="cursor-pointer hover:bg-secondary">
          Sem Glúten
        </Badge>
        <Badge variant="outline" className="cursor-pointer hover:bg-secondary">
          Sem Lactose
        </Badge>
        <Badge variant="outline" className="cursor-pointer hover:bg-secondary">
          Vegetariano
        </Badge>
      </div>

      {/* Recipe Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {SAMPLE_RECIPES.map((recipe) => (
          <RecipeCard key={recipe.id} recipe={recipe} />
        ))}
      </div>

      {/* Substitutions Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ChefHat className="h-5 w-5" />
            Substituições Alimentares
          </CardTitle>
          <CardDescription>
            Tabela de equivalências para adaptações rápidas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground space-y-2">
            <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
              <span>Leite integral → Leite de amêndoas</span>
              <Badge variant="secondary">Sem Lactose</Badge>
            </div>
            <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
              <span>Farinha de trigo → Farinha de arroz</span>
              <Badge variant="secondary">Sem Glúten</Badge>
            </div>
            <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
              <span>Cebola → Parte verde do alho-poró</span>
              <Badge variant="secondary">Low FODMAP</Badge>
            </div>
          </div>
          <Button variant="link" className="mt-4 p-0">
            Ver todas as substituições →
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
