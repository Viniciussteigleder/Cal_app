import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { TenantList } from "./TenantList";
import { getTenants } from "./actions";

export default async function OwnerTenantsPage() {
  const { success, data } = await getTenants();

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

          <TenantList tenants={data || []} />
        </CardContent>
      </Card>
    </div>
  );
}
