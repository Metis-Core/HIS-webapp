'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { toast } from 'sonner';
import {
  FaArrowLeft,
  FaBan,
  FaCheckCircle,
  FaClipboardList,
  FaFlask,
  FaPills,
  FaPlus,
  FaStethoscope,
  FaTrash,
} from 'react-icons/fa';
import { useSWRConfig } from 'swr';
import { Button, Dropdown, Input, PageHeader, Pill, Tabs } from '@/components';
import CompleteStageDrawer from '@/components/drawers/complete-stage.drawer';
import PatientContextPanel from '@/components/consultation/patient-context.panel';
import {
  ButtonVariantEnum,
  ConsultationStatusEnum,
  ConsultationTypeEnum,
  DepartmentEnum,
  LabOrderItemStatusEnum,
  LabOrderStatusEnum,
  LabPriorityEnum,
  PillVariantEnum,
  VisitIntentEnum,
} from '@/enum';
import { extractErrorMessage } from '@/helpers/errors';
import { labOrdersService } from '@/helpers/lab.service';
import pharmacyService from '@/helpers/pharmacy.service';
import { useConsultation, useConsultations, useInventoryItems, useLabOrdersByConsultation, useLabTests } from '@/hooks';
import type { IOption, IUpdateConsultationDto } from '@/interfaces';

type ConsultationTab = 'encounter' | 'lab' | 'prescriptions';

const orderStatusVariant: Record<LabOrderStatusEnum, PillVariantEnum> = {
  [LabOrderStatusEnum.PENDING]: PillVariantEnum.WARNING,
  [LabOrderStatusEnum.IN_PROGRESS]: PillVariantEnum.INFO,
  [LabOrderStatusEnum.COMPLETED]: PillVariantEnum.SUCCESS,
  [LabOrderStatusEnum.CANCELLED]: PillVariantEnum.DEFAULT,
};

const typeOptions: IOption[] = Object.values(ConsultationTypeEnum).map((v) => ({
  label: v.replaceAll('_', ' '),
  value: v,
}));

const departmentOptions: IOption[] = Object.values(DepartmentEnum).map((v) => ({
  label: v.replaceAll('_', ' '),
  value: v,
}));

const priorityOptions: IOption[] = Object.values(LabPriorityEnum).map((v) => ({
  label: v,
  value: v,
}));

const statusVariant: Record<ConsultationStatusEnum, PillVariantEnum> = {
  [ConsultationStatusEnum.IN_PROGRESS]: PillVariantEnum.INFO,
  [ConsultationStatusEnum.COMPLETED]: PillVariantEnum.SUCCESS,
  [ConsultationStatusEnum.CANCELLED]: PillVariantEnum.DEFAULT,
};

