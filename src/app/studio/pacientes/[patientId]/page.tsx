import { redirect } from 'next/navigation';

export default function PatientRootPage({
    params,
}: {
    params: { patientId: string };
}) {
    redirect(`/studio/pacientes/${params.patientId}/resumo`);
}
