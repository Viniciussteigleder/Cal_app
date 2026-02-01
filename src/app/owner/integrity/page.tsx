import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function OwnerIntegrityPage() {
  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Verificações de integridade</CardTitle>
          <p className="text-sm text-muted-foreground">
            Execute canários, validações de snapshots e checagens de RLS.
          </p>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-3">
          <Button>Executar checagens</Button>
          <Button variant="outline">Ver histórico</Button>
        </CardContent>
      </Card>
    </div>
  );
}