export default function ConsultationDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { mutate: globalMutate } = useSWRConfig();

  const { consultation, isLoading, mutate } = useConsultation(params.id);
  const { updateConsultation, completeConsultation, cancelConsultation } = useConsultations({ limit: 20 });

  const [values, setValues] = useState({
    chiefComplaint: '',
    type: ConsultationTypeEnum.OUTPATIENT,
    department: DepartmentEnum.OUTPATIENT_CLINIC,
    historyOfPresentIllness: '',
    examinationFindings: '',
    assessment: '',
    diagnosis: '',
    icd10Codes: '',
    plan: '',
    notes: '',
  });
  const [savingForm, setSavingForm] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [completingBusy, setCompletingBusy] = useState(false);
  const [tab, setTab] = useState<ConsultationTab>('encounter');

  const { orders: labOrders, mutate: mutateLabOrders } = useLabOrdersByConsultation(params.id);
  const resultReadyCount = labOrders.reduce(
    (n, o) => n + o.items.filter((i) => i.status === LabOrderItemStatusEnum.RESULT_READY).length,
    0,
  );

  useEffect(() => {
    if (!consultation) return;
    setValues({
      chiefComplaint: consultation.chiefComplaint,
      type: consultation.type,
      department: consultation.department,
      historyOfPresentIllness: consultation.historyOfPresentIllness ?? '',
      examinationFindings: consultation.examinationFindings ?? '',
      assessment: consultation.assessment ?? '',
      diagnosis: consultation.diagnosis ?? '',
      icd10Codes: consultation.icd10Codes ?? '',
      plan: consultation.plan ?? '',
      notes: consultation.notes ?? '',
    });
  }, [consultation]);

  const invalidateAll = () =>
    globalMutate(
      (key) =>
        typeof key === 'string' &&
        (key.startsWith('/consultations') || key.startsWith('/lab') || key.startsWith('/pharmacy')),
    );

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        <div className="h-6 w-64 rounded bg-line/60" />
        <div className="h-40 rounded-lg border border-line bg-surface-raised" />
      </div>
    );
  }

  if (!consultation) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <p className="text-sm text-ink-muted">Consultation not found</p>
        <Button type="button" variant={ButtonVariantEnum.PRIMARY} onClick={() => router.push('/consultations')}>
          Back to consultations
        </Button>
      </div>
    );
  }

  const readOnly = consultation.status !== ConsultationStatusEnum.IN_PROGRESS;

  const set = <K extends keyof typeof values>(key: K, value: (typeof values)[K]) =>
    setValues((s) => ({ ...s, [key]: value }));

  const saveForm = async () => {
    if (!values.chiefComplaint.trim()) {
      toast.error('Chief complaint is required');
      return;
    }
    setSavingForm(true);
    try {
      const payload: IUpdateConsultationDto = {
        chiefComplaint: values.chiefComplaint.trim(),
        type: values.type,
        department: values.department,
        historyOfPresentIllness: values.historyOfPresentIllness.trim() || undefined,
        examinationFindings: values.examinationFindings.trim() || undefined,
        assessment: values.assessment.trim() || undefined,
        diagnosis: values.diagnosis.trim() || undefined,
        icd10Codes: values.icd10Codes.trim() || undefined,
        plan: values.plan.trim() || undefined,
        notes: values.notes.trim() || undefined,
      };
      await toast.promise(updateConsultation(consultation.id, payload), {
        loading: 'Saving…',
        success: 'Consultation saved',
        error: (err) => extractErrorMessage(err, "Couldn't save — retry"),
      });
      await mutate();
    } finally {
      setSavingForm(false);
    }
  };

  const confirmComplete = async ({ nextIntents, notes }: { nextIntents: VisitIntentEnum[]; notes?: string }) => {
    setCompletingBusy(true);
    try {
      await toast.promise(completeConsultation(consultation.id, { nextIntents, notes }), {
        loading: 'Signing…',
        success: nextIntents.length > 0 ? `Signed — routed to ${nextIntents.join(', ')}` : 'Encounter signed',
        error: (err) => extractErrorMessage(err, "Couldn't sign — retry"),
      });
      setCompleting(false);
      await mutate();
      await invalidateAll();
    } finally {
      setCompletingBusy(false);
    }
  };

  const cancel = async () => {
    if (!confirm('Cancel this consultation?')) return;
    await toast.promise(cancelConsultation(consultation.id, {}), {
      loading: 'Cancelling…',
      success: 'Consultation cancelled',
      error: (err) => extractErrorMessage(err, "Couldn't cancel — retry"),
    });
    await mutate();
    await invalidateAll();
  };

  const patientName = consultation.patient
    ? `${consultation.patient.firstName} ${consultation.patient.lastName}`
    : 'Consultation';

  const prescriptionsCount = 0; // Populated via useConsultation.prescriptions if backend attaches — safe fallback.
  const isInProgress = consultation.status === ConsultationStatusEnum.IN_PROGRESS;

  return (
    <div className="flex flex-col gap-5 pb-24">
      <Link
        href="/consultations"
        className="inline-flex w-fit items-center gap-2 text-xs font-medium text-ink-muted hover:text-ink"
      >
        <FaArrowLeft className="text-[10px]" />
        Back to consultations
      </Link>

      <PageHeader
        title={patientName}
        description={`${consultation.chiefComplaint} · ${consultation.type.replaceAll('_', ' ')} · ${format(new Date(consultation.createdAt), 'dd MMM yyyy')}`}
        action={
          <div className="flex items-center gap-2">
            <Pill variant={statusVariant[consultation.status] ?? PillVariantEnum.DEFAULT}>
              {consultation.status.replaceAll('_', ' ')}
            </Pill>
          </div>
        }
      />

      <Tabs<ConsultationTab>
        tabs={[
          { id: 'encounter', label: 'Encounter', icon: FaStethoscope },
          {
            id: 'lab',
            label:
              resultReadyCount > 0
                ? `Lab · ${resultReadyCount} ready`
                : labOrders.length > 0
                  ? `Lab (${labOrders.length})`
                  : 'Lab orders',
            icon: FaFlask,
          },
          { id: 'prescriptions', label: 'Prescriptions', icon: FaPills },
        ]}
        active={tab}
        onChange={setTab}
      />

      <div className="grid gap-5 lg:grid-cols-12">
        <div className="flex flex-col gap-4 lg:col-span-8 xl:col-span-9">
          {tab === 'encounter' && (
            <section className="flex flex-col gap-4 rounded-lg border border-line bg-surface-raised p-5">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-ink">Encounter</h2>
                {!readOnly && (
                  <Button type="button" variant={ButtonVariantEnum.PRIMARY} onClick={saveForm} loading={savingForm}>
                    Save
                  </Button>
                )}
              </div>

              <Input
                label="Chief complaint"
                required
                disabled={readOnly}
                value={values.chiefComplaint}
                onChange={(e) => set('chiefComplaint', e.target.value)}
              />

              <div className="grid grid-cols-2 gap-3">
                <Dropdown
                  label="Type"
                  options={typeOptions}
                  value={typeOptions.find((o) => o.value === values.type) ?? null}
                  onChange={(o) => set('type', (o as IOption).value as ConsultationTypeEnum)}
                  isDisabled={readOnly}
                />
                <Dropdown
                  label="Department"
                  options={departmentOptions}
                  value={departmentOptions.find((o) => o.value === values.department) ?? null}
                  onChange={(o) => set('department', (o as IOption).value as DepartmentEnum)}
                  isDisabled={readOnly}
                />
              </div>

              <Input
                label="History of present illness"
                disabled={readOnly}
                value={values.historyOfPresentIllness}
                onChange={(e) => set('historyOfPresentIllness', e.target.value)}
              />
              <Input
                label="Examination findings"
                disabled={readOnly}
                value={values.examinationFindings}
                onChange={(e) => set('examinationFindings', e.target.value)}
              />

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Assessment"
                  disabled={readOnly}
                  value={values.assessment}
                  onChange={(e) => set('assessment', e.target.value)}
                />
                <Input
                  label="Diagnosis"
                  disabled={readOnly}
                  value={values.diagnosis}
                  onChange={(e) => set('diagnosis', e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="ICD-10 codes"
                  disabled={readOnly}
                  value={values.icd10Codes}
                  onChange={(e) => set('icd10Codes', e.target.value)}
                />
                <Input
                  label="Plan"
                  disabled={readOnly}
                  value={values.plan}
                  onChange={(e) => set('plan', e.target.value)}
                />
              </div>
              <Input
                label="Notes"
                disabled={readOnly}
                value={values.notes}
                onChange={(e) => set('notes', e.target.value)}
              />
            </section>
          )}

          {tab === 'lab' && (
            <LabTab consultation={consultation} orders={labOrders} onChanged={mutateLabOrders} readOnly={readOnly} />
          )}

          {tab === 'prescriptions' && <PrescriptionsPanel consultation={consultation} readOnly={readOnly} />}
        </div>

        <aside className="flex flex-col gap-4 lg:col-span-4 xl:col-span-3">
          <PatientContextPanel
            patient={consultation.patient ?? null}
            visitId={consultation.visitId ?? null}
            consultationId={consultation.id}
          />

          <section className="flex flex-col gap-2 rounded-lg border border-line bg-surface-raised p-4">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Consultation checklist</h3>
            <ul className="flex flex-col gap-1.5 text-sm">
              <li className="flex items-center justify-between">
                <span className="text-ink-muted">Encounter</span>
                <Pill
                  variant={values.assessment || values.diagnosis ? PillVariantEnum.SUCCESS : PillVariantEnum.WARNING}
                >
                  {values.assessment || values.diagnosis ? 'Drafted' : 'Pending'}
                </Pill>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-ink-muted">Lab orders</span>
                <Pill variant={labOrders.length > 0 ? PillVariantEnum.INFO : PillVariantEnum.DEFAULT}>
                  {labOrders.length > 0 ? `${labOrders.length} ordered` : 'None'}
                </Pill>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-ink-muted">Results ready</span>
                <Pill variant={resultReadyCount > 0 ? PillVariantEnum.SUCCESS : PillVariantEnum.DEFAULT}>
                  {resultReadyCount > 0 ? `${resultReadyCount} back` : 'Awaiting'}
                </Pill>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-ink-muted">Prescriptions</span>
                <Pill variant={prescriptionsCount > 0 ? PillVariantEnum.INFO : PillVariantEnum.DEFAULT}>
                  {prescriptionsCount > 0 ? `${prescriptionsCount} added` : 'None'}
                </Pill>
              </li>
            </ul>
          </section>
        </aside>
      </div>

      {isInProgress && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface-raised/95 backdrop-blur">
          <div className="flex w-full items-center justify-between gap-3 px-6 py-3">
            <div className="flex items-center gap-3 text-xs text-ink-muted">
              <span className="hidden md:inline">
                Document encounter, order labs and prescriptions from the tabs above before signing.
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button type="button" variant={ButtonVariantEnum.SECONDARY} onClick={cancel}>
                <FaBan className="text-xs" />
                Cancel visit
              </Button>
              <Button type="button" variant={ButtonVariantEnum.PRIMARY} onClick={() => setCompleting(true)}>
                <FaCheckCircle className="text-xs" />
                Sign encounter
              </Button>
            </div>
          </div>
        </div>
      )}

      <CompleteStageDrawer
        open={completing}
        title="Sign encounter"
        patientName={patientName}
        onClose={() => setCompleting(false)}
        onConfirm={confirmComplete}
        submitting={completingBusy}
        warnings={[
          ...(!values.chiefComplaint.trim() || values.chiefComplaint.trim().toLowerCase() === 'to be documented'
            ? [
                {
                  message: 'Chief complaint is missing — document it on the Encounter tab.',
                  severity: 'critical' as const,
                },
              ]
            : []),
          ...(!values.assessment.trim() && !values.diagnosis.trim()
            ? [{ message: 'No assessment or diagnosis recorded.', severity: 'warning' as const }]
            : []),
          ...(!values.plan.trim()
            ? [{ message: 'Plan is empty — consider documenting the management plan.', severity: 'warning' as const }]
            : []),
          ...(resultReadyCount > 0
            ? [
                {
                  message: `${resultReadyCount} lab result(s) ready — review before signing.`,
                  severity: 'warning' as const,
                },
              ]
            : []),
        ]}
        summary={
          <ul className="flex flex-col gap-1 text-xs text-ink">
            <li className="flex items-center justify-between">
              <span className="text-ink-muted">Chief complaint</span>
              <span className="max-w-[60%] truncate font-medium">{values.chiefComplaint?.trim() || '—'}</span>
            </li>
            <li className="flex items-center justify-between">
              <span className="text-ink-muted">Diagnosis</span>
              <span className="max-w-[60%] truncate font-medium">{values.diagnosis?.trim() || '—'}</span>
            </li>
            <li className="flex items-center justify-between">
              <span className="text-ink-muted">Plan</span>
              <span className="max-w-[60%] truncate font-medium">{values.plan?.trim() || '—'}</span>
            </li>
            <li className="flex items-center justify-between">
              <span className="text-ink-muted">Lab orders</span>
              <span className="font-medium">
                {labOrders.length}
                {resultReadyCount > 0 ? ` · ${resultReadyCount} ready` : ''}
              </span>
            </li>
            <li className="flex items-center justify-between">
              <span className="text-ink-muted">Prescriptions</span>
              <span className="font-medium">{prescriptionsCount}</span>
            </li>
          </ul>
        }
      />
    </div>
  );
}

