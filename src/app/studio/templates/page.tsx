import React from 'react';
import { getTemplates } from './actions';
import { TemplateList } from './TemplateList';

export default async function TemplatesPage() {
  const { success, data } = await getTemplates();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Modelos e Formulários</h1>
        <p className="text-muted-foreground">Crie templates para anamneses, planos e registros.</p>
      </div>

      <TemplateList templates={data || []} />
    </div>
  );
}
