'use client';

import { useMemo, useState } from 'react';
import { FaBoxes, FaPlus } from 'react-icons/fa';
import { toast } from 'sonner';
import { Button, EmptyState, Input, PageHeader, Pill, Stats, Tabs } from '@/components';
import InventoryItemDrawer from '@/components/drawers/inventory-item.drawer';
import { ButtonVariantEnum, ModalDrawerModeEnum, PillVariantEnum, StatVariantEnum } from '@/enum';
import { useInventoryItems, useInventoryStock, useInventoryTransactions, useLowStock, useRoles } from '@/hooks';
import type { ICreateInventoryItemDto, IInventoryItem, IUpdateInventoryItemDto } from '@/interfaces';

type TabId = 'items' | 'stock' | 'low' | 'transactions';

export default function InventoryPage() {
  const [tab, setTab] = useState<TabId>('items');
  const [search, setSearch] = useState('');
  const [drawerMode, setDrawerMode] = useState<ModalDrawerModeEnum | null>(null);
  const [selected, setSelected] = useState<IInventoryItem | null>(null);
  const roles = useRoles();

  const { items, createItem, updateItem, removeItem } = useInventoryItems({ limit: 100 });
  const { stock } = useInventoryStock();
  const { lowStock } = useLowStock();
  const { transactions } = useInventoryTransactions({ limit: 50 });

  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((i) => i.sku.toLowerCase().includes(q) || i.name.toLowerCase().includes(q));
  }, [items, search]);

  const stats = useMemo(
    () => [
      {
        label: 'Active items',
        value: items.filter((i) => i.isActive).length,
        icon: FaBoxes,
        variant: StatVariantEnum.Emerald,
      },
      { label: 'Low stock', value: lowStock.length, icon: FaBoxes, variant: StatVariantEnum.Amber },
      { label: 'Total SKUs', value: items.length, icon: FaBoxes, variant: StatVariantEnum.Blue },
      { label: 'Recent movements', value: transactions.length, icon: FaBoxes, variant: StatVariantEnum.Green },
    ],
    [items, lowStock, transactions],
  );

  const openAdd = () => {
    setSelected(null);
    setDrawerMode(ModalDrawerModeEnum.ADD);
  };
  const openEdit = (i: IInventoryItem) => {
    setSelected(i);
    setDrawerMode(ModalDrawerModeEnum.EDIT);
  };
  const closeDrawer = () => {
    setDrawerMode(null);
    setSelected(null);
  };

  const save = async (payload: ICreateInventoryItemDto | IUpdateInventoryItemDto, id?: string) => {
    if (id) {
      await toast.promise(updateItem(id, payload), {
        loading: 'Saving…',
        success: 'Item updated',
        error: "Couldn't save — retry",
      });
    } else {
      await toast.promise(createItem(payload as ICreateInventoryItemDto), {
        loading: 'Creating…',
        success: 'Item created',
        error: "Couldn't create — retry",
      });
    }
  };

  const remove = async (i: IInventoryItem) => {
    if (!confirm(`Remove ${i.name}?`)) return;
    await toast.promise(removeItem(i.id), {
      loading: 'Removing…',
      success: 'Item removed',
      error: "Couldn't remove — retry",
    });
  };

  const canManage = roles.isAdmin;

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Inventory"
        description="Medications, consumables, and equipment across stores."
        action={
          tab === 'items' && canManage ? (
            <Button type="button" variant={ButtonVariantEnum.PRIMARY} onClick={openAdd}>
              <FaPlus className="text-xs" />
              New item
            </Button>
          ) : undefined
        }
      />

      <Stats items={stats} />

      <Tabs<TabId>
        tabs={[
          { id: 'items', label: 'Items' },
          { id: 'stock', label: 'Stock levels' },
          { id: 'low', label: `Low stock (${lowStock.length})` },
          { id: 'transactions', label: 'Transactions' },
        ]}
        active={tab}
        onChange={setTab}
      />

      {tab === 'items' && (
        <>
          <Input
            className="max-w-sm"
            placeholder="Search SKU / name"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {filteredItems.length === 0 ? (
            <EmptyState
              message="No inventory items yet"
              icon={FaBoxes}
              actionLabel={canManage ? 'Add first item' : undefined}
              onAction={canManage ? openAdd : undefined}
            />
          ) : (
            <div className="overflow-hidden rounded-lg border border-line bg-surface-raised">
              <table className="w-full text-left">
                <thead className="border-b border-line bg-surface text-ink-muted">
                  <tr>
                    <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-wide">SKU</th>
                    <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-wide">Name</th>
                    <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-wide">Type</th>
                    <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-wide">Unit</th>
                    <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-wide">Min</th>
                    <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-wide">Status</th>
                    {canManage && (
                      <th className="px-4 py-2.5 text-right text-xs font-medium uppercase tracking-wide">Actions</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map((i) => (
                    <tr key={i.id} className="border-b border-line last:border-0">
                      <td className="px-4 py-3 font-mono text-xs text-ink">{i.sku}</td>
                      <td className="px-4 py-3 text-sm font-medium text-ink">{i.name}</td>
                      <td className="px-4 py-3 text-sm capitalize text-ink-muted">{i.type}</td>
                      <td className="px-4 py-3 text-sm text-ink-muted">{i.unitOfMeasure}</td>
                      <td className="px-4 py-3 text-sm tabular-nums text-ink-muted">{i.minStockLevel}</td>
                      <td className="px-4 py-3">
                        <Pill variant={i.isActive ? PillVariantEnum.SUCCESS : PillVariantEnum.DEFAULT}>
                          {i.isActive ? 'active' : 'inactive'}
                        </Pill>
                      </td>
                      {canManage && (
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-3">
                            <button
                              type="button"
                              onClick={() => openEdit(i)}
                              className="text-xs font-medium text-brand hover:text-brand-hover"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => remove(i)}
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
          )}
        </>
      )}

      {tab === 'stock' &&
        (stock.length === 0 ? (
          <EmptyState message="No stock records yet" icon={FaBoxes} />
        ) : (
          <div className="overflow-hidden rounded-lg border border-line bg-surface-raised">
            <table className="w-full text-left">
              <thead className="border-b border-line bg-surface text-ink-muted">
                <tr>
                  <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-wide">Store</th>
                  <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-wide">Item</th>
                  <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-wide">Qty</th>
                  <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-wide">Last restock</th>
                </tr>
              </thead>
              <tbody>
                {stock.map((s) => (
                  <tr key={s.id} className="border-b border-line last:border-0">
                    <td className="px-4 py-3 text-sm text-ink">{s.store?.name ?? '—'}</td>
                    <td className="px-4 py-3 text-sm text-ink">{s.item ? `${s.item.name} (${s.item.sku})` : '—'}</td>
                    <td className="px-4 py-3 text-sm tabular-nums text-ink">{s.quantity}</td>
                    <td className="px-4 py-3 text-xs text-ink-muted tabular-nums">
                      {s.lastRestockedAt ? new Date(s.lastRestockedAt).toLocaleDateString() : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}

      {tab === 'low' &&
        (lowStock.length === 0 ? (
          <EmptyState message="No low-stock alerts" icon={FaBoxes} />
        ) : (
          <div className="overflow-hidden rounded-lg border border-line bg-surface-raised">
            <table className="w-full text-left">
              <thead className="border-b border-line bg-surface text-ink-muted">
                <tr>
                  <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-wide">Store</th>
                  <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-wide">Item</th>
                  <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-wide">On hand</th>
                  <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-wide">Min</th>
                </tr>
              </thead>
              <tbody>
                {lowStock.map((s) => (
                  <tr key={s.id} className="border-b border-line last:border-0">
                    <td className="px-4 py-3 text-sm text-ink">{s.store?.name ?? '—'}</td>
                    <td className="px-4 py-3 text-sm text-ink">{s.item ? `${s.item.name} (${s.item.sku})` : '—'}</td>
                    <td className="px-4 py-3 text-sm tabular-nums text-critical">{s.quantity}</td>
                    <td className="px-4 py-3 text-sm tabular-nums text-ink-muted">{s.item?.minStockLevel ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}

      {tab === 'transactions' &&
        (transactions.length === 0 ? (
          <EmptyState message="No transactions yet" icon={FaBoxes} />
        ) : (
          <div className="overflow-hidden rounded-lg border border-line bg-surface-raised">
            <table className="w-full text-left">
              <thead className="border-b border-line bg-surface text-ink-muted">
                <tr>
                  <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-wide">Date</th>
                  <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-wide">Store</th>
                  <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-wide">Item</th>
                  <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-wide">Type</th>
                  <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-wide">Qty</th>
                  <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-wide">Batch</th>
                  <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-wide">Expiry</th>
                  <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-wide">Balance</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t) => {
                  const expired = t.expiryDate ? new Date(t.expiryDate) < new Date() : false;
                  return (
                    <tr key={t.id} className="border-b border-line last:border-0">
                      <td className="px-4 py-3 text-xs text-ink-muted tabular-nums">
                        {new Date(t.createdAt).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-ink">{t.store?.name ?? '—'}</td>
                      <td className="px-4 py-3 text-sm text-ink">{t.item?.name ?? '—'}</td>
                      <td className="px-4 py-3 text-sm capitalize text-ink-muted">{t.type.replaceAll('_', ' ')}</td>
                      <td className="px-4 py-3 text-sm tabular-nums text-ink">{t.quantity}</td>
                      <td className="px-4 py-3 font-mono text-xs text-ink-muted">{t.batchNumber ?? '—'}</td>
                      <td
                        className={`px-4 py-3 text-xs tabular-nums ${expired ? 'font-semibold text-critical' : 'text-ink-muted'}`}
                      >
                        {t.expiryDate ?? '—'}
                      </td>
                      <td className="px-4 py-3 text-sm tabular-nums text-ink">{t.runningBalance}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ))}

      <InventoryItemDrawer mode={drawerMode} item={selected} onClose={closeDrawer} onSave={save} />
    </div>
  );
}
