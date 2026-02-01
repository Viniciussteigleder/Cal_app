"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Camera,
  X,
  Mic,
  Image as ImageIcon,
  ChevronRight,
  ChevronLeft,
  Check,
  Loader2,
  Clock,
  Utensils,
  Home,
  Briefcase,
  Plane,
  Zap,
  Globe,
  MessageSquare,
} from "lucide-react";
import { toast } from "sonner";
import { VoiceInput, processMultilingualText } from "@/components/voice-input";

type Step = "capture" | "voice" | "checkin" | "details" | "confirm";
type PortionSize = "small" | "normal" | "large";
type MealTag = "homemade" | "restaurant" | "delivery" | "work" | "travel";

interface CheckinData {
  hunger: number;
  energy: number;
  mood: number;
  stress: number;
  craving: "sweet" | "salty" | "none";
  rushed: boolean;
}

export default function CaptureMealPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<Step>("capture");
  const [photo, setPhoto] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [description, setDescription] = useState("");
  const [voiceDescription, setVoiceDescription] = useState("");
  const [detectedFoods, setDetectedFoods] = useState<string[]>([]);
  const [detectedLanguages, setDetectedLanguages] = useState<string[]>([]);
  const [portion, setPortion] = useState<PortionSize>("normal");
  const [tags, setTags] = useState<MealTag[]>(["homemade"]);
  const [mealTime, setMealTime] = useState(
    new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
  );
  const [checkin, setCheckin] = useState<CheckinData>({
    hunger: 5,
    energy: 5,
    mood: 5,
    stress: 3,
    craving: "none",
    rushed: false,
  });
  const [showVoiceForFeeling, setShowVoiceForFeeling] = useState(false);
  const [feelingVoiceText, setFeelingVoiceText] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result as string);
        setStep("checkin");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCapture = () => {
    fileInputRef.current?.click();
  };

  const handleVoiceOnly = () => {
    setStep("voice");
  };

  const handleVoiceTranscript = (text: string, language?: string) => {
    setVoiceDescription(text);
    const processed = processMultilingualText(text);
    setDetectedFoods(processed.foodMentions);
    setDetectedLanguages(processed.detectedLanguages);

    // Automatically populate description
    setDescription((prev) => {
      if (prev) return prev + " " + text;
      return text;
    });

    toast.success("Voz processada!", {
      description: `Detectado: ${processed.foodMentions.length} alimentos`,
    });
  };

  const handleVoiceInterim = (text: string) => {
    setVoiceDescription(text);
  };

  const handleFeelingVoiceTranscript = (text: string) => {
    setFeelingVoiceText(text);

    // Try to extract feeling indicators from voice
    const lowerText = text.toLowerCase();

    // Hunger detection
    if (lowerText.includes("faminto") || lowerText.includes("muito fome") || lowerText.includes("starving") || lowerText.includes("sehr hungrig")) {
      setCheckin(prev => ({ ...prev, hunger: 9 }));
    } else if (lowerText.includes("fome") || lowerText.includes("hungry") || lowerText.includes("hungrig")) {
      setCheckin(prev => ({ ...prev, hunger: 7 }));
    } else if (lowerText.includes("sem fome") || lowerText.includes("not hungry") || lowerText.includes("nicht hungrig")) {
      setCheckin(prev => ({ ...prev, hunger: 2 }));
    }

    // Energy detection
    if (lowerText.includes("cansado") || lowerText.includes("tired") || lowerText.includes("müde")) {
      setCheckin(prev => ({ ...prev, energy: 3 }));
    } else if (lowerText.includes("energia") || lowerText.includes("energized") || lowerText.includes("energisch")) {
      setCheckin(prev => ({ ...prev, energy: 8 }));
    }

    // Stress detection
    if (lowerText.includes("estressado") || lowerText.includes("stressed") || lowerText.includes("gestresst")) {
      setCheckin(prev => ({ ...prev, stress: 8 }));
    } else if (lowerText.includes("relaxado") || lowerText.includes("relaxed") || lowerText.includes("entspannt")) {
      setCheckin(prev => ({ ...prev, stress: 2 }));
    }

    // Mood detection
    if (lowerText.includes("feliz") || lowerText.includes("happy") || lowerText.includes("glücklich") || lowerText.includes("bem")) {
      setCheckin(prev => ({ ...prev, mood: 8 }));
    } else if (lowerText.includes("triste") || lowerText.includes("sad") || lowerText.includes("traurig") || lowerText.includes("mal")) {
      setCheckin(prev => ({ ...prev, mood: 3 }));
    }

    toast.success("Sentimento detectado e aplicado aos sliders");
  };

  const handleSkipCheckin = () => {
    setStep("details");
  };

  const handleCompleteCheckin = () => {
    setStep("details");
  };

  const handleCompleteVoice = () => {
    setStep("checkin");
  };

  const handleSave = async () => {
    setIsProcessing(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    toast.success("Refeição registrada!", {
      description: "Check-in pós-refeição será enviado em 2 horas.",
    });

    setIsProcessing(false);
    router.push("/patient/today");
  };

  const tagOptions: { value: MealTag; label: string; icon: React.ReactNode }[] = [
    { value: "homemade", label: "Caseiro", icon: <Home className="h-4 w-4" /> },
    { value: "restaurant", label: "Restaurante", icon: <Utensils className="h-4 w-4" /> },
    { value: "delivery", label: "Delivery", icon: <Clock className="h-4 w-4" /> },
    { value: "work", label: "Trabalho", icon: <Briefcase className="h-4 w-4" /> },
    { value: "travel", label: "Viagem", icon: <Plane className="h-4 w-4" /> },
  ];

  const toggleTag = (tag: MealTag) => {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const renderSlider = (
    label: string,
    value: number,
    onChange: (val: number) => void,
    leftLabel: string,
    rightLabel: string
  ) => (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="text-muted-foreground">{value}/10</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground w-16">{leftLabel}</span>
        <input
          type="range"
          min="0"
          max="10"
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className="flex-1 accent-primary"
        />
        <span className="text-xs text-muted-foreground w-16 text-right">{rightLabel}</span>
      </div>
    </div>
  );

  const languageFlags: Record<string, string> = {
    "pt-BR": "🇧🇷",
    "de-DE": "🇩🇪",
    "en-US": "🇺🇸",
  };

  return (
    <DashboardLayout role="patient">
      <div className="max-w-md mx-auto">
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Step: Capture */}
        {step === "capture" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="text-center">
              <h1 className="text-2xl font-bold">Registrar Refeição</h1>
              <p className="text-muted-foreground">Foto ou descrição por voz</p>
            </div>

            <Card className="aspect-[4/3] flex items-center justify-center bg-muted/30 border-dashed border-2 cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={handleCapture}
            >
              <div className="text-center space-y-4">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <Camera className="h-10 w-10 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Toque para fotografar</p>
                  <p className="text-sm text-muted-foreground">
                    ou selecione uma imagem
                  </p>
                </div>
              </div>
            </Card>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={handleCapture}>
                <ImageIcon className="h-4 w-4 mr-2" />
                Galeria
              </Button>
              <Button variant="default" className="flex-1" onClick={handleVoiceOnly}>
                <Mic className="h-4 w-4 mr-2" />
                Apenas Voz
              </Button>
            </div>

            {/* Multilingual indicator */}
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Globe className="h-4 w-4" />
              <span>Suporte: 🇧🇷 Português 🇩🇪 Deutsch 🇺🇸 English</span>
            </div>

            <Button
              variant="ghost"
              className="w-full"
              onClick={() => router.push("/patient/today")}
            >
              Cancelar
            </Button>
          </div>
        )}

        {/* Step: Voice Only */}
        {step === "voice" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex items-center justify-between">
              <Button variant="ghost" size="icon" onClick={() => setStep("capture")}>
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <div className="text-center">
                <h1 className="text-lg font-bold">Descreva sua refeição</h1>
                <p className="text-sm text-muted-foreground">
                  Fale o que você comeu
                </p>
              </div>
              <div className="w-9" />
            </div>

            <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
              <CardContent className="pt-6 space-y-4">
                <VoiceInput
                  onTranscript={handleVoiceTranscript}
                  onInterimTranscript={handleVoiceInterim}
                  placeholder="Toque e fale sua refeição..."
                  showLanguageIndicator={true}
                  autoLanguageDetection={true}
                />

                {/* Voice description preview */}
                {voiceDescription && (
                  <div className="p-3 rounded-lg bg-background border">
                    <p className="text-sm font-medium mb-1">Descrição detectada:</p>
                    <p className="text-sm text-muted-foreground">{voiceDescription}</p>
                  </div>
                )}

                {/* Detected foods */}
                {detectedFoods.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Alimentos identificados:</p>
                    <div className="flex flex-wrap gap-2">
                      {detectedFoods.map((food, i) => (
                        <Badge key={i} variant="secondary">
                          {food}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Detected languages */}
                {detectedLanguages.length > 0 && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Globe className="h-3 w-3" />
                    <span>Idiomas detectados:</span>
                    {detectedLanguages.map((lang) => (
                      <span key={lang}>{languageFlags[lang] || lang}</span>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Example phrases */}
            <Card className="bg-muted/30">
              <CardContent className="pt-4">
                <p className="text-xs font-medium text-muted-foreground mb-2">
                  Exemplos de como falar:
                </p>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <p>🇧🇷 "Comi arroz, feijão e frango grelhado"</p>
                  <p>🇩🇪 "Ich habe Reis mit Huhn gegessen"</p>
                  <p>🇺🇸 "I had rice, beans and chicken"</p>
                  <p className="text-primary/70 mt-2">
                    Você pode misturar idiomas na mesma frase!
                  </p>
                </div>
              </CardContent>
            </Card>

            <Button
              className="w-full"
              onClick={handleCompleteVoice}
              disabled={!voiceDescription && !description}
            >
              Continuar
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        )}

        {/* Step: Check-in (Before eating) */}
        {step === "checkin" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex items-center justify-between">
              <Button variant="ghost" size="icon" onClick={() => setStep(photo ? "capture" : "voice")}>
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <div className="text-center">
                <h1 className="text-lg font-bold">Check-in Antes</h1>
                <p className="text-sm text-muted-foreground">
                  Como você está se sentindo?
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={handleSkipCheckin}>
                Pular
              </Button>
            </div>

            {/* Photo preview */}
            {photo && (
              <div className="relative aspect-video rounded-xl overflow-hidden">
                <img
                  src={photo}
                  alt="Meal preview"
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Voice description preview (if no photo) */}
            {!photo && voiceDescription && (
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="pt-4">
                  <div className="flex items-start gap-2">
                    <MessageSquare className="h-4 w-4 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Sua descrição:</p>
                      <p className="text-sm text-muted-foreground">{voiceDescription}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardContent className="pt-4 space-y-6">
                {/* Voice check-in option */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2">
                    <Mic className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Descrever por voz</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowVoiceForFeeling(!showVoiceForFeeling)}
                  >
                    {showVoiceForFeeling ? "Usar sliders" : "Usar voz"}
                  </Button>
                </div>

                {showVoiceForFeeling ? (
                  <div className="space-y-4">
                    <VoiceInput
                      onTranscript={handleFeelingVoiceTranscript}
                      placeholder="Como você está se sentindo?"
                      showLanguageIndicator={false}
                    />

                    {feelingVoiceText && (
                      <div className="p-3 rounded-lg bg-muted/30 text-sm">
                        <p className="text-muted-foreground">{feelingVoiceText}</p>
                      </div>
                    )}

                    <p className="text-xs text-muted-foreground text-center">
                      Diga coisas como: "Estou com muita fome", "Feeling tired", "Ich bin gestresst"
                    </p>
                  </div>
                ) : (
                  <>
                    {renderSlider(
                      "Nível de fome",
                      checkin.hunger,
                      (val) => setCheckin({ ...checkin, hunger: val }),
                      "Sem fome",
                      "Faminto"
                    )}

                    {renderSlider(
                      "Energia",
                      checkin.energy,
                      (val) => setCheckin({ ...checkin, energy: val }),
                      "Cansado",
                      "Energizado"
                    )}

                    {renderSlider(
                      "Humor",
                      checkin.mood,
                      (val) => setCheckin({ ...checkin, mood: val }),
                      "Ruim",
                      "Ótimo"
                    )}

                    {renderSlider(
                      "Estresse",
                      checkin.stress,
                      (val) => setCheckin({ ...checkin, stress: val }),
                      "Relaxado",
                      "Estressado"
                    )}
                  </>
                )}

                {/* Craving */}
                <div className="space-y-2">
                  <span className="text-sm font-medium">Vontade de comer</span>
                  <div className="flex gap-2">
                    {(["none", "sweet", "salty"] as const).map((c) => (
                      <Button
                        key={c}
                        variant={checkin.craving === c ? "default" : "outline"}
                        size="sm"
                        className="flex-1"
                        onClick={() => setCheckin({ ...checkin, craving: c })}
                      >
                        {c === "none" ? "Nenhuma" : c === "sweet" ? "Doce" : "Salgado"}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Rushed */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Está com pressa?</span>
                  <div className="flex gap-2">
                    <Button
                      variant={!checkin.rushed ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCheckin({ ...checkin, rushed: false })}
                    >
                      Não
                    </Button>
                    <Button
                      variant={checkin.rushed ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCheckin({ ...checkin, rushed: true })}
                    >
                      Sim
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button className="w-full" onClick={handleCompleteCheckin}>
              Continuar
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        )}

        {/* Step: Details */}
        {step === "details" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex items-center justify-between">
              <Button variant="ghost" size="icon" onClick={() => setStep("checkin")}>
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-lg font-bold">Detalhes</h1>
              <div className="w-9" />
            </div>

            {/* Photo preview */}
            {photo && (
              <div className="relative aspect-video rounded-xl overflow-hidden">
                <img
                  src={photo}
                  alt="Meal preview"
                  className="w-full h-full object-cover"
                />
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={() => setStep("capture")}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}

            <Card>
              <CardContent className="pt-4 space-y-4">
                {/* Description with voice */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    O que você comeu?
                  </label>
                  <div className="space-y-2">
                    <Textarea
                      placeholder="Ex: Arroz, feijão e frango grelhado / Rice with chicken / Reis mit Huhn"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="min-h-[80px]"
                    />

                    <VoiceInput
                      onTranscript={(text) => {
                        setDescription((prev) => prev ? prev + " " + text : text);
                        const processed = processMultilingualText(text);
                        if (processed.foodMentions.length > 0) {
                          setDetectedFoods((prev) => [...new Set([...prev, ...processed.foodMentions])]);
                        }
                      }}
                      placeholder="Ou adicione por voz..."
                      showLanguageIndicator={true}
                      className="pt-2"
                    />
                  </div>

                  {/* Detected foods chips */}
                  {detectedFoods.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-2">
                      {detectedFoods.map((food, i) => (
                        <Badge
                          key={i}
                          variant="secondary"
                          className="text-xs cursor-pointer"
                          onClick={() => setDetectedFoods((prev) => prev.filter((f) => f !== food))}
                        >
                          {food}
                          <X className="h-3 w-3 ml-1" />
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* Portion */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Porção</label>
                  <div className="flex gap-2">
                    {(["small", "normal", "large"] as const).map((p) => (
                      <Button
                        key={p}
                        variant={portion === p ? "default" : "outline"}
                        size="sm"
                        className="flex-1"
                        onClick={() => setPortion(p)}
                      >
                        {p === "small" ? "Pouca" : p === "normal" ? "Normal" : "Muita"}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Tags */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Onde você comeu?</label>
                  <div className="flex flex-wrap gap-2">
                    {tagOptions.map((tag) => (
                      <Badge
                        key={tag.value}
                        variant={tags.includes(tag.value) ? "default" : "outline"}
                        className="cursor-pointer py-2 px-3"
                        onClick={() => toggleTag(tag.value)}
                      >
                        {tag.icon}
                        <span className="ml-1">{tag.label}</span>
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Time */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Horário</label>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <Input
                      type="time"
                      value={mealTime}
                      onChange={(e) => setMealTime(e.target.value)}
                      className="w-32"
                    />
                    <span className="text-sm text-muted-foreground">
                      (editável)
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button className="w-full h-12" onClick={handleSave} disabled={isProcessing}>
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Salvar Refeição
                </>
              )}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              <Zap className="h-3 w-3 inline mr-1" />
              Lembrete para check-in será enviado em 2 horas
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
