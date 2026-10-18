'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { FaHandHoldingMedical, FaPlus, FaTrash } from 'react-icons/fa';
import { Button, Input, Pill } from '@/components';
import { ButtonVariantEnum, PillVariantEnum } from '@/enum';
import { ChargeStatusEnum } from '@/enum/billing.enum';
import { extractErrorMessage } from '@/helpers/errors';
import RemoteSearchSelect from '@/components/inputs/remote-search-select';
import { PICKER_PAGE_SIZE } from '@/helpers/pagination';
import servicesService from '@/helpers/services.service';
import { useVisitBill } from '@/hooks';
import type { IOption, IService } from '@/interfaces';

const serviceOption = (s: IService): IOption => ({ label: `${s.name} · UGX ${s.fee.toLocaleString()}`, value: s.id });
// The price list is searched on the server rather than loaded whole into the dropdown.
const buildServiceUrl = (search: string) =>
  servicesService.buildListUrl({ search: search || undefined, isActive: true, limit: PICKER_PAGE_SIZE });

const statusVariant: Record<ChargeStatusEnum, PillVariantEnum> = {
  [ChargeStatusEnum.PENDING]: PillVariantEnum.WARNING,
  [ChargeStatusEnum.PAID]: PillVariantEnum.SUCCESS,
  [ChargeStatusEnum.WAIVED]: PillVariantEnum.DEFAULT,
};

export default function VisitChargesPanel({ visitId, readOnly }: { visitId: string | null; readOnly: boolean }) {
  const { charges, total, outstanding, addCharge, removeCharge } = useVisitBill(visitId);
  const [service, setService] = useState<IService | null>(null);
  const [isOther, setIsOther] = useState(false);
  const [description, setDescription] = useState('');
  const [unitPrice, setUnitPrice] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [busy, setBusy] = useState(false);

  const canSubmit =
    (isOther ? Boolean(description.trim() && unitPrice !== '') : Boolean(service)) && Number(quantity) >= 1;

  const submit = async () => {
    if (!canSubmit) return;
    setBusy(true);
    try {
      await toast.promise(
        addCharge({
          quantity: Number(quantity),
          ...(isOther ? { description: description.trim(), unitPrice: Number(unitPrice) } : { serviceId: service?.id }),
        }),
        {
          loading: 'Adding service…',
          success: 'Service added',
          error: (err) => extractErrorMessage(err, "Couldn't add — retry"),
        },
      );
      setService(null);
      setIsOther(false);
      setDescription('');
      setUnitPrice('');
      setQuantity('1');
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id: string) => {
    await toast.promise(removeCharge(id), {
      loading: 'Removing…',
      success: 'Charge removed',
      error: (err) => extractErrorMessage(err, "Couldn't remove — retry"),
    });
  };

  if (!visitId) {
    return (
      <section className="rounded-lg border border-line bg-surface-raised p-5 text-sm text-ink-muted">
        This consultation is not linked to a visit, so charges cannot be recorded.
      </section>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <section className="flex flex-col gap-3 rounded-lg border border-line bg-surface-raised p-5">
        <div className="flex items-center gap-2">
          <FaHandHoldingMedical className="text-brand" />
          <h3 className="text-sm font-semibold text-ink">Visit charges</h3>
          <span className="ml-auto text-xs text-ink-muted">
            Outstanding <span className="font-semibold tabular-nums text-ink">UGX {outstanding.toLocaleString()}</span>
          </span>
        </div>

        {charges.length === 0 ? (
          <p className="text-xs text-ink-muted">No charges yet.</p>
        ) : (
          <div className="overflow-x-auto rounded-md border border-line">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-line bg-surface text-ink-muted">
                <tr>
                  <th className="px-3 py-2 text-xs font-medium uppercase tracking-wide">Item</th>
                  <th className="px-3 py-2 text-xs font-medium uppercase tracking-wide">Qty</th>
                  <th className="px-3 py-2 text-xs font-medium uppercase tracking-wide">Amount</th>
                  <th className="px-3 py-2 text-xs font-medium uppercase tracking-wide">Status</th>
                  {!readOnly && <th className="px-3 py-2" />}
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {charges.map((c) => (
                  <tr key={c.id}>
                    <td className="px-3 py-2 text-ink">
                      {c.description}
                      <span className="ml-2 text-xs capitalize text-ink-muted">{c.source}</span>
                    </td>
                    <td className="px-3 py-2 tabular-nums text-ink-muted">{c.quantity}</td>
                    <td className="px-3 py-2 tabular-nums text-ink">UGX {c.amount.toLocaleString()}</td>
                    <td className="px-3 py-2">
                      <Pill variant={statusVariant[c.status]}>{c.status}</Pill>
                    </td>
                    {!readOnly && (
                      <td className="px-3 py-2 text-right">
                        {c.status === ChargeStatusEnum.PENDING && (
                          <button
                            type="button"
                            onClick={() => remove(c.id)}
                            aria-label={`Remove ${c.description}`}
                            className="text-xs text-critical hover:opacity-80"
                          >
                            <FaTrash />
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t border-line">
                <tr>
                  <td colSpan={2} className="px-3 py-2 text-right text-xs font-semibold uppercase text-ink-muted">
                    Total
                  </td>
                  <td className="px-3 py-2 font-semibold tabular-nums text-ink">UGX {total.toLocaleString()}</td>
                  <td colSpan={readOnly ? 1 : 2} />
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </section>

      {!readOnly && (
        <section className="flex flex-col gap-3 rounded-lg border border-line bg-surface-raised p-5">
          <div className="flex items-center gap-2">
            <FaPlus className="text-brand" />
            <h3 className="text-sm font-semibold text-ink">Add a service</h3>
            <span className="ml-auto text-xs text-ink-muted">Lab tests are billed automatically when ordered.</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              {isOther ? (
                <Input label="Service" value="Other (not in the price list)" disabled />
              ) : (
                <RemoteSearchSelect<IService>
                  label="Service"
                  placeholder="Search the price list"
                  value={service}
                  onChange={setService}
                  buildUrl={buildServiceUrl}
                  toOption={serviceOption}
                  noun="services"
                />
              )}
              <button
                type="button"
                onClick={() => {
                  setIsOther((v) => !v);
                  setService(null);
                }}
                className="mt-1 text-xs text-brand hover:underline"
              >
                {isOther ? 'Pick from the price list instead' : 'Not in the price list? Enter it manually'}
              </button>
            </div>
            <Input
              label="Quantity"
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </div>
          {isOther && (
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <Input
                  label="Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Wound dressing"
                />
              </div>
              <Input
                label="Unit price (UGX)"
                type="number"
                min={0}
                value={unitPrice}
                onChange={(e) => setUnitPrice(e.target.value)}
              />
            </div>
          )}
          <div className="flex justify-end">
            <Button
              type="button"
              variant={ButtonVariantEnum.PRIMARY}
              loading={busy}
              disabled={!canSubmit}
              onClick={submit}
            >
              Add service
            </Button>
          </div>
        </section>
      )}
    </div>
  );
}
