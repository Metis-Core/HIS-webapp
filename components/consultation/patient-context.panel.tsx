'use client';

import { useMemo } from 'react';
import { format } from 'date-fns';
import {
  FaEnvelope,
  FaFlask,
  FaMapMarkerAlt,
  FaNotesMedical,
  FaPhone,
  FaPills,
  FaShieldAlt,
  FaStethoscope,
} from 'react-icons/fa';
import { Pill } from '@/components';
import { ConsultationStatusEnum, LabOrderStatusEnum, PillVariantEnum, TriageAcuityEnum } from '@/enum';
import {
  useConsultationsByPatient,
  useLabOrdersByConsultation,
  useLabOrdersByPatient,
  usePrescriptionsByPatient,
  useTriageByPatient,
} from '@/hooks';
import type { IPatient, ITriage } from '@/interfaces';

const acuityVariant: Record<TriageAcuityEnum, PillVariantEnum> = {
  [TriageAcuityEnum.LEVEL_1]: PillVariantEnum.DANGER,
  [TriageAcuityEnum.LEVEL_2]: PillVariantEnum.DANGER,
  [TriageAcuityEnum.LEVEL_3]: PillVariantEnum.WARNING,
  [TriageAcuityEnum.LEVEL_4]: PillVariantEnum.INFO,
  [TriageAcuityEnum.LEVEL_5]: PillVariantEnum.SUCCESS,
};

function initialsOf(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() ?? '')
    .join('');
}

interface PatientContextPanelProps {
  patient: IPatient | null | undefined;
  visitId?: string | null;
  consultationId: string | null;
}

