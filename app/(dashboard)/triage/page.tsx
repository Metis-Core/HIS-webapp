'use client';

import { useMemo, useState } from 'react';
import { FaPlus, FaStethoscope, FaTrash } from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { Button, EmptyState, PageHeader, Pill, Stats, Tabs } from '@/components';
import TriageDrawer from '@/components/drawers/triage.drawer';
import {
  ButtonVariantEnum,
  DepartmentEnum,
  ModalDrawerModeEnum,
  PillVariantEnum,
  QueueEntryStatusEnum,
  StatVariantEnum,
  TriageAcuityEnum,
  TriageStatusEnum,
} from '@/enum';
import { useDepartmentQueue, usePatients, useTriage } from '@/hooks';
import { extractErrorMessage } from '@/helpers/errors';
import type { ICreateTriageDto, IQueueEntryRecord, ITriage, IUpdateTriageDto } from '@/interfaces';

type TabId = 'waiting' | 'all';

const acuityVariant: Record<TriageAcuityEnum, PillVariantEnum> = {
  [TriageAcuityEnum.LEVEL_1]: PillVariantEnum.DANGER,
  [TriageAcuityEnum.LEVEL_2]: PillVariantEnum.DANGER,
  [TriageAcuityEnum.LEVEL_3]: PillVariantEnum.WARNING,
  [TriageAcuityEnum.LEVEL_4]: PillVariantEnum.INFO,
  [TriageAcuityEnum.LEVEL_5]: PillVariantEnum.SUCCESS,
};

const statusVariant: Record<TriageStatusEnum, PillVariantEnum> = {
  [TriageStatusEnum.WAITING]: PillVariantEnum.WARNING,
  [TriageStatusEnum.IN_PROGRESS]: PillVariantEnum.INFO,
  [TriageStatusEnum.COMPLETED]: PillVariantEnum.SUCCESS,
  [TriageStatusEnum.REFERRED]: PillVariantEnum.INFO,
  [TriageStatusEnum.LEFT_WITHOUT_BEING_SEEN]: PillVariantEnum.DANGER,
  [TriageStatusEnum.CANCELLED]: PillVariantEnum.DEFAULT,
};

const queueStatusVariant: Record<QueueEntryStatusEnum, PillVariantEnum> = {
  [QueueEntryStatusEnum.WAITING]: PillVariantEnum.WARNING,
  [QueueEntryStatusEnum.CALLED]: PillVariantEnum.INFO,
  [QueueEntryStatusEnum.IN_SERVICE]: PillVariantEnum.INFO,
  [QueueEntryStatusEnum.COMPLETED]: PillVariantEnum.SUCCESS,
  [QueueEntryStatusEnum.SKIPPED]: PillVariantEnum.DEFAULT,
  [QueueEntryStatusEnum.TRANSFERRED]: PillVariantEnum.DEFAULT,
};

