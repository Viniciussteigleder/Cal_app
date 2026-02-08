/**
 * AI Service for extracting data from exam result PDFs
 * This service uses Claude/GPT-4 with vision to read PDF layouts
 * and extract structured data
 */

import Anthropic from "@anthropic-ai/sdk";

interface ExamExtractionResult {
  success: boolean;
  data?: {
    examType: string;
    results: Array<{
      test_name: string;
      value: string;
      unit: string;
      reference_range?: string;
      status?: "normal" | "high" | "low" | "critical";
    }>;
    summary?: string;
    labName?: string;
    examDate?: string;
    patientName?: string;
  };
  error?: string;
}

export async function extractExamDataFromPDF(
  pdfBase64: string,
  examType: string
): Promise<ExamExtractionResult> {
  try {
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    // Convert PDF to images (you'll need a PDF-to-image library)
    // For now, we'll assume the PDF is already in image format or use Claude's PDF support

    const systemPrompt = `You are a medical data extraction specialist. Your task is to extract structured data from medical exam results PDFs.

Extract the following information:
1. All test results with their values, units, and reference ranges
2. Any abnormal findings or flags
3. Patient demographic information if present
4. Lab name and exam date
5. Doctor's notes or interpretations

Return the data in JSON format with this structure:
{
  "examType": "blood_test|urine_test|imaging|hormone|other",
  "results": [
    {
      "test_name": "Test Name",
      "value": "123.45",
      "unit": "mg/dL",
      "reference_range": "60-100",
      "status": "normal|high|low|critical"
    }
  ],
  "summary": "Brief summary of findings",
  "labName": "Lab Name",
  "examDate": "2024-01-15",
  "patientName": "Patient Name"
}`;

    const message = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 4096,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Extract all relevant data from this ${examType} exam result. Be thorough and accurate.`,
            },
            {
              type: "image",
              source: {
                type: "base64",
                // Anthropic SDK types currently restrict to common image MIME types,
                // but we pass PDFs here for provider-side parsing.
                media_type: "application/pdf" as any,
                data: pdfBase64,
              },
            },
          ],
        },
      ],
    });

    // Parse the response
    const responseText = message.content[0].type === "text" ? message.content[0].text : "";

    // Extract JSON from response (Claude might wrap it in markdown)
    const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/) || responseText.match(/{[\s\S]*}/);
    const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : responseText;

    const extractedData = JSON.parse(jsonStr);

    return {
      success: true,
      data: extractedData,
    };
  } catch (error) {
    console.error("Error extracting exam data:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to extract data",
    };
  }
}

/**
 * Analyze meal photo and extract food items with quantities
 */
export async function analyzeMealPhoto(
  imageBase64: string,
  mimeType: string = "image/jpeg"
): Promise<{
  success: boolean;
  foods?: Array<{
    name: string;
    estimated_grams: number;
    confidence: number;
  }>;
  error?: string;
}> {
  try {
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const systemPrompt = `You are a nutrition expert specialized in food recognition and portion estimation.

Analyze the meal photo and identify:
1. All visible food items
2. Estimated quantity in grams for each item
3. Your confidence level (0-100)

Consider:
- Plate size (assume standard 25cm dinner plate if visible)
- Food density and volume
- Common serving sizes

Return data in JSON format:
{
  "foods": [
    {
      "name": "Arroz branco",
      "estimated_grams": 150,
      "confidence": 85
    }
  ]
}`;

    const safeMediaType =
      mimeType === "image/png" ||
      mimeType === "image/jpeg" ||
      mimeType === "image/gif" ||
      mimeType === "image/webp"
        ? mimeType
        : "image/png";

    const message = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 2048,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Analyze this meal photo and extract all food items with estimated quantities in grams.",
            },
            {
              type: "image",
              source: {
                type: "base64",
                media_type: safeMediaType,
                data: imageBase64,
              },
            },
          ],
        },
      ],
    });

    const responseText = message.content[0].type === "text" ? message.content[0].text : "";
    const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/) || responseText.match(/{[\s\S]*}/);
    const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : responseText;
    const extractedData = JSON.parse(jsonStr);

    return {
      success: true,
      foods: extractedData.foods || [],
    };
  } catch (error) {
    console.error("Error analyzing meal photo:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to analyze photo",
    };
  }
}
