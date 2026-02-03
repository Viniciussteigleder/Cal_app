import { NextRequest, NextResponse } from "next/server";
import { requireClaims, withSession, getScopedPatient, ApiError } from "@/lib/api-helpers";
import { can } from "@/lib/rbac";
import { analyzeMealPhoto } from "@/lib/ai/pdf-extraction";
import { uploadFile } from "@/lib/storage";

// POST /api/patient/meal-photos - Upload meal photo with AI analysis
export async function POST(request: NextRequest) {
  try {
    const claims = await requireClaims();

    if (claims.role !== "PATIENT" && !can(claims.role, "update", "patient")) {
      throw new ApiError("Acesso negado.", 403);
    }

    const formData = await request.formData();
    const file = formData.get("photo") as File | null;
    const patientId = formData.get("patientId") as string | null;
    const mealId = formData.get("mealId") as string | null;

    if (!file) {
      throw new ApiError("Foto não fornecida.", 400);
    }

    if (!file.type.startsWith("image/")) {
      throw new ApiError("Arquivo deve ser uma imagem.", 400);
    }

    if (file.size > 10 * 1024 * 1024) {
      throw new ApiError("Imagem muito grande. Máximo 10MB.", 400);
    }

    const result = await withSession(claims, async (tx) => {
      const patient = await getScopedPatient(tx, claims, patientId);

      // Upload file to cloud storage
      const uploadResult = await uploadFile(file, "meal-photos", claims.tenant_id, patient.id);

      if (!uploadResult.success) {
        throw new ApiError(`Erro ao fazer upload: ${uploadResult.error}`, 500);
      }

      // Read image for AI analysis
      const buffer = await file.arrayBuffer();
      const base64 = Buffer.from(buffer).toString('base64');

      // Analyze with AI
      const analysis = await analyzeMealPhoto(base64, file.type);

      const mealPhoto = await tx.mealPhoto.create({
        data: {
          tenant_id: claims.tenant_id,
          patient_id: patient.id,
          meal_id: mealId,
          photo_url: uploadResult.url!,
          file_name: file.name,
          file_size: file.size,
          ai_analysis: analysis.success ? analysis.foods : null,
        },
      });

      return {
        photo: mealPhoto,
        analysis: analysis.success ? analysis.foods : null,
      };
    });

    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error("Error uploading meal photo:", error);
    const message = error instanceof Error ? error.message : "Erro ao enviar foto.";
    const status = (error as { status?: number })?.status ?? 500;
    return NextResponse.json({ error: message }, { status });
  }
}

// GET /api/patient/meal-photos - List meal photos
export async function GET(request: NextRequest) {
  try {
    const claims = await requireClaims();
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get("patientId");
    const mealId = searchParams.get("mealId");

    const photos = await withSession(claims, async (tx) => {
      const patient = await getScopedPatient(tx, claims, patientId);

      const where: any = {
        tenant_id: claims.tenant_id,
        patient_id: patient.id,
      };

      if (mealId) {
        where.meal_id = mealId;
      }

      return await tx.mealPhoto.findMany({
        where,
        orderBy: { captured_at: "desc" },
      });
    });

    return NextResponse.json({ photos });
  } catch (error) {
    console.error("Error fetching meal photos:", error);
    const message = error instanceof Error ? error.message : "Erro ao buscar fotos.";
    const status = (error as { status?: number })?.status ?? 500;
    return NextResponse.json({ error: message }, { status });
  }
}
