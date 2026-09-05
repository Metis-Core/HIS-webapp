'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { FaBoxes, FaClipboardList, FaPills, FaSearch } from 'react-icons/fa';
import { toast } from 'sonner';
import { Button, EmptyState, Input, PageHeader, Pill, Stats, Tabs } from '@/components';
import {
  ButtonVariantEnum,
  DepartmentEnum,
  InventoryItemTypeEnum,
  PillVariantEnum,
  PrescriptionStatusEnum,
  QueueEntryStatusEnum,
  StatVariantEnum,
} from '@/enum';
import { useActiveInventoryStores, useDepartmentQueue, useInventoryItems, usePrescriptions } from '@/hooks';
import type { IInventoryItem, IPrescription, IQueueEntryRecord } from '@/interfaces';

type TabId = 'waiting' | 'pending' | 'all' | 'medications';

const statusVariant: Record<PrescriptionStatusEnum, PillVariantEnum> = {
  [PrescriptionStatusEnum.PENDING]: PillVariantEnum.WARNING,
  [PrescriptionStatusEnum.PARTIALLY_DISPENSED]: PillVariantEnum.INFO,
  [PrescriptionStatusEnum.DISPENSED]: PillVariantEnum.SUCCESS,
  [PrescriptionStatusEnum.CANCELLED]: PillVariantEnum.DANGER,
};

