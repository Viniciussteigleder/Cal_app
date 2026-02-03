-- CreateTable
CREATE TABLE "ExamResult" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "patient_id" UUID NOT NULL,
    "exam_type" TEXT NOT NULL,
    "exam_date" TIMESTAMPTZ(6) NOT NULL,
    "lab_name" TEXT,
    "doctor_name" TEXT,
    "extracted_data" JSONB,
    "document_url" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_size" INTEGER NOT NULL,
    "uploaded_by" UUID NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExamResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MealPhoto" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "patient_id" UUID NOT NULL,
    "meal_id" UUID,
    "photo_url" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_size" INTEGER NOT NULL,
    "ai_analysis" JSONB,
    "captured_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MealPhoto_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ExamResult_patient_id_exam_date_idx" ON "ExamResult"("patient_id", "exam_date");

-- CreateIndex
CREATE INDEX "MealPhoto_patient_id_captured_at_idx" ON "MealPhoto"("patient_id", "captured_at");

-- CreateIndex
CREATE INDEX "MealPhoto_meal_id_idx" ON "MealPhoto"("meal_id");
