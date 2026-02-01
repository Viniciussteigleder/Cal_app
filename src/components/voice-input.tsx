"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Mic,
  MicOff,
  Loader2,
  Globe,
  Volume2,
  StopCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface VoiceInputProps {
  onTranscript: (text: string, language?: string) => void;
  onInterimTranscript?: (text: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  showLanguageIndicator?: boolean;
  autoLanguageDetection?: boolean;
  preferredLanguages?: ("pt-BR" | "de-DE" | "en-US")[];
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: Event & { error: string }) => void;
  onend: () => void;
  onstart: () => void;
}

// Language detection patterns for common words/foods
const LANGUAGE_PATTERNS = {
  "pt-BR": {
    words: ["arroz", "feijão", "frango", "carne", "pão", "ovo", "leite", "café", "almoço", "jantar", "café da manhã", "estou", "comi", "bebi", "sinto", "bem", "mal", "dor", "inchaço", "muito", "pouco", "fome", "sede", "cansado", "energia", "hoje", "ontem", "manhã", "tarde", "noite"],
    patterns: [/ção$/, /ão$/, /inho$/, /inha$/, /mente$/],
  },
  "de-DE": {
    words: ["brot", "fleisch", "huhn", "reis", "ei", "milch", "kaffee", "frühstück", "mittagessen", "abendessen", "käse", "wurst", "kartoffel", "gemüse", "obst", "ich", "habe", "gegessen", "getrunken", "fühle", "mich", "gut", "schlecht", "müde", "hunger", "durst", "schmerz", "heute", "gestern", "morgen"],
    patterns: [/ung$/, /keit$/, /heit$/, /lich$/, /chen$/],
  },
  "en-US": {
    words: ["rice", "beans", "chicken", "meat", "bread", "egg", "milk", "coffee", "breakfast", "lunch", "dinner", "cheese", "potato", "vegetable", "fruit", "feeling", "tired", "hungry", "thirsty", "pain", "bloated", "energy", "today", "yesterday", "morning", "afternoon", "evening", "ate", "drank"],
    patterns: [/ing$/, /tion$/, /ly$/, /ness$/],
  },
};

// Detect predominant language in text
function detectLanguage(text: string): "pt-BR" | "de-DE" | "en-US" {
  const lowerText = text.toLowerCase();
  const scores: Record<string, number> = {
    "pt-BR": 0,
    "de-DE": 0,
    "en-US": 0,
  };

  // Check for known words
  for (const [lang, data] of Object.entries(LANGUAGE_PATTERNS)) {
    for (const word of data.words) {
      if (lowerText.includes(word)) {
        scores[lang] += 2;
      }
    }
    // Check patterns
    for (const pattern of data.patterns) {
      const matches = lowerText.match(pattern);
      if (matches) {
        scores[lang] += matches.length;
      }
    }
  }

  // Return language with highest score, default to pt-BR
  const maxLang = Object.entries(scores).reduce((a, b) => (b[1] > a[1] ? b : a));
  return maxLang[1] > 0 ? (maxLang[0] as "pt-BR" | "de-DE" | "en-US") : "pt-BR";
}

