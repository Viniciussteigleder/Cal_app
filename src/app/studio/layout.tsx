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
      nav={[
        { href: "/studio/patients", label: "Pacientes" },
        { href: "/studio/consultations/1", label: "Consulta" },
        { href: "/studio/plans/1", label: "Planos" },
        { href: "/studio/policies/1", label: "Políticas" },
      ]}
    >
      {children}
    </PortalShell>
  );
}
