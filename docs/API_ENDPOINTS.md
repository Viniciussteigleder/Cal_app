# 🔌 API Endpoints Documentation
## NutriPlan Platform - Complete API Reference

**Version**: 1.0  
**Last Updated**: 2026-02-03  
**Base URL**: `/api`

---

## 📋 Table of Contents

1. [AI Agents](#ai-agents)
2. [Patient Management](#patient-management)
3. [Protocols](#protocols)
4. [Recipes](#recipes)
5. [Daily Logs](#daily-logs)
6. [Exams](#exams)
7. [Analytics](#analytics)
8. [Authentication](#authentication)

---

## 🤖 AI Agents

### 1. AI Meal Planner

**Endpoint**: `POST /api/ai/meal-planner`

**Description**: Generate personalized meal plans based on patient data, dietary preferences, allergies, and medical conditions.

**Request Body**:
```json
{
  "patientId": "string",
  "tenantId": "string",
  "targetCalories": 2000,
  "mealsPerDay": 4,
  "daysToGenerate": 7,
  "dietaryPreferences": ["vegetarian", "low_carb"],
  "allergies": ["gluten", "lactose"],
  "medicalConditions": ["diabetes", "hypertension"],
  "customCondition": "string (optional)",
  "includeFoods": ["chicken", "broccoli"],
  "excludeFoods": ["pork", "shellfish"],
  "proteinRatio": 30,
  "carbsRatio": 40,
  "fatRatio": 30
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "mealPlanId": "string",
    "days": [
      {
        "date": "2026-02-03",
        "meals": [
          {
            "mealType": "breakfast",
            "name": "Omelete com Vegetais",
            "calories": 350,
            "protein": 25,
            "carbs": 20,
            "fat": 18,
            "ingredients": [...],
            "instructions": "string"
          }
        ],
        "totalCalories": 2000,
        "totalProtein": 150,
        "totalCarbs": 200,
        "totalFat": 67
      }
    ],
    "aiReasoning": "string",
    "creditsUsed": 30
  }
}
```

**Credits Cost**: 30 credits per 7-day plan

---

### 2. Food Recognition

**Endpoint**: `POST /api/ai/food-recognition`

**Description**: Analyze food images and identify foods with portion estimates.

**Request Body**:
```json
{
  "imageUrl": "string",
  "patientId": "string",
  "tenantId": "string"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "recognized_foods": [
      {
        "food_name": "Arroz Branco",
        "food_id": "string",
        "confidence": 0.95,
        "portion_grams": 150,
        "notes": "Porção média"
      }
    ],
    "confidence_score": 0.92
  },
  "recognitionId": "string",
  "creditsUsed": 20
}
```

**Confirm Recognition**:
```
PATCH /api/ai/food-recognition/{recognitionId}
Body: { "confirmed": true }
```

**Credits Cost**: 20 credits per image

---

### 3. Patient Analyzer

**Endpoint**: `POST /api/ai/patient-analyzer`

**Description**: Analyze patient adherence, progress, and predict dropout risk.

**Request Body**:
```json
{
  "patientId": "string",
  "tenantId": "string"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "adherence_score": 85,
    "progress_score": 78,
    "dropout_risk": "low",
    "intervention_needed": false,
    "insights": [
      "Alta consistência no registro de refeições",
      "Progresso constante nos últimos 30 dias"
    ],
    "recommended_actions": [
      {
        "action": "Manter acompanhamento regular",
        "priority": "medium",
        "description": "Continuar com consultas quinzenais"
      }
    ],
    "clinical_analysis": {
      "vital_signs": "string",
      "risk_factors": "string",
      "comorbidities": "string"
    },
    "nutritional_analysis": {
      "macro_balance": "string",
      "micronutrient_gaps": "string",
      "hydration_patterns": "string"
    },
    "behavioral_analysis": {
      "logging_consistency": "string",
      "emotional_patterns": "string",
      "motivation_level": "string"
    }
  },
  "creditsUsed": 20
}
```

**Credits Cost**: 20 credits per analysis

---

### 4. Exam Analyzer (NEW)

**Endpoint**: `POST /api/ai/exam-analyzer`

**Description**: Analyze medical exam results using OCR and AI interpretation.

**Request Body**:
```json
{
  "patientId": "string",
  "tenantId": "string",
  "examImageUrl": "string",
  "examType": "blood_test" | "urine_test" | "other",
  "examDate": "2026-02-03"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "examId": "string",
    "extractedData": {
      "biomarkers": [
        {
          "name": "Glicose",
          "value": 95,
          "unit": "mg/dL",
          "referenceRange": "70-100",
          "status": "normal"
        }
      ]
    },
    "aiAnalysis": {
      "summary": "string",
      "concerns": ["string"],
      "recommendations": ["string"]
    },
    "nutritionalImplications": {
      "dietaryAdjustments": ["string"],
      "supplementSuggestions": ["string"]
    }
  },
  "creditsUsed": 40
}
```

**Credits Cost**: 40 credits per exam

---

### 5. Protocol Generator (NEW)

**Endpoint**: `POST /api/ai/protocol-generator`

**Description**: Generate custom nutritional protocols based on patient needs.

**Request Body**:
```json
{
  "patientId": "string",
  "tenantId": "string",
  "condition": "string",
  "goals": ["string"],
  "restrictions": ["string"],
  "duration": 90
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "protocolId": "string",
    "name": "string",
    "phases": [
      {
        "name": "Fase 1: Eliminação",
        "duration": 21,
        "rules": ["string"],
        "allowedFoods": ["string"],
        "forbiddenFoods": ["string"]
      }
    ],
    "expectedOutcomes": ["string"],
    "monitoringPoints": ["string"]
  },
  "creditsUsed": 50
}
```

**Credits Cost**: 50 credits per protocol

---

## 👥 Patient Management

### 1. List Patients

**Endpoint**: `GET /api/patients`

**Query Parameters**:
- `tenantId`: string (required)
- `page`: number (default: 1)
- `limit`: number (default: 20)
- `search`: string (optional)
- `status`: "active" | "inactive" (optional)

**Response**:
```json
{
  "success": true,
  "data": {
    "patients": [...],
    "total": 100,
    "page": 1,
    "totalPages": 5
  }
}
```

---

### 2. Get Patient Details

**Endpoint**: `GET /api/patients/{patientId}`

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "string",
    "name": "string",
    "email": "string",
    "phone": "string",
    "birthDate": "1990-01-01",
    "gender": "male" | "female" | "other",
    "currentProtocol": {...},
    "activeGoals": [...],
    "lastConsultation": "2026-02-01",
    "adherenceScore": 85
  }
}
```

---

### 3. Create Patient

**Endpoint**: `POST /api/patients`

**Request Body**:
```json
{
  "tenantId": "string",
  "name": "string",
  "email": "string",
  "phone": "string",
  "birthDate": "1990-01-01",
  "gender": "male" | "female" | "other",
  "initialWeight": 70,
  "height": 170,
  "goals": ["weight_loss", "muscle_gain"]
}
```

---

### 4. Update Patient

**Endpoint**: `PATCH /api/patients/{patientId}`

**Request Body**: (partial update)
```json
{
  "name": "string",
  "phone": "string",
  ...
}
```

---

## 📋 Protocols

### 1. List Protocols

**Endpoint**: `GET /api/protocols`

**Query Parameters**:
- `tenantId`: string (required)
- `type`: string (optional)

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "code": "FODMAP",
      "name": "Protocolo FODMAP",
      "type": "FODMAP",
      "description": "string",
      "phases": [...],
      "activePatients": 12,
      "critiqueScore": 48,
      "strengths": ["string"],
      "improvements": ["string"]
    }
  ]
}
```

---

### 2. Get Protocol Critique

**Endpoint**: `POST /api/ai/protocol-critique`

**Request Body**:
```json
{
  "protocolId": "string",
  "tenantId": "string"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "score": 48,
    "maxScore": 50,
    "criteria": [
      {
        "category": "Evidência Científica",
        "score": 9,
        "maxScore": 10,
        "feedback": "string"
      }
    ],
    "strengths": ["string"],
    "improvements": ["string"],
    "overallAssessment": "string"
  },
  "creditsUsed": 15
}
```

**Credits Cost**: 15 credits per critique

---

## 🍳 Recipes

### 1. List Recipes

**Endpoint**: `GET /api/recipes`

**Query Parameters**:
- `tenantId`: string (required)
- `search`: string (optional)
- `tags`: string[] (optional)
- `isFavorite`: boolean (optional)

---

### 2. Create Recipe

**Endpoint**: `POST /api/recipes`

**Request Body**:
```json
{
  "tenantId": "string",
  "name": "string",
  "description": "string",
  "prepTime": 15,
  "cookTime": 25,
  "servings": 2,
  "tags": ["high_protein"],
  "ingredients": [...],
  "instructions": "string",
  "nutrients": {
    "energy_kcal": 350,
    "protein_g": 42,
    "carbs_g": 12,
    "fat_g": 14
  }
}
```

---

### 3. Generate Recipe with AI

**Endpoint**: `POST /api/ai/recipe-generator`

**Request Body**:
```json
{
  "tenantId": "string",
  "recipeName": "string",
  "servings": 2,
  "dietaryRestrictions": ["vegetarian"],
  "targetCalories": 400,
  "preferredIngredients": ["chicken", "broccoli"]
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "name": "string",
    "description": "string",
    "ingredients": [...],
    "instructions": "string",
    "nutrients": {...},
    "prepTime": 15,
    "cookTime": 25
  },
  "creditsUsed": 25
}
```

**Credits Cost**: 25 credits per recipe

---

## 📝 Daily Logs (NEW)

### 1. Create Daily Log

**Endpoint**: `POST /api/daily-logs`

**Request Body**:
```json
{
  "patientId": "string",
  "tenantId": "string",
  "date": "2026-02-03",
  "logType": "patient" | "nutritionist",
  "meals": [
    {
      "mealType": "breakfast",
      "time": "08:00",
      "foods": [...],
      "totalCalories": 350
    }
  ],
  "symptoms": [
    {
      "type": "bloating",
      "severity": 3,
      "time": "10:00",
      "notes": "string"
    }
  ],
  "weight": 70.5,
  "waterIntake": 2000,
  "exerciseMinutes": 30,
  "sleepHours": 7.5,
  "mood": "good",
  "notes": "string"
}
```

---

### 2. Get Daily Logs

**Endpoint**: `GET /api/daily-logs`

**Query Parameters**:
- `patientId`: string (required)
- `startDate`: string (required)
- `endDate`: string (required)
- `logType`: "patient" | "nutritionist" (optional)

---

### 3. Analyze Log Patterns

**Endpoint**: `POST /api/ai/log-analyzer`

**Request Body**:
```json
{
  "patientId": "string",
  "tenantId": "string",
  "startDate": "2026-01-01",
  "endDate": "2026-02-03"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "patterns": {
      "symptomTriggers": [
        {
          "food": "dairy",
          "symptom": "bloating",
          "correlation": 0.85
        }
      ],
      "adherenceTrends": {...},
      "weightTrends": {...}
    },
    "recommendations": ["string"]
  },
  "creditsUsed": 30
}
```

**Credits Cost**: 30 credits per analysis

---

## 🔬 Exams (NEW)

### 1. Upload Exam

**Endpoint**: `POST /api/exams`

**Request Body**:
```json
{
  "patientId": "string",
  "tenantId": "string",
  "examType": "blood_test",
  "examDate": "2026-02-03",
  "imageUrl": "string",
  "notes": "string"
}
```

---

### 2. Get Patient Exams

**Endpoint**: `GET /api/exams`

**Query Parameters**:
- `patientId`: string (required)
- `examType`: string (optional)
- `startDate`: string (optional)
- `endDate`: string (optional)

---

## 📊 Analytics

### 1. AI Credits Usage

**Endpoint**: `GET /api/analytics/ai-credits`

**Query Parameters**:
- `tenantId`: string (required)
- `period`: "week" | "month" | "year"
- `startDate`: string (optional)
- `endDate`: string (optional)

**Response**:
```json
{
  "success": true,
  "data": {
    "totalCreditsUsed": 12450,
    "creditsRemaining": 37550,
    "avgCostPerPatient": 124.5,
    "projectedMonthlyCost": 3850,
    "perPatient": [...],
    "perNutritionist": [...],
    "history": [...]
  }
}
```

---

### 2. Patient Analytics

**Endpoint**: `GET /api/analytics/patients/{patientId}`

**Response**:
```json
{
  "success": true,
  "data": {
    "adherenceScore": 85,
    "progressScore": 78,
    "weightTrend": [...],
    "symptomFrequency": {...},
    "mealCompliance": 92
  }
}
```

---

## 🔐 Authentication

### 1. Login

**Endpoint**: `POST /api/auth/login`

**Request Body**:
```json
{
  "email": "string",
  "password": "string"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "user": {...},
    "token": "string",
    "refreshToken": "string"
  }
}
```

---

### 2. Refresh Token

**Endpoint**: `POST /api/auth/refresh`

**Request Body**:
```json
{
  "refreshToken": "string"
}
```

---

## 💰 AI Credits Pricing

| Agent | Credits | Cost (R$) |
|-------|---------|-----------|
| Meal Planner (7 days) | 30 | 0.60 |
| Food Recognition | 20 | 0.40 |
| Patient Analyzer | 20 | 0.40 |
| Exam Analyzer | 40 | 0.80 |
| Protocol Generator | 50 | 1.00 |
| Protocol Critique | 15 | 0.30 |
| Recipe Generator | 25 | 0.50 |
| Log Analyzer | 30 | 0.60 |

**Price per Credit**: R$ 0.02

---

## 🔄 Webhooks (Future)

### Events:
- `patient.created`
- `meal_plan.generated`
- `exam.analyzed`
- `protocol.assigned`
- `daily_log.created`

---

## 📚 Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request - Invalid parameters |
| 401 | Unauthorized - Invalid or missing token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error |
| 503 | Service Unavailable - AI service down |

---

## 🔧 Rate Limits

- **Standard**: 100 requests/minute
- **AI Endpoints**: 20 requests/minute
- **Burst**: 200 requests/minute (short bursts)

---

**Documentation Version**: 1.0  
**Last Updated**: 2026-02-03  
**Maintained by**: NutriPlan Development Team
