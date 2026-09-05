'use client';

import { useParams } from 'next/navigation';
import PatientTreatmentsTab from '../../components/patient-treatments-tab';

export default function PatientTreatmentsPage() {
  const params = useParams<{ id: string }>();
  return (
    <section className="rounded-lg border border-line bg-surface-raised p-5">
      <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-ink-muted">Treatments</h2>
      <PatientTreatmentsTab patientId={params.id} />
    </section>
  );
}
