import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function PatientRootPage({
    params,
}: {
    params: Promise<{ patientId: string }>;
}) {
    const { patientId } = await params;
    redirect(`/studio/patients/${patientId}/overview`);
}
