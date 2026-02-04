# 🔍 ANÁLISE DE BLIND SPOTS - NutriPlan (PARTE 2)
## Pontos 6-13: Fluxos, Exemplos e Boas Práticas

---

### 6) COMO CRIAR UM PLANO (PASSO A PASSO)

**STATUS ATUAL**: ⚠️ PROCESSO EXISTE MAS NÃO É GUIADO
- Meal Planner existe mas é complexo
- Falta wizard/assistente
- Sem validação progressiva

**BLIND SPOTS IDENTIFICADOS**:
1. ❌ Nutricionista não tem checklist claro
2. ❌ Passos não são sequenciais/guiados
3. ❌ Falta confirmação de constraints antes de gerar
4. ❌ Review de itens flagged não existe
5. ❌ Publicação não tem workflow

**PLANO DE IMPLEMENTAÇÃO**:

```typescript
// Criar: /src/components/meal-plan/PlanCreationWizard.tsx

interface PlanCreationStep {
  id: number;
  title: string;
  description: string;
  component: React.ComponentType;
  validation: () => boolean;
  microcopy: {
    hint: string;
    error?: string;
    success?: string;
  };
}

const PLAN_CREATION_STEPS: PlanCreationStep[] = [
  {
    id: 1,
    title: 'Escolher Cliente',
    description: 'Selecione o paciente para criar o plano',
    component: ClientSelector,
    validation: () => selectedClient !== null,
    microcopy: {
      hint: 'Busque por nome ou CPF. Você pode criar um novo cliente se necessário.',
      error: 'Selecione um cliente para continuar',
      success: 'Cliente selecionado: {clientName}'
    }
  },
  {
    id: 2,
    title: 'Confirmar Restrições',
    description: 'Revise alergias, intolerâncias e condições',
    component: ConstraintsReview,
    validation: () => constraintsConfirmed === true,
    microcopy: {
      hint: 'Revise cuidadosamente. Alergias críticas bloquearão alimentos automaticamente.',
      error: 'Confirme que revisou todas as restrições',
      success: '{count} restrições confirmadas'
    }
  },
  {
    id: 3,
    title: 'Selecionar Template',
    description: 'Escolha um template base ou crie do zero',
    component: TemplateSelector,
    validation: () => selectedTemplate !== null || customPlan === true,
    microcopy: {
      hint: 'Templates aceleram o processo. Você poderá ajustar depois.',
      error: 'Selecione um template ou marque "Criar do zero"',
      success: 'Template: {templateName}'
    }
  },
  {
    id: 4,
    title: 'Ajustar Macros/Metas',
    description: 'Defina calorias e distribuição de macronutrientes',
    component: MacroTargets,
    validation: () => macrosValid() && caloriesInRange(),
    microcopy: {
      hint: 'Use a calculadora de TMB/TDEE para estimar necessidades calóricas.',
      error: 'Macros devem somar 100%. Calorias entre 1200-4000 kcal.',
      success: '{calories} kcal • P:{protein}% C:{carbs}% G:{fat}%'
    }
  },
  {
    id: 5,
    title: 'Gerar Plano',
    description: 'IA criará o plano baseado nos parâmetros',
    component: PlanGeneration,
    validation: () => planGenerated === true,
    microcopy: {
      hint: 'Isso pode levar 10-30 segundos. A IA considerará todas as restrições.',
      error: 'Falha na geração. Tente novamente ou ajuste os parâmetros.',
      success: 'Plano de {days} dias gerado com sucesso!'
    }
  },
  {
    id: 6,
    title: 'Revisar Itens Flagged',
    description: 'Verifique alertas e possíveis conflitos',
    component: FlaggedItemsReview,
    validation: () => allFlagsResolved(),
    microcopy: {
      hint: 'Itens em amarelo precisam atenção. Vermelhos devem ser substituídos.',
      error: '{count} itens críticos não resolvidos',
      success: 'Todos os alertas foram revisados'
    }
  },
  {
    id: 7,
    title: 'Publicar para Cliente',
    description: 'Envie o plano aprovado para o paciente',
    component: PlanPublication,
    validation: () => publishConfirmed === true,
    microcopy: {
      hint: 'O paciente receberá notificação por email e no app.',
      error: 'Confirme a publicação para continuar',
      success: 'Plano publicado! Cliente notificado.'
    }
  },
  {
    id: 8,
    title: 'Coletar Feedback',
    description: 'Configure lembretes para acompanhamento',
    component: FeedbackSetup,
    validation: () => true, // opcional
    microcopy: {
      hint: 'Recomendamos check-in após 3, 7 e 14 dias.',
      success: 'Lembretes configurados para {dates}'
    }
  }
];

// Component Implementation
export function PlanCreationWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [stepData, setStepData] = useState({});
  
  const step = PLAN_CREATION_STEPS[currentStep - 1];
  const StepComponent = step.component;
  
  const canProceed = step.validation();
  
  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          {PLAN_CREATION_STEPS.map((s, idx) => (
            <div key={s.id} className="flex items-center">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center",
                currentStep > s.id ? "bg-green-500 text-white" :
                currentStep === s.id ? "bg-primary text-white" :
                "bg-gray-200 text-gray-500"
              )}>
                {currentStep > s.id ? <Check className="w-4 h-4" /> : s.id}
              </div>
              {idx < PLAN_CREATION_STEPS.length - 1 && (
                <div className={cn(
                  "w-12 h-1 mx-2",
                  currentStep > s.id ? "bg-green-500" : "bg-gray-200"
                )} />
              )}
            </div>
          ))}
        </div>
        <p className="text-sm text-muted-foreground text-center">
          Passo {currentStep} de {PLAN_CREATION_STEPS.length}
        </p>
      </div>
      
      {/* Step Content */}
      <Card>
        <CardHeader>
          <CardTitle>{step.title}</CardTitle>
          <CardDescription>{step.description}</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Hint */}
          <Alert className="mb-4">
            <Info className="h-4 w-4" />
            <AlertDescription>{step.microcopy.hint}</AlertDescription>
          </Alert>
          
          {/* Step Component */}
          <StepComponent
            data={stepData}
            onChange={(data) => setStepData({ ...stepData, ...data })}
          />
          
          {/* Validation Error */}
          {!canProceed && step.microcopy.error && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{step.microcopy.error}</AlertDescription>
            </Alert>
          )}
          
          {/* Success Message */}
          {canProceed && step.microcopy.success && (
            <Alert className="mt-4 bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                {step.microcopy.success}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(currentStep - 1)}
            disabled={currentStep === 1}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <Button
            onClick={() => setCurrentStep(currentStep + 1)}
            disabled={!canProceed || currentStep === PLAN_CREATION_STEPS.length}
          >
            {currentStep === PLAN_CREATION_STEPS.length ? 'Finalizar' : 'Próximo'}
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
```

