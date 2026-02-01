"use client";

import { useEffect } from "react";

export default function DevSessionBridge({ role }: { role: "PATIENT" | "TENANT_ADMIN" | "TEAM" | "OWNER" }) {
  useEffect(() => {
    if (process.env.NODE_ENV === "production") return;
    const hasSession =
      document.cookie.includes("np_user_id") &&
      document.cookie.includes("np_tenant_id") &&
      document.cookie.includes("np_role");
    if (hasSession) return;

    fetch(`/api/dev/session?role=${role}`, { method: "POST" }).catch(() => undefined);
  }, [role]);

  return null;
}
