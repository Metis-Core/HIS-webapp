'use client';

import { useState } from 'react';
import { FaBalanceScale, FaClock, FaMoneyBillWave, FaUserInjured } from 'react-icons/fa';
import { Input, PageHeader, Stats } from '@/components';
import { formatUGX, todayInput } from '@/components/billing/billing-format';
import Segmented from '@/components/inputs/segmented';
import { formatWait } from '@/components/management/management-format';
import OverviewSections from '@/components/management/overview-sections';
import { StatVariantEnum } from '@/enum';
import { useAnalyticsOverview } from '@/hooks';

type Preset = 'today' | 'week' | 'month' | 'custom';

const PRESETS: Array<{ value: Preset; label: string }> = [
  { value: 'today', label: 'Today' },
  { value: 'week', label: '7 days' },
  { value: 'month', label: '30 days' },
  { value: 'custom', label: 'Custom' },
];

const daysAgo = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

export default function ManagementPage() {
  const [preset, setPreset] = useState<Preset>('week');
  const [from, setFrom] = useState(daysAgo(6));
  const [to, setTo] = useState(todayInput());
  const range =
    preset === 'today'
      ? { from: todayInput(), to: todayInput() }
      : preset === 'week'
        ? { from: daysAgo(6), to: todayInput() }
        : preset === 'month'
          ? { from: daysAgo(29), to: todayInput() }
          : { from, to };
  const { overview, error } = useAnalyticsOverview(range);

  const waitingTotal = overview?.waits.length
    ? Math.round(
        overview.waits.reduce((sum, row) => sum + row.averageWaitSeconds * row.served, 0) /
          overview.waits.reduce((sum, row) => sum + row.served, 0),
      )
    : 0;

  return (
    <div className="flex flex-col gap-5">
      <PageHeader description="How the clinic is running: patients, waiting times, money and the doctors' workload." />
      <div className="flex flex-wrap items-end gap-3">
        <div className="w-80">
          <Segmented options={PRESETS} value={preset} onChange={setPreset} />
        </div>
        {preset === 'custom' && (
          <>
            <div className="w-40">
              <Input type="date" label="From" max={to} value={from} onChange={(e) => setFrom(e.target.value)} />
            </div>
            <div className="w-40">
              <Input
                type="date"
                label="To"
                min={from}
                max={todayInput()}
                value={to}
                onChange={(e) => setTo(e.target.value)}
              />
            </div>
          </>
        )}
      </div>

      {error && (
        <p role="alert" className="rounded-lg bg-critical-soft px-3 py-2 text-sm text-critical">
          Couldn&apos;t load the figures — check the dates and retry.
        </p>
      )}

      {overview && (
        <>
          <Stats
            items={[
              {
                label: 'Visits',
                value: overview.visits.total,
                icon: FaUserInjured,
                variant: StatVariantEnum.Blue,
                hint: `${overview.patients.registered} newly registered`,
              },
              {
                label: 'Money received',
                value: formatUGX(overview.revenue.total),
                icon: FaMoneyBillWave,
                variant: StatVariantEnum.Green,
              },
              {
                label: 'Still owed',
                value: formatUGX(overview.revenue.outstanding),
                icon: FaBalanceScale,
                variant: StatVariantEnum.Amber,
                hint: `${overview.revenue.openInvoices} open invoices`,
              },
              {
                label: 'Average wait',
                value: waitingTotal ? formatWait(waitingTotal) : '—',
                icon: FaClock,
                variant: StatVariantEnum.Amber,
              },
            ]}
          />
          <OverviewSections overview={overview} />
        </>
      )}
    </div>
  );
}
