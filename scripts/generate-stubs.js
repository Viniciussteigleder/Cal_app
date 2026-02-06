#!/usr/bin/env node
// Script to generate route stub pages
const fs = require('fs');
const path = require('path');

const stubs = [
  // === GLOBAL ROUTES ===
  ['src/app/studio/visao-geral/page.tsx', 'Visão Geral', 'Painel principal da clínica com KPIs, alertas e pendências.'],
  ['src/app/studio/visao-geral/alertas/page.tsx', 'Alertas & Pendências', 'Fila de pendências: exames aguardando, documentos sem assinatura, retornos vencidos.'],
  ['src/app/studio/visao-geral/indicadores/page.tsx', 'Indicadores', 'KPIs e métricas da clínica.'],
  ['src/app/studio/agenda/page.tsx', 'Agenda', 'Calendário, tarefas e follow-up.'],
  ['src/app/studio/agenda/calendario/page.tsx', 'Calendário', 'Eventos e consultas agendadas.'],
  ['src/app/studio/agenda/tarefas/page.tsx', 'Tarefas', 'Tarefas globais e por paciente.'],
  ['src/app/studio/agenda/retornos/page.tsx', 'Retornos', 'Fila de follow-up e retornos agendados.'],
  ['src/app/studio/agenda/historico/page.tsx', 'Histórico de Agendamentos', 'Histórico completo de agendamentos.'],
  ['src/app/studio/agenda/link/page.tsx', 'Link de Agendamento', 'Configurar link público de agendamento.'],
  ['src/app/studio/pacientes/page.tsx', 'Pacientes', 'Lista de pacientes, segmentos e tags.'],
  ['src/app/studio/pacientes/novo/page.tsx', 'Novo Paciente', 'Cadastrar novo paciente.'],
  ['src/app/studio/pacientes/segmentos/page.tsx', 'Segmentos & Tags', 'Gerenciar segmentos e tags de pacientes.'],
  ['src/app/studio/pacientes/onboarding/page.tsx', 'Onboarding', 'Fluxo de onboarding para novos pacientes.'],
  ['src/app/studio/pacientes/easy-patient/page.tsx', 'Easy Patient (App)', 'Configurar app do paciente.'],
  ['src/app/studio/materiais/page.tsx', 'Materiais', 'Acervo reutilizável: planos, receitas, protocolos, formulários e modelos.'],
  ['src/app/studio/materiais/planos/page.tsx', 'Planos (Modelos)', 'Modelos de planos alimentares reutilizáveis.'],
  ['src/app/studio/materiais/receitas/page.tsx', 'Receitas', 'Biblioteca de receitas com restrições e substituições.'],
  ['src/app/studio/materiais/protocolos/page.tsx', 'Protocolos', 'Protocolos clínicos organizados por objetivo.'],
  ['src/app/studio/materiais/formularios/page.tsx', 'Formulários', 'Formulários para anamnese e avaliações.'],
  ['src/app/studio/materiais/laminas/page.tsx', 'Lâminas Educativas', 'Material educativo para pacientes.'],
  ['src/app/studio/materiais/documentos/page.tsx', 'Modelos de Documentos', 'Templates de pedido de exame, prescrição e orientações.'],
  ['src/app/studio/relatorios/page.tsx', 'Relatórios', 'Análises agregadas e exportações.'],
  ['src/app/studio/relatorios/clinica/page.tsx', 'Relatórios da Clínica', 'Métricas e análises da clínica.'],
  ['src/app/studio/relatorios/programas/page.tsx', 'Relatórios por Programa', 'Análises por programa nutricional.'],
  ['src/app/studio/relatorios/exportacoes/page.tsx', 'Exportações', 'Exportar dados e relatórios.'],
  ['src/app/studio/relatorios/auditoria/page.tsx', 'Auditoria & Qualidade', 'Logs de auditoria e controle de qualidade.'],
  ['src/app/studio/financeiro/page.tsx', 'Financeiro', 'Faturamento, pagamentos e controle de custos.'],
  ['src/app/studio/financeiro/faturamento/page.tsx', 'Faturamento', 'Gestão de faturamento e notas.'],
  ['src/app/studio/financeiro/pagamentos/page.tsx', 'Pagamentos', 'Controle de pagamentos recebidos.'],
  ['src/app/studio/financeiro/assinaturas/page.tsx', 'Planos & Assinaturas', 'Gerenciar planos e assinaturas.'],
  ['src/app/studio/financeiro/custos/page.tsx', 'Custos (incl. IA)', 'Controle de custos operacionais e de IA.'],
  ['src/app/studio/configuracoes/page.tsx', 'Configurações', 'Configurações gerais do sistema.'],
  ['src/app/studio/configuracoes/perfil/page.tsx', 'Perfil & Preferências', 'Configurações do perfil e preferências pessoais.'],
  ['src/app/studio/configuracoes/equipe/page.tsx', 'Equipe & Permissões', 'Gerenciar equipe e permissões de acesso.'],
  ['src/app/studio/configuracoes/integracoes/page.tsx', 'Integrações', 'Configurar integrações com serviços externos.'],
  ['src/app/studio/configuracoes/assinatura-digital/page.tsx', 'Assinatura Digital', 'Configurar certificado de assinatura digital.'],
  ['src/app/studio/configuracoes/politicas-logs/page.tsx', 'Políticas & Logs', 'Políticas de dados e logs do sistema.'],
  ['src/app/studio/configuracoes/ia-governanca/page.tsx', 'IA (Governança)', 'Limites, logs, templates de prompts e auditoria de IA.'],
  // === PATIENT WORKSPACE ROUTES ===
  ['src/app/studio/pacientes/[patientId]/resumo/page.tsx', 'Resumo do Paciente', 'Visão rápida, pendências, linha do tempo e metas.'],
  ['src/app/studio/pacientes/[patientId]/prontuario/page.tsx', 'Prontuário', 'Consultas, evolução, histórico, anexos e transcrições.'],
  ['src/app/studio/pacientes/[patientId]/prontuario/consultas/page.tsx', 'Consultas', 'Histórico de consultas do paciente.'],
  ['src/app/studio/pacientes/[patientId]/prontuario/evolucao/page.tsx', 'Evolução', 'Registro de evolução clínica.'],
  ['src/app/studio/pacientes/[patientId]/prontuario/historico/page.tsx', 'Histórico', 'Histórico completo do prontuário.'],
  ['src/app/studio/pacientes/[patientId]/prontuario/anexos/page.tsx', 'Anexos', 'Documentos e arquivos anexados.'],
  ['src/app/studio/pacientes/[patientId]/prontuario/transcricoes/page.tsx', 'Transcrições', 'Transcrições de consultas.'],
  ['src/app/studio/pacientes/[patientId]/exames/page.tsx', 'Exames Laboratoriais', 'Upload, resultados, evolução e notas clínicas.'],
  ['src/app/studio/pacientes/[patientId]/exames/adicionar/page.tsx', 'Adicionar Exame', 'Upload de exame (PDF/foto).'],
  ['src/app/studio/pacientes/[patientId]/exames/resultados/page.tsx', 'Resultados', 'Resultados de exames com interpretação.'],
  ['src/app/studio/pacientes/[patientId]/exames/evolucao/page.tsx', 'Evolução de Exames', 'Gráficos evolutivos de marcadores.'],
  ['src/app/studio/pacientes/[patientId]/exames/notas/page.tsx', 'Notas Clínicas', 'Anotações sobre exames.'],
  ['src/app/studio/pacientes/[patientId]/exames/sugestoes/page.tsx', 'Sugestão de Exames', 'Recomendações de exames adicionais.'],
  ['src/app/studio/pacientes/[patientId]/antropometria/page.tsx', 'Antropometria', 'Medidas, bioimpedância, evolução e metas.'],
  ['src/app/studio/pacientes/[patientId]/antropometria/medidas/page.tsx', 'Medidas', 'Registro de medidas corporais.'],
  ['src/app/studio/pacientes/[patientId]/antropometria/bioimpedancia/page.tsx', 'Bioimpedância', 'Dados de bioimpedância.'],
  ['src/app/studio/pacientes/[patientId]/antropometria/evolucao/page.tsx', 'Evolução Antropométrica', 'Gráficos de evolução corporal.'],
  ['src/app/studio/pacientes/[patientId]/antropometria/metas/page.tsx', 'Metas', 'Metas antropométricas do paciente.'],
  ['src/app/studio/pacientes/[patientId]/calculo-energetico/page.tsx', 'Cálculo Energético', 'Dados, parâmetros, cenários e macros.'],
  ['src/app/studio/pacientes/[patientId]/calculo-energetico/parametros/page.tsx', 'Parâmetros', 'Dados e parâmetros para cálculo.'],
  ['src/app/studio/pacientes/[patientId]/calculo-energetico/cenarios/page.tsx', 'Cenários', 'Cenários de cálculo comparativos.'],
  ['src/app/studio/pacientes/[patientId]/calculo-energetico/macros/page.tsx', 'Macros', 'Distribuição de macronutrientes.'],
  ['src/app/studio/pacientes/[patientId]/calculo-energetico/historico/page.tsx', 'Histórico de Cálculos', 'Histórico de cálculos realizados.'],
  ['src/app/studio/pacientes/[patientId]/plano-alimentar/page.tsx', 'Plano Alimentar', 'Plano atual, montar, aplicar modelo e versões.'],
  ['src/app/studio/pacientes/[patientId]/plano-alimentar/atual/page.tsx', 'Plano Atual', 'Plano alimentar vigente.'],
  ['src/app/studio/pacientes/[patientId]/plano-alimentar/montar/page.tsx', 'Montar Plano', 'Construir novo plano alimentar.'],
  ['src/app/studio/pacientes/[patientId]/plano-alimentar/aplicar-modelo/page.tsx', 'Aplicar Modelo', 'Aplicar modelo de plano dos materiais.'],
  ['src/app/studio/pacientes/[patientId]/plano-alimentar/lista-compras/page.tsx', 'Lista de Compras', 'Lista de compras gerada a partir do plano.'],
  ['src/app/studio/pacientes/[patientId]/plano-alimentar/publicar/page.tsx', 'Publicar no Easy Patient', 'Publicar plano no app do paciente.'],
  ['src/app/studio/pacientes/[patientId]/plano-alimentar/versoes/page.tsx', 'Versões', 'Histórico de versões do plano alimentar.'],
  ['src/app/studio/pacientes/[patientId]/prescricao/page.tsx', 'Prescrição', 'Suplementos, dosagens, alertas e documentos.'],
  ['src/app/studio/pacientes/[patientId]/prescricao/itens/page.tsx', 'Itens', 'Suplementos e itens prescritos.'],
  ['src/app/studio/pacientes/[patientId]/prescricao/dosagens/page.tsx', 'Dosagens', 'Dosagens e posologia.'],
  ['src/app/studio/pacientes/[patientId]/prescricao/alertas/page.tsx', 'Alertas', 'Alertas de interações e contraindicações.'],
  ['src/app/studio/pacientes/[patientId]/prescricao/documento/page.tsx', 'Documento', 'Gerar documento de prescrição.'],
  ['src/app/studio/pacientes/[patientId]/prescricao/assinar-enviar/page.tsx', 'Assinar & Enviar', 'Assinar e enviar prescrição.'],
  ['src/app/studio/pacientes/[patientId]/documentos/page.tsx', 'Documentos', 'Gerar, assinar, enviar e histórico.'],
  ['src/app/studio/pacientes/[patientId]/documentos/gerar/page.tsx', 'Gerar Documento', 'Gerar documento personalizado.'],
  ['src/app/studio/pacientes/[patientId]/documentos/assinar/page.tsx', 'Assinar', 'Assinar documento digitalmente.'],
  ['src/app/studio/pacientes/[patientId]/documentos/enviar/page.tsx', 'Enviar', 'Enviar documento ao paciente.'],
  ['src/app/studio/pacientes/[patientId]/documentos/historico/page.tsx', 'Histórico de Documentos', 'Histórico de documentos gerados.'],
  ['src/app/studio/pacientes/[patientId]/mensagens/page.tsx', 'Mensagens', 'WhatsApp, modelos de mensagens e histórico.'],
];

function toFunctionName(title) {
  return title
    .replace(/[^a-zA-ZÀ-ÿ0-9\s]/g, '')
    .split(/\s+/)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join('') + 'Page';
}

function makeStub(filePath, title, description) {
  const fnName = toFunctionName(title);
  return `import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function ${fnName}() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold">${title}</h1>
                <p className="text-sm text-muted-foreground mt-1">${description}</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>${title}</CardTitle>
                    <CardDescription>${description}</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">
                        Esta seção está em desenvolvimento. O conteúdo será implementado em breve.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
`;
}

let count = 0;
for (const [filePath, title, desc] of stubs) {
  const fullPath = path.resolve(filePath);
  const dir = path.dirname(fullPath);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(fullPath, makeStub(filePath, title, desc));
  count++;
}

console.log(`Created ${count} route stubs`);
