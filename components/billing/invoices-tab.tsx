'use client';

import { useState } from 'react';
import { FaFileInvoiceDollar } from 'react-icons/fa';
import { EmptyState, Input, Pagination } from '@/components';
import Segmented from '@/components/inputs/segmented';
import { InvoiceStatusEnum } from '@/enum';
import { useInvoices, usePagedSearch } from '@/hooks';
import { formatDateTime, formatUGX } from './billing-format';
import { InvoiceStatusPill } from './billing-pills';
import InvoiceDrawer from './invoice.drawer';

type StatusFilter = 'open' | 'all' | InvoiceStatusEnum.PAID;

const OPEN_STATUSES = [InvoiceStatusEnum.UNPAID, InvoiceStatusEnum.PARTIALLY_PAID];
const FILTERS: Array<{ value: StatusFilter; label: string }> = [
  { value: 'open', label: 'Open' },
  { value: InvoiceStatusEnum.PAID, label: 'Paid' },
  { value: 'all', label: 'All' },
];
const TH = 'px-4 py-2.5 text-xs font-medium uppercase tracking-wide';

const statusesFor = (filter: StatusFilter) =>
  filter === 'open' ? OPEN_STATUSES : filter === 'all' ? undefined : [InvoiceStatusEnum.PAID];

export default function InvoicesTab({ canVoid }: { canVoid: boolean }) {
  const { page, setPage, search, setSearch, debouncedSearch } = usePagedSearch('invoicePage');
  const [filter, setFilter] = useState<StatusFilter>('open');
  const [selected, setSelected] = useState<string | null>(null);
  const { invoices, pagination } = useInvoices({ page, search: debouncedSearch, status: statusesFor(filter) });

  const changeFilter = (next: StatusFilter) => {
    setFilter(next);
    if (page !== 1) setPage(1);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end gap-3">
        <Input
          className="w-72"
          placeholder="Search invoice no., patient name or MRN"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="w-64">
          <Segmented options={FILTERS} value={filter} onChange={changeFilter} />
        </div>
      </div>

      {invoices.length === 0 ? (
        <EmptyState message="No invoices match" icon={FaFileInvoiceDollar} />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-line bg-surface-raised">
          <table className="w-full text-left">
            <thead className="border-b border-line bg-surface text-ink-muted">
              <tr>
                <th className={TH}>Invoice</th>
                <th className={TH}>Patient</th>
                <th className={TH}>Issued</th>
                <th className={`${TH} text-right`}>Total</th>
                <th className={`${TH} text-right`}>Balance</th>
                <th className={TH}>Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {invoices.map((invoice) => (
                <tr
                  key={invoice.id}
                  onClick={() => setSelected(invoice.id)}
                  className="cursor-pointer hover:bg-brand-soft/40"
                >
                  <td className="px-4 py-3 text-sm font-medium text-ink">
                    <button type="button" onClick={() => setSelected(invoice.id)} className="text-left">
                      {invoice.number}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-sm text-ink">
                    {invoice.patient ? `${invoice.patient.firstName} ${invoice.patient.lastName}` : '—'}
                    <span className="block text-xs text-ink-muted">{invoice.patient?.mrn}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-ink-muted">
                    {formatDateTime(invoice.createdAt as unknown as string)}
                  </td>
                  <td className="px-4 py-3 text-right text-sm tabular-nums text-ink">{formatUGX(invoice.total)}</td>
                  <td className="px-4 py-3 text-right text-sm tabular-nums text-ink">
                    {formatUGX(Math.max(invoice.total - invoice.paid, 0))}
                  </td>
                  <td className="px-4 py-3">
                    <InvoiceStatusPill status={invoice.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination {...pagination} onPageChange={setPage} label="Invoice pages" />
        </div>
      )}

      <InvoiceDrawer invoiceId={selected} onClose={() => setSelected(null)} canVoid={canVoid} />
    </div>
  );
}
