// Mock data for demonstration when database is not available
// This allows the app to function without a database connection

export const MOCK_USERS = {
  "patient@demo.nutriplan.com": {
    id: "00000000-0000-0000-0000-00000000d101",
    email: "patient@demo.nutriplan.com",
    name: "Maria Silva",
    role: "PATIENT" as const,
    tenantId: "00000000-0000-0000-0000-00000000d001",
    patientId: "00000000-0000-0000-0000-00000000d201",
  },
  "nutri@demo.nutriplan.com": {
    id: "00000000-0000-0000-0000-00000000d102",
    email: "nutri@demo.nutriplan.com",
    name: "Dr. Carlos Nutricionista",
    role: "TENANT_ADMIN" as const,
    tenantId: "00000000-0000-0000-0000-00000000d001",
    patientId: null,
  },
  "owner@demo.nutriplan.com": {
    id: "00000000-0000-0000-0000-00000000d103",
    email: "owner@demo.nutriplan.com",
    name: "Admin Sistema",
    role: "OWNER" as const,
    tenantId: "00000000-0000-0000-0000-00000000d001",
    patientId: null,
  },
};

export const MOCK_PATIENT_PROFILE = {
  name: "Maria Silva",
  currentWeight: 68,
  targetWeight: 63,
  goal: "loss",
  height: 165,
  birthDate: "1990-05-15",
  sex: "female",
  activityLevel: "moderate",
};

export const MOCK_FOODS = [
  { id: "food-001", name: "Arroz branco cozido", group: "grains", regionTag: "BR", nutrients: { calories: 128, protein: 2.5, carbs: 28, fat: 0.2, fiber: 0.4 }, histamineRisk: "low" as const },
  { id: "food-002", name: "Feijão preto cozido", group: "legumes", regionTag: "BR", nutrients: { calories: 77, protein: 4.5, carbs: 14, fat: 0.5, fiber: 8.4 }, histamineRisk: "low" as const },
  { id: "food-003", name: "Frango grelhado", group: "protein", regionTag: "BR", nutrients: { calories: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0 }, histamineRisk: "low" as const },
  { id: "food-004", name: "Ovo cozido", group: "protein", regionTag: "BR", nutrients: { calories: 155, protein: 13, carbs: 1.1, fat: 11, fiber: 0 }, histamineRisk: "low" as const },
  { id: "food-005", name: "Banana prata", group: "fruits", regionTag: "BR", nutrients: { calories: 89, protein: 1.1, carbs: 23, fat: 0.3, fiber: 2.6 }, histamineRisk: "medium" as const },
  { id: "food-006", name: "Maçã", group: "fruits", regionTag: "BR", nutrients: { calories: 52, protein: 0.3, carbs: 14, fat: 0.2, fiber: 2.4 }, histamineRisk: "low" as const },
  { id: "food-007", name: "Batata doce cozida", group: "grains", regionTag: "BR", nutrients: { calories: 86, protein: 1.6, carbs: 20, fat: 0.1, fiber: 3 }, histamineRisk: "low" as const },
  { id: "food-008", name: "Pão francês", group: "grains", regionTag: "BR", nutrients: { calories: 289, protein: 8.5, carbs: 57, fat: 2.1, fiber: 2.7 }, histamineRisk: "low" as const },
  { id: "food-009", name: "Queijo minas frescal", group: "dairy", regionTag: "BR", nutrients: { calories: 264, protein: 17, carbs: 3, fat: 20, fiber: 0 }, histamineRisk: "medium" as const },
  { id: "food-010", name: "Iogurte natural", group: "dairy", regionTag: "BR", nutrients: { calories: 59, protein: 3.5, carbs: 4.7, fat: 3.3, fiber: 0 }, histamineRisk: "medium" as const },
  { id: "food-011", name: "Azeite de oliva", group: "oils", regionTag: "BR", nutrients: { calories: 884, protein: 0, carbs: 0, fat: 100, fiber: 0 }, histamineRisk: "low" as const },
  { id: "food-012", name: "Alface", group: "vegetables", regionTag: "BR", nutrients: { calories: 15, protein: 1.4, carbs: 2.9, fat: 0.2, fiber: 1.3 }, histamineRisk: "low" as const },
  { id: "food-013", name: "Tomate", group: "vegetables", regionTag: "BR", nutrients: { calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2, fiber: 1.2 }, histamineRisk: "high" as const },
  { id: "food-014", name: "Cenoura cozida", group: "vegetables", regionTag: "BR", nutrients: { calories: 35, protein: 0.8, carbs: 8.2, fat: 0.2, fiber: 2.8 }, histamineRisk: "low" as const },
  { id: "food-015", name: "Brócolis cozido", group: "vegetables", regionTag: "BR", nutrients: { calories: 35, protein: 2.4, carbs: 7.2, fat: 0.4, fiber: 3.3 }, histamineRisk: "low" as const },
  { id: "food-016", name: "Salmão assado", group: "protein", regionTag: "BR", nutrients: { calories: 208, protein: 20, carbs: 0, fat: 13, fiber: 0 }, histamineRisk: "high" as const },
  { id: "food-017", name: "Atum em água", group: "protein", regionTag: "BR", nutrients: { calories: 116, protein: 26, carbs: 0, fat: 1, fiber: 0 }, histamineRisk: "high" as const },
  { id: "food-018", name: "Aveia em flocos", group: "grains", regionTag: "BR", nutrients: { calories: 389, protein: 17, carbs: 66, fat: 7, fiber: 10 }, histamineRisk: "low" as const },
  { id: "food-019", name: "Castanha de caju", group: "other", regionTag: "BR", nutrients: { calories: 553, protein: 18, carbs: 30, fat: 44, fiber: 3.3 }, histamineRisk: "low" as const },
  { id: "food-020", name: "Abacate", group: "fruits", regionTag: "BR", nutrients: { calories: 160, protein: 2, carbs: 9, fat: 15, fiber: 7 }, histamineRisk: "medium" as const },
];

