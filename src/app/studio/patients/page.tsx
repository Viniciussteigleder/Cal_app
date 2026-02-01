import DashboardLayout from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Plus, MoreHorizontal } from "lucide-react";

export default function StudioPatientsPage() {
  return (
    <DashboardLayout role="nutritionist">
      <div className="grid gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Pacientes</h1>
          <Button className="bg-slate-900 text-white hover:bg-slate-800">
            <Plus className="mr-2 h-4 w-4" /> Novo Paciente
          </Button>
        </div>

        <Card className="border-none shadow-card">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-medium">Lista de Pacientes Ativos</CardTitle>
              <div className="relative w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Buscar por nome..." className="pl-9 bg-muted/40 border-border" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border border-border overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/40 text-muted-foreground font-medium border-b border-border">
                  <tr>
                    <th className="px-4 py-3">Paciente</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Última Consulta</th>
                    <th className="px-4 py-3">Plano Ativo</th>
                    <th className="px-4 py-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-card">
                  {[
                    { name: "Maria Silva", status: "Active", last: "15 Jan 2026", plan: "Hipertrofia v3" },
                    { name: "João Pereira", status: "Active", last: "09 Jan 2026", plan: "Manutenção v2" },
                    { name: "Ana Costa", status: "Pending", last: "22 Jan 2026", plan: "Em avaliação" },
                  ].map((patient, i) => (
                    <tr key={i} className="hover:bg-muted/40/50 transition-colors group">
                      <td className="px-4 py-3 font-medium text-foreground">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 flex items-center justify-center text-xs font-bold">
                            {patient.name.charAt(0)}
                          </div>
                          {patient.name}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${patient.status === "Active"
                          ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-100"
                          : "bg-gradient-to-br from-emerald-50 to-white text-emerald-700 dark:text-emerald-400 border border-emerald-100"
                          }`}>
                          {patient.status === "Active" ? "Ativo" : "Pendente"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{patient.last}</td>
                      <td className="px-4 py-3 text-muted-foreground">{patient.plan}</td>
                      <td className="px-4 py-3 text-right">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
