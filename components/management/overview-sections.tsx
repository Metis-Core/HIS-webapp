'use client';

import type { ReactNode } from 'react';
import AvailabilityPill from '@/components/availability/availability-pill';
import { formatUGX } from '@/components/billing/billing-format';
import type { IAnalyticsOverview, ICountRow } from '@/interfaces';
import { formatWait, titleCase } from './management-format';

const TH = 'px-4 py-2.5 text-xs font-medium uppercase tracking-wide';

function Section({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3 rounded-lg border border-line bg-surface-raised p-5">
      <header>
        <h3 className="text-base font-semibold text-ink">{title}</h3>
        {hint && <p className="text-xs text-ink-muted">{hint}</p>}
      </header>
      {children}
    </section>
  );
}

function CountTable({ rows, empty, money = false }: { rows: ICountRow[]; empty: string; money?: boolean }) {
  if (rows.length === 0) return <p className="text-sm text-ink-muted">{empty}</p>;
  return (
    <ul className="divide-y divide-line">
      {rows.map((row) => (
        <li key={row.label} className="flex items-center justify-between gap-3 py-2 text-sm">
          <span className="text-ink">{titleCase(row.label)}</span>
          <span className="tabular-nums text-ink">{money ? formatUGX(row.count) : row.count}</span>
        </li>
      ))}
    </ul>
  );
}

export default function OverviewSections({ overview }: { overview: IAnalyticsOverview }) {
  const { revenue, visits, waits, clinical, queueNow, doctors } = overview;
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <Section title="Money received" hint="Recorded payments by method; voided payments are left out.">
        <CountTable rows={revenue.byMethod} empty="No payments in this period." money />
        <p className="border-t border-line pt-3 text-sm text-ink-muted">
          Still owed on {revenue.openInvoices} open invoices:{' '}
          <strong className="tabular-nums text-ink">{formatUGX(revenue.outstanding)}</strong>
        </p>
      </Section>

      <Section title="Received each day">
        <CountTable rows={revenue.byDay} empty="No payments in this period." money />
      </Section>

      <Section title="Patients seen" hint="Visits opened in the period.">
        <CountTable rows={visits.byType} empty="No visits in this period." />
        <CountTable rows={visits.byDay} empty="" />
      </Section>

      <Section title="Time spent waiting" hint="Average from being ready for a stage to being called, by department.">
        {waits.length === 0 ? (
          <p className="text-sm text-ink-muted">No finished stages in this period.</p>
        ) : (
          <table className="w-full text-left">
            <thead className="border-b border-line text-ink-muted">
              <tr>
                <th className={TH}>Department</th>
                <th className={`${TH} text-right`}>Served</th>
                <th className={`${TH} text-right`}>Average wait</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {waits.map((row) => (
                <tr key={row.department}>
                  <td className="px-4 py-2 text-sm text-ink">{titleCase(row.department)}</td>
                  <td className="px-4 py-2 text-right text-sm tabular-nums text-ink-muted">{row.served}</td>
                  <td className="px-4 py-2 text-right text-sm tabular-nums text-ink">
                    {formatWait(row.averageWaitSeconds)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Section>

      <Section title="Clinical activity">
        <CountTable
          rows={[
            { label: 'consultations', count: clinical.consultations },
            { label: 'lab orders', count: clinical.labOrders },
            { label: 'imaging orders', count: clinical.imaging },
            { label: 'procedure orders', count: clinical.procedures },
            { label: 'prescriptions', count: clinical.prescriptions },
          ]}
          empty=""
        />
        {clinical.topDiagnoses.length > 0 && (
          <div className="border-t border-line pt-3">
            <h4 className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink-muted">Most common diagnoses</h4>
            <CountTable rows={clinical.topDiagnoses} empty="" />
          </div>
        )}
      </Section>

      <Section title="In the queue right now">
        {queueNow.length === 0 ? (
          <p className="text-sm text-ink-muted">Nobody is waiting.</p>
        ) : (
          <ul className="divide-y divide-line">
            {queueNow.map((row) => (
              <li key={`${row.department}-${row.status}`} className="flex items-center justify-between py-2 text-sm">
                <span className="text-ink">
                  {titleCase(row.department)} <span className="text-ink-muted">· {titleCase(row.status)}</span>
                </span>
                <span className="tabular-nums text-ink">{row.count}</span>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title="Doctors" hint="Availability and patients waiting for each doctor right now.">
        {doctors.length === 0 ? (
          <p className="text-sm text-ink-muted">No active doctors.</p>
        ) : (
          <ul className="divide-y divide-line">
            {doctors.map((doctor) => (
              <li key={doctor.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                <span className="text-ink">Dr {doctor.username}</span>
                <span className="flex items-center gap-3">
                  <span className="tabular-nums text-ink-muted">{doctor.waiting} waiting</span>
                  <AvailabilityPill status={doctor.availability} />
                </span>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </div>
  );
}
