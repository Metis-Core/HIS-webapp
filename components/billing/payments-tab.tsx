'use client';

import { useState } from 'react';
import { FaMoneyBillWave } from 'react-icons/fa';
import { EmptyState, Input, Pagination } from '@/components';
import Segmented from '@/components/inputs/segmented';
import { PaymentMethodEnum } from '@/enum';
import { useUrlPage, usePayments } from '@/hooks';
import { formatDateTime, formatUGX, METHOD_LABEL, todayInput } from './billing-format';
import { PaymentStatusPill } from './billing-pills';
import InvoiceDrawer from './invoice.drawer';

type MethodFilter = 'all' | PaymentMethodEnum;

const METHODS: Array<{ value: MethodFilter; label: string }> = [
  { value: 'all', label: 'All' },
  ...Object.values(PaymentMethodEnum).map((value) => ({ value, label: METHOD_LABEL[value] })),
];
const TH = 'px-4 py-2.5 text-xs font-medium uppercase tracking-wide';

export default function PaymentsTab({ canVoid }: { canVoid: boolean }) {
  const [page, setPage] = useUrlPage('paymentPage');
  const [method, setMethod] = useState<MethodFilter>('all');
  const [from, setFrom] = useState(todayInput());
  const [to, setTo] = useState(todayInput());
  const [invoiceId, setInvoiceId] = useState<string | null>(null);
  const { payments, pagination } = usePayments({
    page,
    method: method === 'all' ? undefined : method,
    from: from || undefined,
    to: to || undefined,
  });

  const reset = () => page !== 1 && setPage(1);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="w-40">
          <Input
            type="date"
            label="From"
            value={from}
            max={to || undefined}
            onChange={(e) => {
              setFrom(e.target.value);
              reset();
            }}
          />
        </div>
        <div className="w-40">
          <Input
            type="date"
            label="To"
            value={to}
            min={from || undefined}
            onChange={(e) => {
              setTo(e.target.value);
              reset();
            }}
          />
        </div>
        <div className="max-w-xl flex-1">
          <Segmented
            options={METHODS}
            value={method}
            onChange={(next) => {
              setMethod(next);
              reset();
            }}
          />
        </div>
      </div>

      {payments.length === 0 ? (
        <EmptyState message="No payments in this period" icon={FaMoneyBillWave} />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-line bg-surface-raised">
          <table className="w-full text-left">
            <thead className="border-b border-line bg-surface text-ink-muted">
              <tr>
                <th className={TH}>Receipt</th>
                <th className={TH}>Patient</th>
                <th className={TH}>Method</th>
                <th className={TH}>Received</th>
                <th className={`${TH} text-right`}>Amount</th>
                <th className={TH}>Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {payments.map((payment) => (
                <tr
                  key={payment.id}
                  onClick={() => setInvoiceId(payment.invoiceId)}
                  className="cursor-pointer hover:bg-brand-soft/40"
                >
                  <td className="px-4 py-3 text-sm font-medium text-ink">
                    <button type="button" onClick={() => setInvoiceId(payment.invoiceId)} className="text-left">
                      {payment.receiptNumber}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-sm text-ink">
                    {payment.invoice?.patient
                      ? `${payment.invoice.patient.firstName} ${payment.invoice.patient.lastName}`
                      : '—'}
                  </td>
                  <td className="px-4 py-3 text-sm text-ink-muted">
                    {METHOD_LABEL[payment.method]}
                    {payment.reference && <span className="block text-xs">{payment.reference}</span>}
                  </td>
                  <td className="px-4 py-3 text-xs text-ink-muted">
                    {formatDateTime(payment.receivedAt)}
                    <span className="block">{payment.receivedBy?.username}</span>
                  </td>
                  <td className="px-4 py-3 text-right text-sm tabular-nums text-ink">{formatUGX(payment.amount)}</td>
                  <td className="px-4 py-3">
                    <PaymentStatusPill status={payment.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination {...pagination} onPageChange={setPage} label="Payment pages" />
        </div>
      )}

      <InvoiceDrawer invoiceId={invoiceId} onClose={() => setInvoiceId(null)} canVoid={canVoid} />
    </div>
  );
}