export const MOCK_MEALS_TODAY = [
  {
    id: "meal-001",
    type: "breakfast",
    time: "07:30",
    items: [
      { foodId: "food-004", name: "Ovo cozido", grams: 100, calories: 155 },
      { foodId: "food-008", name: "Pão francês", grams: 50, calories: 145 },
    ],
    totalCalories: 300,
  },
  {
    id: "meal-002",
    type: "lunch",
    time: "12:30",
    items: [
      { foodId: "food-001", name: "Arroz branco cozido", grams: 150, calories: 192 },
      { foodId: "food-002", name: "Feijão preto cozido", grams: 100, calories: 77 },
      { foodId: "food-003", name: "Frango grelhado", grams: 150, calories: 248 },
      { foodId: "food-012", name: "Alface", grams: 50, calories: 8 },
    ],
    totalCalories: 525,
  },
];

export const MOCK_SYMPTOM_LOGS = [
  {
    id: "symptom-001",
    date: new Date().toISOString(),
    bristolScale: 4,
    discomfortLevel: 3,
    symptoms: ["Leve inchaço"],
    notes: "Após o almoço",
    linkedMealId: "meal-002",
  },
];

export const MOCK_DASHBOARD_DATA = {
  profile: MOCK_PATIENT_PROFILE,
  today: {
    calories: 825,
    protein: 52,
    carbs: 95,
    fat: 28,
    mealsLogged: 2,
  },
  goals: {
    calories: 1800,
    protein: 90,
    carbs: 200,
    fat: 60,
  },
  consistency: {
    daysThisWeek: 5,
    streak: 12,
  },
};