export default function PharmacyPage() {
  const [tab, setTab] = useState<TabId>('waiting');
  const [search, setSearch] = useState('');
  const { prescriptions, dispensePrescription, cancelPrescription } = usePrescriptions({ limit: 100 });
  const { stores } = useActiveInventoryStores();
  const { items: medications, isLoading: medsLoading } = useInventoryItems({
    limit: 100,
    isActive: true,
    type: InventoryItemTypeEnum.MEDICATION,
  });
  // Prefer the pharmacy department store, then any other active store — pharmacists rarely pick manually.
  const pharmacyStore = stores.find((s) => s.department === DepartmentEnum.MAIN_PHARMACY);
  const defaultStoreId = pharmacyStore?.id ?? stores[0]?.id ?? '';
  const hasStore = Boolean(defaultStoreId);
  const {
    entries: waiting,
    call: callEntry,
    start: startEntry,
    complete: completeEntry,
    skip: skipEntry,
  } = useDepartmentQueue(DepartmentEnum.MAIN_PHARMACY);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let rows = prescriptions;
    if (tab === 'pending') {
      rows = rows.filter((p) =>
        [PrescriptionStatusEnum.PENDING, PrescriptionStatusEnum.PARTIALLY_DISPENSED].includes(p.status),
      );
    }
    if (!q) return rows;
    return rows.filter((p) => {
      const name = `${p.patient?.firstName ?? ''} ${p.patient?.lastName ?? ''}`.toLowerCase();
      return name.includes(q) || (p.patient?.mrn ?? '').toLowerCase().includes(q);
    });
  }, [prescriptions, tab, search]);

  const stats = useMemo(
    () => [
      {
        label: 'Waiting',
        value: waiting.filter((e) => e.status !== QueueEntryStatusEnum.COMPLETED).length,
        icon: FaClipboardList,
        variant: StatVariantEnum.Amber,
      },
      {
        label: 'Pending',
        value: prescriptions.filter((p) => p.status === PrescriptionStatusEnum.PENDING).length,
        icon: FaPills,
        variant: StatVariantEnum.Amber,
      },
      {
        label: 'Partial',
        value: prescriptions.filter((p) => p.status === PrescriptionStatusEnum.PARTIALLY_DISPENSED).length,
        icon: FaPills,
        variant: StatVariantEnum.Blue,
      },
      {
        label: 'Dispensed today',
        value: prescriptions.filter((p) => p.status === PrescriptionStatusEnum.DISPENSED).length,
        icon: FaPills,
        variant: StatVariantEnum.Green,
      },
    ],
    [prescriptions, waiting],
  );

  const dispenseAll = async (p: IPrescription) => {
    if (!defaultStoreId) {
      toast.error('Set up an inventory store before dispensing (Inventory → Stores)');
      return;
    }
    const items = p.items
      .filter((i) => i.quantity - i.dispensedQuantity > 0)
      .map((i) => ({
        prescriptionItemId: i.id,
        quantity: i.quantity - i.dispensedQuantity,
      }));
    if (items.length === 0) return;
    await toast.promise(dispensePrescription(p.id, { storeId: defaultStoreId, items }), {
      loading: 'Dispensing…',
      success: 'Dispensed',
      error: "Couldn't dispense — retry",
    });
  };

  const cancel = async (p: IPrescription) => {
    if (!confirm('Cancel this prescription?')) return;
    await toast.promise(cancelPrescription(p.id, ''), {
      loading: 'Cancelling…',
      success: 'Prescription cancelled',
      error: "Couldn't cancel — retry",
    });
  };

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Pharmacy"
        description="Prescription queue — dispense from active stores and record cancellations."
      />

      {!hasStore && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-status-watch/40 bg-status-watch/10 p-3 text-sm text-status-watch">
          <div>
            <p className="font-semibold">No active inventory store</p>
            <p className="text-xs">
              Dispensing needs a Pharmacy-department store. Add one under Inventory › Stores and mark it active.
            </p>
          </div>
          <Link
            href="/inventory"
            className="inline-flex items-center gap-1.5 rounded-md bg-status-watch px-3 py-1.5 text-xs font-medium text-white hover:opacity-90"
          >
            Open Inventory →
          </Link>
        </div>
      )}

      <Stats items={stats} />

      <Tabs<TabId>
        tabs={[
          { id: 'waiting', label: `Waiting (${waiting.length})` },
          { id: 'pending', label: 'Pending' },
          { id: 'all', label: 'All prescriptions' },
          {
            id: 'medications',
            label: `Medications${medications.length > 0 ? ` (${medications.length})` : ''}`,
            icon: FaBoxes,
          },
        ]}
        active={tab}
        onChange={setTab}
      />

      {tab === 'waiting' ? (
        <WaitingPharmacyQueue
          entries={waiting}
          prescriptions={prescriptions}
          onCall={async (e) => {
            try {
              await callEntry(e.id);
              toast.success('Patient called');
            } catch {
              toast.error("Couldn't call — retry");
            }
          }}
          onStart={async (e) => {
            try {
              if (e.status === QueueEntryStatusEnum.WAITING) await callEntry(e.id);
              await startEntry(e.id);
              toast.success('Service started');
            } catch {
              toast.error("Couldn't start — retry");
            }
          }}
          onDispenseAll={dispenseAll}
          onComplete={async (e) => {
            await toast.promise(completeEntry(e.id), {
              loading: 'Completing…',
              success: 'Completed',
              error: "Couldn't complete — retry",
            });
          }}
          onSkip={async (e) => {
            if (!confirm('Skip this patient?')) return;
            await toast.promise(skipEntry(e.id), {
              loading: 'Skipping…',
              success: 'Skipped',
              error: "Couldn't skip — retry",
            });
          }}
        />
      ) : tab === 'medications' ? (
        <MedicationsCatalog items={medications} isLoading={medsLoading} search={search} onSearch={setSearch} />
      ) : (
        <>
          <Input
            className="max-w-sm"
            placeholder="Search patient / MRN"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {filtered.length === 0 ? (
            <EmptyState message="No prescriptions" icon={FaPills} />
          ) : (
            <PrescriptionsTable rows={filtered} onDispense={dispenseAll} onCancel={cancel} />
          )}
        </>
      )}
    </div>
  );
}

