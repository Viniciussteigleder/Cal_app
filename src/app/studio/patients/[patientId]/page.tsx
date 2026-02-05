import { redirect } from 'next/navigation';

export default async function PatientRootPage({
    params,
}: {
    params: Promise<{ patientId: string }>;
}) {
    const { patientId } = await params;
    redirect(`/studio/patients/${patientId}/overview`);
}
