import { describe, expect, it } from "vitest";

import { resolveSource } from "@/lib/snapshots";

describe("Policy resolution", () => {
  it("category override wins over default", () => {
    const source = resolveSource({
      policy: {
        id: "policy",
        tenant_id: "tenant",
        patient_id: "patient",
        version_number: 1,
        is_active: true,
        default_region: "BR",
        allowed_sources: ["TACO", "TBCA"],
        rules_json: null,
        notes: null,
        updated_by: "user",
        created_at: new Date(),
      },
      overrides: [
        {
          id: "override",
          policy_id: "policy",
          category_code: "dairy",
          preferred_source: "BLS",
          notes: null,
        },
      ],
      categoryCode: "dairy",
    });

    expect(source).toBe("BLS");
  });
});
