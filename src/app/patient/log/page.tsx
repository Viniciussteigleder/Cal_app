'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Clock,
  AlertTriangle,
  Flame,
  Snowflake,
  Star,
  History,
  Download,
  Mic,
  ScanBarcode,
  X,
  Search,
  ExternalLink,
  ChevronRight,
  AlertCircle
} from "lucide-react";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const MOCK_FOODS = [
  "Arroz branco cozido",
  "Feijão preto cozido",
  "Frango grelhado",
  "Ovo mexido",
  "Banana prata",
  "Maçã fuji",
  "Alface crespa",
  "Tomate sweet grape",
  "Azeite de oliva",
  "Salmão assado"
];

const FAVORITES = [
  { name: "Arroz Branco", cal: 130 },
  { name: "Peito de Frango", cal: 165 },
  { name: "Ovo Cozido", cal: 70 },
  { name: "Banana", cal: 90 }
];

const RECENT = [
  { name: "Feijão Preto", date: "Há 4h" },
  { name: "Salada de Alface", date: "Ontem" },
  { name: "Iogurte Natural", date: "Ontem" }
];

export default function PatientLogPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [logToDelete, setLogToDelete] = useState<string | null>(null);

  const suggestions = useMemo(() => {
    if (!searchTerm) return [];
    return MOCK_FOODS.filter(f => f.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [searchTerm]);

  const handleExportCSV = () => {
    toast.success("Diário exportado com sucesso (CSV). Verifique seus downloads.");
  };

  const confirmDelete = (item: string) => {
    setLogToDelete(item);
    setShowConfirmDelete(true);
  };

  const executeDelete = () => {
    toast.success(`Registro de "${logToDelete}" removido.`);
    setShowConfirmDelete(false);
    setLogToDelete(null);
  };

  return (
    <div className="grid gap-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Registro de Refeição</h1>
          <p className="text-sm text-slate-500">Adicione ingredientes e monitore gatilhos histamínicos.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExportCSV}>
            <Download className="w-4 h-4 mr-2" />
            Exportar CSV
          </Button>
          <div className="flex border rounded-lg overflow-hidden h-9">
            <Button variant="ghost" size="icon" className="h-full rounded-none border-r"><Mic className="w-4 h-4 text-slate-500" /></Button>
            <Button variant="ghost" size="icon" className="h-full rounded-none"><ScanBarcode className="w-4 h-4 text-slate-500" /></Button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          <Card className="border-none shadow-card">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">O que você comeu?</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6">

              {/* Main Input Grid with Autocomplete Mock */}
              <div className="grid gap-4 md:grid-cols-[2fr_1fr]">
                <div className="grid gap-2 relative">
                  <label className="text-sm font-medium">Alimento / Ingrediente</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar alimento..."
                      className="pl-9"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  {suggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 z-10 bg-white border rounded-md shadow-lg mt-1 overflow-hidden">
                      {suggestions.map((s, i) => (
                        <div
                          key={i}
                          className="px-4 py-2 hover:bg-slate-50 cursor-pointer text-sm border-b last:border-0 border-slate-100"
                          onClick={() => {
                            setSearchTerm(s);
                            // Set search term but hide suggestions by some state logic
                          }}
                        >
                          {s}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Quantidade</label>
                  <Input type="text" placeholder="Ex: 150g ou 2 colheres" />
                </div>
              </div>

              {/* Critical Histamine/Gut Conditions */}
              <div className="rounded-xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-4 space-y-4 shadow-sm">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-emerald-600" />
                  <label className="text-sm font-bold text-emerald-900">Condições Críticas (Histamina)</label>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch id="leftovers" />
                    <Label htmlFor="leftovers" className="cursor-pointer text-sm font-medium text-slate-600">Sobra (24h+)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="fermented" />
                    <Label htmlFor="fermented" className="cursor-pointer text-sm font-medium text-slate-600">Fermentado</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="processed" />
                    <Label htmlFor="processed" className="cursor-pointer text-sm font-medium text-slate-600">Processado</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="reheated" />
                    <Label htmlFor="reheated" className="cursor-pointer text-sm font-medium text-slate-600">Reaquecido</Label>
                  </div>
                </div>
              </div>

              <Button className="w-full bg-slate-900 hover:bg-slate-800 h-11 text-white shadow-lg shadow-slate-200">
                Adicionar à Refeição
              </Button>

              {/* Current Plate Table */}
              <div className="space-y-3 pt-2">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-semibold text-slate-700">Composição do Prato</h3>
                  <span className="text-xs text-slate-500">Refeição Total: <span className="font-bold">269 kcal</span></span>
                </div>
                <Table>
                  <TableHeader className="bg-slate-50">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="w-[45%]">Item</TableHead>
                      <TableHead>Qtd</TableHead>
                      <TableHead>Segurança</TableHead>
                      <TableHead className="text-right">Ação</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium text-slate-900">Arroz branco cozido</TableCell>
                      <TableCell>150g</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">Fresco</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400 hover:text-red-500" onClick={() => confirmDelete("Arroz branco")}>
                          <X className="w-3 h-3" />
                        </Button>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium text-slate-900">Feijão preto</TableCell>
                      <TableCell>100g</TableCell>
                      <TableCell>
                        <Badge variant="destructive" className="bg-red-50 text-red-700 border-red-200 text-[10px] items-center gap-1">
                          <Clock className="w-3 h-3" /> Sobra
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400 hover:text-red-500" onClick={() => confirmDelete("Feijão preto")}>
                          <X className="w-3 h-3" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Log Sidebar */}
        <div className="space-y-6">
          <Card className="border-none shadow-card">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                Lancamento Rápido (Favoritos)
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-2">
              {FAVORITES.map((f, i) => (
                <div key={i} className="group flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors border border-transparent hover:border-slate-100">
                  <div>
                    <div className="text-sm font-medium text-slate-900">{f.name}</div>
                    <div className="text-[10px] text-slate-500">{f.cal} kcal / 100g</div>
                  </div>
                  <Button variant="ghost" size="sm" className="h-7 px-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-none shadow-card">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <History className="w-4 h-4 text-blue-500" />
                Adicionados Recentemente
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-2">
              {RECENT.map((r, i) => (
                <div key={i} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg cursor-pointer border border-transparent hover:border-slate-100 transition-all">
                  <div className="text-sm font-medium text-slate-700">{r.name}</div>
                  <Badge variant="secondary" className="text-[9px] bg-slate-100 text-slate-500 border-none">{r.date}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Tips / Info */}
          <div className="bg-blue-600 rounded-2xl p-6 text-white shadow-xl shadow-blue-100 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform">
              <Flame className="w-24 h-24" />
            </div>
            <div className="relative z-10">
              <h4 className="font-bold text-lg mb-2">Dica de Hoje</h4>
              <p className="text-blue-100 text-sm leading-relaxed">
                Congelar sobras imediatamente após o preparo trava o nível de histamina. É a melhor estratégia para quem tem vida corrida!
              </p>
              <Button variant="link" className="text-white p-0 h-auto mt-4 text-xs hover:translate-x-1 transition-transform">
                Ler mais no Protocolo SIGHI <ExternalLink className="w-3 h-3 ml-2 inline" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDelete} onOpenChange={setShowConfirmDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Você tem certeza que deseja remover "{logToDelete}" da sua refeição atual?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowConfirmDelete(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={executeDelete}>Excluir</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
