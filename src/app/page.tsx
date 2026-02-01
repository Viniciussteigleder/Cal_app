import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#fff6e7,_transparent_55%),radial-gradient(circle_at_bottom,_#fde7cf,_transparent_55%)] px-6 py-12">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-10">
        <header className="flex flex-col gap-4">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">
            NutriPlan · MVP1
          </p>
          <h1 className="text-4xl font-semibold leading-tight md:text-5xl">
            Planejamento alimentar auditável com dados consistentes por paciente.
          </h1>
          <p className="max-w-2xl text-lg text-muted-foreground">
            Estrutura multi-tenant com três portais, políticas de dados por
            paciente e snapshots imutáveis para garantir transparência clínica.
          </p>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          <Card className="flex flex-col gap-4 p-6">
            <div>
              <h2 className="text-xl font-semibold">Portal do Paciente</h2>
              <p className="text-sm text-muted-foreground">
                Diário alimentar, plano publicado e sintomas.
              </p>
            </div>
            <Button asChild className="mt-auto">
              <Link href="/patient/dashboard">Entrar</Link>
            </Button>
          </Card>
          <Card className="flex flex-col gap-4 p-6">
            <div>
              <h2 className="text-xl font-semibold">Portal do Nutricionista</h2>
              <p className="text-sm text-muted-foreground">
                Consulta guiada, políticas de dados e planos versionados.
              </p>
            </div>
            <Button asChild variant="outline" className="mt-auto">
              <Link href="/studio/patients">Entrar</Link>
            </Button>
          </Card>
          <Card className="flex flex-col gap-4 p-6">
            <div>
              <h2 className="text-xl font-semibold">Portal do Owner</h2>
              <p className="text-sm text-muted-foreground">
                Tenants, datasets e checagens de integridade.
              </p>
            </div>
            <Button asChild variant="ghost" className="mt-auto">
              <Link href="/owner/tenants">Entrar</Link>
            </Button>
          </Card>
        </section>
      </div>
    </main>
  );
}
