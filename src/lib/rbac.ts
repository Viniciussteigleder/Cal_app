export type Role = "OWNER" | "TENANT_ADMIN" | "TEAM" | "PATIENT";
export type Resource =
  | "patient"
  | "plan"
  | "consultation"
  | "dataset"
  | "audit"
  | "tenant"
  | "policy";
export type Action =
  | "create"
  | "read"
  | "update"
  | "delete"
  | "approve"
  | "publish"
  | "export";

export const RBAC_MATRIX: Record<Resource, Record<Action, Role[]>> = {
  patient: {
    create: ["TENANT_ADMIN", "TEAM"],
    read: ["OWNER", "TENANT_ADMIN", "TEAM", "PATIENT"],
    update: ["TENANT_ADMIN", "TEAM", "PATIENT"],
    delete: ["TENANT_ADMIN"],
    approve: [],
    publish: [],
    export: ["OWNER", "TENANT_ADMIN", "PATIENT"],
  },
  plan: {
    create: ["TENANT_ADMIN", "TEAM"],
    read: ["OWNER", "TENANT_ADMIN", "TEAM", "PATIENT"],
    update: ["TENANT_ADMIN", "TEAM"],
    delete: ["TENANT_ADMIN"],
    approve: ["TENANT_ADMIN"],
    publish: ["TENANT_ADMIN"],
    export: ["TENANT_ADMIN", "TEAM", "PATIENT"],
  },
  consultation: {
    create: ["TENANT_ADMIN", "TEAM"],
    read: ["OWNER", "TENANT_ADMIN", "TEAM"],
    update: ["TENANT_ADMIN", "TEAM"],
    delete: ["TENANT_ADMIN"],
    approve: ["TENANT_ADMIN"],
    publish: [],
    export: ["TENANT_ADMIN", "TEAM"],
  },
  dataset: {
    create: ["OWNER"],
    read: ["OWNER", "TENANT_ADMIN"],
    update: ["OWNER"],
    delete: ["OWNER"],
    approve: ["OWNER"],
    publish: ["OWNER"],
    export: ["OWNER"],
  },
  audit: {
    create: ["OWNER", "TENANT_ADMIN", "TEAM"],
    read: ["OWNER", "TENANT_ADMIN"],
    update: [],
    delete: [],
    approve: [],
    publish: [],
    export: ["OWNER"],
  },
  tenant: {
    create: ["OWNER"],
    read: ["OWNER"],
    update: ["OWNER"],
    delete: ["OWNER"],
    approve: [],
    publish: [],
    export: ["OWNER"],
  },
  policy: {
    create: ["TENANT_ADMIN", "TEAM"],
    read: ["OWNER", "TENANT_ADMIN", "TEAM"],
    update: ["TENANT_ADMIN", "TEAM"],
    delete: ["TENANT_ADMIN"],
    approve: ["TENANT_ADMIN"],
    publish: [],
    export: ["TENANT_ADMIN", "TEAM"],
  },
};

export function can(role: Role, action: Action, resource: Resource) {
  return RBAC_MATRIX[resource]?.[action]?.includes(role) ?? false;
}
