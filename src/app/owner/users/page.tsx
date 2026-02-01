import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function OwnerUsersPage() {
  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Usuários cross-tenant</CardTitle>
          <p className="text-sm text-muted-foreground">
            Gerencie perfis e roles com auditoria total.
          </p>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Tenant</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Owner Admin</TableCell>
                <TableCell>owner@nutriplan.com</TableCell>
                <TableCell>OWNER</TableCell>
                <TableCell>Clínica A</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Nutricionista A</TableCell>
                <TableCell>nutri-a@example.com</TableCell>
                <TableCell>TENANT_ADMIN</TableCell>
                <TableCell>Clínica A</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