// Normalize and process multilingual text
export function processMultilingualText(text: string): {
  normalized: string;
  detectedLanguages: string[];
  foodMentions: string[];
} {
  const words = text.split(/\s+/);
  const detectedLanguages = new Set<string>();
  const foodMentions: string[] = [];

  // Common food items in multiple languages
  const FOOD_TRANSLATIONS: Record<string, { ptBR: string; de: string; en: string }> = {
    rice: { ptBR: "arroz", de: "reis", en: "rice" },
    beans: { ptBR: "feijão", de: "bohnen", en: "beans" },
    chicken: { ptBR: "frango", de: "huhn", en: "chicken" },
    egg: { ptBR: "ovo", de: "ei", en: "egg" },
    bread: { ptBR: "pão", de: "brot", en: "bread" },
    milk: { ptBR: "leite", de: "milch", en: "milk" },
    cheese: { ptBR: "queijo", de: "käse", en: "cheese" },
    meat: { ptBR: "carne", de: "fleisch", en: "meat" },
    fish: { ptBR: "peixe", de: "fisch", en: "fish" },
    potato: { ptBR: "batata", de: "kartoffel", en: "potato" },
    tomato: { ptBR: "tomate", de: "tomate", en: "tomato" },
    salad: { ptBR: "salada", de: "salat", en: "salad" },
    apple: { ptBR: "maçã", de: "apfel", en: "apple" },
    banana: { ptBR: "banana", de: "banane", en: "banana" },
    orange: { ptBR: "laranja", de: "orange", en: "orange" },
    coffee: { ptBR: "café", de: "kaffee", en: "coffee" },
    tea: { ptBR: "chá", de: "tee", en: "tea" },
    water: { ptBR: "água", de: "wasser", en: "water" },
    juice: { ptBR: "suco", de: "saft", en: "juice" },
    yogurt: { ptBR: "iogurte", de: "joghurt", en: "yogurt" },
    pasta: { ptBR: "macarrão", de: "nudeln", en: "pasta" },
    soup: { ptBR: "sopa", de: "suppe", en: "soup" },
  };

  // Check each word for language and food
  for (const word of words) {
    const lowerWord = word.toLowerCase().replace(/[.,!?]/g, "");

    // Check food translations
    for (const [, translations] of Object.entries(FOOD_TRANSLATIONS)) {
      if (
        lowerWord === translations.ptBR ||
        lowerWord === translations.de ||
        lowerWord === translations.en
      ) {
        foodMentions.push(translations.ptBR); // Normalize to PT-BR
        if (lowerWord === translations.ptBR) detectedLanguages.add("pt-BR");
        if (lowerWord === translations.de) detectedLanguages.add("de-DE");
        if (lowerWord === translations.en) detectedLanguages.add("en-US");
      }
    }

    // Detect language of other words
    for (const [lang, data] of Object.entries(LANGUAGE_PATTERNS)) {
      if (data.words.includes(lowerWord)) {
        detectedLanguages.add(lang);
      }
    }
  }

  return {
    normalized: text,
    detectedLanguages: Array.from(detectedLanguages),
    foodMentions: [...new Set(foodMentions)],
  };
}

