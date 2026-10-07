'use client';

import { useMemo, useState } from 'react';
import { FaBoxes, FaExclamationTriangle, FaPlus } from 'react-icons/fa';
import { toast } from 'sonner';
import { Button, Dropdown, EmptyState, Input, PageHeader, Pill, Stats, Tabs } from '@/components';
import InventoryItemDrawer from '@/components/drawers/inventory-item.drawer';
import StockMovementDrawer from '@/components/drawers/stock-movement.drawer';
import {
  ButtonVariantEnum,
  DepartmentEnum,
  InventoryStoreTypeEnum,
  ModalDrawerModeEnum,
  PillVariantEnum,
  StatVariantEnum,
  UserRoleEnum,
} from '@/enum';
import { extractErrorMessage } from '@/helpers/errors';
import { formatStockQuantity } from '@/helpers/inventory.format';
import {
  useInventoryItems,
  useInventoryStock,
  useInventoryStores,
  useInventoryTransactions,
  useLowStock,
  useRoles,
} from '@/hooks';
import type { ICreateInventoryItemDto, IInventoryItem, IOption, IUpdateInventoryItemDto } from '@/interfaces';

type TabId = 'items' | 'stock' | 'low' | 'transactions' | 'stores';

const NEGATIVE_TYPES = new Set(['ISSUE', 'TRANSFER_OUT', 'ADJUSTMENT_OUT', 'DISPOSAL']);

