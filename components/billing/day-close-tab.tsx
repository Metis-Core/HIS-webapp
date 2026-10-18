'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Button, Input, Pagination, Pill } from '@/components';
import { ButtonVariantEnum, PaymentMethodEnum, PillVariantEnum } from '@/enum';
import { extractErrorMessage } from '@/helpers/errors';
import { ledgerService } from '@/helpers/ledger.service';
import { useDayClosings, useDaySummary, useLedgerRefresh } from '@/hooks';
import { formatDay, formatUGX, METHOD_LABEL, todayInput } from './billing-format';

const TH = 'px-4 py-2.5 text-xs font-medium uppercase tracking-wide';

export default function DayCloseTab({ canReopen }: { canReopen: boolean }) {
  const [date, setDate] = useState(todayInput());
  const [counted, setCounted] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [historyPage, setHistoryPage] = useState(1);
  const { summary } = useDaySummary(date);
  const { closings, pagination } = useDayClosings(historyPage);
  const refresh = useLedgerRefresh();

  const countedValue = counted === '' ? undefined : Number(counted);
  const variance = countedValue === undefined || !summary ? null : countedValue - summary.expectedCash;
  const received = summary ? Object.values(summary.totals).reduce((sum, value) => sum + value, 0) : 0;

  const close = async (event: React.FormEvent) => {
    event.preventDefault();
    if (countedValue !== undefined && (!Number.isInteger(countedValue) || countedValue < 0)) {
      return setError('Counted cash must be a whole number of shillings');
    }
    if (!confirm(`Close out ${formatDay(date)}? Payments for the day can no longer be voided.`)) return;
    setBusy(true);
    setError(null);
    try {
      await ledgerService.closeDay({ date, countedCash: countedValue, notes: notes.trim() || undefined });
      await refresh();
      toast.success(`${formatDay(date)} closed out`);
      setCounted('');
      setNotes('');
    } catch (err) {
      setError(extractErrorMessage(err, "Couldn't close the day — retry"));
    } finally {
      setBusy(false);
    }
  };

  const reopen = async (businessDate: string) => {
    if (!confirm(`Reopen ${formatDay(businessDate)}? Its payments become editable again.`)) return;
    try {
      await ledgerService.reopenDay(businessDate);
      await refresh();
      toast.success(`${formatDay(businessDate)} reopened`);
    } catch (err) {
      toast.error(extractErrorMessage(err, "Couldn't reopen the day — retry"));
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <section className="flex flex-col gap-4 rounded-lg border border-line bg-surface-raised p-5 lg:col-span-3">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="w-44">
            <Input
              type="date"
              label="Business day"
              max={todayInput()}
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          {summary?.closed ? (
            <Pill variant={PillVariantEnum.SUCCESS}>Closed out</Pill>
          ) : (
            <Pill variant={PillVariantEnum.WARNING}>Open</Pill>
          )}
        </div>

        {summary && (
          <>
            <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {Object.values(PaymentMethodEnum).map((method) => (
                <div key={method} className="rounded-lg border border-line bg-surface p-3">
                  <dt className="text-xs text-ink-muted">{METHOD_LABEL[method]}</dt>
                  <dd className="text-base font-semibold tabular-nums text-ink">{formatUGX(summary.totals[method])}</dd>
                </div>
              ))}
            </dl>
            <p className="text-sm text-ink-muted">
              {summary.paymentCount} payments · {formatUGX(received)} received · {summary.voidedCount} voided
            </p>

            {summary.byCashier.length > 0 && (
              <table className="w-full text-left">
                <thead className="border-b border-line text-ink-muted">
                  <tr>
                    <th className={TH}>Received by</th>
                    <th className={`${TH} text-right`}>Payments</th>
                    <th className={`${TH} text-right`}>Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {summary.byCashier.map((cashier) => (
                    <tr key={cashier.userId}>
                      <td className="px-4 py-2 text-sm text-ink">{cashier.username}</td>
                      <td className="px-4 py-2 text-right text-sm tabular-nums text-ink-muted">{cashier.count}</td>
                      <td className="px-4 py-2 text-right text-sm tabular-nums text-ink">{formatUGX(cashier.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {!summary.closed && (
              <form onSubmit={close} className="flex flex-col gap-3 border-t border-line pt-4">
                <h3 className="text-base font-semibold text-ink">Close out the day</h3>
                <p className="text-sm text-ink-muted">
                  Cash expected in the drawer: <strong className="text-ink">{formatUGX(summary.expectedCash)}</strong>
                </p>
                <Input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  label="Cash counted (optional)"
                  value={counted}
                  onChange={(e) => setCounted(e.target.value)}
                />
                {variance !== null && (
                  <p className={`text-sm ${variance === 0 ? 'text-normal' : 'text-watch'}`}>
                    {variance === 0
                      ? 'The drawer matches.'
                      : `${variance > 0 ? 'Over' : 'Short'} by ${formatUGX(Math.abs(variance))}`}
                  </p>
                )}
                <Input
                  label="Notes (optional)"
                  maxLength={500}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
                {error && (
                  <p role="alert" className="rounded-lg bg-critical-soft px-3 py-2 text-sm text-critical">
                    {error}
                  </p>
                )}
                <Button type="submit" variant={ButtonVariantEnum.PRIMARY} loading={busy}>
                  Close out {formatDay(date)}
                </Button>
              </form>
            )}
          </>
        )}
      </section>

      <section className="flex flex-col gap-3 lg:col-span-2">
        <h3 className="text-base font-semibold text-ink">Closed days</h3>
        {closings.length === 0 ? (
          <p className="text-sm text-ink-muted">No day has been closed out yet.</p>
        ) : (
          <div className="overflow-hidden rounded-lg border border-line bg-surface-raised">
            <ul className="divide-y divide-line">
              {closings.map((closing) => (
                <li key={closing.id} className="flex items-start justify-between gap-3 px-4 py-3">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium text-ink">{formatDay(closing.businessDate)}</span>
                    <span className="text-xs text-ink-muted">
                      {closing.paymentCount} payments · cash {formatUGX(closing.expectedCash)}
                      {closing.variance !== null && closing.variance !== 0 && (
                        <span className="text-watch">
                          {' '}
                          · {closing.variance > 0 ? 'over' : 'short'} {formatUGX(Math.abs(closing.variance))}
                        </span>
                      )}
                    </span>
                    <span className="text-xs text-ink-muted">Closed by {closing.closedBy?.username}</span>
                  </div>
                  {canReopen && (
                    <button
                      type="button"
                      onClick={() => void reopen(closing.businessDate)}
                      className="shrink-0 text-xs font-medium text-critical hover:opacity-80"
                    >
                      Reopen
                    </button>
                  )}
                </li>
              ))}
            </ul>
            <Pagination {...pagination} onPageChange={setHistoryPage} label="Closed day pages" />
          </div>
        )}
      </section>
    </div>
  );
}
