'use client';

import { useState, type ReactNode } from 'react';
import Link from 'next/link';
import { FaBoxes, FaClipboardList, FaPills, FaSearch } from 'react-icons/fa';
import { toast } from 'sonner';
import { Button, DocumentButton, EmptyState, Input, PageHeader, Pagination, Pill, Stats, Tabs } from '@/components';
import { extractErrorMessage } from '@/helpers/errors';
import { formatStockQuantity } from '@/helpers/inventory.format';
import {
  DocumentEndpointEnum,
  ButtonVariantEnum,
  DepartmentEnum,
  InventoryItemTypeEnum,
  PillVariantEnum,
  PrescriptionStatusEnum,
  QueueEntryStatusEnum,
  StatVariantEnum,
} from '@/enum';
import {
  useActiveInventoryStores,
  useDepartmentQueue,
  useInventoryItems,
  useInventoryStock,
  useListTotal,
  usePagedSearch,
  usePrescriptions,
} from '@/hooks';
import pharmacyService from '@/helpers/pharmacy.service';
import { inventoryItemsService } from '@/helpers/inventory.service';
import { MAX_PAGE_SIZE } from '@/helpers/pagination';
import type { IPrescription, IQueueEntryRecord } from '@/interfaces';
import PriorityBadge from '@/components/queue/priority-badge';

type TabId = 'waiting' | 'pending' | 'all' | 'medications';

// "Pending" work = not started or partly dispensed.
const OPEN_STATUSES = [PrescriptionStatusEnum.PENDING, PrescriptionStatusEnum.PARTIALLY_DISPENSED];

const statusVariant: Record<PrescriptionStatusEnum, PillVariantEnum> = {
  [PrescriptionStatusEnum.PENDING]: PillVariantEnum.WARNING,
  [PrescriptionStatusEnum.PARTIALLY_DISPENSED]: PillVariantEnum.INFO,
  [PrescriptionStatusEnum.DISPENSED]: PillVariantEnum.SUCCESS,
  [PrescriptionStatusEnum.CANCELLED]: PillVariantEnum.DANGER,
};

export default function PharmacyPage() {
  const [tab, setTab] = useState<TabId>('waiting');
  const rxList = usePagedSearch('rxPage');
  const { prescriptions, pagination, dispensePrescription, cancelPrescription } = usePrescriptions({
    page: rxList.page,
    search: rxList.debouncedSearch,
    status: tab === 'pending' ? OPEN_STATUSES : undefined,
  });
  const { stores } = useActiveInventoryStores();
  const pharmacyStore = stores.find((s) => s.department === DepartmentEnum.MAIN_PHARMACY);
  const defaultStoreId = pharmacyStore?.id ?? stores[0]?.id ?? '';
  const hasStore = Boolean(defaultStoreId);
  const medicationCount = useListTotal(
    inventoryItemsService.buildListUrl({ isActive: true, type: InventoryItemTypeEnum.MEDICATION, limit: 1 }),
  );
  const pendingCount = useListTotal(pharmacyService.buildListUrl({ status: PrescriptionStatusEnum.PENDING, limit: 1 }));
  const partialCount = useListTotal(
    pharmacyService.buildListUrl({ status: PrescriptionStatusEnum.PARTIALLY_DISPENSED, limit: 1 }),
  );
  const dispensedCount = useListTotal(
    pharmacyService.buildListUrl({ status: PrescriptionStatusEnum.DISPENSED, limit: 1 }),
  );
  const {
    entries: waiting,
    call: callEntry,
    start: startEntry,
    complete: completeEntry,
    skip: skipEntry,
  } = useDepartmentQueue(DepartmentEnum.MAIN_PHARMACY);

  const changeTab = (next: TabId) => {
    setTab(next);
    rxList.setPage(1);
  };

  const stats = [
    {
      label: 'Waiting',
      value: waiting.filter((e) => e.status !== QueueEntryStatusEnum.COMPLETED).length,
      icon: FaClipboardList,
      variant: StatVariantEnum.Amber,
    },
    { label: 'Pending', value: pendingCount, icon: FaPills, variant: StatVariantEnum.Amber },
    { label: 'Partial', value: partialCount, icon: FaPills, variant: StatVariantEnum.Blue },
    { label: 'Dispensed', value: dispensedCount, icon: FaPills, variant: StatVariantEnum.Green },
  ];

  const dispenseAll = async (list: IPrescription[]) => {
    if (!defaultStoreId) {
      toast.error('Set up an inventory store before dispensing (Inventory → Stores)');
      return;
    }
    const jobs = list
      .map((p) => ({
        id: p.id,
        items: p.items
          .filter((i) => i.quantity - i.dispensedQuantity > 0)
          .map((i) => ({ prescriptionItemId: i.id, quantity: i.quantity - i.dispensedQuantity })),
      }))
      .filter((j) => j.items.length > 0);
    if (jobs.length === 0) return;
    await toast.promise(
      (async () => {
        for (const job of jobs) await dispensePrescription(job.id, { storeId: defaultStoreId, items: job.items });
      })(),
      {
        loading: 'Dispensing…',
        success: 'Dispensed',
        error: (e) => extractErrorMessage(e, "Couldn't dispense — retry"),
      },
    );
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
      <PageHeader description="Prescription queue — dispense from active stores and record cancellations." />

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
            label: `Medications${medicationCount > 0 ? ` (${medicationCount})` : ''}`,
            icon: FaBoxes,
          },
        ]}
        active={tab}
        onChange={changeTab}
      />

      {tab === 'waiting' ? (
        <WaitingPharmacyQueue
          entries={waiting}
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
        <MedicationsCatalog storeId={defaultStoreId} />
      ) : (
        <>
          <Input
            className="max-w-sm"
            placeholder="Search patient / MRN"
            value={rxList.search}
            onChange={(e) => rxList.setSearch(e.target.value)}
          />

          {prescriptions.length === 0 ? (
            <EmptyState
              message={rxList.debouncedSearch ? 'No prescriptions match your search' : 'No prescriptions'}
              icon={FaPills}
            />
          ) : (
            <PrescriptionsTable
              rows={prescriptions}
              pagination={<Pagination {...pagination} onPageChange={rxList.setPage} label="Prescription pages" />}
              onDispense={(p) => dispenseAll([p])}
              onCancel={cancel}
            />
          )}
        </>
      )}
    </div>
  );
}