**ONDE IMPLEMENTAR**:
- Substituir página atual: `/studio/ai/meal-planner`
- Ou criar nova: `/studio/plans/create`

---

### 7) EXEMPLOS PRÁTICOS (3 MINI-CASES)

**STATUS ATUAL**: ❌ NÃO EXISTE
- Sem casos de uso documentados
- Sem exemplos práticos
- Nutricionistas aprendem por tentativa e erro

**BLIND SPOTS IDENTIFICADOS**:
1. ❌ Falta onboarding com casos reais
2. ❌ Sem demonstração de como sistema lida com restrições
3. ❌ Não mostra valor do NutriPlan vs manual

**PLANO DE IMPLEMENTAÇÃO**:

```typescript
// Criar: /src/data/case-studies.ts

interface CaseStudy {
  id: string;
  title: string;
  client: {
    name: string;
    ageRange: string;
    goal: string;
    routine: string;
  };
  restrictions: {
    allergies: string[];
    intolerances: string[];
    conditions: string[];
  };
  strategy: string[];
  sampleMenu: {
    breakfast: { meal: string; kcal: number; substitutions?: string };
    lunch: { meal: string; kcal: number; substitutions?: string };
    dinner: { meal: string; kcal: number; substitutions?: string };
    snacks: { meal: string; kcal: number; substitutions?: string };
  };
  nutriplanPrevents: string[];
}

export const CASE_STUDIES: CaseStudy[] = [
  {
    id: 'case-1',
    title: 'Caso 1: Executiva com Intolerância à Lactose e SII',
    client: {
      name: 'Ana',
      ageRange: '35-40 anos',
      goal: 'Perda de peso moderada (3kg em 2 meses)',
      routine: 'Trabalho em escritório, almoça fora, pouco tempo para cozinhar'
    },
    restrictions: {
      allergies: [],
      intolerances: ['Lactose'],
      conditions: ['Síndrome do Intestino Irritável (SII)', 'Sensibilidade FODMAP']
    },
    strategy: [
      'Eliminar lactose completamente',
      'Reduzir FODMAPs na fase inicial (4 semanas)',
      'Priorizar refeições rápidas e práticas',
      'Incluir probióticos naturais (sem lactose)'
    ],
    sampleMenu: {
      breakfast: {
        meal: 'Smoothie de banana com leite de amêndoas, aveia e pasta de amendoim',
        kcal: 320,
        substitutions: 'Leite de amêndoas substitui leite de vaca (lactose)'
      },
      lunch: {
        meal: 'Frango grelhado com arroz integral e cenoura refogada',
        kcal: 480,
        substitutions: 'Sem cebola/alho (FODMAP). Temperos: gengibre, cebolinha'
      },
      dinner: {
        meal: 'Omelete de espinafre com batata-doce assada',
        kcal: 380,
        substitutions: 'Sem queijo (lactose). Ovos são permitidos.'
      },
      snacks: {
        meal: 'Iogurte de coco com morangos',
        kcal: 150,
        substitutions: 'Iogurte vegetal substitui iogurte tradicional'
      }
    },
    nutriplanPrevents: [
      '🚫 Bloqueou automaticamente todos os laticínios (lactose)',
      '⚠️ Alertou sobre cebola/alho em receitas (FODMAP)',
      '✅ Sugeriu substituições práticas e culturalmente relevantes',
      '📊 Garantiu equilíbrio nutricional mesmo com restrições'
    ]
  },
  {
    id: 'case-2',
    title: 'Caso 2: Atleta com Alergia a Oleaginosas e Diabetes Tipo 1',
    client: {
      name: 'Carlos',
      ageRange: '28-32 anos',
      goal: 'Ganho de massa muscular (2kg em 3 meses)',
      routine: 'Treina 5x/semana, precisa controlar glicemia, 5-6 refeições/dia'
    },
    restrictions: {
      allergies: ['Oleaginosas (amêndoas, castanhas, nozes)', 'Amendoim'],
      intolerances: [],
      conditions: ['Diabetes Tipo 1']
    },
    strategy: [
      'BLOQUEAR todas as oleaginosas (alergia crítica)',
      'Priorizar proteínas magras e carboidratos de baixo IG',
      'Distribuir carboidratos ao longo do dia',
      'Incluir gorduras boas de outras fontes (abacate, azeite, peixes)'
    ],
    sampleMenu: {
      breakfast: {
        meal: 'Tapioca com ovo mexido e abacate',
        kcal: 380,
        substitutions: 'Abacate fornece gorduras boas (substitui oleaginosas)'
      },
      lunch: {
        meal: 'Salmão grelhado com quinoa e brócolis',
        kcal: 520,
        substitutions: 'Salmão = ômega-3 (substitui nozes). Quinoa = baixo IG'
      },
      dinner: {
        meal: 'Peito de frango com batata-doce e salada',
        kcal: 450,
        substitutions: 'Batata-doce = carboidrato de baixo IG (diabetes)'
      },
      snacks: {
        meal: 'Iogurte grego com sementes de chia e frutas vermelhas',
        kcal: 200,
        substitutions: 'Sementes de chia = ômega-3 (substitui oleaginosas)'
      }
    },
    nutriplanPrevents: [
      '🚫 BLOQUEIO CRÍTICO: Nenhuma receita com oleaginosas ou amendoim',
      '⚠️ Alertou sobre índice glicêmico de todos os carboidratos',
      '✅ Sugeriu fontes alternativas de gorduras boas',
      '📊 Distribuiu carboidratos uniformemente (controle glicêmico)',
      '💪 Atingiu meta proteica (2g/kg) sem oleaginosas'
    ]
  },
  {
    id: 'case-3',
    title: 'Caso 3: Idosa Vegetariana com Hipertensão e Osteoporose',
    client: {
      name: 'Maria',
      ageRange: '65-70 anos',
      goal: 'Manutenção de peso e saúde óssea',
      routine: 'Sedentária, cozinha em casa, prefere refeições simples'
    },
    restrictions: {
      allergies: [],
      intolerances: [],
      conditions: ['Hipertensão', 'Osteoporose', 'Vegetariana (não come carne/peixe)']
    },
    strategy: [
      'Reduzir sódio drasticamente (hipertensão)',
      'Aumentar cálcio e vitamina D (osteoporose)',
      'Garantir proteína adequada sem carne (leguminosas, ovos, laticínios)',
      'Incluir alimentos ricos em potássio (controle pressão)'
    ],
    sampleMenu: {
      breakfast: {
        meal: 'Mingau de aveia com leite, chia e banana',
        kcal: 280,
        substitutions: 'Leite = cálcio. Chia = ômega-3 e cálcio'
      },
      lunch: {
        meal: 'Grão-de-bico refogado com legumes e arroz integral',
        kcal: 420,
        substitutions: 'Grão-de-bico = proteína vegetal. Sem sal adicionado (hipertensão)'
      },
      dinner: {
        meal: 'Omelete de espinafre com queijo branco e salada',
        kcal: 320,
        substitutions: 'Espinafre = cálcio. Queijo branco = baixo sódio'
      },
      snacks: {
        meal: 'Iogurte natural com amêndoas e mel',
        kcal: 180,
        substitutions: 'Iogurte = cálcio e proteína. Amêndoas = cálcio'
      }
    },
    nutriplanPrevents: [
      '⚠️ Alertou sobre sódio em todos os alimentos processados',
      '✅ Priorizou alimentos ricos em cálcio (osteoporose)',
      '✅ Garantiu 1.2g proteína/kg mesmo sem carne',
      '📊 Incluiu alimentos ricos em potássio (banana, abacate)',
      '🧂 Sugeriu temperos naturais (ervas) em vez de sal'
    ]
  }
];
```

