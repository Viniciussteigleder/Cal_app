"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Send,
  Paperclip,
  Image,
  Utensils,
  Activity,
  ChevronRight,
  User,
  Clock,
  CheckCheck,
  Loader2,
  Mic,
  Globe,
} from "lucide-react";
import { toast } from "sonner";
import { VoiceInput, processMultilingualText } from "@/components/voice-input";
import { MedicalDisclaimer } from "@/components/ui/medical-disclaimer";

interface Message {
  id: string;
  role: "patient" | "nutritionist";
  content: string;
  timestamp: string;
  attachments?: Array<{
    type: "meal" | "symptom";
    title: string;
    subtitle: string;
  }>;
  status?: "sent" | "delivered" | "read";
  detectedLanguages?: string[];
}

interface QuickTemplate {
  id: string;
  label: string;
  message: string;
  icon: React.ReactNode;
}

export default function PatientChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "nutritionist",
      content: "Olá Maria! Vi que você está mantendo uma boa consistência nos registros. Como está se sentindo com o novo protocolo?",
      timestamp: "2024-01-30T09:00:00Z",
    },
    {
      id: "2",
      role: "patient",
      content: "Oi Dr. Carlos! Estou me sentindo bem melhor. Os sintomas de inchaço diminuíram bastante desde que comecei a evitar laticínios.",
      timestamp: "2024-01-30T09:30:00Z",
      status: "read",
    },
    {
      id: "3",
      role: "nutritionist",
      content: "Que ótimo! Isso confirma nossa suspeita sobre a sensibilidade à lactose. Vamos manter a eliminação por mais 2 semanas e depois começar a reintrodução gradual. Alguma dificuldade com o plano?",
      timestamp: "2024-01-30T10:00:00Z",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [showVoiceInput, setShowVoiceInput] = useState(false);
  const messageIdRef = useRef(0);
  const [voiceInterimText, setVoiceInterimText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickTemplates: QuickTemplate[] = [
    {
      id: "symptom",
      label: "Relatar sintoma",
      message: "Senti [sintoma] depois de [refeição]. Intensidade [1-10].",
      icon: <Activity className="h-4 w-4" />,
    },
    {
      id: "substitution",
      label: "Pedir substituição",
      message: "Preciso de uma substituição para [alimento] no meu plano.",
      icon: <Utensils className="h-4 w-4" />,
    },
    {
      id: "doubt",
      label: "Tirar dúvida",
      message: "Tenho uma dúvida sobre [assunto].",
      icon: <User className="h-4 w-4" />,
    },
    {
      id: "appointment",
      label: "Agendar consulta",
      message: "Gostaria de agendar a próxima consulta.",
      icon: <Clock className="h-4 w-4" />,
    },
  ];

  const recentMeals = [
    { id: "meal-1", title: "Almoço", time: "12:30", items: "Arroz, feijão, frango" },
    { id: "meal-2", title: "Café da manhã", time: "07:30", items: "Ovo, pão" },
  ];

  const recentSymptoms = [
    { id: "sym-1", title: "Inchaço leve", time: "14:00", intensity: 3 },
  ];

  const languageFlags: Record<string, string> = {
    "pt-BR": "🇧🇷",
    "de-DE": "🇩🇪",
    "en-US": "🇺🇸",
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (content: string, attachments?: Message["attachments"], detectedLanguages?: string[]) => {
    if (!content.trim() && !attachments?.length) return;

    messageIdRef.current += 1;
    const newMessage: Message = {
      id: `msg-${messageIdRef.current}`,
      role: "patient",
      content: content.trim(),
      timestamp: new Date().toISOString(),
      attachments,
      status: "sent",
      detectedLanguages,
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputValue("");
    setVoiceInterimText("");
    setShowVoiceInput(false);
    setIsLoading(true);

    // Simulate message delivery
    setTimeout(() => {
      setMessages((prev) =>
        prev.map((m) => (m.id === newMessage.id ? { ...m, status: "delivered" } : m))
      );
    }, 500);

    // Simulate nutritionist typing and response
    setTimeout(() => {
      setMessages((prev) =>
        prev.map((m) => (m.id === newMessage.id ? { ...m, status: "read" } : m))
      );

      messageIdRef.current += 1;
      const response: Message = {
        id: `msg-${messageIdRef.current}`,
        role: "nutritionist",
        content: "Obrigado por compartilhar! Vou analisar e já respondo. Me avise se for urgente!",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, response]);
      setIsLoading(false);
    }, 2000);
  };

  const handleVoiceTranscript = (text: string, language?: string) => {
    const processed = processMultilingualText(text);

    // Add to input or send directly
    if (inputValue) {
      setInputValue(inputValue + " " + text);
    } else {
      setInputValue(text);
    }

    // Show toast with detected info
    if (processed.foodMentions.length > 0) {
      toast.success(`Detectados: ${processed.foodMentions.join(", ")}`, {
        description: `Idiomas: ${processed.detectedLanguages.map(l => languageFlags[l] || l).join(" ")}`,
      });
    }
  };

  const handleVoiceInterim = (text: string) => {
    setVoiceInterimText(text);
  };

  const handleTemplateSelect = (template: QuickTemplate) => {
    setInputValue(template.message);
    setShowTemplates(false);
  };

  const handleAttachMeal = (meal: typeof recentMeals[0]) => {
    const attachment: Message["attachments"] = [
      {
        type: "meal",
        title: meal.title,
        subtitle: `${meal.time} - ${meal.items}`,
      },
    ];
    handleSendMessage(`Sobre minha refeição: ${meal.title}`, attachment);
    setShowAttachmentMenu(false);
  };

  const handleAttachSymptom = (symptom: typeof recentSymptoms[0]) => {
    const attachment: Message["attachments"] = [
      {
        type: "symptom",
        title: symptom.title,
        subtitle: `${symptom.time} - Intensidade ${symptom.intensity}/10`,
      },
    ];
    handleSendMessage(`Quero reportar: ${symptom.title}`, attachment);
    setShowAttachmentMenu(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(inputValue);
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case "read":
        return <CheckCheck className="h-3 w-3 text-blue-500" />;
      case "delivered":
        return <CheckCheck className="h-3 w-3 text-muted-foreground" />;
      default:
        return <Clock className="h-3 w-3 text-muted-foreground" />;
    }
  };

  return (
      <div className="max-w-2xl mx-auto h-[calc(100vh-120px)] flex flex-col">
        {/* Header */}
        <Card className="mb-4">
          <CardContent className="py-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-lg font-bold text-primary">DC</span>
              </div>
              <div className="flex-1">
                <h2 className="font-semibold">Dr. Carlos Nutricionista</h2>
                <p className="text-sm text-muted-foreground">
                  Geralmente responde em algumas horas
                </p>
              </div>
              <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-200">
                Online
              </Badge>
            </div>
          </CardContent>
        </Card>

        <div className="mb-4">
          <MedicalDisclaimer />
        </div>

        {/* Messages */}
        <Card className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === "patient" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    message.role === "patient"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  {/* Attachments */}
                  {message.attachments && message.attachments.length > 0 && (
                    <div className="mb-2 space-y-2">
                      {message.attachments.map((att, i) => (
                        <div
                          key={i}
                          className={`p-2 rounded-lg overflow-hidden ${
                            message.role === "patient"
                              ? "bg-primary-foreground/10"
                              : "bg-background"
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            {att.type === "meal" ? (
                              <Utensils className="h-4 w-4 flex-shrink-0" />
                            ) : (
                              <Activity className="h-4 w-4 flex-shrink-0" />
                            )}
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-medium truncate">{att.title}</p>
                              <p className="text-xs opacity-70 truncate">{att.subtitle}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>

                  <div className={`flex items-center justify-end gap-1 mt-1 ${
                    message.role === "patient"
                      ? "text-primary-foreground/70"
                      : "text-muted-foreground"
                  }`}>
                    {/* Language indicators for patient messages */}
                    {message.role === "patient" && message.detectedLanguages && message.detectedLanguages.length > 0 && (
                      <div className="flex items-center gap-0.5 mr-1">
                        {message.detectedLanguages.map((lang) => (
                          <span key={lang} className="text-xs">{languageFlags[lang] || ""}</span>
                        ))}
                      </div>
                    )}
                    <span className="text-xs">
                      {new Date(message.timestamp).toLocaleTimeString("pt-BR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    {message.role === "patient" && message.status && (
                      getStatusIcon(message.status)
                    )}
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-2xl px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm text-muted-foreground">
                      Escrevendo...
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Voice Input Panel */}
          {showVoiceInput && (
            <div className="p-4 border-t bg-gradient-to-r from-primary/5 to-primary/10">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mic className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Mensagem por voz</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Globe className="h-3 w-3" />
                    <span>🇧🇷 🇩🇪 🇺🇸</span>
                  </div>
                </div>

                <VoiceInput
                  onTranscript={handleVoiceTranscript}
                  onInterimTranscript={handleVoiceInterim}
                  placeholder="Toque para gravar sua mensagem..."
                  showLanguageIndicator={false}
                  autoLanguageDetection={true}
                />

                {/* Interim text preview */}
                {voiceInterimText && (
                  <div className="p-2 rounded-lg bg-background/80 border">
                    <p className="text-sm text-muted-foreground">{voiceInterimText}</p>
                  </div>
                )}

                <p className="text-xs text-muted-foreground text-center">
                  Fale em português, alemão ou inglês - ou misture os idiomas!
                </p>
              </div>
            </div>
          )}

          {/* Quick Templates */}
          {showTemplates && (
            <div className="p-3 border-t bg-muted/30">
              <p className="text-xs font-medium text-muted-foreground mb-2">
                Templates rápidos
              </p>
              <div className="flex flex-wrap gap-2">
                {quickTemplates.map((template) => (
                  <Button
                    key={template.id}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => handleTemplateSelect(template)}
                  >
                    {template.icon}
                    <span className="ml-1">{template.label}</span>
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Attachment Menu */}
          {showAttachmentMenu && (
            <div className="p-3 border-t bg-muted/30">
              <p className="text-xs font-medium text-muted-foreground mb-2">
                Anexar contexto
              </p>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-xs font-medium mb-1">Refeições recentes</p>
                  {recentMeals.map((meal) => (
                    <button
                      key={meal.id}
                      className="w-full p-2 text-left rounded-lg hover:bg-muted transition-colors flex items-center gap-2"
                      onClick={() => handleAttachMeal(meal)}
                    >
                      <Utensils className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{meal.title}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {meal.items}
                        </p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </button>
                  ))}
                </div>
                <div>
                  <p className="text-xs font-medium mb-1">Sintomas recentes</p>
                  {recentSymptoms.map((symptom) => (
                    <button
                      key={symptom.id}
                      className="w-full p-2 text-left rounded-lg hover:bg-muted transition-colors flex items-center gap-2"
                      onClick={() => handleAttachSymptom(symptom)}
                    >
                      <Activity className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{symptom.title}</p>
                        <p className="text-xs text-muted-foreground">
                          Intensidade {symptom.intensity}/10
                        </p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-3 border-t">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setShowAttachmentMenu(!showAttachmentMenu);
                  setShowTemplates(false);
                  setShowVoiceInput(false);
                }}
              >
                <Paperclip className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setShowTemplates(!showTemplates);
                  setShowAttachmentMenu(false);
                  setShowVoiceInput(false);
                }}
              >
                <Image className="h-5 w-5" />
              </Button>
              <Button
                variant={showVoiceInput ? "default" : "ghost"}
                size="icon"
                onClick={() => {
                  setShowVoiceInput(!showVoiceInput);
                  setShowTemplates(false);
                  setShowAttachmentMenu(false);
                }}
              >
                <Mic className="h-5 w-5" />
              </Button>
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Digite ou use voz (🇧🇷🇩🇪🇺🇸)..."
                className="flex-1"
              />
              <Button
                size="icon"
                onClick={() => handleSendMessage(inputValue)}
                disabled={!inputValue.trim() || isLoading}
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>

            {/* Language support indicator */}
            <p className="text-xs text-muted-foreground text-center mt-2">
              <Globe className="h-3 w-3 inline mr-1" />
              Suporte multilíngue: Português, Deutsch, English
            </p>
          </div>
        </Card>
      </div>
  );
}
