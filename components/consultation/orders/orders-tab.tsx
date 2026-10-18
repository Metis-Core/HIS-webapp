'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { FaXRay } from 'react-icons/fa';
import { Button, Input } from '@/components';
import RemoteSearchSelect from '@/components/inputs/remote-search-select';
import Segmented from '@/components/inputs/segmented';
import { ButtonVariantEnum, OrderKindEnum, OrderPriorityEnum } from '@/enum';
import { extractErrorMessage } from '@/helpers/errors';
import { PICKER_PAGE_SIZE } from '@/helpers/pagination';
import servicesService from '@/helpers/services.service';
import { useProcedureOrders } from '@/hooks';
import type { IConsultation, IOption, IService } from '@/interfaces';
import { KIND_LABEL, PRIORITY_LABEL } from '@/components/orders/order-format';
import OrderStatusPill from '@/components/orders/order-status-pill';

const KINDS = Object.values(OrderKindEnum).map((value) => ({ value, label: KIND_LABEL[value] }));
const PRIORITIES = Object.values(OrderPriorityEnum).map((value) => ({ value, label: PRIORITY_LABEL[value] }));

const serviceOption = (s: IService): IOption => ({
  label: `${s.name} · UGX ${s.fee.toLocaleString('en-US')}`,
  value: s.id,
});
const buildServiceUrl = (search: string) =>
  servicesService.buildListUrl({ search: search || undefined, isActive: true, limit: PICKER_PAGE_SIZE });

export default function OrdersTab({ consultation, readOnly }: { consultation: IConsultation; readOnly: boolean }) {
  const filters = consultation.visitId ? { visitId: consultation.visitId } : { patientId: consultation.patientId };
  const { orders, place } = useProcedureOrders({ ...filters, limit: 50 });
  const [kind, setKind] = useState(OrderKindEnum.RADIOLOGY);
  const [name, setName] = useState('');
  const [service, setService] = useState<IService | null>(null);
  const [priority, setPriority] = useState(OrderPriorityEnum.ROUTINE);
  const [indication, setIndication] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const title = name.trim() || service?.name || '';
    if (title.length < 2) return setError('Say what is being ordered');
    setSaving(true);
    setError(null);
    try {
      await place({
        patientId: consultation.patientId,
        visitId: consultation.visitId ?? undefined,
        consultationId: consultation.id,
        kind,
        name: title,
        serviceId: service?.id,
        priority,
        indication: indication.trim() || undefined,
      });
      toast.success(`${KIND_LABEL[kind]} order placed`);
      setName('');
      setService(null);
      setIndication('');
    } catch (err) {
      setError(extractErrorMessage(err, "Couldn't place the order — retry"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <section className="flex flex-col gap-3 rounded-lg border border-line bg-surface-raised p-5">
        <div className="flex items-center gap-2">
          <FaXRay className="text-brand" aria-hidden />
          <h3 className="text-sm font-semibold text-ink">Imaging and procedures</h3>
        </div>
        {orders.length === 0 ? (
          <p className="text-xs text-ink-muted">Nothing ordered for this visit yet.</p>
        ) : (
          <ul className="divide-y divide-line rounded-md border border-line">
            {orders.map((order) => (
              <li key={order.id} className="flex flex-col gap-1.5 px-3 py-2.5">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-medium text-ink">
                    {order.name}
                    <span className="ml-2 text-xs font-normal text-ink-muted">{KIND_LABEL[order.kind]}</span>
                  </span>
                  <OrderStatusPill status={order.status} />
                </div>
                {order.report && <p className="whitespace-pre-wrap text-xs text-ink-muted">{order.report}</p>}
              </li>
            ))}
          </ul>
        )}
      </section>

      {!readOnly && (
        <form onSubmit={submit} className="flex flex-col gap-4 rounded-lg border border-line bg-surface-raised p-5">
          <h3 className="text-sm font-semibold text-ink">New order</h3>
          <Segmented label="Type" options={KINDS} value={kind} onChange={setKind} />
          <RemoteSearchSelect<IService>
            label="From the price list (bills automatically)"
            placeholder="Search services"
            value={service}
            onChange={(next) => {
              setService(next);
              if (next && !name.trim()) setName(next.name);
            }}
            buildUrl={buildServiceUrl}
            toOption={serviceOption}
            noun="services"
          />
          <Input label="Order" required maxLength={200} value={name} onChange={(e) => setName(e.target.value)} />
          <Segmented label="Priority" options={PRIORITIES} value={priority} onChange={setPriority} />
          <Input
            label="Reason for the order"
            maxLength={2000}
            value={indication}
            onChange={(e) => setIndication(e.target.value)}
          />
          {error && (
            <p role="alert" className="rounded-lg bg-critical-soft px-3 py-2 text-sm text-critical">
              {error}
            </p>
          )}
          <Button type="submit" variant={ButtonVariantEnum.PRIMARY} loading={saving} className="self-start">
            Place order
          </Button>
        </form>
      )}
    </div>
  );
}
