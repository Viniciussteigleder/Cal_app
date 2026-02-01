import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function OwnerTenantsPage() {
  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Tenants cadastrados</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
            <div className="grid gap-1">
              <label className="text-sm font-medium">Buscar tenant</label>
              <Input placeholder="Clínica, status ou plano" />
            </div>
            <Button>Novo tenant</Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tenant</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Pacientes</TableHead>
                <TableHead>Planos ativos</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Clínica A</TableCell>
                <TableCell>Ativo</TableCell>
                <TableCell>120</TableCell>
                <TableCell>48</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Clínica B</TableCell>
                <TableCell>Ativo</TableCell>
                <TableCell>75</TableCell>
                <TableCell>31</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
