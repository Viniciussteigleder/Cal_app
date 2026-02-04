# 🔍 ANÁLISE DE BLIND SPOTS - NutriPlan (PARTE 3)
## Pontos 10-13: Navegação, Qualidade, Glossário e Fluxos

---

### 10) COMO NAVEGAR PELO APP (ATALHOS)

**STATUS ATUAL**: ⚠️ NAVEGAÇÃO TRADICIONAL
- Menu lateral padrão
- Falta orientação baseada em "intenção" (Action-based navigation)
- Usuário precisa saber onde cada função está

**BLIND SPOTS IDENTIFICADOS**:
1. ❌ Novos usuários se perdem no menu
2. ❌ Tarefas comuns exigem muitos cliques
3. ❌ Não há "Start Here" para ações frequentes

**PLANO DE IMPLEMENTAÇÃO**:

```typescript
// Criar: /src/components/dashboard/QuickActionTiles.tsx

interface ActionTile {
  id: string;
  label: string;
  icon: React.ReactNode;
  steps: string[];
  ctaLabel: string;
  href: string;
  color: string;
}

const QUICK_ACTIONS: ActionTile[] = [
  {
    id: 'quick-plan',
    label: 'Quero montar um plano rápido',
    icon: <Zap className="w-6 h-6" />,
    steps: ['Escolha o paciente', 'Selecione um template', 'Ajuste calorias'],
    ctaLabel: 'Criar Agora',
    href: '/studio/ai/meal-planner?mode=quick',
    color: 'bg-emerald-500'
  },
  {
    id: 'check-allergies',
    label: 'Quero revisar alergênicos',
    icon: <ShieldAlert className="w-6 h-6" />,
    steps: ['Selecione paciente', 'Verifique lista de bloqueios', 'Confirme segurança'],
    ctaLabel: 'Verificar',
    href: '/studio/patients/safety-check',
    color: 'bg-red-500'
  },
  {
    id: 'substitutions',
    label: 'Quero criar substituições',
    icon: <RefreshCw className="w-6 h-6" />,
    steps: ['Escolha o alimento', 'Defina opções', 'Salve na biblioteca'],
    ctaLabel: 'Gerenciar',
    href: '/studio/foods/substitutions',
    color: 'bg-blue-500'
  },
  {
    id: 'progress',
    label: 'Quero acompanhar evolução',
    icon: <LineChart className="w-6 h-6" />,
    steps: ['Ver dashboard do paciente', 'Analisar peso/medidas', 'Ver adesão'],
    ctaLabel: 'Ver Evolução',
    href: '/studio/patients/analytics',
    color: 'bg-purple-500'
  },
  {
    id: 'new-patient',
    label: 'Cadastrar novo paciente',
    icon: <UserPlus className="w-6 h-6" />,
    steps: ['Dados básicos', 'Anamnese rápida', 'Definir metas'],
    ctaLabel: 'Cadastrar',
    href: '/studio/patients/new',
    color: 'bg-orange-500'
  }
];

export function QuickActionTiles() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
      {QUICK_ACTIONS.map((action) => (
        <Card key={action.id} className="hover:shadow-lg transition-shadow cursor-pointer group">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-lg ${action.color} text-white`}>
                {action.icon}
              </div>
              <ArrowUpRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
            </div>
            
            <h3 className="font-bold text-lg mb-2">{action.label}</h3>
            
            <div className="space-y-1 mb-4">
              {action.steps.map((step, idx) => (
                <p key={idx} className="text-sm text-muted-foreground flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold">
                    {idx + 1}
                  </span>
                  {step}
                </p>
              ))}
            </div>
            
            <Button className="w-full" variant="outline">
              {action.ctaLabel}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