**UI COMPONENT**:

```typescript
// Criar: /src/components/case-studies/CaseStudyCard.tsx

export function CaseStudyCard({ caseStudy }: { caseStudy: CaseStudy }) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20">
        <CardTitle>{caseStudy.title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        {/* Client Snapshot */}
        <div>
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <User className="w-4 h-4" />
            Perfil do Cliente
          </h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div><span className="text-muted-foreground">Idade:</span> {caseStudy.client.ageRange}</div>
            <div><span className="text-muted-foreground">Objetivo:</span> {caseStudy.client.goal}</div>
            <div className="col-span-2"><span className="text-muted-foreground">Rotina:</span> {caseStudy.client.routine}</div>
          </div>
        </div>
        
        {/* Restrictions */}
        <div>
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            Restrições
          </h4>
          <div className="space-y-1 text-sm">
            {caseStudy.restrictions.allergies.length > 0 && (
              <div>
                <Badge variant="destructive" className="mr-2">Alergias</Badge>
                {caseStudy.restrictions.allergies.join(', ')}
              </div>
            )}
            {caseStudy.restrictions.intolerances.length > 0 && (
              <div>
                <Badge variant="warning" className="mr-2">Intolerâncias</Badge>
                {caseStudy.restrictions.intolerances.join(', ')}
              </div>
            )}
            {caseStudy.restrictions.conditions.length > 0 && (
              <div>
                <Badge variant="secondary" className="mr-2">Condições</Badge>
                {caseStudy.restrictions.conditions.join(', ')}
              </div>
            )}
          </div>
        </div>
        
        {/* Strategy */}
        <div>
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <Target className="w-4 h-4" />
            Estratégia do Plano
          </h4>
          <ul className="space-y-1 text-sm">
            {caseStudy.strategy.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
        
        {/* Sample Menu */}
        <div>
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <UtensilsCrossed className="w-4 h-4" />
            Exemplo de Cardápio (1 dia)
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {Object.entries(caseStudy.sampleMenu).map(([meal, data]) => (
              <div key={meal} className="p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm capitalize">{meal}</span>
                  <Badge variant="outline">{data.kcal} kcal</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{data.meal}</p>
                {data.substitutions && (
                  <p className="text-xs text-blue-600 dark:text-blue-400">
                    💡 {data.substitutions}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
        
        {/* What NutriPlan Prevents */}
        <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-lg">
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-600" />
            O que o NutriPlan Preveniu
          </h4>
          <ul className="space-y-1 text-sm">
            {caseStudy.nutriplanPrevents.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
```

