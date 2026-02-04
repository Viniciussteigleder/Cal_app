# 🔍 ANÁLISE DE BLIND SPOTS - NutriPlan
## Identificação de Gaps e Plano de Melhorias

---

## 📊 STATUS ATUAL vs REQUISITOS

### 3) MAPA INTERATIVO DA JORNADA (CARDS)

**STATUS ATUAL**: ❌ NÃO IMPLEMENTADO
- Não existe visualização de jornada do paciente
- Não há cards mostrando etapas do processo
- Fluxo não é claro para nutricionistas

**BLIND SPOTS IDENTIFICADOS**:
1. ❌ Falta onboarding visual do processo
2. ❌ Nutricionista não vê "próximos passos" claros
3. ❌ Paciente não entende sua jornada
4. ❌ Sem indicadores de progresso por etapa
5. ❌ Falta mapeamento de inputs/outputs

**PLANO DE IMPLEMENTAÇÃO**:

```typescript
// Criar: /src/components/journey/JourneyMap.tsx

interface JourneyCard {
  id: string;
  title: string; // 2-4 palavras
  description: string; // 1 linha
  inputs: string[]; // 2-3 bullets
  outputs: string[]; // 2-3 bullets
  status: 'pending' | 'in_progress' | 'completed';
  icon: React.ReactNode;
}

const JOURNEY_CARDS: JourneyCard[] = [
  {
    id: 'cadastro',
    title: 'Cadastro do Cliente',
    description: 'Coleta de dados básicos e criação do perfil',
    inputs: ['Nome, email, telefone', 'Dados antropométricos', 'Objetivo principal'],
    outputs: ['Perfil criado', 'ID do paciente', 'Acesso ao app'],
    status: 'completed',
    icon: <UserPlus />
  },
  {
    id: 'anamnese',
    title: 'Anamnese & Objetivos',
    description: 'Entrevista completa e definição de metas',
    inputs: ['Histórico médico', 'Rotina diária', 'Preferências alimentares'],
    outputs: ['Ficha completa', 'Metas definidas', 'Perfil de atividade'],
    status: 'in_progress',
    icon: <ClipboardList />
  },
  {
    id: 'restricoes',
    title: 'Restrições & Alergênicos',
    description: 'Mapeamento de alergias e intolerâncias',
    inputs: ['Alergias conhecidas', 'Sintomas reportados', 'Exames anteriores'],
    outputs: ['Lista de bloqueios', 'Alertas configurados', 'Substitutos sugeridos'],
    status: 'pending',
    icon: <AlertTriangle />
  },
  {
    id: 'plano',
    title: 'Plano Alimentar',
    description: 'Criação do plano personalizado',
    inputs: ['Metas calóricas', 'Restrições', 'Preferências'],
    outputs: ['Plano semanal', 'Receitas', 'Macros balanceados'],
    status: 'pending',
    icon: <FileText />
  },
  {
    id: 'lista',
    title: 'Lista de Compras',
    description: 'Geração automática da lista',
    inputs: ['Plano alimentar', 'Número de pessoas', 'Período'],
    outputs: ['Lista organizada', 'Custo estimado', 'Opções de entrega'],
    status: 'pending',
    icon: <ShoppingCart />
  },
  {
    id: 'ajustes',
    title: 'Ajustes & Substituições',
    description: 'Adaptações conforme feedback',
    inputs: ['Feedback do paciente', 'Dificuldades', 'Preferências'],
    outputs: ['Plano ajustado', 'Novas receitas', 'Alternativas'],
    status: 'pending',
    icon: <RefreshCw />
  },
  {
    id: 'acompanhamento',
    title: 'Acompanhamento',
    description: 'Monitoramento contínuo de progresso',
    inputs: ['Logs diários', 'Sintomas', 'Medições'],
    outputs: ['Relatórios', 'Insights', 'Recomendações'],
    status: 'pending',
    icon: <TrendingUp />
  }
];
```