export default function InventoryPage() {
  const [tab, setTab] = useState<TabId>('items');
  const [search, setSearch] = useState('');
  const [drawerMode, setDrawerMode] = useState<ModalDrawerModeEnum | null>(null);
  const [selected, setSelected] = useState<IInventoryItem | null>(null);
  const [stockItem, setStockItem] = useState<IInventoryItem | null>(null);
  const roles = useRoles();

  const { items, createItem, updateItem, removeItem } = useInventoryItems({ limit: 100 });
  const { stock } = useInventoryStock();
  const { lowStock } = useLowStock();
  const { transactions, recordTransaction } = useInventoryTransactions({ limit: 50 });

  const canManage = roles.isAdmin;
  const canAdjustStock = roles.is(
    UserRoleEnum.SUPER_ADMIN,
    UserRoleEnum.ADMIN,
    UserRoleEnum.PHARMACIST,
    UserRoleEnum.LAB_TECH,
  );

  const onHandByItem = useMemo(() => {
    const map = new Map<string, number>();
    stock.forEach((s) => map.set(s.itemId, (map.get(s.itemId) ?? 0) + s.quantity));
    return map;
  }, [stock]);

  const query = search.trim().toLowerCase();
  const matches = (name?: string, sku?: string) =>
    !query || (name ?? '').toLowerCase().includes(query) || (sku ?? '').toLowerCase().includes(query);

  const filteredItems = items.filter((i) => matches(i.name, i.sku));
  const filteredStock = stock.filter((s) => matches(s.item?.name, s.item?.sku));

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
      await toast
        .promise(updateItem(id, payload), {
          loading: 'Saving…',
          success: 'Item updated',
          error: (e) => extractErrorMessage(e, "Couldn't save — retry"),
        })
        .unwrap();
    } else {
      await toast
        .promise(createItem(payload as ICreateInventoryItemDto), {
          loading: 'Creating…',
          success: 'Item created',
          error: (e) => extractErrorMessage(e, "Couldn't create — retry"),
        })
        .unwrap();
    }
  };

  const remove = async (i: IInventoryItem) => {
    if (!confirm(`Remove ${i.name}?`)) return;
    await toast.promise(removeItem(i.id), {
      loading: 'Removing…',
      success: 'Item removed',
      error: (e) => extractErrorMessage(e, "Couldn't remove — retry"),
    });
  };

  const searchBox = (
    <Input
      className="max-w-sm"
      placeholder="Search SKU / name"
      value={search}
      onChange={(e) => setSearch(e.target.value)}
    />
  );

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
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
          { id: 'stores', label: 'Stores' },
        ]}
        active={tab}
        onChange={setTab}
      />

      {tab === 'items' && (
        <>
          {searchBox}
          {filteredItems.length === 0 ? (
            <EmptyState
              message={items.length === 0 ? 'No inventory items yet' : 'No items match your search'}
              icon={FaBoxes}
              actionLabel={canManage && items.length === 0 ? 'Add first item' : undefined}
              onAction={canManage && items.length === 0 ? openAdd : undefined}
            />
          ) : (
            <div className="overflow-hidden rounded-lg border border-line bg-surface-raised">
              <table className="w-full text-left">
                <thead className="border-b border-line bg-surface text-ink-muted">
                  <tr>
                    <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-wide">SKU</th>
                    <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-wide">Name</th>
                    <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-wide">Type</th>
                    <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-wide">On hand</th>
                    <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-wide">Pack</th>
                    <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-wide">Reorder at</th>
                    <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-wide">Status</th>
                    {(canManage || canAdjustStock) && (
                      <th className="px-4 py-2.5 text-right text-xs font-medium uppercase tracking-wide">Actions</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map((i) => {
                    const onHand = onHandByItem.get(i.id) ?? 0;
                    const low = i.isActive && onHand <= i.minStockLevel;
                    return (
                      <tr key={i.id} className="border-b border-line last:border-0">
                        <td className="px-4 py-3 font-mono text-xs text-ink">{i.sku}</td>
                        <td className="px-4 py-3 text-sm font-medium text-ink">{i.name}</td>
                        <td className="px-4 py-3 text-sm capitalize text-ink-muted">{i.type}</td>
                        <td className="px-4 py-3 text-sm tabular-nums text-ink">
                          {low ? (
                            <Pill variant={PillVariantEnum.WARNING} icon={<FaExclamationTriangle aria-hidden />}>
                              {formatStockQuantity(onHand, i)}
                            </Pill>
                          ) : (
                            formatStockQuantity(onHand, i)
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-ink-muted">
                          {i.packSize > 1 ? `${i.packSize} ${i.unitOfMeasure} / ${i.packUnit}` : i.unitOfMeasure}
                        </td>
                        <td className="px-4 py-3 text-sm tabular-nums text-ink-muted">{i.minStockLevel}</td>
                        <td className="px-4 py-3">
                          <Pill variant={i.isActive ? PillVariantEnum.SUCCESS : PillVariantEnum.DEFAULT}>
                            {i.isActive ? 'active' : 'inactive'}
                          </Pill>
                        </td>
                        {(canManage || canAdjustStock) && (
                          <td className="px-4 py-3 text-right">
                            <div className="flex justify-end gap-3">
                              {canAdjustStock && (
                                <button
                                  type="button"
                                  onClick={() => setStockItem(i)}
                                  className="text-xs font-medium text-primary hover:text-primary-hover"
                                >
                                  Add / adjust stock
                                </button>
                              )}
                              {canManage && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => openEdit(i)}
                                    className="text-xs font-medium text-primary hover:text-primary-hover"
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
                                </>
                              )}
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {tab === 'stock' && (
        <>
          {searchBox}
          {filteredStock.length === 0 ? (
            <EmptyState
              message={stock.length === 0 ? 'No stock yet — receive stock from the Items tab' : 'No stock matches'}
              icon={FaBoxes}
            />
          ) : (
            <div className="overflow-hidden rounded-lg border border-line bg-surface-raised">
              <table className="w-full text-left">
                <thead className="border-b border-line bg-surface text-ink-muted">
                  <tr>
                    <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-wide">Store</th>
                    <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-wide">Item</th>
                    <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-wide">Available</th>
                    <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-wide">Reorder at</th>
                    <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-wide">Last restock</th>
                    {canAdjustStock && <th className="px-4 py-2.5" />}
                  </tr>
                </thead>
                <tbody>
                  {filteredStock.map((s) => {
                    const low = s.item != null && s.quantity <= s.item.minStockLevel;
                    return (
                      <tr key={s.id} className="border-b border-line last:border-0">
                        <td className="px-4 py-3 text-sm text-ink">{s.store?.name ?? '—'}</td>
                        <td className="px-4 py-3 text-sm text-ink">
                          {s.item ? `${s.item.name} (${s.item.sku})` : '—'}
                        </td>
                        <td className="px-4 py-3 text-sm tabular-nums text-ink">
                          {low ? (
                            <Pill variant={PillVariantEnum.WARNING} icon={<FaExclamationTriangle aria-hidden />}>
                              {formatStockQuantity(s.quantity, s.item)} · {s.quantity === 0 ? 'out' : 'low'}
                            </Pill>
                          ) : (
                            formatStockQuantity(s.quantity, s.item)
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm tabular-nums text-ink-muted">
                          {s.item?.minStockLevel ?? '—'}
                        </td>
                        <td className="px-4 py-3 text-xs text-ink-muted tabular-nums">
                          {s.lastRestockedAt ? new Date(s.lastRestockedAt).toLocaleDateString() : '—'}
                        </td>
                        {canAdjustStock && (
                          <td className="px-4 py-3 text-right">
                            {s.item && (
                              <button
                                type="button"
                                onClick={() => setStockItem(s.item!)}
                                className="text-xs font-medium text-primary hover:text-primary-hover"
                              >
                                Add / adjust
                              </button>
                            )}
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

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
                  <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-wide">Reorder at</th>
                  {canAdjustStock && <th className="px-4 py-2.5" />}
                </tr>
              </thead>
              <tbody>
                {lowStock.map((s) => (
                  <tr key={s.id} className="border-b border-line last:border-0">
                    <td className="px-4 py-3 text-sm text-ink">{s.store?.name ?? '—'}</td>
                    <td className="px-4 py-3 text-sm text-ink">{s.item ? `${s.item.name} (${s.item.sku})` : '—'}</td>
                    <td className="px-4 py-3 text-sm tabular-nums text-critical">
                      {formatStockQuantity(s.quantity, s.item)}
                    </td>
                    <td className="px-4 py-3 text-sm tabular-nums text-ink-muted">{s.item?.minStockLevel ?? '—'}</td>
                    {canAdjustStock && (
                      <td className="px-4 py-3 text-right">
                        {s.item && (
                          <button
                            type="button"
                            onClick={() => setStockItem(s.item!)}
                            className="text-xs font-medium text-primary hover:text-primary-hover"
                          >
                            Restock
                          </button>
                        )}
                      </td>
                    )}
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
                  const negative = NEGATIVE_TYPES.has(t.type);
                  return (
                    <tr key={t.id} className="border-b border-line last:border-0">
                      <td className="px-4 py-3 text-xs text-ink-muted tabular-nums">
                        {new Date(t.createdAt).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-ink">{t.store?.name ?? '—'}</td>
                      <td className="px-4 py-3 text-sm text-ink">{t.item?.name ?? '—'}</td>
                      <td className="px-4 py-3 text-sm capitalize text-ink-muted">
                        {t.type.replaceAll('_', ' ').toLowerCase()}
                      </td>
                      <td className={`px-4 py-3 text-sm tabular-nums ${negative ? 'text-critical' : 'text-ink'}`}>
                        {negative ? '−' : '+'}
                        {t.quantity}
                      </td>
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

      {tab === 'stores' && <StoresPanel canManage={canManage} />}

      <InventoryItemDrawer mode={drawerMode} item={selected} onClose={closeDrawer} onSave={save} />
      <StockMovementDrawer
        item={stockItem}
        stock={stock.filter((s) => s.itemId === stockItem?.id)}
        onClose={() => setStockItem(null)}
        onSubmit={recordTransaction}
      />
    </div>
  );
}

const storeTypeOptions: IOption[] = Object.values(InventoryStoreTypeEnum).map((v) => ({ label: v, value: v }));
const departmentOptions: IOption[] = [
  { label: 'None', value: '' },
  ...Object.values(DepartmentEnum).map((v) => ({ label: v.replaceAll('_', ' '), value: v })),
];

function StoresPanel({ canManage }: { canManage: boolean }) {
  const { stores, createStore, updateStore } = useInventoryStores();
  const [name, setName] = useState('');
  const [type, setType] = useState<InventoryStoreTypeEnum>(InventoryStoreTypeEnum.DEPARTMENT);
  const [department, setDepartment] = useState('');

  const add = async () => {
    if (!name.trim()) {
      toast.error('Store name is required');
      return;
    }
    await toast
      .promise(
        createStore({
          name: name.trim(),
          type,
          department: (department || undefined) as DepartmentEnum | undefined,
        }),
        {
          loading: 'Creating store…',
          success: 'Store created',
          error: (e) => extractErrorMessage(e, "Couldn't create store — retry"),
        },
      )
      .unwrap();
    setName('');
    setDepartment('');
  };

  const toggle = async (id: string, isActive: boolean) => {
    await toast.promise(updateStore(id, { isActive: !isActive }), {
      loading: 'Saving…',
      success: isActive ? 'Store deactivated' : 'Store activated',
      error: (e) => extractErrorMessage(e, "Couldn't update store — retry"),
    });
  };

  return (
    <div className="flex flex-col gap-4">
      {canManage && (
        <form
          className="grid grid-cols-1 items-end gap-3 rounded-lg border border-line bg-surface-raised p-4 md:grid-cols-4"
          onSubmit={(e) => {
            e.preventDefault();
            add().catch(() => undefined);
          }}
        >
          <Input
            label="Store name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Main Pharmacy"
          />
          <Dropdown
            label="Type"
            options={storeTypeOptions}
            value={storeTypeOptions.find((o) => o.value === type) ?? null}
            onChange={(o) => setType((o as IOption).value as InventoryStoreTypeEnum)}
          />
          <Dropdown
            label="Department (pharmacy dispenses from main pharmacy)"
            options={departmentOptions}
            value={departmentOptions.find((o) => o.value === department) ?? null}
            onChange={(o) => setDepartment((o as IOption).value as string)}
          />
          <Button type="submit" variant={ButtonVariantEnum.PRIMARY}>
            <FaPlus className="text-xs" />
            Add store
          </Button>
        </form>
      )}

      {stores.length === 0 ? (
        <EmptyState message="No stores yet" icon={FaBoxes} />
      ) : (
        <div className="overflow-hidden rounded-lg border border-line bg-surface-raised">
          <table className="w-full text-left">
            <thead className="border-b border-line bg-surface text-ink-muted">
              <tr>
                <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-wide">Name</th>
                <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-wide">Type</th>
                <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-wide">Department</th>
                <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-wide">Status</th>
                {canManage && <th className="px-4 py-2.5" />}
              </tr>
            </thead>
            <tbody>
              {stores.map((s) => (
                <tr key={s.id} className="border-b border-line last:border-0">
                  <td className="px-4 py-3 text-sm font-medium text-ink">{s.name}</td>
                  <td className="px-4 py-3 text-sm text-ink-muted">{s.type}</td>
                  <td className="px-4 py-3 text-sm capitalize text-ink-muted">
                    {s.department ? s.department.replaceAll('_', ' ') : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <Pill variant={s.isActive ? PillVariantEnum.SUCCESS : PillVariantEnum.DEFAULT}>
                      {s.isActive ? 'active' : 'inactive'}
                    </Pill>
                  </td>
                  {canManage && (
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => toggle(s.id, s.isActive)}
                        className="text-xs font-medium text-primary hover:text-primary-hover"
                      >
                        {s.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
