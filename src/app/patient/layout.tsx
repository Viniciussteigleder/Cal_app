import { PortalShell } from "@/components/portal-shell";

export default function PatientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PortalShell
      title="Portal do Paciente"
      subtitle="Seu plano alimentar, diário e sintomas em um só lugar."
      nav={[
        { href: "/patient/dashboard", label: "Dashboard" },
        { href: "/patient/log", label: "Diário" },
        { href: "/patient/plan", label: "Plano" },
        { href: "/patient/symptoms", label: "Sintomas" },
      ]}
    >
      {children}
    </PortalShell>
  );
}