**ONDE IMPLEMENTAR**:
- Dashboard do Nutricionista: `/studio/dashboard`
- Página do Paciente: `/studio/patients/[id]`
- Onboarding: `/studio/patients/new`

**MÉTRICAS DE SUCESSO**:
- ✅ Nutricionista vê status de cada etapa
- ✅ Tempo médio por etapa reduz 30%
- ✅ Taxa de conclusão aumenta 40%

---

### 4) LÓGICA POR TRÁS DO NUTRIPLAN

**STATUS ATUAL**: ⚠️ PARCIALMENTE IMPLEMENTADO
- Existe lógica básica no schema (PatientCondition, ConditionType)
- Meal Planner tem campos para alergias
- Falta integração e regras de negócio claras

**BLIND SPOTS IDENTIFICADOS**:
1. ⚠️ Lógica de perfil existe mas não é usada consistentemente
2. ❌ Safety gates de alergia não implementados
3. ❌ Gut health considerations não estruturadas
4. ⚠️ Plan generation é manual, não usa constraints
5. ❌ Adherence logic não existe

**PLANO DE IMPLEMENTAÇÃO**:

```typescript
// Criar: /src/lib/nutriplan/core-logic.ts

// 1. CLIENT PROFILE LOGIC
interface ClientProfile {
  goals: Goal; // loss, gain, maintain
  routine: {
    workSchedule: 'regular' | 'shift' | 'flexible';
    activityLevel: ActivityLevel;
    mealPreferences: {
      mealsPerDay: number;
      cookingTime: 'quick' | 'moderate' | 'elaborate';
      complexity: 'simple' | 'intermediate' | 'advanced';
    };
  };
  preferences: {
    cuisineTypes: string[];
    favoriteIngredients: string[];
    dislikedIngredients: string[];
  };
}

// 2. ALLERGY/INTOLERANCE SAFETY GATES
interface SafetyGate {
  type: 'allergy' | 'intolerance' | 'restriction';
  severity: 'critical' | 'high' | 'medium' | 'low';
  action: 'block' | 'warn' | 'suggest_substitute';
  
  blockedFoods: string[]; // IDs de alimentos bloqueados
  warnings: string[]; // Mensagens de alerta
  substitutions: Array<{
    original: string;
    substitute: string;
    reason: string;
  }>;
}

function validateMealPlanSafety(
  plan: MealPlan,
  safetyGates: SafetyGate[]
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  for (const gate of safetyGates) {
    if (gate.severity === 'critical') {
      // BLOQUEIA se encontrar alimento proibido
      const violations = findBlockedFoods(plan, gate.blockedFoods);
      if (violations.length > 0) {
        errors.push(`CRÍTICO: ${gate.type} detectada - ${violations.join(', ')}`);
      }
    } else if (gate.action === 'warn') {
      // AVISA mas permite
      warnings.push(`Atenção: ${gate.warnings.join(', ')}`);
    }
  }
  
  return { valid: errors.length === 0, errors, warnings };
}

// 3. GUT HEALTH CONSIDERATIONS
interface GutHealthProfile {
  symptoms: {
    bloating: number; // 0-10
    pain: number;
    irregularity: number;
    gas: number;
  };
  triggers: {
    food: string;
    symptom: string;
    confidence: number; // 0-1
  }[];
  microbiotaSupport: {
    probiotics: boolean;
    prebiotics: boolean;
    fermentedFoods: boolean;
    fiberTarget: number; // gramas/dia
  };
}

function applyGutHealthRules(
  plan: MealPlan,
  gutProfile: GutHealthProfile
): MealPlan {
  // Remove trigger foods
  plan = removeTriggerFoods(plan, gutProfile.triggers);
  
  // Add microbiota support
  if (gutProfile.microbiotaSupport.probiotics) {
    plan = addProbioticFoods(plan); // iogurte, kefir
  }
  
  if (gutProfile.microbiotaSupport.prebiotics) {
    plan = addPrebioticFoods(plan); // banana verde, aveia
  }
  
  // Ensure fiber target
  plan = adjustFiberContent(plan, gutProfile.microbiotaSupport.fiberTarget);
  
  return plan;
}

// 4. PLAN GENERATION LOGIC
interface PlanGenerationConfig {
  template: PlanTemplate;
  constraints: {
    calories: { min: number; max: number; target: number };
    macros: { protein: number; carbs: number; fat: number };
    meals: { count: number; distribution: number[] };
  };
  personalization: {
    profile: ClientProfile;
    safetyGates: SafetyGate[];
    gutHealth?: GutHealthProfile;
  };
}

async function generateMealPlan(
  config: PlanGenerationConfig
): Promise<MealPlan> {
  // 1. Start with template
  let plan = cloneTemplate(config.template);
  
  // 2. Apply safety gates (PRIORITY 1)
  plan = applySafetyGates(plan, config.personalization.safetyGates);
  
  // 3. Apply gut health rules (PRIORITY 2)
  if (config.personalization.gutHealth) {
    plan = applyGutHealthRules(plan, config.personalization.gutHealth);
  }
  
  // 4. Adjust to macro targets (PRIORITY 3)
  plan = adjustMacros(plan, config.constraints.macros);
  
  // 5. Apply preferences (PRIORITY 4)
  plan = applyPreferences(plan, config.personalization.profile.preferences);
  
  // 6. Simplify if needed (PRIORITY 5)
  if (config.personalization.profile.routine.mealPreferences.cookingTime === 'quick') {
    plan = simplifyRecipes(plan);
  }
  
  // 7. Validate final plan
  const validation = validateMealPlanSafety(plan, config.personalization.safetyGates);
  if (!validation.valid) {
    throw new Error(`Plan validation failed: ${validation.errors.join(', ')}`);
  }
  
  return plan;
}

// 5. ADHERENCE LOGIC
interface AdherenceFactors {
  simplicity: number; // 0-1 (quanto mais simples, maior aderência)
  variety: number; // 0-1 (variedade moderada é melhor)
  culturalFit: number; // 0-1 (alimentos familiares)
  costEffectiveness: number; // 0-1 (custo acessível)
  preparationTime: number; // minutos médios
}

function calculateAdherenceProbability(
  plan: MealPlan,
  profile: ClientProfile
): number {
  const factors = analyzeAdherenceFactors(plan, profile);
  
  // Weighted formula
  const score = (
    factors.simplicity * 0.25 +
    factors.variety * 0.15 +
    factors.culturalFit * 0.25 +
    factors.costEffectiveness * 0.20 +
    (1 - factors.preparationTime / 120) * 0.15 // normalize prep time
  );
  
  return Math.round(score * 100); // 0-100%
}

function optimizeForAdherence(plan: MealPlan): MealPlan {
  // Add swap options for each meal
  plan.meals.forEach(meal => {
    meal.swapOptions = generateSwapOptions(meal, 3); // 3 alternativas
  });
  
  // Add reminders
  plan.reminders = [
    { time: '08:00', message: 'Lembre-se de preparar o café da manhã!' },
    { time: '12:00', message: 'Hora do almoço! Confira seu plano.' },
    { time: '19:00', message: 'Jantar em breve. Tudo pronto?' }
  ];
  
  return plan;
}
```

