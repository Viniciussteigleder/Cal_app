import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function StudioPatientsPage() {
  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Pacientes ativos</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
            <div className="grid gap-1">
              <label className="text-sm font-medium">Buscar paciente</label>
              <Input placeholder="Nome, e-mail ou prontuário" />
            </div>
            <Button>Novo paciente</Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Paciente</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Última consulta</TableHead>
                <TableHead>Plano ativo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Maria Silva</TableCell>
                <TableCell>Ativo</TableCell>
                <TableCell>15/01/2026</TableCell>
                <TableCell>Versão 3</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>João Pereira</TableCell>
                <TableCell>Ativo</TableCell>
                <TableCell>09/01/2026</TableCell>
                <TableCell>Versão 2</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
