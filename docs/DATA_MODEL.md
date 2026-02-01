# Modelo de Dados (MVP1)

## Entidades principais
- Tenant, User, Patient, PatientProfile, PatientCondition
- FoodCanonical, FoodAlias, FoodNutrient
- DatasetRelease, ImportJob, ValidationReport
- PatientDataPolicy, PatientCategoryOverride
- FoodSnapshot, Meal, MealItem
- Plan, PlanVersion, PlanItem, PlanApproval, PlanPublication
- AuditEvent, CalcAudit
- IntegrityCheckRun, IntegrityIssue
- Protocol (catálogo)

## Invariantes
- Todas as tabelas de domínio possuem `tenant_id`.
- `meal_item.snapshot_id` e `plan_item.snapshot_id` são obrigatórios.
- `food_snapshot` é append-only (sem UPDATE/DELETE).
- `plan_version` publicado é imutável.
- Uma única política ativa por paciente (`is_active = true`).

## ER (ASCII)
Tenant ──< User
Tenant ──< Patient ──1─ PatientProfile
Patient ──< PatientCondition
Patient ──< PatientDataPolicy ──< PatientCategoryOverride
DatasetRelease ──< FoodNutrient >── FoodCanonical ──< FoodAlias
FoodCanonical ──< FoodSnapshot ──< PlanItem
FoodCanonical ──< FoodSnapshot ──< MealItem
Plan ──< PlanVersion ──< PlanItem
PlanVersion ──1─ PlanApproval
PlanVersion ──1─ PlanPublication
Patient ──< Meal ──< MealItem
AuditEvent (append-only)
CalcAudit (append-only)
IntegrityCheckRun ──< IntegrityIssue