**INTEGRAÇÃO NO APP**:
- Criar service layer: `/src/services/nutriplan-engine.ts`
- Integrar no meal planner: `/studio/ai/meal-planner`
- Adicionar validação em tempo real
- Dashboard mostra adherence score

---

### 5) REGRAS E RESTRIÇÕES

**STATUS ATUAL**: ⚠️ CONCEITOS EXISTEM, LÓGICA NÃO
- Schema tem `ConditionType` enum (allergy, intolerance, disease, other)
- Não há sistema de priorização
- Não há resolução de conflitos

**BLIND SPOTS IDENTIFICADOS**:
1. ❌ Conceitos não estão documentados para usuário
2. ❌ Ordem de prioridade não implementada
3. ❌ Conflitos não são detectados nem resolvidos
4. ❌ UI não mostra hierarquia de regras

**PLANO DE IMPLEMENTAÇÃO**:

```typescript
// Criar: /src/lib/nutriplan/rules-engine.ts

// 1. CONCEITOS CLAROS
enum RestrictionType {
  ALLERGY = 'allergy',           // Reação imunológica - BLOQUEIA
  INTOLERANCE = 'intolerance',   // Dificuldade digestão - EVITA/LIMITA
  CLINICAL = 'clinical',         // Condição médica - CAUTELA
  PREFERENCE = 'preference',     // Gosto pessoal - OTIMIZA
  CONVENIENCE = 'convenience'    // Praticidade - SIMPLIFICA
}

interface Restriction {
  type: RestrictionType;
  priority: number; // 1 = highest
  name: string;
  description: string;
  action: 'block' | 'limit' | 'caution' | 'optimize' | 'simplify';
  affectedFoods: string[];
  symptoms?: string[];
}

// 2. ORDEM DE PRIORIDADE
const PRIORITY_ORDER = [
  {
    level: 1,
    type: RestrictionType.ALLERGY,
    action: 'block',
    description: 'Alergias alimentares - BLOQUEIO TOTAL',
    examples: ['Alergia a amendoim', 'Alergia a frutos do mar', 'Alergia a lactose']
  },
  {
    level: 2,
    type: RestrictionType.INTOLERANCE,
    action: 'limit',
    description: 'Intolerâncias - EVITAR ou LIMITAR quantidade',
    examples: ['Intolerância à lactose', 'Intolerância ao glúten', 'Intolerância à histamina']
  },
  {
    level: 3,
    type: RestrictionType.CLINICAL,
    action: 'caution',
    description: 'Condições clínicas - SUGERIR CAUTELA',
    examples: ['Diabetes', 'Hipertensão', 'Doença renal', 'SII']
  },
  {
    level: 4,
    type: RestrictionType.PREFERENCE,
    action: 'optimize',
    description: 'Preferências pessoais - OTIMIZAR escolhas',
    examples: ['Vegetariano', 'Não gosta de cebola', 'Prefere frango']
  },
  {
    level: 5,
    type: RestrictionType.CONVENIENCE,
    action: 'simplify',
    description: 'Conveniência - SIMPLIFICAR quando possível',
    examples: ['Pouco tempo para cozinhar', 'Orçamento limitado', 'Poucos utensílios']
  }
];

// 3. RESOLUÇÃO DE CONFLITOS
interface Conflict {
  type: 'restriction_vs_restriction' | 'restriction_vs_goal' | 'restriction_vs_preference';
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  resolution: string;
}

function detectConflicts(restrictions: Restriction[]): Conflict[] {
  const conflicts: Conflict[] = [];
  
  // Exemplo: Alergia a lactose + Preferência por iogurte
  const lactoseAllergy = restrictions.find(r => 
    r.type === RestrictionType.ALLERGY && r.affectedFoods.includes('lactose')
  );
  const yogurtPreference = restrictions.find(r =>
    r.type === RestrictionType.PREFERENCE && r.affectedFoods.includes('iogurte')
  );
  
  if (lactoseAllergy && yogurtPreference) {
    conflicts.push({
      type: 'restriction_vs_preference',
      severity: 'critical',
      description: 'Paciente tem alergia a lactose mas prefere iogurte',
      resolution: 'ALERGIA tem prioridade. Sugerir iogurte sem lactose ou alternativas vegetais.'
    });
  }
  
  // Exemplo: Diabetes + Meta de ganho de peso
  const diabetes = restrictions.find(r =>
    r.type === RestrictionType.CLINICAL && r.name.includes('diabetes')
  );
  const gainWeight = restrictions.find(r =>
    r.type === RestrictionType.PREFERENCE && r.name.includes('ganho')
  );
  
  if (diabetes && gainWeight) {
    conflicts.push({
      type: 'restriction_vs_goal',
      severity: 'high',
      description: 'Paciente diabético quer ganhar peso',
      resolution: 'Priorizar controle glicêmico. Ganho de peso com alimentos de baixo IG e alto valor proteico.'
    });
  }
  
  return conflicts;
}

function resolveConflicts(
  restrictions: Restriction[],
  conflicts: Conflict[]
): Restriction[] {
  // Sort by priority
  const sorted = restrictions.sort((a, b) => a.priority - b.priority);
  
  // Apply resolution logic
  for (const conflict of conflicts) {
    if (conflict.severity === 'critical') {
      // Higher priority wins
      console.log(`CONFLICT RESOLVED: ${conflict.resolution}`);
    }
  }
  
  return sorted;
}

// 4. APLICAÇÃO DE REGRAS
function applyRestrictions(
  foods: Food[],
  restrictions: Restriction[]
): Food[] {
  let filtered = [...foods];
  
  // Apply in priority order
  for (const restriction of restrictions.sort((a, b) => a.priority - b.priority)) {
    switch (restriction.action) {
      case 'block':
        filtered = filtered.filter(f => !restriction.affectedFoods.includes(f.id));
        break;
      case 'limit':
        filtered = filtered.map(f => {
          if (restriction.affectedFoods.includes(f.id)) {
            f.maxQuantity = 50; // limite em gramas
            f.warning = `Limitar consumo devido a ${restriction.name}`;
          }
          return f;
        });
        break;
      case 'caution':
        filtered = filtered.map(f => {
          if (restriction.affectedFoods.includes(f.id)) {
            f.caution = `Atenção: ${restriction.description}`;
          }
          return f;
        });
        break;
    }
  }
  
  return filtered;
}
```