export default function PatientContextPanel({ patient, visitId, consultationId }: PatientContextPanelProps) {
  const { triages } = useTriageByPatient(patient?.id);
  const { consultations } = useConsultationsByPatient(patient?.id);
  const { orders: allOrders } = useLabOrdersByPatient(patient?.id);
  const { prescriptions } = usePrescriptionsByPatient(patient?.id);

  const latestTriage = useMemo<ITriage | null>(() => {
    if (triages.length === 0) return null;
    return [...triages].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
  }, [triages]);

  const priorConsultations = useMemo(
    () => consultations.filter((c) => c.id !== consultationId).slice(0, 5),
    [consultations, consultationId],
  );

  const visitOrders = useMemo(
    () => (visitId ? allOrders.filter((o) => o.visitId === visitId) : []),
    [allOrders, visitId],
  );
  const otherOrders = useMemo(
    () => (visitId ? allOrders.filter((o) => o.visitId !== visitId).slice(0, 5) : allOrders.slice(0, 5)),
    [allOrders, visitId],
  );

  if (!patient) {
    return (
      <section className="rounded-lg border border-line bg-surface-raised p-5 text-sm text-ink-muted">
        Select a patient to see their triage, previous consultations, lab results, and prescriptions.
      </section>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <section className="rounded-lg border border-line bg-surface-raised p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-soft text-brand text-sm font-semibold">
            {initialsOf(`${patient.firstName} ${patient.lastName}`)}
          </div>
          <div>
            <h2 className="text-sm font-semibold text-ink">
              {patient.firstName} {patient.lastName}
            </h2>
            <p className="text-xs text-ink-muted">{patient.mrn ?? 'No MRN'}</p>
          </div>
        </div>
        <dl className="mt-4 flex flex-col gap-2 border-t border-line pt-3 text-xs">
          <ProfileRow icon={<FaPhone />} label="Phone" value={patient.phone ?? null} />
          <ProfileRow icon={<FaEnvelope />} label="Email" value={patient.email ?? null} />
          <ProfileRow
            icon={<FaMapMarkerAlt />}
            label="Location"
            value={
              patient.city
                ? `${patient.city}${patient.address ? ` · ${patient.address}` : ''}`
                : (patient.address ?? null)
            }
          />
          {patient.insuranceProvider && (
            <ProfileRow
              icon={<FaShieldAlt />}
              label={patient.insuranceProvider}
              value={patient.insurancePolicyNumber ?? 'Insured'}
            />
          )}
        </dl>
        {patient.allergies && (
          <p className="mt-3 rounded-md bg-critical-soft px-3 py-2 text-xs font-medium text-critical">
            Allergies: {patient.allergies}
          </p>
        )}
      </section>

      {latestTriage && <TriageCard triage={latestTriage} />}

      {visitOrders.length > 0 && <VisitLabOrdersCard title="Lab orders this visit" orders={visitOrders} />}

      {consultationId && <ConsultationLabResults consultationId={consultationId} />}

      {priorConsultations.length > 0 && (
        <section className="rounded-lg border border-line bg-surface-raised">
          <header className="flex items-center gap-2 border-b border-line px-5 py-3">
            <FaStethoscope className="text-ink-muted" />
            <h3 className="text-sm font-semibold text-ink">Prior consultations</h3>
          </header>
          <ul className="flex flex-col divide-y divide-line">
            {priorConsultations.map((c) => (
              <li key={c.id} className="flex flex-col gap-1 px-5 py-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-ink">
                    {format(new Date(c.createdAt), 'dd MMM yyyy')} · {c.type.replaceAll('_', ' ')}
                  </p>
                  <Pill
                    variant={
                      c.status === ConsultationStatusEnum.COMPLETED
                        ? PillVariantEnum.SUCCESS
                        : c.status === ConsultationStatusEnum.CANCELLED
                          ? PillVariantEnum.DEFAULT
                          : PillVariantEnum.INFO
                    }
                  >
                    {c.status.replaceAll('_', ' ')}
                  </Pill>
                </div>
                <p className="text-sm text-ink">{c.chiefComplaint}</p>
                {c.diagnosis && (
                  <p className="text-xs text-ink-muted">
                    <span className="font-medium">Dx:</span> {c.diagnosis}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {otherOrders.length > 0 && <VisitLabOrdersCard title="Recent lab history" orders={otherOrders} />}

      {prescriptions.length > 0 && (
        <section className="rounded-lg border border-line bg-surface-raised">
          <header className="flex items-center gap-2 border-b border-line px-5 py-3">
            <FaPills className="text-ink-muted" />
            <h3 className="text-sm font-semibold text-ink">Prescriptions</h3>
          </header>
          <ul className="flex flex-col divide-y divide-line">
            {prescriptions.slice(0, 5).map((p) => (
              <li key={p.id} className="flex flex-col gap-1 px-5 py-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-ink">{format(new Date(p.createdAt), 'dd MMM yyyy')}</p>
                  <Pill variant={PillVariantEnum.DEFAULT}>{p.status.replaceAll('_', ' ')}</Pill>
                </div>
                <p className="text-sm text-ink">{p.items?.map((i) => i.item?.name ?? i.itemId).join(', ')}</p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function ProfileRow({ icon, label, value }: { icon: React.ReactNode; label: string; value?: string | null }) {
  if (!value?.trim()) return null;
  return (
    <div className="flex items-start gap-3 text-ink">
      <span className="mt-0.5 text-ink-muted">{icon}</span>
      <div className="min-w-0">
        <p className="text-[11px] uppercase tracking-wide text-ink-muted">{label}</p>
        <p className="truncate text-sm">{value}</p>
      </div>
    </div>
  );
}

function TriageCard({ triage }: { triage: ITriage }) {
  return (
    <section className="rounded-lg border border-line bg-surface-raised">
      <header className="flex items-center justify-between border-b border-line px-5 py-3">
        <div className="flex items-center gap-2">
          <FaNotesMedical className="text-ink-muted" />
          <h3 className="text-sm font-semibold text-ink">Latest triage</h3>
        </div>
        <Pill variant={acuityVariant[triage.acuity] ?? PillVariantEnum.DEFAULT}>{triage.acuity.replace('_', ' ')}</Pill>
      </header>
      <div className="flex flex-col gap-2 px-5 py-3">
        <p className="text-sm text-ink">{triage.chiefComplaint}</p>
        <div className="grid grid-cols-3 gap-2 rounded-md bg-surface p-2 font-mono text-xs text-ink-muted">
          {triage.temperatureC != null && <span>Temp {triage.temperatureC}°C</span>}
          {triage.heartRate != null && <span>HR {triage.heartRate}</span>}
          {triage.respiratoryRate != null && <span>RR {triage.respiratoryRate}</span>}
          {triage.bloodPressureSystolic != null && triage.bloodPressureDiastolic != null && (
            <span>
              BP {triage.bloodPressureSystolic}/{triage.bloodPressureDiastolic}
            </span>
          )}
          {triage.oxygenSaturation != null && <span>SpO₂ {triage.oxygenSaturation}%</span>}
          {triage.painScore != null && <span>Pain {triage.painScore}/10</span>}
          {triage.weightKg != null && <span>Wt {triage.weightKg} kg</span>}
          {triage.heightCm != null && <span>Ht {triage.heightCm} cm</span>}
        </div>
        {triage.allergiesNoted && (
          <p className="rounded-md bg-critical-soft px-2 py-1 text-xs text-critical">{triage.allergiesNoted}</p>
        )}
        {triage.assessmentNotes && (
          <p className="text-xs text-ink-muted">
            <span className="font-medium">Notes:</span> {triage.assessmentNotes}
          </p>
        )}
        <p className="text-[11px] text-ink-muted tabular-nums">
          {format(new Date(triage.createdAt), 'dd MMM yyyy · HH:mm')}
        </p>
      </div>
    </section>
  );
}

function VisitLabOrdersCard({
  title,
  orders,
}: {
  title: string;
  orders: Array<{
    id: string;
    status: string;
    priority: string;
    items?: Array<{ test?: { code?: string; name?: string }; resultValue?: string | null }>;
    createdAt: Date;
  }>;
}) {
  return (
    <section className="rounded-lg border border-line bg-surface-raised">
      <header className="flex items-center gap-2 border-b border-line px-5 py-3">
        <FaFlask className="text-ink-muted" />
        <h3 className="text-sm font-semibold text-ink">{title}</h3>
      </header>
      <ul className="flex flex-col divide-y divide-line">
        {orders.map((o) => (
          <li key={o.id} className="flex flex-col gap-1 px-5 py-3">
            <div className="flex items-center justify-between">
              <p className="text-xs text-ink-muted">{format(new Date(o.createdAt), 'dd MMM yyyy · HH:mm')}</p>
              <Pill
                variant={
                  o.status === LabOrderStatusEnum.COMPLETED
                    ? PillVariantEnum.SUCCESS
                    : o.status === LabOrderStatusEnum.CANCELLED
                      ? PillVariantEnum.DEFAULT
                      : PillVariantEnum.INFO
                }
              >
                {o.status.replaceAll('_', ' ')}
              </Pill>
            </div>
            <ul className="flex flex-col gap-0.5 text-xs text-ink">
              {o.items?.map((i, idx) => (
                <li key={idx} className="flex justify-between gap-2">
                  <span>
                    {i.test?.code ?? '—'} — {i.test?.name ?? ''}
                  </span>
                  <span className="font-medium tabular-nums">
                    {i.resultValue ? i.resultValue : <span className="text-ink-muted">pending</span>}
                  </span>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </section>
  );
}

function ConsultationLabResults({ consultationId }: { consultationId: string }) {
  const { orders } = useLabOrdersByConsultation(consultationId);
  if (orders.length === 0) return null;
  return <VisitLabOrdersCard title="Lab orders for this consultation" orders={orders} />;
}
