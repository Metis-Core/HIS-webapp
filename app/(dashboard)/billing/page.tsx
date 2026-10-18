'use client';

import { useState } from 'react';
import { FaCalendarCheck, FaFileInvoiceDollar, FaMoneyBillWave } from 'react-icons/fa';
import { PageHeader, Stats, Tabs } from '@/components';
import DayCloseTab from '@/components/billing/day-close-tab';
import { formatUGX } from '@/components/billing/billing-format';
import InvoicesTab from '@/components/billing/invoices-tab';
import PaymentsTab from '@/components/billing/payments-tab';
import { InvoiceStatusEnum, StatVariantEnum } from '@/enum';
import { ledgerService } from '@/helpers/ledger.service';
import { roleInGroup } from '@/helpers/role-groups';
import { useDaySummary, useListTotal } from '@/hooks';
import { useAuth } from '@/providers';

type TabId = 'invoices' | 'payments' | 'closeout';

export default function BillingPage() {
  const { effectiveRole } = useAuth();
  const isFinance = roleInGroup(effectiveRole, 'FINANCE_MANAGERS');
  const isAdmin = roleInGroup(effectiveRole, 'ADMINS');
  const [tab, setTab] = useState<TabId>('invoices');
  const { summary } = useDaySummary();
  const unpaid = useListTotal(ledgerService.invoicesUrl({ status: [InvoiceStatusEnum.UNPAID], limit: 1 }));
  const partial = useListTotal(ledgerService.invoicesUrl({ status: [InvoiceStatusEnum.PARTIALLY_PAID], limit: 1 }));
  const received = summary ? Object.values(summary.totals).reduce((sum, value) => sum + value, 0) : 0;

  const tabs = [
    { id: 'invoices' as const, label: 'Invoices', icon: FaFileInvoiceDollar },
    { id: 'payments' as const, label: 'Payments ledger', icon: FaMoneyBillWave },
    ...(isFinance ? [{ id: 'closeout' as const, label: 'Day close-out', icon: FaCalendarCheck }] : []),
  ];

  return (
    <div className="flex flex-col gap-5">
      <PageHeader description="Itemised invoices, payments received and the daily close-out." />
      <Stats
        items={[
          {
            label: 'Received today',
            value: formatUGX(received),
            icon: FaMoneyBillWave,
            variant: StatVariantEnum.Green,
          },
          {
            label: 'Payments today',
            value: summary?.paymentCount ?? 0,
            icon: FaMoneyBillWave,
            variant: StatVariantEnum.Blue,
          },
          { label: 'Unpaid invoices', value: unpaid, icon: FaFileInvoiceDollar, variant: StatVariantEnum.Amber },
          { label: 'Part paid', value: partial, icon: FaFileInvoiceDollar, variant: StatVariantEnum.Amber },
        ]}
      />
      <Tabs<TabId> tabs={tabs} active={tab} onChange={setTab} />
      {tab === 'invoices' && <InvoicesTab canVoid={isFinance} />}
      {tab === 'payments' && <PaymentsTab canVoid={isFinance} />}
      {tab === 'closeout' && isFinance && <DayCloseTab canReopen={isAdmin} />}
    </div>
  );
}
