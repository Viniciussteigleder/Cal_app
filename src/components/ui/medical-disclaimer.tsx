import { AlertTriangle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface MedicalDisclaimerProps {
  variant?: "default" | "supplement" | "emergency"
  className?: string
}

export function MedicalDisclaimer({ variant = "default", className }: MedicalDisclaimerProps) {
  const disclaimers = {
    default: {
      title: "Aviso Médico Importante",
      description: "Esta ferramenta utiliza Inteligência Artificial para fins informativos e de apoio à decisão profissional. NÃO substitui a avaliação clínica, o julgamento profissional do nutricionista, nem a consulta médica. Sempre considere o contexto clínico completo do paciente, histórico médico, exames laboratoriais e outras informações relevantes antes de tomar decisões sobre o cuidado nutricional."
    },
    supplement: {
      title: "⚠️ Aviso Crítico - Suplementação",
      description: "As recomendações de suplementos geradas por IA são APENAS sugestões educacionais. NUNCA prescreva suplementos sem: (1) Avaliação clínica completa, (2) Exames laboratoriais recentes, (3) Verificação de interações medicamentosas, (4) Consideração de condições médicas pré-existentes. Suplementação inadequada pode causar toxicidade, interações perigosas ou mascarar condições graves. Sempre oriente o paciente a consultar um médico antes de iniciar qualquer suplementação."
    },
    emergency: {
      title: "🚨 Quando Buscar Atendimento Médico IMEDIATO",
      description: "Se você ou seu paciente apresentar: dor abdominal intensa, vômitos persistentes com sangue, diarreia com sangue ou preta, febre alta (>39°C), sinais de desidratação severa, perda de consciência, dificuldade para respirar, ou qualquer sintoma súbito e grave - PARE de usar este aplicativo e PROCURE IMEDIATAMENTE o pronto-socorro ou ligue 192 (SAMU). Este aplicativo NÃO deve ser usado para emergências médicas."
    }
  }

  const content = disclaimers[variant]
  const bgColor = variant === "emergency" ? "bg-red-50 border-red-200" :
                  variant === "supplement" ? "bg-orange-50 border-orange-200" :
                  "bg-yellow-50 border-yellow-200"
  const iconColor = variant === "emergency" ? "text-red-600" :
                    variant === "supplement" ? "text-orange-600" :
                    "text-yellow-600"

  return (
    <Card className={`${bgColor} ${className}`}>
      <CardContent className="pt-6 flex gap-3">
        <AlertTriangle className={`h-5 w-5 flex-shrink-0 mt-0.5 ${iconColor}`} />
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-base mb-2">{content.title}</h3>
          <p className="text-sm leading-relaxed overflow-hidden">
            {content.description}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