**UI COMPONENTS**:

```typescript
// Criar: /src/components/restrictions/RestrictionsPriorityList.tsx

export function RestrictionsPriorityList({ patientId }: Props) {
  const restrictions = usePatientRestrictions(patientId);
  const conflicts = detectConflicts(restrictions);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Regras e Restrições</CardTitle>
        <CardDescription>Ordem de prioridade aplicada</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Conflicts Alert */}
        {conflicts.length > 0 && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>{conflicts.length} conflito(s) detectado(s)</AlertTitle>
            <AlertDescription>
              {conflicts.map(c => (
                <div key={c.description}>
                  <p className="font-medium">{c.description}</p>
                  <p className="text-sm">Resolução: {c.resolution}</p>
                </div>
              ))}
            </AlertDescription>
          </Alert>
        )}
        
        {/* Priority List */}
        <div className="space-y-2 mt-4">
          {PRIORITY_ORDER.map(priority => {
            const items = restrictions.filter(r => r.type === priority.type);
            return (
              <div key={priority.level} className="border-l-4 pl-4" style={{
                borderColor: priority.level === 1 ? 'red' : 
                            priority.level === 2 ? 'orange' : 
                            priority.level === 3 ? 'yellow' : 'gray'
              }}>
                <div className="flex items-center justify-between">
                  <div>
                    <Badge>{priority.level}</Badge>
                    <span className="ml-2 font-medium">{priority.description}</span>
                  </div>
                  <Badge variant={priority.action === 'block' ? 'destructive' : 'secondary'}>
                    {priority.action.toUpperCase()}
                  </Badge>
                </div>
                {items.length > 0 && (
                  <ul className="mt-2 text-sm text-muted-foreground">
                    {items.map(item => (
                      <li key={item.name}>• {item.name}</li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
```

---

## 🎯 PRÓXIMOS PASSOS

Vou continuar com os pontos 6-13 em um segundo documento para não exceder o limite de tokens.

Deseja que eu continue com:
- 6) Como criar um plano (passo a passo)
- 7) Exemplos práticos (3 mini-cases)
- 8) O que acontece quando você muda uma regra
- 9) Conflitos e boas práticas
- 10) Como navegar pelo app (atalhos)
- 11) Diagnóstico e integridade
- 12) Glossário inteligente
- 13) Fluxos

?
