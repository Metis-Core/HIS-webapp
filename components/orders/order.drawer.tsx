'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Button, Drawer, Input } from '@/components';
import { ButtonVariantEnum, OrderKindEnum, OrderStatusEnum } from '@/enum';
import { extractErrorMessage } from '@/helpers/errors';
import { useProcedureOrders } from '@/hooks';
import type { IProcedureOrder, IUpdateOrderStatusDto } from '@/interfaces';
import { KIND_LABEL, PRIORITY_LABEL } from './order-format';
import OrderStatusPill from './order-status-pill';

type Mode = 'schedule' | 'complete' | 'cancel' | null;

const toLocalInput = (date: Date) => {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

interface OrderDrawerProps {
  order: IProcedureOrder | null;
  onClose: () => void;
}

export default function OrderDrawer({ order, onClose }: OrderDrawerProps) {
  const { advance } = useProcedureOrders({}, false);
  const [mode, setMode] = useState<Mode>(null);
  const [when, setWhen] = useState(() => toLocalInput(new Date(Date.now() + 3_600_000)));
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const close = () => {
    setMode(null);
    setText('');
    setError(null);
    onClose();
  };

  const run = async (dto: IUpdateOrderStatusDto, success: string) => {
    if (!order) return;
    setBusy(true);
    setError(null);
    try {
      await advance(order.id, dto);
      toast.success(success);
      close();
    } catch (err) {
      setError(extractErrorMessage(err, "Couldn't update the order — retry"));
    } finally {
      setBusy(false);
    }
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (mode === 'schedule') {
      return run({ status: OrderStatusEnum.SCHEDULED, scheduledFor: new Date(when).toISOString() }, 'Order scheduled');
    }
    if (mode === 'complete') {
      if (text.trim().length < 3) {
        return setError(
          order?.kind === OrderKindEnum.RADIOLOGY ? 'Write the findings first' : 'Write the operation notes first',
        );
      }
      return run({ status: OrderStatusEnum.COMPLETED, report: text.trim() }, 'Order completed');
    }
    if (!text.trim()) return setError('Give a reason for cancelling');
    return run({ status: OrderStatusEnum.CANCELLED, reason: text.trim() }, 'Order cancelled');
  };

  const status = order?.status;
  const isRadiology = order?.kind === OrderKindEnum.RADIOLOGY;
  const textLabel =
    mode === 'cancel' ? 'Reason for cancelling' : isRadiology ? 'Findings and impression' : 'Operation notes';

  return (
    <Drawer open={Boolean(order)} onClose={close} title={order ? order.name : 'Order'} width="w-[560px]">
      {order && (
        <div className="flex flex-col gap-6">
          <section className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-base font-semibold text-ink">
                {order.patient ? `${order.patient.firstName} ${order.patient.lastName}` : 'Patient'}
              </p>
              <p className="text-xs text-ink-muted">
                {order.patient?.mrn} · {KIND_LABEL[order.kind]} · {PRIORITY_LABEL[order.priority]}
              </p>
            </div>
            <OrderStatusPill status={order.status} />
          </section>

          <dl className="grid gap-3 text-sm">
            {order.indication && (
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Reason for the order</dt>
                <dd className="text-ink">{order.indication}</dd>
              </div>
            )}
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Ordered by</dt>
              <dd className="text-ink">Dr {order.orderedBy?.username}</dd>
            </div>
            {order.scheduledFor && (
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Scheduled for</dt>
                <dd className="text-ink">{new Date(order.scheduledFor).toLocaleString('en-GB')}</dd>
              </div>
            )}
            {order.report && (
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
                  {isRadiology ? 'Findings' : 'Operation notes'}
                </dt>
                <dd className="whitespace-pre-wrap text-ink">{order.report}</dd>
              </div>
            )}
            {order.cancellationReason && (
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Cancelled because</dt>
                <dd className="text-ink">{order.cancellationReason}</dd>
              </div>
            )}
          </dl>

          {status && status !== OrderStatusEnum.COMPLETED && status !== OrderStatusEnum.CANCELLED && !mode && (
            <div className="flex flex-wrap gap-2">
              {status === OrderStatusEnum.REQUESTED && (
                <Button type="button" variant={ButtonVariantEnum.SECONDARY} onClick={() => setMode('schedule')}>
                  Schedule
                </Button>
              )}
              {status !== OrderStatusEnum.IN_PROGRESS && (
                <Button
                  type="button"
                  variant={ButtonVariantEnum.PRIMARY}
                  loading={busy}
                  onClick={() => void run({ status: OrderStatusEnum.IN_PROGRESS }, 'Order started')}
                >
                  Start
                </Button>
              )}
              {status === OrderStatusEnum.IN_PROGRESS && (
                <Button type="button" variant={ButtonVariantEnum.PRIMARY} onClick={() => setMode('complete')}>
                  {isRadiology ? 'Report findings' : 'Record operation notes'}
                </Button>
              )}
              <Button type="button" variant={ButtonVariantEnum.GHOST} onClick={() => setMode('cancel')}>
                Cancel order
              </Button>
            </div>
          )}

          {mode && (
            <form onSubmit={submit} className="flex flex-col gap-4 rounded-lg border border-line bg-surface p-4">
              {mode === 'schedule' ? (
                <Input
                  type="datetime-local"
                  label="Date and time"
                  min={toLocalInput(new Date())}
                  value={when}
                  onChange={(e) => setWhen(e.target.value)}
                  required
                />
              ) : (
                <label className="flex flex-col gap-1.5 text-xs font-medium text-ink-muted">
                  {textLabel}
                  <textarea
                    rows={6}
                    maxLength={mode === 'cancel' ? 255 : 8000}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className="w-full rounded-lg border border-line bg-surface-raised px-3 py-2 text-sm text-ink outline-none focus:border-brand focus:ring-1 focus:ring-brand"
                  />
                </label>
              )}
              {error && (
                <p role="alert" className="rounded-lg bg-critical-soft px-3 py-2 text-sm text-critical">
                  {error}
                </p>
              )}
              <div className="flex justify-end gap-2">
                <Button type="button" variant={ButtonVariantEnum.GHOST} onClick={() => setMode(null)}>
                  Back
                </Button>
                <Button
                  type="submit"
                  variant={mode === 'cancel' ? ButtonVariantEnum.DANGER : ButtonVariantEnum.PRIMARY}
                  loading={busy}
                >
                  {mode === 'schedule' ? 'Schedule' : mode === 'complete' ? 'Complete order' : 'Cancel order'}
                </Button>
              </div>
            </form>
          )}
          {!mode && error && (
            <p role="alert" className="rounded-lg bg-critical-soft px-3 py-2 text-sm text-critical">
              {error}
            </p>
          )}
        </div>
      )}
    </Drawer>
  );
}