export default function TriagePage() {
  const [tab, setTab] = useState<TabId>('waiting');
  const [drawerMode, setDrawerMode] = useState<ModalDrawerModeEnum | null>(null);
  const [selected, setSelected] = useState<ITriage | null>(null);
  const [prefillFromQueue, setPrefillFromQueue] = useState<IQueueEntryRecord | null>(null);

  const { patients } = usePatients({ limit: 100 });
  const { entries, call, start, remove } = useDepartmentQueue(DepartmentEnum.TRIAGE);
  const { triages, createTriage, updateTriage } = useTriage({ limit: 50 });

  const stats = useMemo(
    () => [
      {
        label: 'Waiting in queue',
        value: entries.filter((e) => e.status === QueueEntryStatusEnum.WAITING).length,
        icon: FaStethoscope,
        variant: StatVariantEnum.Amber,
      },
      {
        label: 'In service',
        value: entries.filter((e) => e.status === QueueEntryStatusEnum.IN_SERVICE).length,
        icon: FaStethoscope,
        variant: StatVariantEnum.Blue,
      },
      {
        label: 'Critical (L1-L2)',
        value: triages.filter((t) => [TriageAcuityEnum.LEVEL_1, TriageAcuityEnum.LEVEL_2].includes(t.acuity)).length,
        icon: FaStethoscope,
        variant: StatVariantEnum.Amber,
      },
      {
        label: 'Referred today',
        value: triages.filter((t) => t.status === TriageStatusEnum.REFERRED).length,
        icon: FaStethoscope,
        variant: StatVariantEnum.Emerald,
      },
    ],
    [entries, triages],
  );

  const openAdd = () => {
    setSelected(null);
    setPrefillFromQueue(null);
    setDrawerMode(ModalDrawerModeEnum.ADD);
  };
  const openEdit = (t: ITriage) => {
    setSelected(t);
    setPrefillFromQueue(null);
    setDrawerMode(ModalDrawerModeEnum.EDIT);
  };
  const closeDrawer = () => {
    setDrawerMode(null);
    setSelected(null);
    setPrefillFromQueue(null);
  };

  const startFromQueue = async (entry: IQueueEntryRecord) => {
    if (entry.status === QueueEntryStatusEnum.WAITING) {
      await toast.promise(call(entry.id), {
        loading: 'Calling patient…',
        success: 'Patient called',
        error: "Couldn't call — retry",
      });
    }
    if (entry.status !== QueueEntryStatusEnum.IN_SERVICE) {
      await start(entry.id);
    }
    setSelected(null);
    setPrefillFromQueue(entry);
    setDrawerMode(ModalDrawerModeEnum.ADD);
  };

  const removeEntry = async (entry: IQueueEntryRecord) => {
    if (!confirm('Remove this patient from the triage queue?')) return;
    await toast.promise(remove(entry.id), {
      loading: 'Removing…',
      success: 'Removed from queue',
      error: "Couldn't remove — retry",
    });
  };

  const save = async (payload: ICreateTriageDto | IUpdateTriageDto, id?: string) => {
    if (id) {
      await toast.promise(updateTriage(id, payload), {
        loading: 'Saving triage…',
        success: 'Triage updated',
        error: (err) => extractErrorMessage(err, "Couldn't save — retry"),
      });
    } else {
      await toast.promise(createTriage(payload as ICreateTriageDto), {
        loading: 'Recording triage…',
        success: 'Triage recorded — queue advanced',
        error: (err) => extractErrorMessage(err, "Couldn't record — retry"),
      });
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Triage"
        description="Assess vitals, set acuity, and route patients to the next stage."
        action={
          <Button type="button" variant={ButtonVariantEnum.PRIMARY} onClick={openAdd}>
            <FaPlus className="text-xs" />
            New triage
          </Button>
        }
      />

      <Stats items={stats} />

      <Tabs<TabId>
        tabs={[
          { id: 'waiting', label: `Waiting queue (${entries.length})` },
          { id: 'all', label: `Triage records (${triages.length})` },
        ]}
        active={tab}
        onChange={setTab}
      />

      {tab === 'waiting' ? (
        entries.length === 0 ? (
          <EmptyState
            message="Nobody waiting for triage. Reception can add walk-ins from the dashboard."
            icon={FaStethoscope}
          />
        ) : (
          <div className="overflow-hidden rounded-lg border border-line bg-surface-raised">
            <table className="w-full text-left">
              <thead className="border-b border-line bg-surface text-ink-muted">
                <tr>
                  <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-wide">#</th>
                  <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-wide">Patient</th>
                  <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-wide">Status</th>
                  <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-wide">Waiting</th>
                  <th className="px-4 py-2.5 text-right text-xs font-medium uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => (
                  <tr key={entry.id} className="border-b border-line last:border-0">
                    <td className="px-4 py-3 text-xs tabular-nums text-ink-muted">{entry.sequenceNumber}</td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-ink">
                        {entry.visit?.patient
                          ? `${entry.visit.patient.firstName} ${entry.visit.patient.lastName}`
                          : entry.visitId}
                      </div>
                      <div className="text-xs text-ink-muted">{entry.visit?.patient?.mrn}</div>
                    </td>
                    <td className="px-4 py-3">
                      <Pill variant={queueStatusVariant[entry.status] ?? PillVariantEnum.DEFAULT}>
                        {entry.status.replaceAll('_', ' ')}
                      </Pill>
                    </td>
                    <td className="px-4 py-3 text-xs text-ink-muted tabular-nums">
                      {formatDistanceToNow(new Date(entry.createdAt), { addSuffix: true })}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-3">
                        <button
                          type="button"
                          onClick={() => startFromQueue(entry)}
                          className="text-xs font-medium text-brand hover:text-brand-hover"
                        >
                          Start triage
                        </button>
                        <button
                          type="button"
                          onClick={() => removeEntry(entry)}
                          aria-label="Remove from queue"
                          className="text-xs font-medium text-critical hover:opacity-80"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : triages.length === 0 ? (
        <EmptyState
          message="No triage records yet"
          icon={FaStethoscope}
          actionLabel="Record triage"
          onAction={openAdd}
        />
      ) : (
        <div className="overflow-hidden rounded-lg border border-line bg-surface-raised">
          <table className="w-full text-left">
            <thead className="border-b border-line bg-surface text-ink-muted">
              <tr>
                <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-wide">Patient</th>
                <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-wide">Chief complaint</th>
                <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-wide">Acuity</th>
                <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-wide">Vitals</th>
                <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-wide">Status</th>
                <th className="px-4 py-2.5 text-right text-xs font-medium uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody>
              {triages.map((t) => (
                <tr key={t.id} className="border-b border-line last:border-0">
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium text-ink">
                      {t.patient ? `${t.patient.firstName} ${t.patient.lastName}` : '—'}
                    </div>
                    <div className="text-xs text-ink-muted">{t.patient?.mrn}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-ink">{t.chiefComplaint}</td>
                  <td className="px-4 py-3">
                    <Pill variant={acuityVariant[t.acuity] ?? PillVariantEnum.DEFAULT}>
                      {t.acuity.replace('_', ' ')}
                    </Pill>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-ink-muted">
                    {t.temperatureC ? `${t.temperatureC}°C · ` : ''}
                    {t.heartRate ? `HR ${t.heartRate} · ` : ''}
                    {t.bloodPressureSystolic && t.bloodPressureDiastolic
                      ? `${t.bloodPressureSystolic}/${t.bloodPressureDiastolic} · `
                      : ''}
                    {t.oxygenSaturation ? `SpO₂ ${t.oxygenSaturation}%` : ''}
                  </td>
                  <td className="px-4 py-3">
                    <Pill variant={statusVariant[t.status] ?? PillVariantEnum.DEFAULT}>
                      {t.status.replaceAll('_', ' ')}
                    </Pill>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => openEdit(t)}
                      className="text-xs font-medium text-brand hover:text-brand-hover"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <TriageDrawer
        mode={drawerMode}
        triage={selected}
        patients={patients}
        prefillPatient={prefillFromQueue?.visit?.patient ?? null}
        prefillPatientId={prefillFromQueue?.visit?.patientId ?? prefillFromQueue?.visit?.patient?.id}
        prefillVisitId={prefillFromQueue?.visitId}
        onClose={closeDrawer}
        onSave={save}
      />
    </div>
  );
}
