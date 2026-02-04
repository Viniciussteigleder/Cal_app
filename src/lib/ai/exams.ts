import { analyzeImage } from '@/lib/openai';

export interface ExamExtractionResult {
    labName?: string;
    date?: string;
    patientName?: string;
    results: {
        biomarker: string;
        value: number;
        unit: string;
        referenceRange?: string;
        flag?: 'low' | 'high' | 'normal' | 'critical';
    }[];
}

const EXAM_EXTRACTION_PROMPT = `
Você é um especialista em análise de exames laboratoriais médicos, fluente em Português, Alemão e Inglês.
Sua tarefa é extrair dados estruturados de imagens de exames laboratoriais.

Instruções:
1. Identifique o laboratório, data do exame e nome do paciente, se visível.
2. Extraia CADA biomarcador (ex: Glicose, Colesterol, TSH) encontrado.
3. Para cada biomarcador, extraia:
   - Nome original (como aparece no documento)
   - Valor numérico (converta vírgula decimal para ponto)
   - Unidade de medida (ex: mg/dL, uIU/mL)
   - Faixa de referência (como texto)
   - Flag de anormalidade (se indicado: low, high, normal, critical). Se não houver indicador explícito, infira baseado na referência se possível, senão 'normal'.

Saída deve ser EXCLUSIVAMENTE um JSON válido com a seguinte estrutura:
{
  "labName": "string ou null",
  "date": "YYYY-MM-DD ou null",
  "patientName": "string ou null",
  "results": [
    {
      "biomarker": "Nome original",
      "value": 0.0,
      "unit": "unidade",
      "referenceRange": "texto da referencia",
      "flag": "normal/low/high/critical"
    }
  ]
}

Não inclua markdown, apenas o JSON cru. Se houver múltiplas páginas/imagens, extraia o máximo possível desta imagem.
`;

export async function extractExamDataFromImage(imageUrl: string): Promise<ExamExtractionResult | null> {
    try {
        const { content } = await analyzeImage(imageUrl, EXAM_EXTRACTION_PROMPT);

        if (!content) return null;

        // Clean markdown code blocks if present
        const cleanContent = content.replace(/```json/g, '').replace(/```/g, '').trim();

        return JSON.parse(cleanContent) as ExamExtractionResult;
    } catch (error) {
        console.error('Error extracting exam data:', error);
        return null;
    }
}
