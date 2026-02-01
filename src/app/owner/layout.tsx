import { PortalShell } from "@/components/portal-shell";

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  return (
    <PortalShell
      title="Portal do Owner"
      subtitle="Governança cross-tenant com integridade e auditoria."
      nav={[
        { href: "/owner/tenants", label: "Tenants" },
        { href: "/owner/users", label: "Usuários" },
        { href: "/owner/datasets", label: "Datasets" },
        { href: "/owner/integrity", label: "Integridade" },
        { href: "/owner/app-description", label: "Descrição" },
      ]}
    >
      {children}
    </PortalShell>
  );
}
