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
import {
  AVAILABILITY_LABEL,
  describeAvailability,
  formatUntil,
  formatWhen,
  minutesLeftToday,
} from './availability-status';

type Away = AvailabilityStatusEnum.ON_LEAVE | AvailabilityStatusEnum.OUT_OF_OFFICE;

const AWAY_OPTIONS: Array<{ value: Away; label: string }> = [
  { value: AvailabilityStatusEnum.ON_LEAVE, label: AVAILABILITY_LABEL[AvailabilityStatusEnum.ON_LEAVE] },
  { value: AvailabilityStatusEnum.OUT_OF_OFFICE, label: AVAILABILITY_LABEL[AvailabilityStatusEnum.OUT_OF_OFFICE] },
];

const MAX_BUSY_MINUTES = 12 * 60;

const BUSY_QUICK = [
  { label: '30 minutes', minutes: () => 30 },
  { label: '1 hour', minutes: () => 60 },
  { label: '2 hours', minutes: () => 120 },
  { label: 'Rest of the day', minutes: () => minutesLeftToday(MAX_BUSY_MINUTES) },
];

const toDateInput = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

const startOfDay = (value: string) => new Date(`${value}T00:00:00`);

const dayAfter = (value: string) => {
  const next = startOfDay(value);
  next.setDate(next.getDate() + 1);
  return next;
};

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
          {started ? formatUntil(period.endsAt) : `From ${formatWhen(period.startsAt)} ${formatUntil(period.endsAt)}`}
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

/** Quick "busy for…" buttons for the day, and a short form for planned leave or time away. */
export default function AvailabilityDrawer({ open, onClose, userId, name }: AvailabilityDrawerProps) {
  const { overview, set, cancel } = useAvailability(userId, open);
  const [planning, setPlanning] = useState(false);
  const [status, setStatus] = useState<Away>(AvailabilityStatusEnum.ON_LEAVE);
  const [from, setFrom] = useState(() => toDateInput(new Date()));
  const [until, setUntil] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const current = overview?.current;
  const isAway = Boolean(current && current.status !== AvailabilityStatusEnum.AVAILABLE);
  const subject = name ? `${name} is` : "You're";

  const run = async (work: () => Promise<unknown>, success: string, closeAfter = true) => {
    setSaving(true);
    setError(null);
    try {
      await work();
      toast.success(success);
      if (closeAfter) {
        setPlanning(false);
        setUntil('');
        setNote('');
        onClose();
      }
    } catch (err) {
      setError(extractErrorMessage(err, "Couldn't update availability — try again"));
    } finally {
      setSaving(false);
    }
  };

  const goBusy = (minutes: number, label: string) =>
    run(() => set({ status: AvailabilityStatusEnum.BUSY, durationMinutes: minutes }), `${subject} busy for ${label}`);

  const planAway = (event: React.FormEvent) => {
    event.preventDefault();
    if (until && until < from) return setError('The last day cannot be before the first day');
    const dto: ISetAvailabilityDto = { status, note: note.trim() || undefined };
    if (from !== toDateInput(new Date())) dto.startsAt = startOfDay(from).toISOString();
    if (until) dto.endsAt = dayAfter(until).toISOString();
    void run(() => set(dto), status === AvailabilityStatusEnum.ON_LEAVE ? 'Leave saved' : 'Time away saved');
  };

  return (
    <Drawer open={open} onClose={onClose} title={name ? `Availability — ${name}` : 'My availability'} width="w-[460px]">
      <div className="flex flex-col gap-6">
        <section className="flex flex-col gap-3 rounded-xl border border-line bg-surface p-4">
          {current ? (
            <>
              <AvailabilityPill status={current.status} />
              <p className="text-sm text-ink">
                {name && current.status !== AvailabilityStatusEnum.AVAILABLE
                  ? `${name} is ${AVAILABILITY_LABEL[current.status].toLowerCase()} ${formatUntil(current.until)}.`
                  : describeAvailability(current.status, current.until)}
              </p>
            </>
          ) : (
            <p className="text-sm text-ink-muted">Loading…</p>
          )}
        </section>

        {error && (
          <p role="alert" className="rounded-lg bg-critical-soft px-3 py-2 text-sm text-critical">
            {error}
          </p>
        )}

        {isAway ? (
          <Button
            type="button"
            variant={ButtonVariantEnum.PRIMARY}
            loading={saving}
            onClick={() => run(() => set({ status: AvailabilityStatusEnum.AVAILABLE }), `${subject} available again`)}
          >
            {name ? 'Mark available now' : "I'm available again"}
          </Button>
        ) : (
          <section className="flex flex-col gap-3">
            <h3 className="text-base font-semibold text-ink">Busy for a while?</h3>
            <div className="grid grid-cols-2 gap-2">
              {BUSY_QUICK.map((option) => (
                <Button
                  key={option.label}
                  type="button"
                  variant={ButtonVariantEnum.SECONDARY}
                  disabled={saving}
                  onClick={() => goBusy(option.minutes(), option.label.toLowerCase())}
                >
                  {option.label}
                </Button>
              ))}
            </div>
            <p className="text-xs text-ink-muted">New patients go to other doctors until the time is up.</p>
          </section>
        )}

        <section className="flex flex-col gap-3 border-t border-line pt-5">
          <button
            type="button"
            aria-expanded={planning}
            onClick={() => setPlanning((value) => !value)}
            className="flex items-center justify-between text-left text-base font-semibold text-ink"
          >
            Plan leave or time away
            <span aria-hidden className="text-ink-muted">
              {planning ? '−' : '+'}
            </span>
          </button>
          {planning && (
            <form onSubmit={planAway} className="flex flex-col gap-4">
              <Segmented label="What kind?" options={AWAY_OPTIONS} value={status} onChange={setStatus} />
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
              </div>
              <p className="-mt-2 text-xs text-ink-muted">
                You come back automatically the day after your last day. Leave it empty if you don&apos;t know yet — you
                can mark yourself available whenever you return.
              </p>
              <Input label="Note (optional)" maxLength={255} value={note} onChange={(e) => setNote(e.target.value)} />
              <Button type="submit" variant={ButtonVariantEnum.PRIMARY} loading={saving}>
                Save
              </Button>
            </form>
          )}
        </section>

        {overview && overview.periods.length > 0 && (
          <section className="flex flex-col gap-1 border-t border-line pt-5">
            <h3 className="text-base font-semibold text-ink">Current and planned</h3>
            <ul className="divide-y divide-line">
              {overview.periods.map((period) => (
                <PeriodRow
                  key={period.id}
                  period={period}
                  onCancel={(id) => void run(() => cancel(id), 'Availability updated', false)}
                />
              ))}
            </ul>
          </section>
        )}
      </div>
    </Drawer>
  );
}
