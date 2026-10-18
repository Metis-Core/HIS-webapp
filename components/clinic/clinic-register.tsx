'use client';

import { Fragment, useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { FaBaby } from 'react-icons/fa';
import { EmptyState, Input, Pagination, Pill } from '@/components';
import LabResultTable from '@/components/lab/lab-result-table';
import { PillVariantEnum } from '@/enum';
import type { ClinicRecordKindEnum } from '@/enum/clinic.enum';
import { useClinicRecords, useClinicTemplates, usePagedSearch } from '@/hooks';
import { KIND_LABEL, recordSummary } from './clinic-format';

const TH = 'px-4 py-2.5 text-xs font-medium uppercase tracking-wide';

/** Every record of one kind, newest first, filtered by patient and date; a row opens the full record. */
export default function ClinicRegister({ kind }: { kind: ClinicRecordKindEnum }) {
  const { page, setPage, search, setSearch, debouncedSearch } = usePagedSearch(`${kind}Page`);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [open, setOpen] = useState<string | null>(null);
  const templates = useClinicTemplates();
  const { records, pagination } = useClinicRecords({
    kind,
    page,
    search: debouncedSearch,
    from: from || undefined,
    to: to || undefined,
  });

  const changeDate = (set: (value: string) => void) => (value: string) => {
    set(value);
    if (page !== 1) setPage(1);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end gap-3">
        <Input
          className="w-72"
          placeholder="Search patient name / MRN"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="w-44">
          <Input label="From" type="date" value={from} onChange={(e) => changeDate(setFrom)(e.target.value)} />
        </div>
        <div className="w-44">
          <Input label="To" type="date" value={to} onChange={(e) => changeDate(setTo)(e.target.value)} />
        </div>
      </div>
      {records.length === 0 ? (
        <EmptyState message={`No ${KIND_LABEL[kind].toLowerCase()} records match`} icon={FaBaby} />
      ) : (
        <div className="overflow-hidden rounded-lg border border-line bg-surface-raised">
          <table className="w-full text-left">
            <thead className="border-b border-line bg-surface text-ink-muted">
              <tr>
                <th className={TH}>Date</th>
                <th className={TH}>Patient</th>
                <th className={TH}>Record</th>
                <th className={TH}>Flags</th>
                <th className={TH}>Recorded by</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record) => {
                const flagged = Object.keys(record.flags ?? {}).length;
                const patient = record.patient;
                return (
                  <Fragment key={record.id}>
                    <tr
                      onClick={() => setOpen(open === record.id ? null : record.id)}
                      className="cursor-pointer border-b border-line last:border-0 hover:bg-surface"
                    >
                      <td className="px-4 py-3 text-xs text-ink-muted">
                        {format(new Date(record.createdAt), 'd MMM yyyy, HH:mm')}
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-ink">
                          {patient ? `${patient.firstName} ${patient.lastName}` : '—'}
                        </div>
                        <div className="text-xs text-ink-muted">{patient?.mrn}</div>
                      </td>
                      <td className="px-4 py-3 text-sm text-ink">{recordSummary(record)}</td>
                      <td className="px-4 py-3">
                        {flagged > 0 ? <Pill variant={PillVariantEnum.WARNING}>{flagged} flagged</Pill> : '—'}
                      </td>
                      <td className="px-4 py-3 text-xs text-ink-muted">{record.recordedBy?.username ?? '—'}</td>
                    </tr>
                    {open === record.id && templates && patient && (
                      <tr className="border-b border-line bg-surface">
                        <td colSpan={5} className="px-4 py-3">
                          <LabResultTable
                            item={{
                              resultData: record.data,
                              resultFlags: record.flags,
                              test: { resultSchema: templates.templates[record.kind] },
                            }}
                            patient={patient}
                          />
                          {record.visitId && (
                            <Link
                              href={`/queue/${record.visitId}`}
                              className="mt-2 inline-block text-xs font-medium text-brand"
                            >
                              Open the visit
                            </Link>
                          )}
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
          <Pagination {...pagination} onPageChange={setPage} label={`${KIND_LABEL[kind]} pages`} />
        </div>
      )}
    </div>
  );
}