function LabTab({
  consultation,
  orders,
  onChanged,
  readOnly,
}: {
  consultation: NonNullable<ReturnType<typeof useConsultation>['consultation']>;
  orders: ReturnType<typeof useLabOrdersByConsultation>['orders'];
  onChanged: ReturnType<typeof useLabOrdersByConsultation>['mutate'];
  readOnly: boolean;
}) {
  const { tests } = useLabTests({ limit: 100, isActive: true });
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [priority, setPriority] = useState<LabPriorityEnum>(LabPriorityEnum.ROUTINE);
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState(false);
  const [search, setSearch] = useState('');

  const toggle = (id: string) => setSelectedIds((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const filteredTests = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return tests;
    return tests.filter(
      (t) =>
        t.code.toLowerCase().includes(q) || t.name.toLowerCase().includes(q) || t.category.toLowerCase().includes(q),
    );
  }, [tests, search]);

  const readyItems = useMemo(
    () =>
      orders
        .flatMap((o) =>
          o.items
            .filter((i) => i.status === LabOrderItemStatusEnum.RESULT_READY || i.resultValue)
            .map((i) => ({ order: o, item: i })),
        )
        .sort((a, b) => {
          const av = a.item.resultedAt ? new Date(a.item.resultedAt).getTime() : 0;
          const bv = b.item.resultedAt ? new Date(b.item.resultedAt).getTime() : 0;
          return bv - av;
        }),
    [orders],
  );

  const pendingItems = useMemo(
    () =>
      orders.flatMap((o) =>
        o.items
          .filter((i) => i.status !== LabOrderItemStatusEnum.RESULT_READY && !i.resultValue)
          .map((i) => ({ order: o, item: i })),
      ),
    [orders],
  );

  const submit = async () => {
    if (selectedIds.length === 0) {
      toast.error('Select at least one test');
      return;
    }
    setBusy(true);
    try {
      await toast.promise(
        labOrdersService.create({
          patientId: consultation.patientId,
          consultationId: consultation.id,
          visitId: consultation.visitId ?? undefined,
          priority,
          clinicalNotes: notes.trim() || undefined,
          items: selectedIds.map((testId) => ({ testId })),
        }),
        {
          loading: 'Sending order to lab…',
          success: 'Order sent to laboratory',
          error: (err) => extractErrorMessage(err, "Couldn't send — retry"),
        },
      );
      setSelectedIds([]);
      setNotes('');
      await onChanged();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <section className="flex flex-col gap-3 rounded-lg border border-line bg-surface-raised p-5">
        <div className="flex items-center gap-2">
          <FaFlask className="text-status-normal" />
          <h3 className="text-sm font-semibold text-ink">Results</h3>
          {readyItems.length > 0 && <Pill variant={PillVariantEnum.SUCCESS}>{readyItems.length} ready</Pill>}
        </div>

        {readyItems.length === 0 ? (
          <p className="text-xs text-ink-muted">
            No results yet. Results will appear here as the lab completes each test — you'll also get a notification.
          </p>
        ) : (
          <ul className="flex flex-col divide-y divide-line rounded-md border border-line">
            {readyItems.map(({ order, item }) => (
              <li key={item.id} className="flex flex-col gap-1 px-3 py-2 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-ink">
                    {item.test ? `${item.test.code} — ${item.test.name}` : 'Test'}
                  </span>
                  <div className="flex items-center gap-2">
                    {item.isAbnormal && <Pill variant={PillVariantEnum.DANGER}>Abnormal</Pill>}
                    <Pill variant={PillVariantEnum.SUCCESS}>{item.status.replaceAll('_', ' ')}</Pill>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-muted">
                  <span>
                    Result:{' '}
                    <span className="font-mono text-ink">
                      {item.resultValue ?? '—'}
                      {item.test?.unit ? ` ${item.test.unit}` : ''}
                    </span>
                  </span>
                  {item.test?.referenceRange && <span>Ref: {item.test.referenceRange}</span>}
                  {item.resultedAt && (
                    <span className="tabular-nums">{format(new Date(item.resultedAt), 'dd MMM HH:mm')}</span>
                  )}
                  <span className="capitalize">Priority {order.priority}</span>
                </div>
                {item.resultNotes && <p className="text-xs text-ink-muted">Notes: {item.resultNotes}</p>}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="flex flex-col gap-3 rounded-lg border border-line bg-surface-raised p-5">
        <div className="flex items-center gap-2">
          <FaClipboardList className="text-brand" />
          <h3 className="text-sm font-semibold text-ink">Orders in progress</h3>
          {pendingItems.length > 0 && <Pill variant={PillVariantEnum.INFO}>{pendingItems.length} pending</Pill>}
        </div>

        {orders.length === 0 ? (
          <p className="text-xs text-ink-muted">No lab orders yet for this consultation.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-line rounded-md border border-line">
            {orders.map((o) => (
              <li key={o.id} className="flex flex-col gap-1 px-3 py-2 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-ink">
                    {o.items
                      ?.map((i) => i.test?.code)
                      .filter(Boolean)
                      .join(', ') || 'Tests'}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-ink-muted capitalize">Priority {o.priority}</span>
                    <Pill variant={orderStatusVariant[o.status] ?? PillVariantEnum.DEFAULT}>
                      {o.status.replaceAll('_', ' ')}
                    </Pill>
                  </div>
                </div>
                <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-ink-muted">
                  {o.items.map((i) => (
                    <span key={i.id}>
                      {i.test?.code}: <span className="capitalize">{i.status.replaceAll('_', ' ')}</span>
                    </span>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {!readOnly && (
        <section className="flex flex-col gap-3 rounded-lg border border-line bg-surface-raised p-5">
          <div className="flex items-center gap-2">
            <FaPlus className="text-brand" />
            <h3 className="text-sm font-semibold text-ink">Order new tests</h3>
            <span className="ml-auto text-xs text-ink-muted">Sent to the laboratory queue on order.</span>
          </div>

          <Input
            placeholder="Search code / name / category"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <div className="max-h-64 overflow-auto rounded-md border border-line p-3">
            {tests.length === 0 ? (
              <p className="text-xs text-ink-muted">
                No lab tests configured yet. Ask the lab admin to add tests under{' '}
                <Link href="/lab" className="text-brand hover:underline">
                  Lab › Tests catalog
                </Link>
                .
              </p>
            ) : filteredTests.length === 0 ? (
              <p className="text-xs text-ink-muted">No tests match your search.</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {filteredTests.map((t) => {
                  const active = selectedIds.includes(t.id);
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => toggle(t.id)}
                      className={`rounded-full px-2.5 py-1 text-xs ring-1 transition ${
                        active
                          ? 'bg-brand text-white ring-brand'
                          : 'bg-surface text-ink-muted ring-line hover:bg-surface-raised'
                      }`}
                    >
                      {t.code} — {t.name}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Dropdown
              label="Priority"
              options={priorityOptions}
              value={priorityOptions.find((o) => o.value === priority) ?? null}
              onChange={(o) => setPriority((o as IOption).value as LabPriorityEnum)}
            />
            <Input label="Clinical notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
          <div className="flex justify-end">
            <Button type="button" variant={ButtonVariantEnum.PRIMARY} loading={busy} onClick={submit}>
              <FaPlus className="text-xs" />
              Order{' '}
              {selectedIds.length > 0 ? `${selectedIds.length} test${selectedIds.length === 1 ? '' : 's'}` : 'tests'}
            </Button>
          </div>
        </section>
      )}
    </div>
  );
}

function PrescriptionsPanel({
  consultation,
  readOnly,
}: {
  consultation: NonNullable<ReturnType<typeof useConsultation>['consultation']>;
  readOnly: boolean;
}) {
  const { items: inventoryItems } = useInventoryItems({ limit: 100, isActive: true });
  const [rows, setRows] = useState<
    Array<{ itemId: string; dosage: string; frequency: string; duration: string; quantity: string }>
  >([]);
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState(false);

  const itemOptions: IOption[] = inventoryItems.map((i) => ({
    label: `${i.sku} — ${i.name}`,
    value: i.id,
  }));

  const addRow = () => setRows((s) => [...s, { itemId: '', dosage: '', frequency: '', duration: '', quantity: '1' }]);

  const removeRow = (idx: number) => setRows((s) => s.filter((_, i) => i !== idx));

  const setRow = (idx: number, key: string, value: string) =>
    setRows((s) => s.map((r, i) => (i === idx ? { ...r, [key]: value } : r)));

  const submit = async () => {
    const filled = rows.filter((r) => r.itemId && r.dosage && r.frequency && r.quantity);
    if (filled.length === 0) {
      toast.error('Add at least one prescription item');
      return;
    }
    setBusy(true);
    try {
      await toast.promise(
        pharmacyService.create({
          patientId: consultation.patientId,
          consultationId: consultation.id,
          notes: notes.trim() || undefined,
          items: filled.map((r) => ({
            itemId: r.itemId,
            dosage: r.dosage,
            frequency: r.frequency,
            duration: r.duration || undefined,
            quantity: Number(r.quantity),
          })),
        }),
        {
          loading: 'Sending to pharmacy…',
          success: 'Prescription sent to pharmacy',
          error: (err) => extractErrorMessage(err, "Couldn't send — retry"),
        },
      );
      setRows([]);
      setNotes('');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="flex flex-col gap-3 rounded-lg border border-line bg-surface-raised p-5">
      <div className="flex items-center gap-2">
        <FaPills className="text-brand" />
        <h3 className="text-sm font-semibold text-ink">Prescriptions</h3>
        <span className="ml-auto text-xs text-ink-muted">Sent directly to the pharmacy queue on save.</span>
      </div>

      <div className="rounded-md border border-line p-3">
        {inventoryItems.length === 0 ? (
          <p className="text-xs text-ink-muted">
            No pharmacy items configured yet. Ask the pharmacy admin to add stock under{' '}
            <Link href="/inventory" className="text-brand hover:underline">
              Inventory
            </Link>
            .
          </p>
        ) : rows.length === 0 ? (
          <p className="text-xs text-ink-muted">No items yet. Click "Add item" to prescribe.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {rows.map((row, idx) => (
              <div key={idx} className="grid grid-cols-12 items-end gap-2">
                <div className="col-span-4">
                  <Dropdown
                    label="Item"
                    options={itemOptions}
                    value={itemOptions.find((o) => o.value === row.itemId) ?? null}
                    onChange={(o) => setRow(idx, 'itemId', (o as IOption).value as string)}
                  />
                </div>
                <div className="col-span-2">
                  <Input
                    label="Dosage"
                    value={row.dosage}
                    onChange={(e) => setRow(idx, 'dosage', e.target.value)}
                    placeholder="500mg"
                  />
                </div>
                <div className="col-span-2">
                  <Input
                    label="Frequency"
                    value={row.frequency}
                    onChange={(e) => setRow(idx, 'frequency', e.target.value)}
                    placeholder="TDS"
                  />
                </div>
                <div className="col-span-2">
                  <Input
                    label="Duration"
                    value={row.duration}
                    onChange={(e) => setRow(idx, 'duration', e.target.value)}
                    placeholder="5 days"
                  />
                </div>
                <div className="col-span-1">
                  <Input
                    label="Qty"
                    type="number"
                    value={row.quantity}
                    onChange={(e) => setRow(idx, 'quantity', e.target.value)}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeRow(idx)}
                  className="col-span-1 mb-1 text-critical hover:opacity-80"
                  aria-label="Remove"
                >
                  <FaTrash className="text-sm" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
          <div className="min-w-[240px] flex-1">
            <Input label="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} disabled={readOnly} />
          </div>
          <div className="flex gap-2">
            <Button type="button" variant={ButtonVariantEnum.SECONDARY} onClick={addRow} disabled={readOnly}>
              <FaPlus className="text-xs" />
              Add item
            </Button>
            <Button
              type="button"
              variant={ButtonVariantEnum.PRIMARY}
              loading={busy}
              onClick={submit}
              disabled={rows.length === 0 || readOnly}
            >
              Prescribe
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
