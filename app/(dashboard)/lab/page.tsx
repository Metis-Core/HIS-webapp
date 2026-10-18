'use client';

import { useState } from 'react';
import { FaClipboardList, FaFlask, FaPlus } from 'react-icons/fa';
import { toast } from 'sonner';
import { useSWRConfig } from 'swr';
import { Button, PageHeader, Stats, Tabs } from '@/components';
import LabResultsDrawer from '@/components/consultation/lab/lab-results.drawer';
import { OPEN_ORDER_STATUSES } from '@/components/lab/lab-status';
import BoardTab from '@/components/lab/page/board-tab';
import LabOrderDrawer from '@/components/lab/page/lab-order.drawer';
import OrdersTab from '@/components/lab/page/orders-tab';
import ReportsTab from '@/components/lab/page/reports-tab';
import TestsTab from '@/components/lab/page/tests-tab';
import WaitingTab from '@/components/lab/page/waiting-tab';
import LabResultDrawer from '@/components/lab/result/lab-result.drawer';
import {
  ButtonVariantEnum,
  DepartmentEnum,
  LabOrderItemStatusEnum,
  QueueEntryStatusEnum,
  StatVariantEnum,
  UserRoleEnum,
} from '@/enum';
import { extractErrorMessage } from '@/helpers/errors';
import { labOrdersService } from '@/helpers/lab.service';
import { useDepartmentQueue, useLabBoardSummary, useListTotal, useRoles } from '@/hooks';
import type { ILabOrder, IPatient, IQueueEntryRecord } from '@/interfaces';

type TabId = 'waiting' | 'board' | 'orders' | 'tests' | 'reports';

const LAB_TABS: Array<{ id: TabId; label: string }> = [
  { id: 'waiting', label: 'Waiting' },
  { id: 'board', label: 'Status board' },
  { id: 'orders', label: 'Orders' },
  { id: 'tests', label: 'Tests catalogue' },
  { id: 'reports', label: 'Reports' },
];

/** The lab bench (L2): the lab works here; other clinical staff get a read-only orders view. */
export default function LabPage() {
  const roles = useRoles();
  const isLab = roles.isAdmin || roles.is(UserRoleEnum.LAB_TECH);
  const [tab, setTab] = useState<TabId>(isLab ? 'waiting' : 'orders');
  const [order, setOrder] = useState<ILabOrder | null>(null);
  const [walkIn, setWalkIn] = useState<{ patient: IPatient | null; visitId?: string } | null>(null);
  const { mutate } = useSWRConfig();
  const queue = useDepartmentQueue(DepartmentEnum.MAIN_LABORATORY);
  const summary = useLabBoardSummary({}, isLab);
  const openOrders = useListTotal(labOrdersService.buildListUrl({ status: [...OPEN_ORDER_STATUSES], limit: 1 }));
  const waiting = queue.entries.filter((e) => e.status !== QueueEntryStatusEnum.COMPLETED);

  const stats = [
    { label: 'Waiting', value: waiting.length, icon: FaClipboardList, variant: StatVariantEnum.Amber },
    { label: 'Open orders', value: openOrders, icon: FaFlask, variant: StatVariantEnum.Blue },
    {
      label: 'Awaiting verification',
      value: summary?.[LabOrderItemStatusEnum.RESULT_READY] ?? 0,
      icon: FaFlask,
      variant: StatVariantEnum.Amber,
    },
    {
      label: 'Verified',
      value: summary?.[LabOrderItemStatusEnum.VERIFIED] ?? 0,
      icon: FaFlask,
      variant: StatVariantEnum.Green,
    },
  ];

  const openById = async (orderId: string) => {
    try {
      setOrder(await labOrdersService.getOne(orderId));
    } catch (err) {
      toast.error(extractErrorMessage(err, "Couldn't open the order"));
    }
  };
  const orderFor = (e: IQueueEntryRecord) => setWalkIn({ patient: e.visit?.patient ?? null, visitId: e.visitId });
  const refreshLab = async () => {
    await mutate((key) => typeof key === 'string' && key.startsWith('/lab'));
  };

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        description="Run the bench: collect, result and verify tests, and report on the lab's work."
        action={
          isLab ? (
            <Button type="button" variant={ButtonVariantEnum.PRIMARY} onClick={() => setWalkIn({ patient: null })}>
              <FaPlus className="text-xs" /> New lab order
            </Button>
          ) : undefined
        }
      />
      {isLab && <Stats items={stats} />}
      {isLab && (
        <Tabs<TabId>
          tabs={LAB_TABS.map((t) => (t.id === 'waiting' ? { ...t, label: `Waiting (${waiting.length})` } : t))}
          active={tab}
          onChange={setTab}
        />
      )}

      {tab === 'waiting' && <WaitingTab entries={queue.entries} queue={queue} onOpen={setOrder} onOrder={orderFor} />}
      {tab === 'board' && <BoardTab onOpen={openById} />}
      {tab === 'orders' && <OrdersTab onOpen={setOrder} />}
      {tab === 'tests' && <TestsTab canManage={roles.isAdmin} />}
      {tab === 'reports' && <ReportsTab />}

      {isLab ? (
        <LabResultDrawer open={Boolean(order)} order={order} onClose={() => setOrder(null)} onSaved={refreshLab} />
      ) : (
        <LabResultsDrawer order={order} onClose={() => setOrder(null)} />
      )}
      <LabOrderDrawer
        open={Boolean(walkIn)}
        patient={walkIn?.patient ?? null}
        visitId={walkIn?.visitId}
        onClose={() => setWalkIn(null)}
        onOrdered={(created) => {
          setWalkIn(null);
          void refreshLab();
          void openById(created.id);
        }}
      />
    </div>
  );
}