export const MOCK_PATIENTS = [
  {
    id: "patient-001",
    name: "Maria Silva",
    email: "maria@email.com",
    status: "active",
    lastConsultation: "2024-01-15",
    activePlan: "Emagrecimento FODMAP",
    histamineLoad: 45,
    alerts: [],
  },
  {
    id: "patient-002",
    name: "João Santos",
    email: "joao@email.com",
    status: "active",
    lastConsultation: "2024-01-10",
    activePlan: "Manutenção Low Histamine",
    histamineLoad: 72,
    alerts: [{ type: "warning", message: "Carga histamínica elevada" }],
  },
  {
    id: "patient-003",
    name: "Ana Costa",
    email: "ana@email.com",
    status: "active",
    lastConsultation: "2024-01-12",
    activePlan: "Protocolo Lactose",
    histamineLoad: 28,
    alerts: [],
  },
  {
    id: "patient-004",
    name: "Carlos Oliveira",
    email: "carlos@email.com",
    status: "active",
    lastConsultation: "2024-01-08",
    activePlan: "Ganho de Massa",
    histamineLoad: 35,
    alerts: [],
  },
  {
    id: "patient-005",
    name: "Fernanda Lima",
    email: "fernanda@email.com",
    status: "inactive",
    lastConsultation: "2023-12-20",
    activePlan: null,
    histamineLoad: 0,
    alerts: [],
  },
];

export const MOCK_CLINICAL_ALERTS = [
  {
    id: "alert-001",
    patientId: "patient-002",
    patientName: "João Santos",
    severity: "warning" as const,
    type: "histamine",
    message: "Carga histamínica acima do limite (72%)",
    trigger: "Consumo de atum + queijo curado",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "alert-002",
    patientId: "patient-001",
    patientName: "Maria Silva",
    severity: "info" as const,
    type: "correlation",
    message: "Nova correlação detectada: laticínios → inchaço",
    trigger: "Padrão identificado em 5 ocorrências",
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
  },
];

export const MOCK_AI_CORRELATIONS = [
  {
    id: "corr-001",
    patientId: "patient-001",
    patientName: "Maria Silva",
    pattern: "Consumo de laticínios correlacionado com inchaço abdominal",
    confidence: 0.87,
    occurrences: 5,
    timeWindow: "30-90 minutos após consumo",
    recommendation: "Considerar protocolo de eliminação de lactose",
  },
  {
    id: "corr-002",
    patientId: "patient-002",
    patientName: "João Santos",
    pattern: "Sobras de mais de 24h associadas a sintomas histamínicos",
    confidence: 0.92,
    occurrences: 8,
    timeWindow: "1-3 horas após consumo",
    recommendation: "Orientar sobre congelamento imediato de sobras",
  },
];

export const MOCK_TENANTS = [
  {
    id: "tenant-001",
    name: "Clínica NutriVida",
    type: "B2C",
    status: "active",
    createdAt: "2023-06-15",
    stats: {
      totalUsers: 15,
      nutritionists: 3,
      patients: 12,
      activePatients: 10,
      activeToday: 6,
      publishedDatasets: 2,
    },
  },
  {
    id: "tenant-002",
    name: "Instituto Saúde Digestiva",
    type: "B2B",
    status: "active",
    createdAt: "2023-08-20",
    stats: {
      totalUsers: 45,
      nutritionists: 8,
      patients: 37,
      activePatients: 32,
      activeToday: 18,
      publishedDatasets: 2,
    },
  },
];

export const MOCK_GLOBAL_STATS = {
  totalTenants: 2,
  activeTenants: 2,
  totalUsers: 60,
  totalPatients: 49,
  totalMeals: 1250,
  totalSymptomLogs: 480,
  mealsToday: 42,
  symptomsToday: 15,
};

