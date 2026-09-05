'use client';

import { useParams } from 'next/navigation';
import PatientTriageTab from '../../components/patient-triage-tab';

export default function PatientTriagePage() {
  const params = useParams<{ id: string }>();
  return (
    <section className="rounded-lg border border-line bg-surface-raised p-5">
      <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-ink-muted">Triage</h2>
      <PatientTriageTab patientId={params.id} />
    </section>
  );
}
