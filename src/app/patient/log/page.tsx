import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function PatientLogPage() {
  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Registro de refeições</CardTitle>
          <p className="text-sm text-muted-foreground">
            Os valores mostrados aqui refletem a base de dados escolhida pelo seu
            nutricionista.
          </p>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-3 md:grid-cols-[2fr_1fr_auto] md:items-end">
            <div className="grid gap-1">
              <label className="text-sm font-medium">Buscar alimento</label>
              <Input placeholder="Ex.: arroz branco cozido" />
            </div>
            <div className="grid gap-1">
              <label className="text-sm font-medium">Quantidade (g)</label>
              <Input type="number" placeholder="150" />
            </div>
            <Button>Adicionar</Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Alimento</TableHead>
                <TableHead>Quantidade</TableHead>
                <TableHead>Energia</TableHead>
                <TableHead>Fonte</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Arroz branco cozido</TableCell>
                <TableCell>150g</TableCell>
                <TableCell>192 kcal</TableCell>
                <TableCell>TACO v7.1</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Feijão preto cozido</TableCell>
                <TableCell>100g</TableCell>
                <TableCell>77 kcal</TableCell>
                <TableCell>TACO v7.1</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
