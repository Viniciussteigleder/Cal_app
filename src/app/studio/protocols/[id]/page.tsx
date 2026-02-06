import React from 'react';
import { ProtocolForm } from '../ProtocolForm';
import { getProtocol } from '../actions';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function EditProtocolPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const { success, data } = await getProtocol(id);

    if (!success || !data) {
        notFound();
    }

    return <ProtocolForm initialData={data} isEditing={true} />;
}