**ONDE IMPLEMENTAR**:
- Nova página: `/studio/learn/case-studies`
- Onboarding: Mostrar 1 caso durante setup
- Help center: Seção "Exemplos Práticos"

---

### 8) O QUE ACONTECE QUANDO VOCÊ MUDA UMA REGRA?

**STATUS ATUAL**: ❌ NÃO EXISTE
- Mudanças não têm impacto visível
- Sem sistema de auditoria
- Nutricionista não vê consequências

**BLIND SPOTS IDENTIFICADOS**:
1. ❌ Falta rastreabilidade de mudanças
2. ❌ Impacto não é calculado/mostrado
3. ❌ Sem sugestões de revisão
4. ❌ Planos existentes não são atualizados

**PLANO DE IMPLEMENTAÇÃO**:

```typescript
// Criar: /src/components/rules/RuleChangeImpact.tsx

interface RuleChange {
  mudanca: string;
  impactoImediato: string;
  oQueRevisar: string[];
  status: 'bloqueado' | 'atencao' | 'ok';
  affectedPlans?: number;
  affectedPatients?: number;
}

const RULE_CHANGE_IMPACTS: RuleChange[] = [
  {
    mudanca: 'Adicionar alergia a glúten',
    impactoImediato: 'Todos os alimentos com glúten serão BLOQUEADOS',
    oQueRevisar: [
      'Planos alimentares ativos (substituir pães, massas)',
      'Receitas salvas (verificar ingredientes)',
      'Templates (atualizar opções de carboidratos)'
    ],
    status: 'bloqueado',
    affectedPlans: 3,
    affectedPatients: 1
  },
  {
    mudanca: 'Remover preferência por frango',
    impactoImediato: 'Frango voltará a aparecer nas sugestões',
    oQueRevisar: [
      'Verificar se paciente realmente quer essa mudança',
      'Planos futuros incluirão frango automaticamente'
    ],
    status: 'ok',
    affectedPlans: 0,
    affectedPatients: 1
  },
  {
    mudanca: 'Alterar meta calórica de 1800 para 2200 kcal',
    impactoImediato: 'Aumento de 400 kcal/dia (+22%)',
    oQueRevisar: [
      'Plano atual precisa ser regenerado',
      'Distribuição de macros pode precisar ajuste',
      'Verificar se objetivo mudou (perda → manutenção?)'
    ],
    status: 'atencao',
    affectedPlans: 1,
    affectedPatients: 1
  },
  {
    mudanca: 'Trocar horário de refeições (jantar 19h → 21h)',
    impactoImediato: 'Lembretes serão atualizados',
    oQueRevisar: [
      'Verificar se afeta qualidade do sono',
      'Ajustar horário do lanche da tarde se necessário'
    ],
    status: 'ok',
    affectedPlans: 1,
    affectedPatients: 1
  },
  {
    mudanca: 'Adicionar sintoma: inchaço após laticínios',
    impactoImediato: 'Sistema sugerirá investigar intolerância à lactose',
    oQueRevisar: [
      'Considerar protocolo de eliminação de lactose',
      'Revisar consumo atual de laticínios',
      'Agendar reavaliação em 2 semanas'
    ],
    status: 'atencao',
    affectedPlans: 1,
    affectedPatients: 1
  },
  {
    mudanca: 'Remover restrição de carboidratos à noite',
    impactoImediato: 'Jantar poderá incluir carboidratos novamente',
    oQueRevisar: [
      'Verificar se objetivo foi atingido',
      'Monitorar peso nas próximas semanas',
      'Ajustar quantidade gradualmente'
    ],
    status: 'ok',
    affectedPlans: 1,
    affectedPatients: 1
  },
  {
    mudanca: 'Adicionar suplemento: Vitamina D 2000 UI',
    impactoImediato: 'Lembrete diário será criado',
    oQueRevisar: [
      'Verificar interações com medicamentos',
      'Agendar exame de controle em 3 meses',
      'Orientar sobre melhor horário (manhã com gordura)'
    ],
    status: 'ok',
    affectedPlans: 0,
    affectedPatients: 1
  },
  {
    mudanca: 'Mudar de vegetariano para vegano',
    impactoImediato: 'Ovos e laticínios serão BLOQUEADOS',
    oQueRevisar: [
      'CRÍTICO: Revisar todos os planos e receitas',
      'Garantir fontes de B12, ferro, cálcio',
      'Considerar suplementação',
      'Recalcular proteínas (fontes vegetais)'
    ],
    status: 'bloqueado',
    affectedPlans: 5,
    affectedPatients: 1
  }
];

export function RuleChangeImpactTable() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Impacto de Mudanças nas Regras</CardTitle>
        <CardDescription>
          Entenda o que acontece quando você altera restrições, preferências ou metas
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mudança</TableHead>
              <TableHead>Impacto Imediato</TableHead>
              <TableHead>O que Revisar</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {RULE_CHANGE_IMPACTS.map((change, idx) => (
              <TableRow key={idx}>
                <TableCell className="font-medium">{change.mudanca}</TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <p>{change.impactoImediato}</p>
                    {(change.affectedPlans > 0 || change.affectedPatients > 0) && (
                      <div className="flex gap-2 text-xs text-muted-foreground">
                        {change.affectedPlans > 0 && (
                          <Badge variant="outline" className="text-xs">
                            {change.affectedPlans} plano(s)
                          </Badge>
                        )}
                        {change.affectedPatients > 0 && (
                          <Badge variant="outline" className="text-xs">
                            {change.affectedPatients} paciente(s)
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <ul className="text-sm space-y-1">
                    {change.oQueRevisar.map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-muted-foreground">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </TableCell>
                <TableCell>
                  <Badge variant={
                    change.status === 'bloqueado' ? 'destructive' :
                    change.status === 'atencao' ? 'warning' :
                    'default'
                  }>
                    {change.status === 'bloqueado' ? '🚫 Bloqueado' :
                     change.status === 'atencao' ? '⚠️ Atenção' :
                     '✅ OK'}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
```