```

---

### 11) DIAGNÓSTICO E INTEGRIDADE (QUALIDADE DO PLANO)

**STATUS ATUAL**: ❌ NÃO EXISTE AUTOMATIZAÇÃO
- Validação é manual
- Erros passam despercebidos
- Sem feedback de qualidade

**BLIND SPOTS IDENTIFICADOS**:
1. ❌ Planos incompletos são salvos
2. ❌ Conflitos de alergia não detectados
3. ❌ Variedade não é analisada
4. ❌ Praticidade (tempo de preparo) ignorada

**PLANO DE IMPLEMENTAÇÃO**:

```typescript
// Criar: /src/components/plan/PlanIntegrityChecklist.tsx

interface IntegrityCheck {
  id: string;
  category: 'safety' | 'completeness' | 'variety' | 'practicality';
  label: string;
  status: 'passed' | 'warning' | 'failed';
  details: string;
  icon: React.ReactNode;
}

function runIntegrityChecks(plan: MealPlan, patient: Patient): IntegrityCheck[] {
  return [
    {
      id: 'safety-allergies',
      category: 'safety',
      label: 'Conflitos de Alergia',
      status: checkAllergies(plan, patient) ? 'passed' : 'failed',
      details: checkAllergies(plan, patient) 
        ? 'Nenhum alérgeno detectado' 
        : '⚠️ ATENÇÃO: Alérgenos encontrados!',
      icon: <ShieldAlert />
    },
    {
      id: 'data-restrictions',
      category: 'completeness',
      label: 'Dados de Restrições',
      status: patient.restrictions ? 'passed' : 'warning',
      details: patient.restrictions 
        ? 'Restrições configuradas' 
        : 'Paciente sem restrições definidas. Verifique.',
      icon: <FileQuestion />
    },
    {
      id: 'variety-score',
      category: 'variety',
      label: 'Variedade Alimentar',
      status: calculateVarietyScore(plan) > 0.7 ? 'passed' : 'warning',
      details: calculateVarietyScore(plan) > 0.7
        ? 'Boa variedade de grupos alimentares'
        : 'Planos repetitivos podem reduzir adesão',
      icon: <LayoutGrid />
    },
    {
      id: 'prep-time',
      category: 'practicality',
      label: 'Tempo de Preparo',
      status: checkPrepTime(plan, patient.routine) ? 'passed' : 'warning',
      details: checkPrepTime(plan, patient.routine)
        ? 'Adequado à rotina do paciente'
        : 'Tempo de preparo excede disponibilidade diária',
      icon: <Clock />
    },
    {
      id: 'macro-targets',
      category: 'completeness',
      label: 'Metas Nutricionais',
      status: checkMacros(plan) ? 'passed' : 'failed',
      details: checkMacros(plan)
        ? 'Macros dentro da faixa aceitável (±5%)'
        : 'Desvio significativo das metas definidas',
      icon: <Target />
    }
  ];
}

