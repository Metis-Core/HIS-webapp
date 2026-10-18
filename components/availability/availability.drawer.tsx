'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Button, Drawer, Input } from '@/components';
import Segmented from '@/components/inputs/segmented';
import { AvailabilityStatusEnum, ButtonVariantEnum } from '@/enum';
import { extractErrorMessage } from '@/helpers/errors';
import { useAvailability } from '@/hooks';
import type { IAvailabilityPeriod, ISetAvailabilityDto } from '@/interfaces';
import AvailabilityPill from './availability-pill';
import { AVAILABILITY_LABEL, formatUntil, formatWhen } from './availability-status';

type Plannable = Exclude<AvailabilityStatusEnum, AvailabilityStatusEnum.AVAILABLE>;

const STATUS_OPTIONS: Array<{ value: Plannable; label: string }> = [
  { value: AvailabilityStatusEnum.BUSY, label: AVAILABILITY_LABEL[AvailabilityStatusEnum.BUSY] },
  { value: AvailabilityStatusEnum.ON_LEAVE, label: AVAILABILITY_LABEL[AvailabilityStatusEnum.ON_LEAVE] },
  { value: AvailabilityStatusEnum.OUT_OF_OFFICE, label: AVAILABILITY_LABEL[AvailabilityStatusEnum.OUT_OF_OFFICE] },
];

const BUSY_PRESETS = [
  { value: 30, label: '30 min' },
  { value: 60, label: '1 hour' },
  { value: 120, label: '2 hours' },
  { value: 240, label: '4 hours' },
];

const toDateInput = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

const startOfDay = (value: string) => new Date(`${value}T00:00:00`);

const dayAfter = (value: string) => {
  const next = startOfDay(value);
  next.setDate(next.getDate() + 1);
  return next;
};

function buildDto(status: Plannable, minutes: number, from: string, until: string, note: string): ISetAvailabilityDto {
  const dto: ISetAvailabilityDto = { status, note: note.trim() || undefined };
  if (status === AvailabilityStatusEnum.BUSY) return { ...dto, durationMinutes: minutes };
  if (from !== toDateInput(new Date())) dto.startsAt = startOfDay(from).toISOString();
  if (until) dto.endsAt = dayAfter(until).toISOString();
  return dto;
}

function PeriodRow({ period, onCancel }: { period: IAvailabilityPeriod; onCancel: (id: string) => void }) {
  const started = new Date(period.startsAt) <= new Date();
  return (
    <li className="flex items-start justify-between gap-3 py-3">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <AvailabilityPill status={period.status} />
          <span className="text-xs text-ink-muted">{started ? 'Now' : 'Planned'}</span>
        </div>
        <p className="text-sm text-ink">
          {started ? formatUntil(period.endsAt) : `${formatWhen(period.startsAt)} ${formatUntil(period.endsAt)}`}
        </p>
        {period.note && <p className="text-xs text-ink-muted">{period.note}</p>}
      </div>
      <button
        type="button"
        onClick={() => onCancel(period.id)}
        className="shrink-0 text-xs font-medium text-critical hover:opacity-80"
      >
        {started ? 'End now' : 'Cancel'}
      </button>
    </li>
  );
}

interface AvailabilityDrawerProps {
  open: boolean;
  onClose: () => void;
  userId?: string;
  name?: string;
}

/** Sets when a staff member is busy, on leave or out of office; the system returns them to available by itself. */
export default function AvailabilityDrawer({ open, onClose, userId, name }: AvailabilityDrawerProps) {
  const { overview, set, cancel } = useAvailability(userId, open);
  const [status, setStatus] = useState<Plannable>(AvailabilityStatusEnum.BUSY);
  const [minutes, setMinutes] = useState(60);
  const [from, setFrom] = useState(() => toDateInput(new Date()));
  const [until, setUntil] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const current = overview?.current;
  const isAway = current && current.status !== AvailabilityStatusEnum.AVAILABLE;
  const isBusy = status === AvailabilityStatusEnum.BUSY;

  const run = async (work: () => Promise<unknown>, success: string) => {
    setSaving(true);
    setError(null);
    try {
      await work();
      toast.success(success);
      return true;
    } catch (err) {
      setError(extractErrorMessage(err, "Couldn't update availability — retry"));
      return false;
    } finally {
      setSaving(false);
    }
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!isBusy && until && until < from) {
      setError('The last day away cannot be before the first day');
      return;
    }
    const saved = await run(() => set(buildDto(status, minutes, from, until, note)), 'Availability updated');
    if (saved) {
      setUntil('');
      setNote('');
    }
  };

  return (
    <Drawer open={open} onClose={onClose} title={name ? `Availability — ${name}` : 'My availability'} width="w-[480px]">
      <div className="flex flex-col gap-6">
        <section className="flex items-center justify-between gap-3 rounded-lg border border-line bg-surface p-4">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Right now</span>
            {current ? (
              <AvailabilityPill status={current.status} />
            ) : (
              <span className="text-sm text-ink-muted">Loading…</span>
            )}
            {isAway && <span className="text-xs text-ink-muted">{formatUntil(current.until)}</span>}
          </div>
          {isAway && (
            <Button
              type="button"
              variant={ButtonVariantEnum.SECONDARY}
              loading={saving}
              onClick={() => run(() => set({ status: AvailabilityStatusEnum.AVAILABLE }), 'Marked available')}
            >
              Mark available
            </Button>
          )}
        </section>

        <form onSubmit={submit} className="flex flex-col gap-4">
          <h3 className="text-base font-semibold text-ink">Set away time</h3>
          <Segmented label="Status" options={STATUS_OPTIONS} value={status} onChange={setStatus} />

          {isBusy ? (
            <Segmented label="For how long?" options={BUSY_PRESETS} value={minutes} onChange={setMinutes} />
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <Input
                type="date"
                label="First day away"
                min={toDateInput(new Date())}
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                required
              />
              <Input
                type="date"
                label="Last day away"
                min={from}
                value={until}
                onChange={(e) => setUntil(e.target.value)}
              />
              <p className="col-span-2 -mt-2 text-xs text-ink-muted">
                Leave the last day empty to stay away until you mark yourself available. You return automatically after
                the last day.
              </p>
            </div>
          )}

          <Input label="Note (optional)" maxLength={255} value={note} onChange={(e) => setNote(e.target.value)} />

          {error && (
            <p role="alert" className="rounded-lg bg-critical-soft px-3 py-2 text-sm text-critical">
              {error}
            </p>
          )}

          <Button type="submit" variant={ButtonVariantEnum.PRIMARY} loading={saving}>
            {isBusy ? 'Set busy' : status === AvailabilityStatusEnum.ON_LEAVE ? 'Plan leave' : 'Set out of office'}
          </Button>
        </form>

        <section className="flex flex-col gap-1">
          <h3 className="text-base font-semibold text-ink">Current and planned</h3>
          {overview && overview.periods.length > 0 ? (
            <ul className="divide-y divide-line">
              {overview.periods.map((period) => (
                <PeriodRow
                  key={period.id}
                  period={period}
                  onCancel={(id) => void run(() => cancel(id), 'Availability updated')}
                />
              ))}
            </ul>
          ) : (
            <p className="text-sm text-ink-muted">Nothing planned. You are available.</p>
          )}
        </section>
      </div>
    </Drawer>
  );
}