// AI Chat feature mock data
export const MOCK_PATIENT_CASES = [
  {
    id: "case-001",
    patientId: "patient-001",
    patientName: "Maria Silva",
    anamnesis: {
      mainComplaint: "Inchaço abdominal frequente e desconforto após refeições",
      medicalHistory: "Síndrome do intestino irritável diagnosticada em 2022",
      medications: ["Buscopan (quando necessário)", "Probiótico VSL#3"],
      allergies: ["Nenhuma conhecida"],
      lifestyle: {
        exercise: "Caminhada 3x/semana",
        sleep: "6-7 horas/noite",
        stress: "Moderado a alto (trabalho)",
        alcohol: "Ocasional, 1-2x/mês",
        smoking: "Não",
      },
    },
    goals: {
      primary: "Reduzir sintomas digestivos",
      secondary: "Perder 5kg de forma saudável",
      timeline: "3 meses",
    },
    consultations: [
      {
        date: "2024-01-15",
        notes: "Primeira consulta. Paciente relata desconforto frequente após consumo de laticínios e alimentos fermentados. Iniciamos protocolo de eliminação.",
        weight: 68,
        symptoms: ["Inchaço", "Gases", "Desconforto abdominal"],
      },
      {
        date: "2024-01-29",
        notes: "Retorno 2 semanas. Melhora significativa com eliminação de laticínios. Mantém queixa leve com alguns vegetais crus.",
        weight: 67.2,
        symptoms: ["Inchaço leve"],
      },
    ],
    currentProtocol: "Low FODMAP - Fase de Eliminação",
    progressNotes: [
      "Boa adesão ao protocolo nas primeiras 2 semanas",
      "Identificada correlação com laticínios (87% confiança)",
      "Consistência de registro: 85%",
    ],
    chatHistory: [
      {
        id: "msg-001",
        role: "user" as const,
        content: "Olá! Gostaria de uma análise do caso da Maria, considerando o histórico de consultas e sintomas.",
        timestamp: "2024-01-30T10:00:00Z",
      },
      {
        id: "msg-002",
        role: "assistant" as const,
        content: "# Resumo do Caso - Maria Silva\n\n## Perfil do Paciente\n- **Idade:** 33 anos\n- **Diagnóstico:** SII (Síndrome do Intestino Irritável)\n- **Objetivo:** Redução de sintomas + emagrecimento\n\n## Evolução Clínica\n\n### Queixas Principais\n- Inchaço abdominal pós-prandial\n- Desconforto digestivo\n- Gases frequentes\n\n### Progresso\n✅ **Positivo:**\n- Perda de 0.8kg em 2 semanas\n- Melhora de 70% nos sintomas com eliminação de laticínios\n- Boa adesão ao protocolo (85%)\n\n⚠️ **Atenção:**\n- Ainda apresenta desconforto com vegetais crus\n- Padrão de estresse pode estar contribuindo para sintomas\n\n## Correlações Identificadas (IA)\n1. **Laticínios → Inchaço** (87% confiança)\n   - Janela: 30-90 min após consumo\n   - Sugestão: Manter eliminação, testar reintrodução gradual em 4 semanas\n\n2. **Refeições tardias → Desconforto noturno** (72% confiança)\n   - Refeições após 21h correlacionadas com sintomas\n\n## Próximos Passos Sugeridos\n1. Manter protocolo Low FODMAP por mais 2 semanas\n2. Avaliar introdução de legumes cozidos vs crus\n3. Considerar encaminhamento para avaliação de estresse",
        timestamp: "2024-01-30T10:00:30Z",
      },
    ],
  },
  {
    id: "case-002",
    patientId: "patient-002",
    patientName: "João Santos",
    anamnesis: {
      mainComplaint: "Dores de cabeça frequentes e urticária intermitente",
      medicalHistory: "Suspeita de intolerância à histamina, investigação em andamento",
      medications: ["Anti-histamínico (Allegra) conforme necessário"],
      allergies: ["Frutos do mar"],
      lifestyle: {
        exercise: "Academia 4x/semana",
        sleep: "7-8 horas/noite",
        stress: "Baixo",
        alcohol: "Social, 1x/semana",
        smoking: "Não",
      },
    },
    goals: {
      primary: "Identificar e eliminar gatilhos de histamina",
      secondary: "Manter ganho de massa muscular",
      timeline: "6 meses",
    },
    consultations: [
      {
        date: "2024-01-10",
        notes: "Paciente atleta com sintomas histamínicos. Carga atual de histamina elevada. Iniciamos protocolo de redução.",
        weight: 82,
        symptoms: ["Dor de cabeça", "Urticária", "Rubor facial"],
      },
    ],
    currentProtocol: "Low Histamine - Fase Inicial",
    progressNotes: [
      "Carga histamínica atual: 72% (acima do ideal)",
      "Principal fonte: sobras e alimentos fermentados",
      "Necessário educar sobre conservação de alimentos",
    ],
    chatHistory: [],
  },
];