export function PlanIntegrityChecklist({ checks }: { checks: IntegrityCheck[] }) {
  const score = checks.filter(c => c.status === 'passed').length / checks.length * 100;
  
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Diagnóstico de Qualidade</CardTitle>
          <Badge className={
            score === 100 ? 'bg-green-500' : 
            score >= 70 ? 'bg-yellow-500' : 'bg-red-500'
          }>
            Score: {score.toFixed(0)}%
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {checks.map(check => (
            <div key={check.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <div className={
                check.status === 'passed' ? 'text-green-500' :
                check.status === 'warning' ? 'text-yellow-500' :
                'text-red-500'
              }>
                {check.status === 'passed' ? <CheckCircle2 /> : 
                 check.status === 'warning' ? <AlertTriangle /> : 
                 <XCircle />}
              </div>
              <div>
                <h4 className="font-medium text-sm">{check.label}</h4>
                <p className="text-xs text-muted-foreground">{check.details}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
```

---

### 12) GLOSSÁRIO INTELIGENTE

**STATUS ATUAL**: ❌ NÃO EXISTE
- Termos técnicos usados sem explicação
- Falta educação do usuário
- Ambiguidade em conceitos (ex: Alergia vs Intolerância)

**PLANO DE IMPLEMENTAÇÃO**:

```typescript
// Criar: /src/data/glossary.ts

export const GLOSSARY_TERMS = [
  {
    term: 'Microbiota Intestinal',
    definition: 'Comunidade de microrganismos (bactérias, fungos, vírus) que vivem no trato digestivo. Essencial para digestão, imunidade e saúde mental.',
    example: 'Consumir fibras prebióticas (como aveia) ajuda a "alimentar" a microbiota saudável.'
  },
  {
    term: 'Alergênicos',
    definition: 'Substâncias (geralmente proteínas) que desencadeiam uma resposta imune exagerada. Podem causar reações graves.',
    example: 'Glúten, amendoim, crustáceos são alergênicos comuns que devem ser estritamente evitados por alérgicos.'
  },
  {
    term: 'Substituição',
    definition: 'Troca de um alimento por outro nutricionalmente equivalente, respeitando restrições e preferências.',
    example: 'Substituir leite de vaca por leite de amêndoas em casos de intolerância à lactose.'
  },
  {
    term: 'Template',
    definition: 'Modelo base de plano alimentar pré-configurado para objetivos específicos, servindo como ponto de partida.',
    example: 'Usar o template "Low FODMAP" como base e ajustar quantidades para o paciente.'
  },
  {
    term: 'Aderência',
    definition: 'Grau em que o comportamento do paciente corresponde às recomendações acordadas (seguir o plano).',
    example: 'Um plano simples e saboroso aumenta a aderência em comparação a um plano muito restritivo.'
  },
  {
    term: 'Sintomas Gatilho',
    definition: 'Sinais físicos (inchaço, dor, fadiga) que ocorrem consistentemente após consumir certos alimentos.',
    example: 'Inchaço abdominal 30min após comer pão pode indicar sensibilidade ao glúten ou fermentação.'
  },
  {
    term: 'FODMAPs',
    definition: 'Sigla para Fermentable Oligosaccharides, Disaccharides, Monosaccharides and Polyols. Carboidratos de difícil digestão que fermentam.',
    example: 'Cebola e alho são ricos em FODMAPs e podem causar desconforto em pessoas com SII.'
  },
  {
    term: 'Densidade Nutricional',
    definition: 'Quantidade de nutrientes (vitaminas, minerais) por caloria de um alimento.',
    example: 'Espinafre tem alta densidade nutricional, enquanto refrigerante tem baixa.'
  },
  {
    term: 'Protocolo de Eliminação',
    definition: 'Dieta temporária onde alimentos suspeitos são removidos e depois reintroduzidos para identificar gatilhos.',
    example: 'Remover glúten por 30 dias e observar melhora nos sintomas.'
  },
  {
    term: 'TMB (Taxa Metabólica Basal)',
    definition: 'Quantidade de energia (calorias) que o corpo gasta em repouso absoluto para manter funções vitais.',
    example: 'Para perder peso, é preciso consumir menos calorias que o gasto total (TMB + atividade).'
  }
];

// Componente Tooltip
export function GlossaryTooltip({ term, children }: { term: string, children: React.ReactNode }) {
  const entry = GLOSSARY_TERMS.find(t => t.term.toLowerCase() === term.toLowerCase());
  if (!entry) return <>{children}</>;
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="underline decoration-dotted cursor-help">{children}</span>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <p className="font-bold mb-1">{entry.term}</p>
          <p className="text-sm mb-2">{entry.definition}</p>
          <p className="text-xs text-muted-foreground italic">Ex: {entry.example}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
```

---

### 13) FLUXOS

**STATUS ATUAL**: ⚠️ FLUXOS NÃO OTIMIZADOS
- Não existem "caminhos felizes" definidos
- Tempo desperdiçado em navegação ineficiente
- Nutricionista precisa "lembrar" o que fazer

**PLANO DE IMPLEMENTAÇÃO**:

```typescript
// Documentação: /docs/workflows.md

export const WORKFLOWS = [
  {
    title: "Primeiro Cliente (15 min)",
    description: "Fluxo otimizado para cadastro e primeiro plano",
    steps: [
      {
        order: 1,
        action: "Cadastro Rápido",
        details: "Nome, Email, Telefone. Enviar convite de app.",
        time: "2 min"
      },
      {
        order: 2,
        action: "Anamnese Guiada",
        details: "Preencher sintomas principais e restrições (Safety Check).",
        time: "5 min"
      },
      {
        order: 3,
        action: "Definição de Metas",
        details: "Calcular TMB/TDEE e definir déficit/superávit.",
        time: "3 min"
      },
      {
        order: 4,
        action: "Geração de Plano via Template",
        details: "Selecionar template adequado (ex: Low Carb Iniciante) e ajustar.",
        time: "4 min"
      },
      {
        order: 5,
        action: "Publicação",
        details: "Revisar alertas e enviar.",
        time: "1 min"
      }
    ]
  },
  {
    title: "Rotina Semanal (Acompanhamento)",
    description: "Revisão rápida de pacientes ativos",
    steps: [
      {
        order: 1,
        action: "Dashboard Check",
        details: "Verificar alertas e adesão média na semana.",
        time: "5 min"
      },
      {
        order: 2,
        action: "Revisão de Logs",
        details: "Checar fotos de refeições e sintomas reportados.",
        time: "10 min"
      },
      {
        order: 3,
        action: "Feedback Rápido",
        details: "Enviar mensagens de incentivo ou ajuste via chat.",
        time: "10 min"
      }
    ]
  },
  {
    title: "Revisão Mensal (Evolução)",
    description: "Análise profunda e redefinição de estratégia",
    steps: [
      {
        order: 1,
        action: "Comparativo de Medidas",
        details: "Peso, dobras, fotos (Antes vs Depois).",
        time: "10 min"
      },
      {
        order: 2,
        action: "Análise de Sintomas",
        details: "Rodar IA Symptom Correlator para identificar melhoras.",
        time: "5 min"
      },
      {
        order: 3,
        action: "Ajuste de Plano",
        details: "Atualizar TMB (novo peso) e gerar novo ciclo.",
        time: "15 min"
      },
      {
        order: 4,
        action: "Solicitação de Exames",
        details: "Gerar pedido de exames se necessário.",
        time: "5 min"
      }
    ]
  }
];

// UI Component: Flow Assistant
export function WorkflowAssistant({ workflow }) {
  return (
    <Card className="bg-slate-50 dark:bg-slate-900 border-l-4 border-l-primary">
      <CardHeader>
        <CardTitle>{workflow.title}</CardTitle>
        <CardDescription>{workflow.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative border-l border-slate-200 dark:border-slate-800 ml-3 space-y-6">
          {workflow.steps.map((step, idx) => (
            <div key={idx} className="relative pl-6">
              <span className="absolute -left-1 top-1 h-2 w-2 rounded-full bg-slate-300 dark:bg-slate-700 ring-4 ring-white dark:ring-slate-950" />
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold text-sm">{step.action}</h4>
                  <p className="text-sm text-muted-foreground">{step.details}</p>
                </div>
                <Badge variant="outline" className="text-xs">{step.time}</Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full">Iniciar Fluxo</Button>
      </CardFooter>
    </Card>
  );
}
```

---

## ✅ CONCLUSÃO DA ANÁLISE

Esta trilogia de documentos (`ANALYSIS`, `PART2`, `PART3`) cobre todos os 13 pontos solicitados com profundidade técnica e foco na experiência do usuário.

**Resumo das Entregas:**
1.  **Mapas e Cards**: Visualização clara da jornada.
2.  **Lógica Robusta**: Safety gates, regras de prioridade.
3.  **Usabilidade**: Wizards, atalhos, glossários.
4.  **Qualidade**: Checklists automáticos de integridade.
5.  **Fluxos**: Processos otimizados para nutricionistas.

Pronto para iniciar a implementação de qualquer um destes módulos.
