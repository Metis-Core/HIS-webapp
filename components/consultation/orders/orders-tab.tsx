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
import { procedureTestsService } from '@/helpers/procedure-tests.service';
import { useProcedureOrders } from '@/hooks';
import type { IConsultation, IOption, IProcedureTest } from '@/interfaces';
import { KIND_LABEL, PRIORITY_LABEL } from '@/components/orders/order-format';
import ClassificationPill from '@/components/orders/classification-pill';
import OrderResultView from '@/components/orders/order-result-view';
import OrderStatusPill from '@/components/orders/order-status-pill';

const KINDS = Object.values(OrderKindEnum).map((value) => ({ value, label: KIND_LABEL[value] }));
const PRIORITIES = Object.values(OrderPriorityEnum).map((value) => ({ value, label: PRIORITY_LABEL[value] }));

const testOption = (test: IProcedureTest): IOption => ({
  label: `${test.name} · UGX ${test.price.toLocaleString('en-US')}`,
  value: test.id,
});

export default function OrdersTab({ consultation, readOnly }: { consultation: IConsultation; readOnly: boolean }) {
  const filters = consultation.visitId ? { visitId: consultation.visitId } : { patientId: consultation.patientId };
  const { orders, place } = useProcedureOrders({ ...filters, limit: 50 });
  const [kind, setKind] = useState(OrderKindEnum.RADIOLOGY);
  const [test, setTest] = useState<IProcedureTest | null>(null);
  const [priority, setPriority] = useState(OrderPriorityEnum.ROUTINE);
  const [indication, setIndication] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const buildTestUrl = (search: string) =>
    procedureTestsService.buildListUrl({ search: search || undefined, kind, isActive: true, limit: PICKER_PAGE_SIZE });

  const changeKind = (next: OrderKindEnum) => {
    setKind(next);
    setTest(null);
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!test) return setError('Choose what is being ordered');
    setSaving(true);
    setError(null);
    try {
      await place({
        patientId: consultation.patientId,
        visitId: consultation.visitId ?? undefined,
        consultationId: consultation.id,
        testId: test.id,
        priority,
        indication: indication.trim() || undefined,
      });
      toast.success(`${test.name} ordered`);
      setTest(null);
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
                  <span className="flex items-center gap-2">
                    <ClassificationPill classification={order.classification} />
                    <OrderStatusPill status={order.status} />
                  </span>
                </div>
                <OrderResultView order={order} />
              </li>
            ))}
          </ul>
        )}
      </section>

      {!readOnly && (
        <form onSubmit={submit} className="flex flex-col gap-4 rounded-lg border border-line bg-surface-raised p-5">
          <h3 className="text-sm font-semibold text-ink">New order</h3>
          <Segmented label="Type" options={KINDS} value={kind} onChange={changeKind} />
          <RemoteSearchSelect<IProcedureTest>
            key={kind}
            label="Test or procedure (bills automatically)"
            placeholder={kind === OrderKindEnum.RADIOLOGY ? 'Search imaging, e.g. chest x-ray' : 'Search procedures'}
            value={test}
            onChange={setTest}
            buildUrl={buildTestUrl}
            toOption={testOption}
            minSearchLength={0}
            noun="tests"
          />
          {test?.preparation && <p className="text-xs text-ink-muted">Preparation: {test.preparation}</p>}
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