function MedicationsCatalog({ storeId }: { storeId: string }) {
  const { page, setPage, search, setSearch, debouncedSearch } = usePagedSearch('medsPage');
  const { items, pagination, isLoading } = useInventoryItems({
    page,
    search: debouncedSearch,
    isActive: true,
    type: InventoryItemTypeEnum.MEDICATION,
  });
  // On-hand quantities for just the medications on this page.
  const itemIds = items.map((i) => i.id);
  const { stock } = useInventoryStock(
    { storeId, itemIds, limit: MAX_PAGE_SIZE },
    { enabled: Boolean(storeId) && itemIds.length > 0 },
  );
  const onHandByItem = new Map(stock.map((st) => [st.itemId, st.quantity]));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <div className="relative w-full max-w-sm">
          <FaSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-ink-muted" />
          <Input
            className="pl-9"
            placeholder="Search medication / SKU / manufacturer"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Link href="/inventory" className="text-xs font-medium text-primary hover:text-primary-hover">
          Manage in inventory →
        </Link>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-2 rounded-lg border border-line bg-surface-raised p-6">
          <div className="h-4 w-40 animate-pulse rounded bg-line" />
          <div className="h-3 w-full animate-pulse rounded bg-line/70" />
          <div className="h-3 w-5/6 animate-pulse rounded bg-line/70" />
        </div>
      ) : items.length === 0 && !debouncedSearch ? (
        <EmptyState
          message="No medications configured"
          icon={FaBoxes}
          actionLabel="Add in Inventory"
          onAction={() => (window.location.href = '/inventory')}
        />
      ) : items.length === 0 ? (
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
                <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-wide">In stock</th>
                <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-wide">Reorder at</th>
                <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-wide">Status</th>
              </tr>
            </thead>
            <tbody>
              {items.map((i) => (
                <tr key={i.id} className="border-b border-line last:border-0">
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium text-ink">{i.name}</div>
                    {i.description && <div className="text-xs text-ink-muted line-clamp-1">{i.description}</div>}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-ink-muted">{i.sku}</td>
                  <td className="px-4 py-3 text-sm text-ink-muted">{i.manufacturer ?? '—'}</td>
                  <td className="px-4 py-3 text-sm text-ink-muted">{i.unitOfMeasure}</td>
                  <td className="px-4 py-3 text-sm tabular-nums text-ink">{i.unitPrice.toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm tabular-nums text-ink">
                    {formatStockQuantity(onHandByItem.get(i.id) ?? 0, i)}
                  </td>
                  <td className="px-4 py-3 text-sm tabular-nums text-ink-muted">{i.minStockLevel}</td>
                  <td className="px-4 py-3">
                    <Pill variant={i.isActive ? PillVariantEnum.SUCCESS : PillVariantEnum.DEFAULT}>
                      {i.isActive ? 'active' : 'inactive'}
                    </Pill>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination {...pagination} onPageChange={setPage} label="Medication pages" />
        </div>
      )}
    </div>
  );
}

function WaitingPharmacyQueue({
  entries,
  onCall,
  onStart,
  onDispenseAll,
  onComplete,
  onSkip,
}: {
  entries: IQueueEntryRecord[];
  onCall: (e: IQueueEntryRecord) => void;
  onStart: (e: IQueueEntryRecord) => void;
  onDispenseAll: (list: IPrescription[]) => void;
  onComplete: (e: IQueueEntryRecord) => void;
  onSkip: (e: IQueueEntryRecord) => void;
}) {
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
          {entries.map((e) => (
            <WaitingPharmacyRow
              key={e.id}
              entry={e}
              onCall={onCall}
              onStart={onStart}
              onDispenseAll={onDispenseAll}
              onComplete={onComplete}
              onSkip={onSkip}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Each waiting patient's open prescriptions (a handful), instead of loading every prescription to match them up.
function WaitingPharmacyRow({
  entry: e,
  onCall,
  onStart,
  onDispenseAll,
  onComplete,
  onSkip,
}: {
  entry: IQueueEntryRecord;
  onCall: (e: IQueueEntryRecord) => void;
  onStart: (e: IQueueEntryRecord) => void;
  onDispenseAll: (list: IPrescription[]) => void;
  onComplete: (e: IQueueEntryRecord) => void;
  onSkip: (e: IQueueEntryRecord) => void;
}) {
  const patient = e.visit?.patient;
  const patientId = e.visit?.patientId ?? e.visit?.patient?.id;
  // Without a patient id the filter would match everyone, so skip the request.
  const { prescriptions: rx } = usePrescriptions(
    { patientId, status: OPEN_STATUSES, limit: 20 },
    { enabled: Boolean(patientId) },
  );
  return (
    <tr className="border-b border-line last:border-0">
      <td className="px-4 py-3">
        <div className="text-sm font-medium text-ink">{patient ? `${patient.firstName} ${patient.lastName}` : '—'}</div>
        <div className="text-xs text-ink-muted">{patient?.mrn}</div>
        <PriorityBadge visit={e.visit} />
      </td>
      <td className="px-4 py-3 text-sm text-ink">
        {rx.length === 0 ? '—' : rx.flatMap((p) => p.items.map((i) => i.item?.name ?? i.itemId)).join(', ')}
      </td>
      <td className="px-4 py-3 text-sm tabular-nums text-ink">#{e.sequenceNumber}</td>
      <td className="px-4 py-3">
        <Pill variant={e.status === QueueEntryStatusEnum.WAITING ? PillVariantEnum.WARNING : PillVariantEnum.INFO}>
          {e.status.replaceAll('_', ' ')}
        </Pill>
      </td>
      <td className="px-4 py-3 text-right">
        <div className="flex justify-end gap-3">
          {e.status === QueueEntryStatusEnum.WAITING && (
            <button
              type="button"
              onClick={() => onCall(e)}
              className="text-xs font-medium text-primary hover:text-primary-hover"
            >
              Call
            </button>
          )}
          {e.status !== QueueEntryStatusEnum.IN_SERVICE && (
            <button
              type="button"
              onClick={() => onStart(e)}
              className="text-xs font-medium text-primary hover:text-primary-hover"
            >
              Start
            </button>
          )}
          {rx.length > 0 && (
            <button
              type="button"
              onClick={() => onDispenseAll(rx)}
              className="text-xs font-medium text-primary hover:text-primary-hover"
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
          <button type="button" onClick={() => onSkip(e)} className="text-xs font-medium text-ink-muted hover:text-ink">
            Skip
          </button>
        </div>
      </td>
    </tr>
  );
}

function PrescriptionsTable({
  rows,
  pagination,
  onDispense,
  onCancel,
}: {
  rows: IPrescription[];
  pagination: ReactNode;
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
                    <DocumentButton endpoint={DocumentEndpointEnum.PRESCRIPTION} id={p.id}>
                      Print
                    </DocumentButton>
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
      {pagination}
    </div>
  );
}