export function VoiceInput({
  onTranscript,
  onInterimTranscript,
  placeholder = "Toque para falar...",
  className,
  disabled = false,
  showLanguageIndicator = true,
  autoLanguageDetection = true,
  preferredLanguages = ["pt-BR", "de-DE", "en-US"],
}: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [interimText, setInterimText] = useState("");
  const [detectedLang, setDetectedLang] = useState<string>("pt-BR");
  const [currentLangIndex, setCurrentLangIndex] = useState(0);
  const [isSupported, setIsSupported] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const finalTranscriptRef = useRef<string>("");

  const languageNames: Record<string, string> = {
    "pt-BR": "Português",
    "de-DE": "Deutsch",
    "en-US": "English",
  };

  const languageFlags: Record<string, string> = {
    "pt-BR": "🇧🇷",
    "de-DE": "🇩🇪",
    "en-US": "🇺🇸",
  };

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;

      if (!SpeechRecognition) {
        setIsSupported(false);
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 3;
      recognition.lang = preferredLanguages[currentLangIndex];

      recognition.onstart = () => {
        setIsListening(true);
        setError(null);
        finalTranscriptRef.current = "";
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let interim = "";
        let final = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            final += transcript;
          } else {
            interim += transcript;
          }
        }

        if (final) {
          finalTranscriptRef.current += final;

          // Detect language and process
          if (autoLanguageDetection) {
            const detected = detectLanguage(final);
            setDetectedLang(detected);

            // If detected language differs, restart with that language
            if (detected !== preferredLanguages[currentLangIndex]) {
              const newIndex = preferredLanguages.indexOf(detected);
              if (newIndex !== -1) {
                setCurrentLangIndex(newIndex);
                recognition.lang = detected;
              }
            }
          }
        }

        setInterimText(interim);
        if (onInterimTranscript) {
          onInterimTranscript(finalTranscriptRef.current + interim);
        }
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setError(
          event.error === "not-allowed"
            ? "Permissão de microfone negada"
            : event.error === "no-speech"
            ? "Nenhuma fala detectada"
            : "Erro no reconhecimento de voz"
        );
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
        setIsProcessing(true);

        if (finalTranscriptRef.current.trim()) {
          const processed = processMultilingualText(finalTranscriptRef.current);
          onTranscript(processed.normalized, detectedLang);
        }

        setIsProcessing(false);
        setInterimText("");
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [currentLangIndex, preferredLanguages, autoLanguageDetection, onTranscript, onInterimTranscript, detectedLang]);

  const toggleListening = useCallback(() => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      finalTranscriptRef.current = "";
      setInterimText("");
      recognitionRef.current.lang = preferredLanguages[currentLangIndex];
      recognitionRef.current.start();
    }
  }, [isListening, currentLangIndex, preferredLanguages]);

  const cycleLanguage = useCallback(() => {
    const newIndex = (currentLangIndex + 1) % preferredLanguages.length;
    setCurrentLangIndex(newIndex);
    setDetectedLang(preferredLanguages[newIndex]);
  }, [currentLangIndex, preferredLanguages]);

  if (!isSupported) {
    return (
      <div className={cn("text-center text-sm text-muted-foreground p-4", className)}>
        <MicOff className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>Reconhecimento de voz não suportado neste navegador.</p>
        <p className="text-xs mt-1">Use Chrome, Edge ou Safari.</p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      {/* Main Voice Button */}
      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant={isListening ? "destructive" : "outline"}
          size="lg"
          className={cn(
            "flex-1 h-14 relative overflow-hidden transition-all",
            isListening && "animate-pulse"
          )}
          onClick={toggleListening}
          disabled={disabled || isProcessing}
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Processando...
            </>
          ) : isListening ? (
            <>
              <StopCircle className="h-5 w-5 mr-2" />
              Parar Gravação
              <div className="absolute inset-0 bg-red-500/10 animate-pulse" />
            </>
          ) : (
            <>
              <Mic className="h-5 w-5 mr-2" />
              {placeholder}
            </>
          )}
        </Button>

        {/* Language Selector */}
        {showLanguageIndicator && (
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-14 w-14 flex-shrink-0"
            onClick={cycleLanguage}
            disabled={isListening || disabled}
            title={`Idioma: ${languageNames[preferredLanguages[currentLangIndex]]}`}
          >
            <span className="text-2xl">{languageFlags[preferredLanguages[currentLangIndex]]}</span>
          </Button>
        )}
      </div>

      {/* Language Indicator */}
      {showLanguageIndicator && (
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <Globe className="h-3 w-3" />
          <span>
            Idiomas: {preferredLanguages.map((l) => languageFlags[l]).join(" ")}
          </span>
          {autoLanguageDetection && (
            <Badge variant="outline" className="text-xs">
              Detecção automática
            </Badge>
          )}
        </div>
      )}

      {/* Interim Transcript Display */}
      {(isListening || interimText) && (
        <div className="p-3 rounded-lg bg-muted/50 border min-h-[60px]">
          <div className="flex items-start gap-2">
            <Volume2 className={cn("h-4 w-4 mt-0.5 text-primary", isListening && "animate-pulse")} />
            <div className="flex-1">
              {finalTranscriptRef.current && (
                <span className="text-foreground">{finalTranscriptRef.current}</span>
              )}
              {interimText && (
                <span className="text-muted-foreground italic">{interimText}</span>
              )}
              {!finalTranscriptRef.current && !interimText && isListening && (
                <span className="text-muted-foreground italic">Ouvindo...</span>
              )}
            </div>
            {detectedLang && isListening && (
              <Badge variant="secondary" className="text-xs">
                {languageFlags[detectedLang]} {languageNames[detectedLang]}
              </Badge>
            )}
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="p-2 rounded-lg bg-destructive/10 text-destructive text-sm text-center">
          {error}
        </div>
      )}

      {/* Instructions */}
      <p className="text-xs text-center text-muted-foreground">
        Fale em português, alemão ou inglês. A detecção é automática.
        <br />
        <span className="opacity-70">Sprechen Sie Deutsch, Englês oder Portugiesisch.</span>
      </p>
    </div>
  );
}

export default VoiceInput;
