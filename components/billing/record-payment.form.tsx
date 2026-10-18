'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Button, Input } from '@/components';
import Segmented from '@/components/inputs/segmented';
import { ButtonVariantEnum, PaymentMethodEnum } from '@/enum';
import { extractErrorMessage } from '@/helpers/errors';
import { ledgerService } from '@/helpers/ledger.service';
import { useLedgerRefresh } from '@/hooks';
import { formatUGX, METHOD_LABEL, REFERENCE_REQUIRED } from './billing-format';

const METHOD_OPTIONS = Object.values(PaymentMethodEnum).map((value) => ({ value, label: METHOD_LABEL[value] }));

interface RecordPaymentFormProps {
  invoiceId: string;
  balance: number;
  onRecorded: (paymentId: string) => void;
}

export default function RecordPaymentForm({ invoiceId, balance, onRecorded }: RecordPaymentFormProps) {
  const [amount, setAmount] = useState(String(balance));
  const [method, setMethod] = useState(PaymentMethodEnum.CASH);
  const [reference, setReference] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const refresh = useLedgerRefresh();

  const needsReference = REFERENCE_REQUIRED.includes(method);
  const value = Number(amount);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!Number.isInteger(value) || value < 1) return setError('Enter the amount received in whole shillings');
    if (value > balance) return setError(`The balance is only ${formatUGX(balance)}`);
    if (needsReference && !reference.trim()) return setError('Enter the transaction or claim reference');
    setSaving(true);
    setError(null);
    try {
      const payment = await ledgerService.record({
        invoiceId,
        amount: value,
        method,
        reference: reference.trim() || undefined,
      });
      await refresh();
      toast.success(`Payment recorded — receipt ${payment.receiptNumber}`);
      setReference('');
      setAmount(String(Math.max(balance - value, 0)));
      onRecorded(payment.id);
    } catch (err) {
      setError(extractErrorMessage(err, "Couldn't record the payment — retry"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-4 rounded-lg border border-line bg-surface p-4">
      <h3 className="text-base font-semibold text-ink">Record payment</h3>
      <Segmented label="Method" options={METHOD_OPTIONS} value={method} onChange={setMethod} />
      <Input
        type="number"
        inputMode="numeric"
        min={1}
        max={balance}
        label={`Amount (balance ${formatUGX(balance)})`}
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        required
      />
      {needsReference && (
        <Input
          label={method === PaymentMethodEnum.INSURANCE ? 'Claim reference' : 'Transaction reference'}
          maxLength={100}
          value={reference}
          onChange={(e) => setReference(e.target.value)}
          required
        />
      )}
      {error && (
        <p role="alert" className="rounded-lg bg-critical-soft px-3 py-2 text-sm text-critical">
          {error}
        </p>
      )}
      <Button type="submit" variant={ButtonVariantEnum.PRIMARY} loading={saving}>
        Record payment
      </Button>
    </form>
  );
}
