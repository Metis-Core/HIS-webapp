'use client';

import { useState } from 'react';
import { FaBaby, FaPlus, FaSyringe } from 'react-icons/fa';
import { Button, Pill } from '@/components';
import LabResultTable from '@/components/lab/lab-result-table';
import { ButtonVariantEnum, PillVariantEnum } from '@/enum';
import { ClinicRecordKindEnum } from '@/enum/clinic.enum';
import { useClinicRecords, useClinicTemplates } from '@/hooks';
import type { IPatient } from '@/interfaces';
import ClinicRecordDrawer from './clinic-record.drawer';
import { KIND_LABEL, recordSummary } from './clinic-format';

const KINDS = Object.values(ClinicRecordKindEnum);

/** Antenatal, delivery, postnatal and immunization records for a visit, with a button to add each. */
export default function ClinicRecordsPanel({ patient, visitId }: { patient: IPatient; visitId: string }) {
  const { records } = useClinicRecords({ visitId, limit: 50 });
  const templates = useClinicTemplates();
  const [adding, setAdding] = useState<ClinicRecordKindEnum | null>(null);
  const [open, setOpen] = useState<string | null>(null);

  return (
    <section className="flex flex-col gap-3 rounded-lg border border-line bg-surface-raised p-5">
      <div className="flex items-center gap-2">
        <FaBaby className="text-brand" aria-hidden />
        <h2 className="text-sm font-semibold text-ink">Antenatal, birth and immunization</h2>
      </div>
      <div className="flex flex-wrap gap-2">
        {KINDS.map((kind) => (
          <Button key={kind} type="button" variant={ButtonVariantEnum.SECONDARY} onClick={() => setAdding(kind)}>
            <FaPlus className="text-[10px]" aria-hidden /> {KIND_LABEL[kind]}
          </Button>
        ))}
      </div>
      {records.length === 0 ? (
        <p className="text-xs text-ink-muted">Nothing recorded for this visit yet.</p>
      ) : (
        <ul className="divide-y divide-line rounded-md border border-line">
          {records.map((record) => {
            const flagged = Object.keys(record.flags ?? {}).length;
            return (
              <li key={record.id} className="flex flex-col gap-2 px-3 py-2.5">
                <button
                  type="button"
                  onClick={() => setOpen(open === record.id ? null : record.id)}
                  className="flex items-center justify-between gap-3 text-left"
                >
                  <span className="flex items-center gap-2 text-sm font-medium text-ink">
                    {record.kind === ClinicRecordKindEnum.IMMUNIZATION && (
                      <FaSyringe className="text-brand" aria-hidden />
                    )}
                    {KIND_LABEL[record.kind]}
                    <span className="text-xs font-normal text-ink-muted">{recordSummary(record)}</span>
                  </span>
                  {flagged > 0 && <Pill variant={PillVariantEnum.WARNING}>{flagged} flagged</Pill>}
                </button>
                {open === record.id && templates && (
                  <LabResultTable
                    item={{
                      resultData: record.data,
                      resultFlags: record.flags,
                      test: { resultSchema: templates.templates[record.kind] },
                    }}
                    patient={patient}
                  />
                )}
              </li>
            );
          })}
        </ul>
      )}
      <ClinicRecordDrawer kind={adding} patient={patient} visitId={visitId} onClose={() => setAdding(null)} />
    </section>
  );
}
