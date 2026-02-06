import React from 'react';
import { getProtocols } from './actions';

export const dynamic = 'force-dynamic';
import { ProtocolList } from './ProtocolList';

export default async function ProtocolsPage() {
  const { success, data } = await getProtocols();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Catálogo de Protocolos</h1>
        <p className="text-muted-foreground">Gerencie e valide protocolos clínicos baseados em evidências.</p>
      </div>

      <ProtocolList protocols={data || []} />
    </div>
  );
}
