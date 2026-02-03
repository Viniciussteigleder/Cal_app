"use client";

import { useState, useRef } from "react";
import { Upload, FileText, Calendar, Building, UserRound, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { toast } from "sonner";
import DashboardLayout from "@/components/layout/dashboard-layout";

const EXAM_TYPES = [
  { value: "blood_test", label: "Exame de Sangue" },
  { value: "urine_test", label: "Exame de Urina" },
  { value: "imaging", label: "Imagem (Raio-X, Ultrassom, etc.)" },
  { value: "hormone", label: "Exame Hormonal" },
  { value: "allergy", label: "Teste de Alergia" },
  { value: "other", label: "Outro" },
];

export default function PatientExamsPage() {
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [examType, setExamType] = useState("");
  const [examDate, setExamDate] = useState("");
  const [labName, setLabName] = useState("");
  const [doctorName, setDoctorName] = useState("");
  const [notes, setNotes] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== "application/pdf") {
        toast.error("Por favor, selecione um arquivo PDF");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Arquivo muito grande. Máximo 10MB");
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !examType || !examDate) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("examType", examType);
      formData.append("examDate", examDate);
      if (labName) formData.append("labName", labName);
      if (doctorName) formData.append("doctorName", doctorName);
      if (notes) formData.append("notes", notes);

      const response = await fetch("/api/patient/exams", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao enviar exame");
      }

      toast.success("Exame enviado com sucesso! A IA está processando o documento...");

      // Reset form
      setSelectedFile(null);
      setExamType("");
      setExamDate("");
      setLabName("");
      setDoctorName("");
      setNotes("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(error instanceof Error ? error.message : "Erro ao enviar exame");
    } finally {
      setUploading(false);
    }
  };

  return (
    <DashboardLayout role="patient">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Meus Exames</h1>
          <p className="text-muted-foreground mt-2">
            Compartilhe seus resultados de exames com sua nutricionista
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Enviar Novo Exame
            </CardTitle>
            <CardDescription>
              Envie seus exames em PDF. Nossa IA irá extrair automaticamente as informações principais.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* File Upload */}
            <div className="space-y-2">
              <Label htmlFor="file">
                Arquivo PDF <span className="text-destructive">*</span>
              </Label>
              <div
                className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                {selectedFile ? (
                  <div className="flex items-center justify-center gap-3">
                    <FileText className="w-8 h-8 text-primary" />
                    <div className="text-left">
                      <p className="font-medium text-foreground">{selectedFile.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-foreground font-medium">Clique para selecionar um arquivo PDF</p>
                    <p className="text-sm text-muted-foreground mt-1">Máximo 10MB</p>
                  </>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            </div>

            {/* Exam Type */}
            <div className="space-y-2">
              <Label htmlFor="examType">
                Tipo de Exame <span className="text-destructive">*</span>
              </Label>
              <select
                id="examType"
                value={examType}
                onChange={(e) => setExamType(e.target.value)}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Selecione o tipo</option>
                {EXAM_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Exam Date */}
            <div className="space-y-2">
              <Label htmlFor="examDate">
                Data do Exame <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="examDate"
                  type="date"
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Lab Name */}
            <div className="space-y-2">
              <Label htmlFor="labName">Laboratório (Opcional)</Label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="labName"
                  value={labName}
                  onChange={(e) => setLabName(e.target.value)}
                  placeholder="Nome do laboratório"
                  className="pl-10"
                />
              </div>
            </div>

            {/* Doctor Name */}
            <div className="space-y-2">
              <Label htmlFor="doctorName">Médico Solicitante (Opcional)</Label>
              <div className="relative">
                <UserRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="doctorName"
                  value={doctorName}
                  onChange={(e) => setDoctorName(e.target.value)}
                  placeholder="Nome do médico"
                  className="pl-10"
                />
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Observações (Opcional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Adicione qualquer observação relevante sobre este exame..."
                rows={4}
              />
            </div>

            {/* Submit Button */}
            <div className="flex gap-3">
              <Button
                onClick={handleUpload}
                disabled={uploading || !selectedFile || !examType || !examDate}
                className="flex-1"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Enviar Exame
                  </>
                )}
              </Button>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg p-4">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                    Como funciona?
                  </p>
                  <ul className="text-blue-800 dark:text-blue-200 space-y-1 list-disc list-inside">
                    <li>Envie seus exames em formato PDF</li>
                    <li>Nossa IA extrai automaticamente os dados principais</li>
                    <li>O documento original fica salvo para consulta futura</li>
                    <li>Sua nutricionista terá acesso completo aos resultados</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* TODO: List of uploaded exams */}
        <Card>
          <CardHeader>
            <CardTitle>Exames Enviados</CardTitle>
            <CardDescription>Histórico dos seus exames compartilhados</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground py-8">
              Nenhum exame enviado ainda. Envie seu primeiro exame acima!
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
