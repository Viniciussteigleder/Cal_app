import { NextRequest, NextResponse } from "next/server";
import { requireClaims, withSession, getScopedPatient, ApiError } from "@/lib/api-helpers";
import { can } from "@/lib/rbac";

// GET /api/patient/exams - List patient exam results
export async function GET(request: NextRequest) {
  try {
    const claims = await requireClaims();
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get("patientId");

    const exams = await withSession(claims, async (tx) => {
      const patient = await getScopedPatient(tx, claims, patientId);

      // For now, return empty array until ExamResult model is added to schema
      // Once added, uncomment:
      /*
      const results = await tx.examResult.findMany({
        where: {
          tenant_id: claims.tenant_id,
          patient_id: patient.id,
        },
        orderBy: { exam_date: "desc" },
      });
      return results;
      */

      return [];
    });

    return NextResponse.json({ exams });
  } catch (error) {
    console.error("Error fetching exams:", error);
    const message = error instanceof Error ? error.message : "Erro ao buscar exames.";
    const status = (error as { status?: number })?.status ?? 500;
    return NextResponse.json({ error: message }, { status });
  }
}

// POST /api/patient/exams - Upload exam result
export async function POST(request: NextRequest) {
  try {
    const claims = await requireClaims();

    if (claims.role !== "PATIENT" && !can(claims.role, "update", "patient")) {
      throw new ApiError("Acesso negado.", 403);
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const patientId = formData.get("patientId") as string | null;
    const examType = formData.get("examType") as string;
    const examDate = formData.get("examDate") as string;
    const labName = formData.get("labName") as string | null;
    const doctorName = formData.get("doctorName") as string | null;
    const notes = formData.get("notes") as string | null;

    if (!file) {
      throw new ApiError("Arquivo não fornecido.", 400);
    }

    if (!examType || !examDate) {
      throw new ApiError("Tipo de exame e data são obrigatórios.", 400);
    }

    const result = await withSession(claims, async (tx) => {
      const patient = await getScopedPatient(tx, claims, patientId);

      // Read file content for AI processing
      const buffer = await file.arrayBuffer();
      const base64 = Buffer.from(buffer).toString('base64');

      // TODO: Store file in cloud storage (S3, Cloudflare R2, etc.)
      // For now, we'll just store the filename and prepare for AI extraction
      const documentUrl = `pending-upload/${file.name}`; // Replace with actual storage

      // TODO: Call AI service to extract data from PDF
      // const extractedData = await extractExamData(base64, examType);
      const extractedData = {
        status: "pending_extraction",
        message: "AI extraction will be implemented"
      };

      // Once ExamResult model is added to schema, uncomment:
      /*
      const examResult = await tx.examResult.create({
        data: {
          tenant_id: claims.tenant_id,
          patient_id: patient.id,
          exam_type: examType,
          exam_date: new Date(examDate),
          lab_name: labName,
          doctor_name: doctorName,
          extracted_data: extractedData,
          document_url: documentUrl,
          file_name: file.name,
          file_size: file.size,
          uploaded_by: claims.user_id,
          notes: notes,
        },
      });

      return examResult;
      */

      // Temporary response
      return {
        id: "temp-id",
        exam_type: examType,
        exam_date: examDate,
        file_name: file.name,
        message: "Schema needs to be migrated first. Uncomment code in route.ts after running migration."
      };
    });

    return NextResponse.json({ success: true, exam: result });
  } catch (error) {
    console.error("Error uploading exam:", error);
    const message = error instanceof Error ? error.message : "Erro ao enviar exame.";
    const status = (error as { status?: number })?.status ?? 500;
    return NextResponse.json({ error: message }, { status });
  }
}
