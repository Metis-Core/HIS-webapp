'use client';

import { useState } from 'react';
import { FaXRay } from 'react-icons/fa';
import { EmptyState, Input, PageHeader, Pagination, Stats, Tabs } from '@/components';
import Segmented from '@/components/inputs/segmented';
import ProcedureTestsTab from '@/components/orders/catalogue/procedure-tests-tab';
import { isOpenOrder, KIND_LABEL, OPEN_ORDER_STATUSES, PRIORITY_LABEL } from '@/components/orders/order-format';
import OrderDrawer from '@/components/orders/order.drawer';
import OrderStatusPill from '@/components/orders/order-status-pill';
import { OrderKindEnum, OrderPriorityEnum, OrderStatusEnum, StatVariantEnum, UserRoleEnum } from '@/enum';
import { ordersService } from '@/helpers/ledger.service';
import { useListTotal, usePagedSearch, useProcedureOrders, useRoles } from '@/hooks';
import type { IProcedureOrder } from '@/interfaces';

type StatusFilter = 'open' | 'done' | 'all';
type View = OrderKindEnum | 'catalogue';

const FILTERS: Array<{ value: StatusFilter; label: string }> = [
  { value: 'open', label: 'Open' },
  { value: 'done', label: 'Completed' },
  { value: 'all', label: 'All' },
];
const TH = 'px-4 py-2.5 text-xs font-medium uppercase tracking-wide';

const statusesFor = (filter: StatusFilter) =>
  filter === 'open'
    ? OPEN_ORDER_STATUSES
    : filter === 'done'
      ? [OrderStatusEnum.COMPLETED, OrderStatusEnum.CANCELLED]
      : undefined;

export default function OrdersPage() {
  const roles = useRoles();
  const radiologyOnly = roles.is(UserRoleEnum.LAB_TECH);
  const [view, setView] = useState<View>(OrderKindEnum.RADIOLOGY);
  const kind = view === 'catalogue' ? OrderKindEnum.RADIOLOGY : view;
  const [filter, setFilter] = useState<StatusFilter>('open');
  const [selected, setSelected] = useState<IProcedureOrder | null>(null);
  const { page, setPage, search, setSearch, debouncedSearch } = usePagedSearch('orderPage');
  const { orders, pagination } = useProcedureOrders(
    {
      page,
      kind,
      search: debouncedSearch,
      status: statusesFor(filter),
    },
    view !== 'catalogue',
  );
  const openRadiology = useListTotal(
    ordersService.listUrl({ kind: OrderKindEnum.RADIOLOGY, status: OPEN_ORDER_STATUSES, limit: 1 }),
  );
  const openSurgery = useListTotal(
    ordersService.listUrl({ kind: OrderKindEnum.SURGERY, status: OPEN_ORDER_STATUSES, limit: 1 }),
  );
  const requested = useListTotal(ordersService.listUrl({ status: [OrderStatusEnum.REQUESTED], limit: 1 }));

  const tabs: Array<{ id: View; label: string }> = [
    { id: OrderKindEnum.RADIOLOGY, label: `${KIND_LABEL[OrderKindEnum.RADIOLOGY]} (${openRadiology})` },
    ...(radiologyOnly
      ? []
      : [{ id: OrderKindEnum.SURGERY, label: `${KIND_LABEL[OrderKindEnum.SURGERY]} (${openSurgery})` }]),
    ...(roles.isAdmin ? [{ id: 'catalogue' as const, label: 'Catalogue' }] : []),
  ];

  const changeView = (next: View) => {
    setView(next);
    if (page !== 1) setPage(1);
  };

  return (
    <div className="flex flex-col gap-5">
      <PageHeader description="Imaging and procedures ordered by doctors: schedule, perform and report." />
      <Stats
        items={[
          { label: 'Open radiology', value: openRadiology, icon: FaXRay, variant: StatVariantEnum.Blue },
          { label: 'Open procedures', value: openSurgery, icon: FaXRay, variant: StatVariantEnum.Blue },
          { label: 'Waiting to be scheduled', value: requested, icon: FaXRay, variant: StatVariantEnum.Amber },
        ]}
        className="md:grid-cols-3"
      />
      <Tabs<View> tabs={tabs} active={view} onChange={changeView} />
      {view === 'catalogue' ? (
        <ProcedureTestsTab />
      ) : (
        <>
          <div className="flex flex-wrap items-end gap-3">
            <Input
              className="w-72"
              placeholder="Search patient, MRN or order"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="w-72">
              <Segmented
                options={FILTERS}
                value={filter}
                onChange={(next) => {
                  setFilter(next);
                  if (page !== 1) setPage(1);
                }}
              />
            </div>
          </div>

          {orders.length === 0 ? (
            <EmptyState message="No orders here" icon={FaXRay} />
          ) : (
            <div className="overflow-x-auto rounded-lg border border-line bg-surface-raised">
              <table className="w-full text-left">
                <thead className="border-b border-line bg-surface text-ink-muted">
                  <tr>
                    <th className={TH}>Order</th>
                    <th className={TH}>Patient</th>
                    <th className={TH}>Priority</th>
                    <th className={TH}>Ordered</th>
                    <th className={TH}>Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {orders.map((order) => (
                    <tr
                      key={order.id}
                      onClick={() => setSelected(order)}
                      className="relative cursor-pointer hover:bg-brand-soft/40"
                    >
                      <td className="px-4 py-3 text-sm font-medium text-ink">
                        <span
                          aria-hidden
                          className={`absolute inset-y-0 left-0 w-0.5 ${
                            order.priority === OrderPriorityEnum.ROUTINE || !isOpenOrder(order.status)
                              ? 'bg-line'
                              : 'bg-critical'
                          }`}
                        />
                        <button type="button" onClick={() => setSelected(order)} className="text-left">
                          {order.name}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-sm text-ink">
                        {order.patient ? `${order.patient.firstName} ${order.patient.lastName}` : '—'}
                        <span className="block text-xs text-ink-muted">{order.patient?.mrn}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-ink-muted">{PRIORITY_LABEL[order.priority]}</td>
                      <td className="px-4 py-3 text-xs text-ink-muted">
                        {new Date(order.createdAt).toLocaleString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                        <span className="block">Dr {order.orderedBy?.username}</span>
                      </td>
                      <td className="px-4 py-3">
                        <OrderStatusPill status={order.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <Pagination {...pagination} onPageChange={setPage} label="Order pages" />
            </div>
          )}
        </>
      )}

      <OrderDrawer order={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