**FUNCIONALIDADE ADICIONAL**: Sistema de Preview de Mudanças

```typescript
// Antes de salvar uma mudança crítica, mostrar preview:

function RuleChangePreview({ oldRule, newRule, patientId }) {
  const impact = calculateImpact(oldRule, newRule, patientId);
  
  return (
    <Alert variant="warning">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Esta mudança afetará:</AlertTitle>
      <AlertDescription>
        <ul className="mt-2 space-y-1">
          <li>• {impact.affectedPlans} plano(s) alimentar(es)</li>
          <li>• {impact.blockedFoods.length} alimento(s) serão bloqueados</li>
          <li>• {impact.recipesToUpdate} receita(s) precisam revisão</li>
        </ul>
        <div className="mt-4 flex gap-2">
          <Button variant="outline" onClick={onCancel}>Cancelar</Button>
          <Button variant="destructive" onClick={onConfirm}>
            Confirmar Mudança
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}
```

---

### 9) CONFLITOS E BOAS PRÁTICAS

**STATUS ATUAL**: ❌ NÃO DOCUMENTADO
- Sem guia de boas práticas
- Erros comuns não são prevenidos
- Falta educação do usuário

**PLANO DE IMPLEMENTAÇÃO**:

```typescript
// Criar: /src/components/best-practices/BestPracticesGuide.tsx

const COMMON_MISTAKES = [
  {
    mistake: 'Não revisar alergias antes de gerar plano',
    consequence: 'Plano pode incluir alimentos perigosos',
    solution: 'SEMPRE confirme alergias no passo 2 do wizard',
    severity: 'critical'
  },
  {
    mistake: 'Criar plano muito restritivo na primeira semana',
    consequence: 'Paciente desiste por dificuldade',
    solution: 'Comece simples. Adicione complexidade gradualmente',
    severity: 'high'
  },
  {
    mistake: 'Não configurar substituições',
    consequence: 'Paciente não sabe o que fazer se faltar ingrediente',
    solution: 'Sempre forneça 2-3 opções de substituição por refeição',
    severity: 'medium'
  },
  {
    mistake: 'Ignorar rotina do paciente',
    consequence: 'Plano impraticável (ex: receitas elaboradas para quem não tem tempo)',
    solution: 'Pergunte: "Quanto tempo você tem para cozinhar?"',
    severity: 'high'
  },
  {
    mistake: 'Não acompanhar sintomas',
    consequence: 'Perde oportunidade de identificar intolerâncias',
    solution: 'Peça ao paciente para logar sintomas diariamente',
    severity: 'medium'
  },
  {
    mistake: 'Mudar muitas coisas de uma vez',
    consequence: 'Impossível identificar o que funcionou/não funcionou',
    solution: 'Mude 1-2 variáveis por vez. Aguarde 1-2 semanas para avaliar',
    severity: 'medium'
  },
  {
    mistake: 'Não explicar o "porquê" das restrições',
    consequence: 'Paciente não entende e não adere',
    solution: 'Sempre explique a razão científica de cada restrição',
    severity: 'high'
  }
];

const BEST_PRACTICES = [
  {
    practice: 'Revisar alergênicos SEMPRE',
    benefit: 'Segurança do paciente garantida',
    howTo: 'Use o checklist automático antes de publicar plano',
    icon: <Shield />
  },
  {
    practice: 'Confirmar substitutos com paciente',
    benefit: 'Evita desperdício e frustração',
    howTo: 'Envie lista de substitutos para aprovação antes de finalizar',
    icon: <CheckCircle />
  },
  {
    practice: 'Simplificar primeira semana',
    benefit: 'Aumenta aderência em 40%',
    howTo: 'Use template "Iniciante" com receitas de ≤30min',
    icon: <Zap />
  },
  {
    practice: 'Acompanhar evolução semanalmente',
    benefit: 'Ajustes rápidos = melhores resultados',
    howTo: 'Configure lembretes para check-in nos dias 3, 7, 14',
    icon: <TrendingUp />
  },
  {
    practice: 'Usar IA para análise de sintomas',
    benefit: 'Identifica padrões que você pode não ver',
    howTo: 'Rode "Symptom Correlator" a cada 2 semanas',
    icon: <Brain />
  },
  {
    practice: 'Documentar tudo',
    benefit: 'Rastreabilidade e aprendizado contínuo',
    howTo: 'Use campo de notas em cada consulta',
    icon: <FileText />
  },
  {
    practice: 'Educar o paciente',
    benefit: 'Paciente educado = paciente aderente',
    howTo: 'Compartilhe artigos e vídeos educativos do app',
    icon: <GraduationCap />
  }
];

export function BestPracticesGuide() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Common Mistakes */}
      <Card>
        <CardHeader className="bg-red-50 dark:bg-red-900/20">
          <CardTitle className="flex items-center gap-2">
            <XCircle className="w-5 h-5 text-red-500" />
            Erros Comuns
          </CardTitle>
          <CardDescription>Evite estes erros frequentes</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {COMMON_MISTAKES.map((item, idx) => (
              <div key={idx} className="border-l-4 border-red-500 pl-4 py-2">
                <div className="flex items-start justify-between mb-1">
                  <h4 className="font-medium text-sm">{item.mistake}</h4>
                  <Badge variant={
                    item.severity === 'critical' ? 'destructive' :
                    item.severity === 'high' ? 'warning' :
                    'secondary'
                  } className="text-xs">
                    {item.severity}
                  </Badge>
                </div>
                <p className="text-sm text-red-600 dark:text-red-400 mb-2">
                  ⚠️ {item.consequence}
                </p>
                <p className="text-sm text-muted-foreground">
                  ✅ {item.solution}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Best Practices */}
      <Card>
        <CardHeader className="bg-green-50 dark:bg-green-900/20">
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            Boas Práticas
          </CardTitle>
          <CardDescription>Siga estas recomendações</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {BEST_PRACTICES.map((item, idx) => (
              <div key={idx} className="border-l-4 border-green-500 pl-4 py-2">
                <div className="flex items-center gap-2 mb-1">
                  {item.icon}
                  <h4 className="font-medium text-sm">{item.practice}</h4>
                </div>
                <p className="text-sm text-green-600 dark:text-green-400 mb-2">
                  💡 {item.benefit}
                </p>
                <p className="text-sm text-muted-foreground">
                  📝 {item.howTo}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

---

## 📄 CONTINUA EM PARTE 3

Os próximos pontos (10-13) serão cobertos em documento separado:
- 10) Como navegar pelo app (atalhos)
- 11) Diagnóstico e integridade
- 12) Glossário inteligente
- 13) Fluxos

Deseja que eu continue?
