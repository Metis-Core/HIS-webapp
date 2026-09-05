'use client';

import { useMemo, useState } from 'react';
import { FaClipboardList, FaFlask, FaPlus, FaSearch } from 'react-icons/fa';
import { toast } from 'sonner';
import { useSWRConfig } from 'swr';
import { Button, EmptyState, Input, PageHeader, Pill, Stats, Tabs } from '@/components';
import LabResultDrawer from '@/components/drawers/lab-result.drawer';
import LabTestDrawer from '@/components/drawers/lab-test.drawer';
import {
  ButtonVariantEnum,
  DepartmentEnum,
  LabOrderStatusEnum,
  ModalDrawerModeEnum,
  PillVariantEnum,
  QueueEntryStatusEnum,
  StatVariantEnum,
} from '@/enum';
import { useDepartmentQueue, useLabOrders, useLabTests, useRoles } from '@/hooks';
import type {
  ICreateLabTestDto,
  ILabOrder,
  ILabTest,
  IPatient,
  IQueueEntryRecord,
  IUpdateLabTestDto,
} from '@/interfaces';

type TabId = 'waiting' | 'orders' | 'tests';

const orderStatusVariant: Record<LabOrderStatusEnum, PillVariantEnum> = {
  [LabOrderStatusEnum.PENDING]: PillVariantEnum.WARNING,
  [LabOrderStatusEnum.IN_PROGRESS]: PillVariantEnum.INFO,
  [LabOrderStatusEnum.COMPLETED]: PillVariantEnum.SUCCESS,
  [LabOrderStatusEnum.CANCELLED]: PillVariantEnum.DANGER,
};

