import { PortalShell } from "@/components/portal-shell";

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PortalShell
      title="Portal do Nutricionista"
      subtitle="Gerencie pacientes, consultas e planos com auditoria completa."
      devRole="TENANT_ADMIN"
      nav={[
        { href: "/studio", label: "Visão Geral" },
        { href: "/studio/planner", label: "Planner" },
        { href: "/studio/patients", label: "Pacientes" },
        { href: "/studio/forms", label: "Formulários" },
        { href: "/studio/recipes", label: "Receitas" },
        { href: "/studio/protocols", label: "Protocolos" },
        { href: "/studio/templates", label: "Templates" },
        { href: "/studio/plans/1", label: "Planos" },
      ]}
    >
      {children}
    </PortalShell>
  );
}