function MedicationsCatalog({
  items,
  isLoading,
  search,
  onSearch,
}: {
  items: IInventoryItem[];
  isLoading: boolean;
  search: string;
  onSearch: (v: string) => void;
}) {
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (i) =>
        i.name.toLowerCase().includes(q) ||
        i.sku.toLowerCase().includes(q) ||
        (i.manufacturer ?? '').toLowerCase().includes(q),
    );
  }, [items, search]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <div className="relative w-full max-w-sm">
          <FaSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-ink-muted" />
          <Input
            className="pl-9"
            placeholder="Search medication / SKU / manufacturer"
            value={search}
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>
        <Link href="/inventory" className="text-xs font-medium text-brand hover:text-brand-hover">
          Manage in inventory →
        </Link>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-2 rounded-lg border border-line bg-surface-raised p-6">
          <div className="h-4 w-40 animate-pulse rounded bg-line" />
          <div className="h-3 w-full animate-pulse rounded bg-line/70" />
          <div className="h-3 w-5/6 animate-pulse rounded bg-line/70" />
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          message="No medications configured"
          icon={FaBoxes}
          actionLabel="Add in Inventory"
          onAction={() => (window.location.href = '/inventory')}
        />
      ) : filtered.length === 0 ? (
        <EmptyState message="No medications match your search" icon={FaBoxes} />
      ) : (
        <div className="overflow-hidden rounded-lg border border-line bg-surface-raised">
          <table className="w-full text-left">
            <thead className="border-b border-line bg-surface text-ink-muted">
              <tr>
                <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-wide">Medication</th>
                <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-wide">SKU</th>
                <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-wide">Manufacturer</th>
                <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-wide">Unit</th>
                <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-wide">Unit price</th>
                <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-wide">Reorder at</th>
                <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-wide">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((i) => (
                <tr key={i.id} className="border-b border-line last:border-0">
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium text-ink">{i.name}</div>
                    {i.description && <div className="text-xs text-ink-muted line-clamp-1">{i.description}</div>}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-ink-muted">{i.sku}</td>
                  <td className="px-4 py-3 text-sm text-ink-muted">{i.manufacturer ?? '—'}</td>
                  <td className="px-4 py-3 text-sm text-ink-muted">{i.unitOfMeasure}</td>
                  <td className="px-4 py-3 text-sm tabular-nums text-ink">{i.unitPrice.toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm tabular-nums text-ink-muted">{i.reorderLevel}</td>
                  <td className="px-4 py-3">
                    <Pill variant={i.isActive ? PillVariantEnum.SUCCESS : PillVariantEnum.DEFAULT}>
                      {i.isActive ? 'active' : 'inactive'}
                    </Pill>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function WaitingPharmacyQueue({
  entries,
  prescriptions,
  onCall,
  onStart,
  onDispenseAll,
  onComplete,
  onSkip,
}: {
  entries: IQueueEntryRecord[];
  prescriptions: IPrescription[];
  onCall: (e: IQueueEntryRecord) => void;
  onStart: (e: IQueueEntryRecord) => void;
  onDispenseAll: (p: IPrescription) => void;
  onComplete: (e: IQueueEntryRecord) => void;
  onSkip: (e: IQueueEntryRecord) => void;
}) {
  const prescriptionsByPatient = useMemo(() => {
    const map = new Map<string, IPrescription[]>();
    prescriptions.forEach((p) => {
      const list = map.get(p.patientId) ?? [];
      list.push(p);
      map.set(p.patientId, list);
    });
    return map;
  }, [prescriptions]);

  if (entries.length === 0) {
    return <EmptyState message="Nobody waiting for pharmacy" icon={FaClipboardList} />;
  }
  return (
    <div className="overflow-hidden rounded-lg border border-line bg-surface-raised">
      <table className="w-full text-left">
        <thead className="border-b border-line bg-surface text-ink-muted">
          <tr>
            <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-wide">Patient</th>
            <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-wide">Prescriptions</th>
            <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-wide">Sequence</th>
            <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-wide">Status</th>
            <th className="px-4 py-2.5 text-right text-xs font-medium uppercase tracking-wide">Actions</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((e) => {
            const patient = e.visit?.patient;
            const rx = (prescriptionsByPatient.get(e.visit?.patientId ?? '') ?? []).filter(
              (p) =>
                p.status === PrescriptionStatusEnum.PENDING || p.status === PrescriptionStatusEnum.PARTIALLY_DISPENSED,
            );
            const primary = rx[0];
            return (
              <tr key={e.id} className="border-b border-line last:border-0">
                <td className="px-4 py-3">
                  <div className="text-sm font-medium text-ink">
                    {patient ? `${patient.firstName} ${patient.lastName}` : '—'}
                  </div>
                  <div className="text-xs text-ink-muted">{patient?.mrn}</div>
                </td>
                <td className="px-4 py-3 text-sm text-ink">
                  {rx.length === 0 ? '—' : rx.flatMap((p) => p.items.map((i) => i.item?.name ?? i.itemId)).join(', ')}
                </td>
                <td className="px-4 py-3 text-sm tabular-nums text-ink">#{e.sequenceNumber}</td>
                <td className="px-4 py-3">
                  <Pill
                    variant={e.status === QueueEntryStatusEnum.WAITING ? PillVariantEnum.WARNING : PillVariantEnum.INFO}
                  >
                    {e.status.replaceAll('_', ' ')}
                  </Pill>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-3">
                    {e.status === QueueEntryStatusEnum.WAITING && (
                      <button
                        type="button"
                        onClick={() => onCall(e)}
                        className="text-xs font-medium text-brand hover:text-brand-hover"
                      >
                        Call
                      </button>
                    )}
                    {e.status !== QueueEntryStatusEnum.IN_SERVICE && (
                      <button
                        type="button"
                        onClick={() => onStart(e)}
                        className="text-xs font-medium text-brand hover:text-brand-hover"
                      >
                        Start
                      </button>
                    )}
                    {primary && (
                      <button
                        type="button"
                        onClick={() => onDispenseAll(primary)}
                        className="text-xs font-medium text-brand hover:text-brand-hover"
                      >
                        Dispense
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => onComplete(e)}
                      className="text-xs font-medium text-normal hover:opacity-80"
                    >
                      Complete
                    </button>
                    <button
                      type="button"
                      onClick={() => onSkip(e)}
                      className="text-xs font-medium text-ink-muted hover:text-ink"
                    >
                      Skip
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function PrescriptionsTable({
  rows,
  onDispense,
  onCancel,
}: {
  rows: IPrescription[];
  onDispense: (p: IPrescription) => void;
  onCancel: (p: IPrescription) => void;
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-line bg-surface-raised">
      <table className="w-full text-left">
        <thead className="border-b border-line bg-surface text-ink-muted">
          <tr>
            <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-wide">Patient</th>
            <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-wide">Items</th>
            <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-wide">Progress</th>
            <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-wide">Status</th>
            <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-wide">Created</th>
            <th className="px-4 py-2.5 text-right text-xs font-medium uppercase tracking-wide">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((p) => {
            const totalQty = p.items.reduce((s, i) => s + i.quantity, 0);
            const dispensedQty = p.items.reduce((s, i) => s + i.dispensedQuantity, 0);
            const complete =
              p.status === PrescriptionStatusEnum.DISPENSED || p.status === PrescriptionStatusEnum.CANCELLED;
            return (
              <tr key={p.id} className="border-b border-line last:border-0">
                <td className="px-4 py-3">
                  <div className="text-sm font-medium text-ink">
                    {p.patient ? `${p.patient.firstName} ${p.patient.lastName}` : '—'}
                  </div>
                  <div className="text-xs text-ink-muted">{p.patient?.mrn}</div>
                </td>
                <td className="px-4 py-3 text-sm text-ink">
                  {p.items.map((i) => i.item?.name ?? i.itemId).join(', ')}
                </td>
                <td className="px-4 py-3 text-sm tabular-nums text-ink-muted">
                  {dispensedQty}/{totalQty}
                </td>
                <td className="px-4 py-3">
                  <Pill variant={statusVariant[p.status] ?? PillVariantEnum.DEFAULT}>
                    {p.status.replaceAll('_', ' ')}
                  </Pill>
                </td>
                <td className="px-4 py-3 text-xs text-ink-muted tabular-nums">
                  {new Date(p.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-3">
                    <a
                      href={`${process.env.NEXT_PUBLIC_API_URL}/documents/prescription/${p.id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-md border border-line bg-surface px-2.5 py-1 text-xs font-medium text-ink hover:bg-surface-raised"
                    >
                      Print
                    </a>
                    {!complete && (
                      <>
                        <Button type="button" variant={ButtonVariantEnum.PRIMARY} onClick={() => onDispense(p)}>
                          Dispense
                        </Button>
                        <button
                          type="button"
                          onClick={() => onCancel(p)}
                          className="text-xs font-medium text-critical hover:opacity-80"
                        >
                          Cancel
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