export default function LabPage() {
  const [tab, setTab] = useState<TabId>('waiting');
  const [search, setSearch] = useState('');
  const [testDrawerMode, setTestDrawerMode] = useState<ModalDrawerModeEnum | null>(null);
  const [selectedTest, setSelectedTest] = useState<ILabTest | null>(null);
  const [resultDrawer, setResultDrawer] = useState<ILabOrder | null>(null);
  const roles = useRoles();
  const { mutate: globalMutate } = useSWRConfig();

  const { tests, createTest, updateTest, removeTest } = useLabTests({ limit: 100 });
  const { orders } = useLabOrders({ limit: 50 });
  const {
    entries: waiting,
    call: callEntry,
    start: startEntry,
    complete: completeEntry,
    skip: skipEntry,
  } = useDepartmentQueue(DepartmentEnum.MAIN_LABORATORY);

  const filteredTests = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return tests;
    return tests.filter(
      (t) =>
        t.code.toLowerCase().includes(q) || t.name.toLowerCase().includes(q) || t.category.toLowerCase().includes(q),
    );
  }, [tests, search]);

  const filteredOrders = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return orders;
    return orders.filter((o) => {
      const name = `${o.patient?.firstName ?? ''} ${o.patient?.lastName ?? ''}`.toLowerCase();
      return name.includes(q) || o.patient?.mrn?.toLowerCase().includes(q);
    });
  }, [orders, search]);

  const stats = useMemo(
    () => [
      {
        label: 'Waiting',
        value: waiting.filter((e) => e.status !== QueueEntryStatusEnum.COMPLETED).length,
        icon: FaClipboardList,
        variant: StatVariantEnum.Amber,
      },
      {
        label: 'Pending orders',
        value: orders.filter((o) => o.status === LabOrderStatusEnum.PENDING).length,
        icon: FaFlask,
        variant: StatVariantEnum.Amber,
      },
      {
        label: 'In progress',
        value: orders.filter((o) => o.status === LabOrderStatusEnum.IN_PROGRESS).length,
        icon: FaFlask,
        variant: StatVariantEnum.Blue,
      },
      {
        label: 'Completed today',
        value: orders.filter((o) => o.status === LabOrderStatusEnum.COMPLETED).length,
        icon: FaFlask,
        variant: StatVariantEnum.Green,
      },
    ],
    [orders, waiting],
  );

  const canManageCatalog = roles.isAdmin;

  const openAddTest = () => {
    setSelectedTest(null);
    setTestDrawerMode(ModalDrawerModeEnum.ADD);
  };

  const openEditTest = (test: ILabTest) => {
    setSelectedTest(test);
    setTestDrawerMode(ModalDrawerModeEnum.EDIT);
  };

  const closeTestDrawer = () => {
    setTestDrawerMode(null);
    setSelectedTest(null);
  };

  const saveTest = async (payload: ICreateLabTestDto | IUpdateLabTestDto, id?: string) => {
    if (id) {
      await toast.promise(updateTest(id, payload), {
        loading: 'Saving…',
        success: 'Test updated',
        error: "Couldn't save — retry",
      });
    } else {
      await toast.promise(createTest(payload as ICreateLabTestDto), {
        loading: 'Creating…',
        success: 'Test created',
        error: "Couldn't create — retry",
      });
    }
  };

  const deleteTest = async (test: ILabTest) => {
    if (!confirm(`Remove ${test.name}?`)) return;
    await toast.promise(removeTest(test.id), {
      loading: 'Removing…',
      success: 'Test removed',
      error: "Couldn't remove — retry",
    });
  };

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Laboratory"
        description="Track lab orders and manage the tests the lab can run."
        action={
          tab === 'tests' && canManageCatalog ? (
            <Button type="button" variant={ButtonVariantEnum.PRIMARY} onClick={openAddTest}>
              <FaPlus className="text-xs" />
              New test
            </Button>
          ) : undefined
        }
      />

      <Stats items={stats} />

      <Tabs<TabId>
        tabs={[
          { id: 'waiting', label: `Waiting (${waiting.length})` },
          { id: 'orders', label: 'Orders' },
          { id: 'tests', label: 'Tests catalog' },
        ]}
        active={tab}
        onChange={setTab}
      />

      {tab !== 'waiting' && (
        <div className="flex items-center gap-2">
          <div className="relative w-full max-w-sm">
            <FaSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-ink-muted" />
            <Input
              className="pl-9"
              placeholder={tab === 'orders' ? 'Search patient / MRN' : 'Search code / name / category'}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      )}

      {tab === 'waiting' ? (
        <WaitingLabQueue
          entries={waiting}
          orders={orders}
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
          onOpen={(order) => setResultDrawer(order)}
          onComplete={async (e) => {
            await toast.promise(completeEntry(e.id), {
              loading: 'Completing…',
              success: 'Completed — next stage advanced',
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
      ) : tab === 'orders' ? (
        <OrdersTable orders={filteredOrders} onOpen={(order) => setResultDrawer(order)} />
      ) : (
        <TestsTable
          tests={filteredTests}
          canManage={canManageCatalog}
          onAdd={openAddTest}
          onEdit={openEditTest}
          onDelete={deleteTest}
        />
      )}

      <LabTestDrawer mode={testDrawerMode} test={selectedTest} onClose={closeTestDrawer} onSave={saveTest} />

      <LabResultDrawer
        open={Boolean(resultDrawer)}
        order={resultDrawer}
        onClose={() => setResultDrawer(null)}
        onSaved={async () => {
          await globalMutate((key) => typeof key === 'string' && key.startsWith('/lab'));
        }}
      />
    </div>
  );
}

function WaitingLabQueue({
  entries,
  orders,
  onCall,
  onStart,
  onOpen,
  onComplete,
  onSkip,
}: {
  entries: IQueueEntryRecord[];
  orders: ILabOrder[];
  onCall: (e: IQueueEntryRecord) => void;
  onStart: (e: IQueueEntryRecord) => void;
  onOpen: (o: ILabOrder) => void;
  onComplete: (e: IQueueEntryRecord) => void;
  onSkip: (e: IQueueEntryRecord) => void;
}) {
  const ordersByVisit = useMemo(() => {
    const map = new Map<string, ILabOrder[]>();
    orders.forEach((o) => {
      if (!o.visitId) return;
      const list = map.get(o.visitId) ?? [];
      list.push(o);
      map.set(o.visitId, list);
    });
    return map;
  }, [orders]);

  if (entries.length === 0) {
    return <EmptyState message="Nobody waiting for lab" icon={FaClipboardList} />;
  }
  return (
    <div className="overflow-hidden rounded-lg border border-line bg-surface-raised">
      <table className="w-full text-left">
        <thead className="border-b border-line bg-surface text-ink-muted">
          <tr>
            <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-wide">Patient</th>
            <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-wide">Orders</th>
            <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-wide">Sequence</th>
            <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-wide">Status</th>
            <th className="px-4 py-2.5 text-right text-xs font-medium uppercase tracking-wide">Actions</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((e) => {
            const patient = e.visit?.patient;
            const visitOrders = ordersByVisit.get(e.visitId) ?? [];
            const activeOrder = visitOrders.find((o) => o.status !== LabOrderStatusEnum.CANCELLED);
            return (
              <tr key={e.id} className="border-b border-line last:border-0">
                <td className="px-4 py-3">
                  <div className="text-sm font-medium text-ink">
                    {patient ? `${patient.firstName} ${patient.lastName}` : '—'}
                  </div>
                  <div className="text-xs text-ink-muted">{patient?.mrn}</div>
                </td>
                <td className="px-4 py-3 text-sm text-ink">
                  {visitOrders.length === 0
                    ? '—'
                    : visitOrders.flatMap((o) => o.items.map((i) => i.test?.code ?? '—')).join(', ')}
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
                    {activeOrder && (
                      <button
                        type="button"
                        onClick={() => onOpen(activeOrder)}
                        className="text-xs font-medium text-brand hover:text-brand-hover"
                      >
                        Enter results
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

function OrdersTable({ orders, onOpen }: { orders: ILabOrder[]; onOpen: (o: ILabOrder) => void }) {
  if (orders.length === 0) {
    return <EmptyState message="No lab orders yet" icon={FaFlask} />;
  }
  return (
    <div className="overflow-hidden rounded-lg border border-line bg-surface-raised">
      <table className="w-full text-left">
        <thead className="border-b border-line bg-surface text-ink-muted">
          <tr>
            <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-wide">Patient</th>
            <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-wide">Tests</th>
            <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-wide">Priority</th>
            <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-wide">Status</th>
            <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-wide">Ordered</th>
            <th className="px-4 py-2.5 text-right text-xs font-medium uppercase tracking-wide">Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id} className="border-b border-line last:border-0">
              <td className="px-4 py-3">
                <div className="text-sm font-medium text-ink">
                  {o.patient ? `${o.patient.firstName} ${o.patient.lastName}` : '—'}
                </div>
                <div className="text-xs text-ink-muted">{o.patient?.mrn}</div>
              </td>
              <td className="px-4 py-3 text-sm text-ink">{o.items?.length ?? 0}</td>
              <td className="px-4 py-3">
                <Pill variant={PillVariantEnum.DEFAULT}>{o.priority}</Pill>
              </td>
              <td className="px-4 py-3">
                <Pill variant={orderStatusVariant[o.status] ?? PillVariantEnum.DEFAULT}>
                  {o.status.replaceAll('_', ' ')}
                </Pill>
              </td>
              <td className="px-4 py-3 text-xs text-ink-muted tabular-nums">
                {new Date(o.createdAt).toLocaleDateString()}
              </td>
              <td className="px-4 py-3 text-right">
                <button
                  type="button"
                  onClick={() => onOpen(o)}
                  className="text-xs font-medium text-brand hover:text-brand-hover"
                >
                  Open
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TestsTable({
  tests,
  canManage,
  onAdd,
  onEdit,
  onDelete,
}: {
  tests: ILabTest[];
  canManage: boolean;
  onAdd: () => void;
  onEdit: (t: ILabTest) => void;
  onDelete: (t: ILabTest) => void;
}) {
  if (tests.length === 0) {
    return (
      <EmptyState
        message="No lab tests yet"
        icon={FaFlask}
        actionLabel={canManage ? 'Add first test' : undefined}
        onAction={canManage ? onAdd : undefined}
      />
    );
  }
  return (
    <div className="overflow-hidden rounded-lg border border-line bg-surface-raised">
      <table className="w-full text-left">
        <thead className="border-b border-line bg-surface text-ink-muted">
          <tr>
            <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-wide">Code</th>
            <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-wide">Name</th>
            <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-wide">Category</th>
            <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-wide">Sample</th>
            <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-wide">Price</th>
            <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-wide">Status</th>
            {canManage && (
              <th className="px-4 py-2.5 text-right text-xs font-medium uppercase tracking-wide">Actions</th>
            )}
          </tr>
        </thead>
        <tbody>
          {tests.map((t) => (
            <tr key={t.id} className="border-b border-line last:border-0">
              <td className="px-4 py-3 font-mono text-xs text-ink">{t.code}</td>
              <td className="px-4 py-3 text-sm font-medium text-ink">{t.name}</td>
              <td className="px-4 py-3 text-sm text-ink-muted capitalize">{t.category}</td>
              <td className="px-4 py-3 text-sm text-ink-muted capitalize">{t.sampleType}</td>
              <td className="px-4 py-3 text-sm tabular-nums text-ink">UGX {t.price.toLocaleString()}</td>
              <td className="px-4 py-3">
                <Pill variant={t.isActive ? PillVariantEnum.SUCCESS : PillVariantEnum.DEFAULT}>
                  {t.isActive ? 'active' : 'inactive'}
                </Pill>
              </td>
              {canManage && (
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => onEdit(t)}
                      className="text-xs font-medium text-brand hover:text-brand-hover"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(t)}
                      className="text-xs font-medium text-critical hover:opacity-80"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
