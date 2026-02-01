import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Clock, AlertTriangle, Flame, Snowflake } from "lucide-react";

export default function PatientLogPage() {
  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Registro de Refeição</CardTitle>
          <CardDescription>
            Registre não apenas o que comeu, mas *como* comeu. Detalhes de preparo são essenciais.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">

          {/* Main Input Grid */}
          <div className="grid gap-4 md:grid-cols-[2fr_1fr]">
            <div className="grid gap-2">
              <label className="text-sm font-medium">Alimento / Ingrediente</label>
              <Input placeholder="Ex.: arroz branco, peito de frango..." />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Quantidade (g ou medidas)</label>
              <Input type="text" placeholder="Ex: 150g ou 2 colheres" />
            </div>
          </div>

          {/* Critical Histamine/Gut Conditions */}
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <label className="text-sm font-semibold text-slate-700">Condições de Preparo (Crítico para Histamina)</label>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center space-x-2">
                <Switch id="leftovers" />
                <Label htmlFor="leftovers" className="cursor-pointer text-sm font-medium text-slate-600">Sobras / Reaquecido</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="fermented" />
                <Label htmlFor="fermented" className="cursor-pointer text-sm font-medium text-slate-600">Fermentado / Em Conserva</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="processed" />
                <Label htmlFor="processed" className="cursor-pointer text-sm font-medium text-slate-600">Industrializado</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="fried" />
                <Label htmlFor="fried" className="cursor-pointer text-sm font-medium text-slate-600">Fritura</Label>
              </div>
            </div>
          </div>

          <Button className="w-full bg-slate-900 hover:bg-slate-800">Adicionar ao Diário</Button>

          {/* Current Plate Table */}
          <div className="space-y-2 pt-4">
            <h3 className="text-sm font-medium text-muted-foreground">Adicionados nesta refeição:</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Alimento</TableHead>
                  <TableHead>Detalhes</TableHead>
                  <TableHead>Condição</TableHead>
                  <TableHead>Energia</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Arroz branco cozido</TableCell>
                  <TableCell>150g</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] mr-1">Fresco</Badge>
                  </TableCell>
                  <TableCell>192 kcal</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Feijão preto</TableCell>
                  <TableCell>100g</TableCell>
                  <TableCell>
                    <Badge variant="destructive" className="bg-red-50 text-red-700 border-red-200 text-[10px] items-center gap-1">
                      <Clock className="w-3 h-3" /> Sobra (24h)
                    </Badge>
                  </TableCell>
                  <TableCell>77 kcal</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Quick Tips */}
      <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-xs text-blue-700 flex gap-2">
        <div className="font-bold">Dica do Nutri:</div>
        <div>Para reduzir histamina, prefira sempre alimentos preparados na hora. O congelamento interrompe a produção de histamina.</div>
      </div>
    </div>
  );
}
