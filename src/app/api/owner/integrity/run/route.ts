import { NextResponse } from "next/server";

import { requireClaims, requireOwner, withSession } from "@/lib/api-helpers";
import {
  checkCanaryCalculations,
  checkDatasetSanity,
  checkImmutability,
  checkRBACEnforcement,
  checkSnapshotIntegrity,
  getMaxSeverity,
} from "@/lib/integrity";

export async function POST() {
  try {
    const claims = await requireClaims();
    requireOwner(claims);

    const result = await withSession(
      claims,
      async (tx) => {
        const run = await tx.integrityCheckRun.create({
          data: {
            tenant_id: claims.tenant_id,
            run_type: "full",
            started_at: new Date(),
            status: "running",
          },
        });

        const issues = [
          ...(await checkCanaryCalculations()),
          ...(await checkDatasetSanity(tx)),
          ...(await checkSnapshotIntegrity(tx)),
          ...(await checkImmutability(tx)),
          ...(await checkRBACEnforcement(tx)),
        ];

        for (const issue of issues) {
          await tx.integrityIssue.create({
            data: {
              tenant_id: claims.tenant_id,
              run_id: run.id,
              severity: issue.severity,
              entity_type: issue.entity_type,
              entity_id: issue.entity_id,
              details_json: issue.details,
            },
          });
        }

        const maxSeverity = getMaxSeverity(issues);
        const summary = {
          total_issues: issues.length,
          by_severity: issues.reduce<Record<string, number>>((acc, issue) => {
            acc[issue.severity] = (acc[issue.severity] ?? 0) + 1;
            return acc;
          }, {}),
        };

        const updated = await tx.integrityCheckRun.update({
          where: { id: run.id },
          data: {
            finished_at: new Date(),
            status: maxSeverity === "CRITICAL" ? "failed" : "passed",
            summary_json: summary,
          },
        });

        return { run: updated, summary };
      },
      { ownerMode: true }
    );

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro inesperado.";
    const status = (error as { status?: number })?.status ?? 500;
    return NextResponse.json({ error: message }, { status });
  }
}
