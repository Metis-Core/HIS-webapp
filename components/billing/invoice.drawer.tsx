'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { FaFilePdf } from 'react-icons/fa';
import { Button, Input, Modal } from '@/components';
import { ButtonVariantEnum, PaymentStatusEnum } from '@/enum';
import { extractErrorMessage } from '@/helpers/errors';
import { ledgerService } from '@/helpers/ledger.service';
import { useInvoice, useLedgerRefresh } from '@/hooks';
import { Drawer } from '@/components';
import type { IPayment } from '@/interfaces';
import { InvoiceStatusPill, PaymentStatusPill } from './billing-pills';
import { formatDateTime, formatUGX, METHOD_LABEL } from './billing-format';
import RecordPaymentForm from './record-payment.form';

interface InvoiceDrawerProps {
  invoiceId: string | null;
  onClose: () => void;
  canVoid: boolean;
}

function VoidModal({ payment, onClose }: { payment: IPayment | null; onClose: () => void }) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const refresh = useLedgerRefresh();

  const close = () => {
    setReason('');
    setError(null);
    onClose();
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!payment) return;
    if (reason.trim().length < 3) return setError('Give a short reason for voiding the payment');
    setBusy(true);
    setError(null);
    try {
      await ledgerService.voidPayment(payment.id, reason.trim());
      await refresh();
      toast.success('Payment voided');
      close();
    } catch (err) {
      setError(extractErrorMessage(err, "Couldn't void the payment — retry"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal open={Boolean(payment)} onClose={close} title={`Void ${payment?.receiptNumber ?? 'payment'}`}>
      <form onSubmit={submit} className="flex flex-col gap-4">
        <p className="text-sm text-ink-muted">
          Voiding keeps the entry in the ledger marked void and puts{' '}
          {payment ? formatUGX(payment.amount) : 'the amount'} back on the invoice.
        </p>
        <Input label="Reason" required maxLength={255} value={reason} onChange={(e) => setReason(e.target.value)} />
        {error && (
          <p role="alert" className="rounded-lg bg-critical-soft px-3 py-2 text-sm text-critical">
            {error}
          </p>
        )}
        <div className="flex justify-end gap-2">
          <Button type="button" variant={ButtonVariantEnum.GHOST} onClick={close}>
            Keep payment
          </Button>
          <Button type="submit" variant={ButtonVariantEnum.DANGER} loading={busy}>
            Void payment
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default function InvoiceDrawer({ invoiceId, onClose, canVoid }: InvoiceDrawerProps) {
  const { details } = useInvoice(invoiceId);
  const [voiding, setVoiding] = useState<IPayment | null>(null);
  const invoice = details?.invoice;
  const patient = invoice?.patient;

  const openReceipt = (paymentId: string) =>
    void ledgerService
      .receiptPdf(paymentId)
      .catch((err) => toast.error(extractErrorMessage(err, "Couldn't open the receipt")));

  return (
    <Drawer
      open={Boolean(invoiceId)}
      onClose={onClose}
      title={invoice ? `Invoice ${invoice.number}` : 'Invoice'}
      width="w-[640px]"
    >
      {!details || !invoice ? (
        <p className="text-sm text-ink-muted">Loading…</p>
      ) : (
        <div className="flex flex-col gap-6">
          <section className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-base font-semibold text-ink">
                {patient ? `${patient.firstName} ${patient.lastName}` : 'Patient'}
              </p>
              <p className="text-xs text-ink-muted">{patient?.mrn}</p>
            </div>
            <div className="flex items-center gap-2">
              <InvoiceStatusPill status={invoice.status} />
              <Button
                type="button"
                variant={ButtonVariantEnum.SECONDARY}
                onClick={() => void ledgerService.invoicePdf(invoice.id)}
              >
                <FaFilePdf aria-hidden /> PDF
              </Button>
            </div>
          </section>

          <section className="overflow-hidden rounded-lg border border-line">
            {details.groups.length === 0 ? (
              <p className="p-4 text-sm text-ink-muted">Nothing has been billed for this visit yet.</p>
            ) : (
              details.groups.map((group) => (
                <div key={group.source} className="border-b border-line last:border-0">
                  <div className="flex items-center justify-between bg-surface px-4 py-2">
                    <h4 className="text-xs font-semibold uppercase tracking-wide text-ink-muted">{group.label}</h4>
                    <span className="text-sm font-medium tabular-nums text-ink">{formatUGX(group.subtotal)}</span>
                  </div>
                  <ul className="divide-y divide-line">
                    {group.items.map((item) => (
                      <li key={item.id} className="flex items-center justify-between gap-3 px-4 py-2 text-sm">
                        <span className={item.status === 'waived' ? 'text-ink-muted line-through' : 'text-ink'}>
                          {item.description}
                          {item.status === 'waived' && <span className="ml-2 no-underline">(waived)</span>}
                        </span>
                        <span className="shrink-0 tabular-nums text-ink-muted">
                          {item.unitPrice === 0
                            ? 'Free'
                            : `${item.quantity} × ${item.unitPrice.toLocaleString('en-US')} = ${item.amount.toLocaleString('en-US')}`}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))
            )}
            <dl className="grid grid-cols-3 gap-2 border-t border-line bg-surface px-4 py-3 text-sm">
              <div>
                <dt className="text-xs text-ink-muted">Total</dt>
                <dd className="font-semibold tabular-nums text-ink">{formatUGX(details.total)}</dd>
              </div>
              <div>
                <dt className="text-xs text-ink-muted">Paid</dt>
                <dd className="font-semibold tabular-nums text-normal">{formatUGX(details.paid)}</dd>
              </div>
              <div>
                <dt className="text-xs text-ink-muted">Balance</dt>
                <dd className="font-semibold tabular-nums text-ink">{formatUGX(details.balance)}</dd>
              </div>
            </dl>
          </section>

          {details.balance > 0 && (
            <RecordPaymentForm
              key={`${invoice.id}-${details.paid}`}
              invoiceId={invoice.id}
              balance={details.balance}
              onRecorded={openReceipt}
            />
          )}

          <section className="flex flex-col gap-2">
            <h3 className="text-base font-semibold text-ink">Payments</h3>
            {details.payments.length === 0 ? (
              <p className="text-sm text-ink-muted">No payments yet.</p>
            ) : (
              <ul className="divide-y divide-line rounded-lg border border-line">
                {details.payments.map((payment) => (
                  <li key={payment.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-medium text-ink">
                        {payment.receiptNumber} · {formatUGX(payment.amount)}
                      </span>
                      <span className="text-xs text-ink-muted">
                        {METHOD_LABEL[payment.method]}
                        {payment.reference ? ` (${payment.reference})` : ''} · {formatDateTime(payment.receivedAt)} ·{' '}
                        {payment.receivedBy?.username}
                      </span>
                      {payment.voidReason && (
                        <span className="text-xs text-critical">Voided: {payment.voidReason}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <PaymentStatusPill status={payment.status} />
                      <button
                        type="button"
                        onClick={() => openReceipt(payment.id)}
                        className="text-xs font-medium text-primary hover:text-primary-hover"
                      >
                        Receipt
                      </button>
                      {canVoid && payment.status === PaymentStatusEnum.RECORDED && !payment.closingId && (
                        <button
                          type="button"
                          onClick={() => setVoiding(payment)}
                          className="text-xs font-medium text-critical hover:opacity-80"
                        >
                          Void
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}
      <VoidModal payment={voiding} onClose={() => setVoiding(null)} />
    </Drawer>
  );
}
