'use client';

import { useParams } from 'next/navigation';
import PatientAppointmentsTab from '../../components/patient-appointments-tab';

export default function PatientAppointmentsPage() {
  const params = useParams<{ id: string }>();
  return (
    <section className="rounded-lg border border-line bg-surface-raised p-5">
      <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-ink-muted">Appointments</h2>
      <PatientAppointmentsTab patientId={params.id} />
    </section>
  );
}