export const MOCK_AI_PROMPTS = [
  {
    id: "prompt-001",
    name: "Resumo de Caso",
    description: "Gera um resumo completo do caso do paciente",
    category: "analysis",
    prompt: "Analise o caso do paciente {patient_name} considerando: anamnese, histórico de consultas, sintomas registrados, correlações identificadas pela IA, e progresso no protocolo atual. Forneça um resumo estruturado com seções claras.",
    isActive: true,
    createdAt: "2024-01-01",
  },
  {
    id: "prompt-002",
    name: "Sugestão de Protocolo",
    description: "Sugere ajustes no protocolo baseado nos dados",
    category: "recommendation",
    prompt: "Com base no histórico de {patient_name}, sugira ajustes no protocolo nutricional atual. Considere: sintomas recentes, correlações identificadas, adesão ao plano, e objetivos do paciente.",
    isActive: true,
    createdAt: "2024-01-01",
  },
  {
    id: "prompt-003",
    name: "Análise de Correlações",
    description: "Analisa padrões entre alimentação e sintomas",
    category: "analysis",
    prompt: "Analise as correlações entre alimentação e sintomas de {patient_name}. Identifique padrões, horários críticos, e alimentos gatilho com base nos dados registrados.",
    isActive: true,
    createdAt: "2024-01-01",
  },
  {
    id: "prompt-004",
    name: "Preparação para Consulta",
    description: "Prepara pontos para discussão na consulta",
    category: "consultation",
    prompt: "Prepare uma lista de pontos para discutir na próxima consulta com {patient_name}. Inclua: progresso, desafios identificados, perguntas a fazer, e sugestões de ajustes.",
    isActive: true,
    createdAt: "2024-01-01",
  },
];

export const MOCK_AI_AGENTS = [
  {
    id: "agent-001",
    name: "Assistente Clínico",
    description: "Analisa casos e fornece insights clínicos",
    role: "clinical_assistant",
    capabilities: ["case_analysis", "correlation_detection", "protocol_suggestion"],
    systemPrompt: "Você é um assistente clínico especializado em nutrição. Analise dados do paciente e forneça insights baseados em evidências. Sempre inclua disclaimers apropriados.",
    isActive: true,
  },
  {
    id: "agent-002",
    name: "Assistente de Protocolo",
    description: "Especialista em protocolos de eliminação",
    role: "protocol_specialist",
    capabilities: ["protocol_management", "food_substitution", "phase_tracking"],
    systemPrompt: "Você é um especialista em protocolos nutricionais de eliminação (FODMAP, Histamina, Lactose, Glúten). Ajude na gestão de protocolos e reintrodução de alimentos.",
    isActive: true,
  },
  {
    id: "agent-003",
    name: "Analista de Dados",
    description: "Analisa padrões e tendências nos dados",
    role: "data_analyst",
    capabilities: ["pattern_detection", "trend_analysis", "reporting"],
    systemPrompt: "Você é um analista de dados nutricionais. Identifique padrões, tendências e correlações nos dados dos pacientes. Forneça insights acionáveis.",
    isActive: false,
  },
];

export const MOCK_PROMPT_BLOCKS = [
  {
    id: "block-001",
    name: "Diagnósticos Definitivos",
    description: "Bloqueia sugestões de diagnósticos médicos definitivos",
    pattern: "diagnóstico|diagnosticar|você tem|doença",
    action: "block",
    message: "A IA não pode fornecer diagnósticos médicos. Consulte um médico para avaliação clínica.",
    isActive: true,
  },
  {
    id: "block-002",
    name: "Prescrição de Medicamentos",
    description: "Bloqueia sugestões de medicamentos",
    pattern: "prescrever|receitar|medicamento|remédio|dose de",
    action: "block",
    message: "A IA não pode prescrever medicamentos. Esta é uma competência médica.",
    isActive: true,
  },
  {
    id: "block-003",
    name: "Valores Calóricos Extremos",
    description: "Alerta sobre recomendações calóricas muito baixas",
    pattern: "menos de 1000|abaixo de 800|dieta de 500",
    action: "warn",
    message: "Atenção: Recomendações calóricas muito baixas podem ser prejudiciais. Revise com cuidado.",
    isActive: true,
  },
];
