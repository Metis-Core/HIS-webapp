'use client';

import { useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import useSWR from 'swr';
import { PatientTimeline, VisitDrawer } from '@/components';
import { getPatientHistory } from '@/data/patient-history';
import type { IPatientHistoryEvent } from '@/data/patient-history';
import { api } from '@/helpers/axios';
import type { IPatient } from '@/interfaces/patient.interface';

export default function PatientVisitsPage() {
  const params = useParams<{ id: string }>();
  const { data } = useSWR<{ data: { data: IPatient } }>(`/patients/${params.id}`, api);
  const patient = data?.data.data;
  const history = useMemo(() => (patient ? getPatientHistory(patient.id) : []), [patient]);
  const [selected, setSelected] = useState<IPatientHistoryEvent | null>(null);

  return (
    <section className="rounded-lg border border-line bg-surface-raised p-5">
      <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-ink-muted">Activity timeline</h2>
      <PatientTimeline events={history} onSelect={setSelected} />
      <VisitDrawer visit={selected} onClose={() => setSelected(null)} />
    </section>
  );
}
