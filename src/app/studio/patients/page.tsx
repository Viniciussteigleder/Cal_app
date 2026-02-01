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
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Pacientes</h1>
          <Button className="bg-slate-900 text-white hover:bg-slate-800">
            <Plus className="mr-2 h-4 w-4" /> Novo Paciente
          </Button>
        </div>

        <Card className="border-none shadow-card">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-medium">Lista de Pacientes Ativos</CardTitle>
              <div className="relative w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-500" />
                <Input placeholder="Buscar por nome..." className="pl-9 bg-slate-50 border-slate-200" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border border-slate-100 overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
                  <tr>
                    <th className="px-4 py-3">Paciente</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Última Consulta</th>
                    <th className="px-4 py-3">Plano Ativo</th>
                    <th className="px-4 py-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {[
                    { name: "Maria Silva", status: "Active", last: "15 Jan 2026", plan: "Hipertrofia v3" },
                    { name: "João Pereira", status: "Active", last: "09 Jan 2026", plan: "Manutenção v2" },
                    { name: "Ana Costa", status: "Pending", last: "22 Jan 2026", plan: "Em avaliação" },
                  ].map((patient, i) => (
                    <tr key={i} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-4 py-3 font-medium text-slate-900">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold">
                            {patient.name.charAt(0)}
                          </div>
                          {patient.name}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${patient.status === "Active"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                            : "bg-amber-50 text-amber-700 border border-amber-100"
                          }`}>
                          {patient.status === "Active" ? "Ativo" : "Pendente"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500">{patient.last}</td>
                      <td className="px-4 py-3 text-slate-500">{patient.plan}</td>
                      <td className="px-4 py-3 text-right">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-900">
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
