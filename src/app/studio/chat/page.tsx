"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Send,
  Bot,
  User,
  Sparkles,
  FileText,
  MessageSquare,
  ChevronRight,
  Plus,
  Loader2,
  Lightbulb,
  ClipboardList,
  TrendingUp,
  Calendar,
} from "lucide-react";
import { MOCK_PATIENT_CASES, MOCK_PATIENTS } from "@/lib/mock-data";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  patientContext?: string;
}

interface QuickPrompt {
  id: string;
  label: string;
  icon: React.ReactNode;
  prompt: string;
}

export default function AIChatPage() {
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messageIdRef = useRef(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const quickPrompts: QuickPrompt[] = [
    {
      id: "summary",
      label: "Resumo do Caso",
      icon: <FileText className="h-4 w-4" />,
      prompt: "Gere um resumo completo do caso deste paciente, incluindo anamnese, histórico de consultas e correlações identificadas.",
    },
    {
      id: "protocol",
      label: "Sugestão de Protocolo",
      icon: <ClipboardList className="h-4 w-4" />,
      prompt: "Com base no histórico, sugira ajustes no protocolo nutricional atual do paciente.",
    },
    {
      id: "correlations",
      label: "Análise de Correlações",
      icon: <TrendingUp className="h-4 w-4" />,
      prompt: "Analise as correlações entre alimentação e sintomas identificadas para este paciente.",
    },
    {
      id: "consultation",
      label: "Preparar Consulta",
      icon: <Calendar className="h-4 w-4" />,
      prompt: "Prepare uma lista de pontos para discutir na próxima consulta com este paciente.",
    },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (selectedPatient) {
      const patientCase = MOCK_PATIENT_CASES.find(c => c.patientId === selectedPatient);
      if (patientCase && patientCase.chatHistory.length > 0) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMessages(patientCase.chatHistory.map(m => ({
          ...m,
          patientContext: patientCase.patientName,
        })));
      } else {
         
        setMessages([]);
      }
    }
  }, [selectedPatient]);

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const patientName = MOCK_PATIENTS.find(p => p.id === selectedPatient)?.name || "Paciente";

    messageIdRef.current += 1;
    const userMessage: Message = {
      id: `msg-${messageIdRef.current}`,
      role: "user",
      content: content.trim(),
      timestamp: new Date().toISOString(),
      patientContext: patientName,
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const patientCase = MOCK_PATIENT_CASES.find(c => c.patientId === selectedPatient);

      let response = "";

      if (content.toLowerCase().includes("resumo") || content.toLowerCase().includes("caso")) {
        response = generateCaseSummary(patientCase, patientName);
      } else if (content.toLowerCase().includes("protocolo") || content.toLowerCase().includes("ajuste")) {
        response = generateProtocolSuggestion(patientCase, patientName);
      } else if (content.toLowerCase().includes("correlação") || content.toLowerCase().includes("padrão")) {
        response = generateCorrelationAnalysis(patientCase, patientName);
      } else if (content.toLowerCase().includes("consulta") || content.toLowerCase().includes("preparar")) {
        response = generateConsultationPrep(patientCase, patientName);
      } else {
        response = generateGeneralResponse(patientCase, patientName, content);
      }

      messageIdRef.current += 1;
      const assistantMessage: Message = {
        id: `msg-${messageIdRef.current}`,
        role: "assistant",
        content: response,
        timestamp: new Date().toISOString(),
        patientContext: patientName,
      };

      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1500);
  };

  const handleQuickPrompt = (prompt: string) => {
    if (!selectedPatient) return;
    handleSendMessage(prompt);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(inputValue);
    }
  };

  const startNewChat = () => {
    setMessages([]);
    inputRef.current?.focus();
  };

  return (
    <div className="flex h-[calc(100vh-120px)] gap-4">
      {/* Sidebar - Patient List */}
      <Card className="w-80 flex flex-col">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Chat IA por Paciente
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-auto p-2">
          <div className="space-y-1">
            {MOCK_PATIENTS.filter(p => p.status === "active").map((patient) => {
              const hasCase = MOCK_PATIENT_CASES.some(c => c.patientId === patient.id);
              return (
                <button
                  key={patient.id}
                  onClick={() => setSelectedPatient(patient.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors text-left ${
                    selectedPatient === patient.id
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                      selectedPatient === patient.id
                        ? "bg-primary-foreground/20 text-primary-foreground"
                        : "bg-primary/10 text-primary"
                    }`}>
                      {patient.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{patient.name}</p>
                      <p className={`text-xs ${
                        selectedPatient === patient.id
                          ? "text-primary-foreground/70"
                          : "text-muted-foreground"
                      }`}>
                        {patient.activePlan || "Sem plano ativo"}
                      </p>
                    </div>
                  </div>
                  {hasCase && (
                    <Badge variant={selectedPatient === patient.id ? "secondary" : "outline"} className="text-xs">
                      Caso
                    </Badge>
                  )}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Main Chat Area */}
      <Card className="flex-1 flex flex-col">
        {!selectedPatient ? (
          /* Empty State */
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
              <Bot className="h-10 w-10 text-primary" />
            </div>
            <h2 className="text-2xl font-semibold mb-2">Assistente IA Clínico</h2>
            <p className="text-muted-foreground max-w-md mb-8">
              Selecione um paciente para iniciar uma conversa. O assistente pode analisar casos,
              sugerir protocolos e preparar consultas com base nos dados do paciente.
            </p>
            <div className="grid grid-cols-2 gap-4 max-w-lg">
              {[
                { icon: FileText, title: "Resumo de Casos", desc: "Análise completa do histórico" },
                { icon: Lightbulb, title: "Insights Clínicos", desc: "Correlações e padrões" },
                { icon: ClipboardList, title: "Protocolos", desc: "Sugestões personalizadas" },
                { icon: Calendar, title: "Consultas", desc: "Preparação estruturada" },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 p-4 rounded-lg bg-muted/50 text-left">
                  <item.icon className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bot className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">
                    Chat com IA - {MOCK_PATIENTS.find(p => p.id === selectedPatient)?.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Assistente clínico para análise de casos
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={startNewChat}>
                <Plus className="h-4 w-4 mr-2" />
                Nova Conversa
              </Button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center">
                  <Sparkles className="h-12 w-12 text-primary/30 mb-4" />
                  <p className="text-muted-foreground mb-6">
                    Inicie uma conversa ou use os prompts rápidos abaixo
                  </p>

                  {/* Quick Prompts */}
                  <div className="grid grid-cols-2 gap-3 max-w-xl">
                    {quickPrompts.map((qp) => (
                      <button
                        key={qp.id}
                        onClick={() => handleQuickPrompt(qp.prompt)}
                        className="flex items-center gap-3 p-4 rounded-lg border hover:bg-muted transition-colors text-left"
                      >
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          {qp.icon}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{qp.label}</p>
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {qp.prompt.slice(0, 50)}...
                          </p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground ml-auto" />
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${
                        message.role === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      {message.role === "assistant" && (
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Bot className="h-4 w-4 text-primary" />
                        </div>
                      )}
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                          message.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        {message.role === "assistant" ? (
                          <div className="prose prose-sm dark:prose-invert max-w-none">
                            <MarkdownRenderer content={message.content} />
                          </div>
                        ) : (
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        )}
                        <p className={`text-xs mt-2 ${
                          message.role === "user"
                            ? "text-primary-foreground/70"
                            : "text-muted-foreground"
                        }`}>
                          {new Date(message.timestamp).toLocaleTimeString("pt-BR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                      {message.role === "user" && (
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                          <User className="h-4 w-4 text-primary-foreground" />
                        </div>
                      )}
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex gap-3 justify-start">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Bot className="h-4 w-4 text-primary" />
                      </div>
                      <div className="bg-muted rounded-2xl px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="text-sm text-muted-foreground">Analisando...</span>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Input Area */}
            <div className="p-4 border-t">
              <div className="flex gap-3">
                <Input
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Digite sua mensagem ou pergunta sobre o paciente..."
                  className="flex-1"
                  disabled={isLoading}
                />
                <Button
                  onClick={() => handleSendMessage(inputValue)}
                  disabled={!inputValue.trim() || isLoading}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                O assistente IA analisa dados do paciente para fornecer insights.
                Sempre valide as sugestões clinicamente.
              </p>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}

// Markdown renderer component
function MarkdownRenderer({ content }: { content: string }) {
  // Simple markdown parsing for common elements
  const lines = content.split("\n");

  return (
    <div className="space-y-2">
      {lines.map((line, i) => {
        // Headers
        if (line.startsWith("# ")) {
          return <h1 key={i} className="text-lg font-bold mt-4 mb-2">{line.slice(2)}</h1>;
        }
        if (line.startsWith("## ")) {
          return <h2 key={i} className="text-base font-semibold mt-3 mb-1">{line.slice(3)}</h2>;
        }
        if (line.startsWith("### ")) {
          return <h3 key={i} className="text-sm font-semibold mt-2">{line.slice(4)}</h3>;
        }

        // Bullets
        if (line.startsWith("- ") || line.startsWith("* ")) {
          const content = line.slice(2);
          return (
            <div key={i} className="flex gap-2 ml-2">
              <span className="text-muted-foreground">•</span>
              <span dangerouslySetInnerHTML={{ __html: parseBold(content) }} />
            </div>
          );
        }

        // Numbered lists
        const numberedMatch = line.match(/^(\d+)\.\s(.+)/);
        if (numberedMatch) {
          return (
            <div key={i} className="flex gap-2 ml-2">
              <span className="text-muted-foreground">{numberedMatch[1]}.</span>
              <span dangerouslySetInnerHTML={{ __html: parseBold(numberedMatch[2]) }} />
            </div>
          );
        }

        // Checkmarks
        if (line.startsWith("✅") || line.startsWith("⚠️")) {
          return <p key={i} className="ml-2">{line}</p>;
        }

        // Empty lines
        if (!line.trim()) {
          return <div key={i} className="h-2" />;
        }

        // Regular text
        return <p key={i} dangerouslySetInnerHTML={{ __html: parseBold(line) }} />;
      })}
    </div>
  );
}

function parseBold(text: string): string {
  return text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
}

// AI Response generators
function generateCaseSummary(patientCase: typeof MOCK_PATIENT_CASES[0] | undefined, patientName: string): string {
  if (!patientCase) {
    return `# Resumo do Caso - ${patientName}

## Dados Disponíveis
Ainda não há dados suficientes para gerar um resumo completo deste caso.

## Próximos Passos
1. Complete a anamnese inicial
2. Registre a primeira consulta
3. Defina o protocolo inicial
4. Oriente o paciente sobre registro de refeições e sintomas

*Após mais dados serem coletados, o assistente poderá gerar análises mais detalhadas.*`;
  }

  return `# Resumo do Caso - ${patientCase.patientName}

## Perfil do Paciente
- **Queixa Principal:** ${patientCase.anamnesis.mainComplaint}
- **Histórico:** ${patientCase.anamnesis.medicalHistory}
- **Medicações:** ${patientCase.anamnesis.medications.join(", ")}

## Objetivos
- **Principal:** ${patientCase.goals.primary}
- **Secundário:** ${patientCase.goals.secondary}
- **Prazo:** ${patientCase.goals.timeline}

## Evolução Clínica

### Consultas Realizadas
${patientCase.consultations.map(c => `- **${c.date}:** ${c.notes}`).join("\n")}

### Protocolo Atual
${patientCase.currentProtocol}

## Notas de Progresso
${patientCase.progressNotes.map(n => `✅ ${n}`).join("\n")}

## Estilo de Vida
- **Exercício:** ${patientCase.anamnesis.lifestyle.exercise}
- **Sono:** ${patientCase.anamnesis.lifestyle.sleep}
- **Estresse:** ${patientCase.anamnesis.lifestyle.stress}

## Próximos Passos Sugeridos
1. Avaliar progresso do protocolo atual
2. Revisar correlações identificadas
3. Considerar ajustes baseados nos sintomas recentes

*Esta análise é baseada nos dados disponíveis. Sempre valide clinicamente.*`;
}

function generateProtocolSuggestion(patientCase: typeof MOCK_PATIENT_CASES[0] | undefined, patientName: string): string {
  if (!patientCase) {
    return `# Sugestões de Protocolo - ${patientName}

Não há dados suficientes para sugerir um protocolo personalizado.

## Recomendações Iniciais
1. Realizar anamnese completa
2. Avaliar histórico alimentar
3. Identificar sintomas principais
4. Definir objetivos do tratamento

*Após coleta de dados, o assistente poderá sugerir protocolos específicos.*`;
  }

  return `# Sugestões de Protocolo - ${patientCase.patientName}

## Protocolo Atual
**${patientCase.currentProtocol}**

## Análise da Situação
Com base nos dados coletados:
- ${patientCase.progressNotes.join("\n- ")}

## Sugestões de Ajuste

### Curto Prazo (1-2 semanas)
1. **Manter eliminação** dos alimentos gatilho identificados
2. **Monitorar** consistência de registro (meta: 90%+)
3. **Avaliar** resposta aos ajustes recentes

### Médio Prazo (3-4 semanas)
1. **Iniciar reintrodução** gradual se sintomas estáveis
2. **Testar** um alimento por vez, em doses crescentes
3. **Documentar** janela de reação (tempo e intensidade)

### Considerações Especiais
- **Nível de estresse:** ${patientCase.anamnesis.lifestyle.stress}
  - Considerar abordagem integrativa se estresse alto
- **Exercício:** ${patientCase.anamnesis.lifestyle.exercise}
  - Ajustar timing das refeições se necessário

## Alertas
⚠️ Sempre validar sugestões com avaliação clínica
⚠️ Considerar fatores individuais não capturados nos dados

*Sugestões baseadas em padrões identificados. Use julgamento clínico.*`;
}

function generateCorrelationAnalysis(patientCase: typeof MOCK_PATIENT_CASES[0] | undefined, patientName: string): string {
  if (!patientCase) {
    return `# Análise de Correlações - ${patientName}

## Status
Dados insuficientes para análise de correlações.

## Requisitos para Análise
- Mínimo de 7 dias de registro alimentar
- Pelo menos 5 registros de sintomas
- Registro consistente de horários

*Continue coletando dados para análises mais precisas.*`;
  }

  return `# Análise de Correlações - ${patientCase.patientName}

## Correlações Identificadas

### Alta Confiança (>80%)
1. **Laticínios → Inchaço abdominal**
   - Confiança: 87%
   - Janela de reação: 30-90 minutos
   - Ocorrências: 5 eventos
   - **Recomendação:** Manter eliminação completa

### Média Confiança (60-80%)
2. **Refeições tardias → Desconforto noturno**
   - Confiança: 72%
   - Refeições após 21h correlacionadas
   - **Recomendação:** Antecipar última refeição

### Em Observação (<60%)
3. **Vegetais crus → Gases**
   - Confiança: 58%
   - Padrão emergente
   - **Recomendação:** Continuar monitoramento

## Padrões Temporais
- **Pico de sintomas:** 14h-16h (pós-almoço)
- **Melhor período:** Manhã (menos relatos)

## Análise de Adesão
- Consistência de registro: 85%
- Dias completos: 12/14
- Cobertura de sintomas: Alta

## Insights Adicionais
- Padrão sugere possível intolerância à lactose
- Considerar teste de hidrogênio expirado
- Avaliar enzima lactase se reintrodução desejada

*Correlações estatísticas não implicam causalidade. Avalie clinicamente.*`;
}

function generateConsultationPrep(patientCase: typeof MOCK_PATIENT_CASES[0] | undefined, patientName: string): string {
  if (!patientCase) {
    return `# Preparação para Consulta - ${patientName}

## Pauta Sugerida

### 1. Anamnese Inicial
- [ ] Histórico alimentar completo
- [ ] Histórico de sintomas
- [ ] Medicações e suplementos
- [ ] Estilo de vida

### 2. Avaliação
- [ ] Medidas antropométricas
- [ ] Avaliação nutricional
- [ ] Definir exames se necessário

### 3. Plano
- [ ] Definir objetivos
- [ ] Estabelecer protocolo inicial
- [ ] Orientar sobre uso do app

*Personalize conforme necessidade do paciente.*`;
  }

  return `# Preparação para Consulta - ${patientCase.patientName}

## Resumo Rápido
- **Protocolo atual:** ${patientCase.currentProtocol}
- **Última consulta:** ${patientCase.consultations[patientCase.consultations.length - 1]?.date || "N/A"}
- **Objetivo principal:** ${patientCase.goals.primary}

## Pontos para Discussão

### ✅ Progressos
${patientCase.progressNotes.map(n => `- ${n}`).join("\n")}

### ⚠️ Pontos de Atenção
- Avaliar sintomas residuais
- Verificar dificuldades com o protocolo
- Discutir próximas fases

## Perguntas para o Paciente
1. "Como você se sentiu nas últimas semanas em relação aos sintomas?"
2. "Teve dificuldades em seguir o protocolo?"
3. "Notou algum alimento específico que causou reação?"
4. "Como está o nível de energia e disposição?"
5. "Alguma mudança no estilo de vida recentemente?"

## Dados para Revisar
- [ ] Registro alimentar da última semana
- [ ] Log de sintomas
- [ ] Correlações identificadas pela IA
- [ ] Peso e medidas atuais

## Possíveis Ajustes
1. ${patientCase.currentProtocol.includes("Eliminação") ? "Avaliar início da fase de reintrodução" : "Revisar protocolo atual"}
2. Ajustar metas calóricas se necessário
3. Adicionar/remover alimentos do plano

## Próximos Passos Sugeridos
- Definir data da próxima consulta
- Atualizar tarefas no app
- Revisar lista de compras do paciente

*Pauta gerada automaticamente. Adapte conforme necessário.*`;
}

function generateGeneralResponse(patientCase: typeof MOCK_PATIENT_CASES[0] | undefined, patientName: string, question: string): string {
  return `# Resposta - ${patientName}

Obrigado pela pergunta! Deixe-me analisar com base nos dados disponíveis.

## Sobre "${question.slice(0, 50)}${question.length > 50 ? "..." : ""}"

${patientCase ? `
Com base no histórico de **${patientCase.patientName}**:

### Contexto
- **Protocolo:** ${patientCase.currentProtocol}
- **Objetivo:** ${patientCase.goals.primary}

### Análise
Os dados sugerem que o paciente está ${patientCase.progressNotes[0]?.toLowerCase() || "progredindo conforme esperado"}.

### Recomendação
Continue monitorando os registros e considere revisar na próxima consulta.
` : `
Ainda não há dados suficientes para uma análise detalhada deste paciente.

### Próximos Passos
1. Complete o cadastro do paciente
2. Realize a anamnese inicial
3. Oriente sobre o uso do aplicativo
`}

## Posso ajudar com mais alguma coisa?
- Análise de correlações
- Sugestões de protocolo
- Preparação de consulta
- Resumo do caso

*Use os prompts rápidos ou digite sua pergunta.*`;
}
