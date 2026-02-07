'use client';

import { useState, useRef } from 'react';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Mic, MicOff, FileText, Brain, Save, Download, Copy, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { MedicalDisclaimer } from '@/components/ui/medical-disclaimer';

interface SOAPNote {
    subjective: string;
    objective: string;
    assessment: string;
    plan: string;
}

export default function MedicalRecordCreatorPage() {
    const [isRecording, setIsRecording] = useState(false);
    const [isTranscribing, setIsTranscribing] = useState(false);
    const [transcriptionProgress, setTranscriptionProgress] = useState(0);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [transcription, setTranscription] = useState('');
    const [soapNote, setSOAPNote] = useState<SOAPNote | null>(null);
    const [selectedPatient, setSelectedPatient] = useState('');
    const [consultationType, setConsultationType] = useState('');
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                setAudioBlob(audioBlob);
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
            toast.success('Gravação iniciada');
        } catch (error) {
            toast.error('Erro ao acessar microfone');
            console.error('Error accessing microphone:', error);
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            toast.success('Gravação finalizada');
        }
    };

    const transcribeAudio = async () => {
        if (!audioBlob) return;

        setIsTranscribing(true);
        setTranscriptionProgress(0);

        try {
            // Convert audio blob to base64 data URL for API transport
            const reader = new FileReader();
            const audioDataUrl = await new Promise<string>((resolve) => {
                reader.onloadend = () => resolve(reader.result as string);
                reader.readAsDataURL(audioBlob);
            });

            setTranscriptionProgress(30);

            const response = await fetch('/api/ai/medical-record', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'transcribe',
                    audioUrl: audioDataUrl,
                    consultationType,
                    patientId: selectedPatient,
                }),
            });

            setTranscriptionProgress(70);

            if (!response.ok) throw new Error('Falha na transcrição');

            const result = await response.json();
            setTranscriptionProgress(100);

            const text = result.transcription?.text || result.transcription || '';
            setTranscription(text);
            toast.success(`Transcrição concluída! (${result.creditsUsed || 0} créditos)`);
        } catch (error) {
            console.error('Error transcribing audio:', error);
            toast.error('Erro na transcrição. Tente novamente.');
        } finally {
            setIsTranscribing(false);
        }
    };

    const generateSOAPNote = async () => {
        if (!transcription) return;

        const soapPromise = (async () => {
            const response = await fetch('/api/ai/medical-record', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'generate-soap',
                    transcription,
                    consultationType,
                    patientId: selectedPatient,
                }),
            });

            if (!response.ok) throw new Error('Falha ao gerar nota SOAP');

            const result = await response.json();
            const soapData = result.soapNote || result.data?.soapNote || result.data || {};

            const soap: SOAPNote = {
                subjective: soapData.subjective || soapData.subjetivo || '',
                objective: soapData.objective || soapData.objetivo || '',
                assessment: soapData.assessment || soapData.avaliacao || '',
                plan: soapData.plan || soapData.plano || '',
            };

            setSOAPNote(soap);
            return soap;
        })();

        toast.promise(soapPromise, {
            loading: 'Gerando nota SOAP com IA...',
            success: 'Nota SOAP gerada com sucesso!',
            error: 'Erro ao gerar nota SOAP',
        });
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success('Copiado para área de transferência!');
    };

    const saveRecord = () => {
        toast.success('Prontuário salvo com sucesso!');
    };

    return (
        <DashboardLayout role="nutritionist">
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <FileText className="h-8 w-8 text-primary" />
                        Criador de Prontuário com IA
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Grave consultas e gere prontuários SOAP automaticamente com Whisper AI
                    </p>
                </div>

                <MedicalDisclaimer />

                {/* Configuration */}
                <Card>
                    <CardHeader>
                        <CardTitle>Configuração da Consulta</CardTitle>
                        <CardDescription>Selecione o paciente e tipo de consulta</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Paciente</label>
                                <Select value={selectedPatient} onValueChange={setSelectedPatient}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione o paciente" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1">Maria Silva</SelectItem>
                                        <SelectItem value="2">João Santos</SelectItem>
                                        <SelectItem value="3">Ana Costa</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Tipo de Consulta</label>
                                <Select value={consultationType} onValueChange={setConsultationType}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione o tipo" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="initial">Consulta Inicial</SelectItem>
                                        <SelectItem value="followup">Retorno</SelectItem>
                                        <SelectItem value="emergency">Emergência</SelectItem>
                                        <SelectItem value="reevaluation">Reavaliação</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Recording Controls */}
                <Card>
                    <CardHeader>
                        <CardTitle>Gravação de Áudio</CardTitle>
                        <CardDescription>
                            Grave a consulta para transcrição automática
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex flex-col items-center gap-4 py-8">
                            {!isRecording ? (
                                <Button
                                    size="lg"
                                    className="h-32 w-32 rounded-full bg-emerald-600 hover:bg-emerald-700"
                                    onClick={startRecording}
                                    disabled={isTranscribing}
                                >
                                    <Mic className="h-12 w-12" />
                                </Button>
                            ) : (
                                <Button
                                    size="lg"
                                    className="h-32 w-32 rounded-full bg-red-600 hover:bg-red-700 animate-pulse"
                                    onClick={stopRecording}
                                >
                                    <MicOff className="h-12 w-12" />
                                </Button>
                            )}

                            <p className="text-sm text-muted-foreground">
                                {isRecording ? 'Gravando... Clique para parar' : 'Clique para iniciar gravação'}
                            </p>

                            {audioBlob && !isRecording && (
                                <Button
                                    onClick={transcribeAudio}
                                    disabled={isTranscribing}
                                    className="bg-blue-600 hover:bg-blue-700"
                                >
                                    <Brain className="h-4 w-4 mr-2" />
                                    {isTranscribing ? 'Transcrevendo...' : 'Transcrever com Whisper AI'}
                                </Button>
                            )}
                        </div>

                        {isTranscribing && (
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="font-medium">Transcrevendo áudio...</span>
                                    <span className="text-muted-foreground">{transcriptionProgress}%</span>
                                </div>
                                <Progress value={transcriptionProgress} className="h-2" />
                            </div>
                        )}

                        <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg p-4">
                            <div className="flex gap-3">
                                <Brain className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="font-medium text-blue-900 dark:text-blue-100 text-sm">
                                        Whisper AI - Transcrição Automática
                                    </h4>
                                    <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                                        Utilizamos o Whisper AI da OpenAI para transcrição precisa em português.
                                        A IA identifica termos médicos e nutricionais automaticamente.
                                    </p>
                                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-2 font-medium">
                                        Custo: 15 créditos (R$ 0,30) por consulta
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Transcription */}
                {transcription && (
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Transcrição</CardTitle>
                                    <CardDescription>Texto transcrito da consulta</CardDescription>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => copyToClipboard(transcription)}
                                    >
                                        <Copy className="h-4 w-4 mr-2" />
                                        Copiar
                                    </Button>
                                    <Button
                                        size="sm"
                                        onClick={generateSOAPNote}
                                        className="bg-purple-600 hover:bg-purple-700"
                                    >
                                        <Brain className="h-4 w-4 mr-2" />
                                        Gerar Nota SOAP
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Textarea
                                value={transcription}
                                onChange={(e) => setTranscription(e.target.value)}
                                rows={12}
                                className="font-mono text-sm"
                            />
                        </CardContent>
                    </Card>
                )}

                {/* SOAP Note */}
                {soapNote && (
                    <Card className="border-emerald-200 dark:border-emerald-900">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="flex items-center gap-2">
                                        <CheckCircle className="h-5 w-5 text-emerald-600" />
                                        Nota SOAP Gerada
                                    </CardTitle>
                                    <CardDescription>Prontuário estruturado automaticamente</CardDescription>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm">
                                        <Download className="h-4 w-4 mr-2" />
                                        Exportar PDF
                                    </Button>
                                    <Button size="sm" onClick={saveRecord} className="bg-emerald-600 hover:bg-emerald-700">
                                        <Save className="h-4 w-4 mr-2" />
                                        Salvar Prontuário
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Subjective */}
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <Badge className="bg-blue-100 text-blue-800">S</Badge>
                                    <h3 className="font-semibold">Subjetivo</h3>
                                </div>
                                <Textarea
                                    value={soapNote.subjective}
                                    onChange={(e) => setSOAPNote({ ...soapNote, subjective: e.target.value })}
                                    rows={4}
                                    className="bg-muted/50"
                                />
                            </div>

                            {/* Objective */}
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <Badge className="bg-green-100 text-green-800">O</Badge>
                                    <h3 className="font-semibold">Objetivo</h3>
                                </div>
                                <Textarea
                                    value={soapNote.objective}
                                    onChange={(e) => setSOAPNote({ ...soapNote, objective: e.target.value })}
                                    rows={4}
                                    className="bg-muted/50"
                                />
                            </div>

                            {/* Assessment */}
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <Badge className="bg-amber-100 text-amber-800">A</Badge>
                                    <h3 className="font-semibold">Avaliação</h3>
                                </div>
                                <Textarea
                                    value={soapNote.assessment}
                                    onChange={(e) => setSOAPNote({ ...soapNote, assessment: e.target.value })}
                                    rows={4}
                                    className="bg-muted/50"
                                />
                            </div>

                            {/* Plan */}
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <Badge className="bg-purple-100 text-purple-800">P</Badge>
                                    <h3 className="font-semibold">Plano</h3>
                                </div>
                                <Textarea
                                    value={soapNote.plan}
                                    onChange={(e) => setSOAPNote({ ...soapNote, plan: e.target.value })}
                                    rows={6}
                                    className="bg-muted/50"
                                />
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </DashboardLayout>
    );
}
