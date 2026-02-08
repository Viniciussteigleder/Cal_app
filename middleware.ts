import { NextResponse, type NextRequest } from "next/server";

function redirectTo(request: NextRequest, pathname: string) {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  return NextResponse.redirect(url);
}

function mapPacientesToPatients(pathname: string): string {
  // Normalize `/studio/pacientes/...` to the implemented `/studio/patients/...` routes.
  const rest = pathname.replace(/^\/studio\/pacientes\/?/, "");
  if (!rest) return "/studio/patients";

  const parts = rest.split("/").filter(Boolean);
  const patientId = parts[0];
  const sub = parts[1] ?? "";

  // If `patientId` looks like a section (e.g. "novo"), route to list.
  if (!patientId || ["novo", "segmentos", "onboarding", "easy-patient"].includes(patientId)) {
    return "/studio/patients";
  }

  const map: Record<string, string> = {
    resumo: "overview",
    prontuario: "prontuario",
    exames: "exames",
    "plano-alimentar": "plano-alimentar",
    prescricao: "protocols",
    mensagens: "log",
    "calculo-energetico": "analyzer",
    antropometria: "overview",
    documentos: "prontuario",
  };

  const mappedSub = sub ? map[sub] ?? "overview" : "overview";
  return `/studio/patients/${patientId}/${mappedSub}`;
}

function mapMateriais(pathname: string): string {
  const rest = pathname.replace(/^\/studio\/materiais\/?/, "");
  if (!rest) return "/studio/templates";
  const section = rest.split("/").filter(Boolean)[0] ?? "";
  const map: Record<string, string> = {
    protocolos: "/studio/protocols",
    receitas: "/studio/recipes",
    planos: "/studio/templates",
    formularios: "/studio/forms",
    documentos: "/studio/document-templates",
    laminas: "/studio/templates",
  };
  return map[section] ?? "/studio/templates";
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Avoid touching Next internals.
  if (pathname.startsWith("/_next") || pathname.startsWith("/favicon")) {
    return NextResponse.next();
  }

  // Studio legacy/placeholder routes -> implemented routes.
  if (pathname === "/studio/visao-geral" || pathname.startsWith("/studio/visao-geral/")) {
    return redirectTo(request, "/studio/dashboard");
  }

  if (pathname === "/studio/agenda" || pathname.startsWith("/studio/agenda/")) {
    return redirectTo(request, "/studio/planner");
  }

  if (pathname === "/studio/configuracoes" || pathname.startsWith("/studio/configuracoes/")) {
    return redirectTo(request, "/studio/settings/ai-agents");
  }

  if (pathname === "/studio/pacientes" || pathname.startsWith("/studio/pacientes/")) {
    return redirectTo(request, mapPacientesToPatients(pathname));
  }

  if (pathname === "/studio/materiais" || pathname.startsWith("/studio/materiais/")) {
    return redirectTo(request, mapMateriais(pathname));
  }

  if (pathname.startsWith("/studio/financeiro/")) {
    return redirectTo(request, "/studio/financeiro");
  }

  if (pathname.startsWith("/studio/relatorios/")) {
    return redirectTo(request, "/studio/relatorios");
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/studio/:path*"],
};

