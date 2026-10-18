'use client';

import useSWR, { useSWRConfig } from 'swr';
import { InventoryEndpointEnum } from '@/enum';
import { inventoryItemsService, inventoryStockService, inventoryStoresService } from '@/helpers/inventory.service';
import type {
  ICreateInventoryItemDto,
  ICreateInventoryStoreDto,
  ICreateInventoryTransactionDto,
  IInventoryItem,
  IInventoryItemFilters,
  IInventoryStock,
  IInventoryStockFilters,
  IInventoryStore,
  IInventoryTransaction,
  IInventoryTransactionFilters,
  IPageQuery,
  IPagination,
  IUpdateInventoryItemDto,
  IUpdateInventoryStoreDto,
} from '@/interfaces';
import { pageInfo } from '@/helpers/pagination';

const isInventoryKey = (key: unknown) => typeof key === 'string' && key.startsWith('/inventory');

export function useInventoryItems(filters: IInventoryItemFilters = {}) {
  const { mutate } = useSWRConfig();
  const url = inventoryItemsService.buildListUrl(filters);

  const { data, error, isLoading } = useSWR<IPagination<IInventoryItem>>(url, { keepPreviousData: true });
  const invalidate = () => mutate(isInventoryKey);

  const createItem = async (dto: ICreateInventoryItemDto) => {
    const item = await inventoryItemsService.create(dto);
    await invalidate();
    return item;
  };

  const updateItem = async (id: string, dto: IUpdateInventoryItemDto) => {
    const item = await inventoryItemsService.update(id, dto);
    await invalidate();
    return item;
  };

  const removeItem = async (id: string) => {
    await inventoryItemsService.remove(id);
    await invalidate();
  };

  return {
    items: data?.items ?? [],
    total: data?.total ?? 0,
    pagination: pageInfo(data, filters.limit),
    isLoading,
    error,
    createItem,
    updateItem,
    removeItem,
  };
}

export function useInventoryItem(id: string | null | undefined) {
  const key = id ? `${InventoryEndpointEnum.ITEMS}/${id}` : null;
  const { data, error, isLoading, mutate } = useSWR<IInventoryItem>(key);
  return { item: data, isLoading, error, mutate };
}

export function useInventoryStores(query: IPageQuery = {}) {
  const { mutate } = useSWRConfig();
  const url = inventoryStoresService.buildListUrl(query);

  const { data, error, isLoading } = useSWR<IPagination<IInventoryStore>>(url, { keepPreviousData: true });
  const invalidate = () => mutate(isInventoryKey);

  const stores = data?.items ?? [];

  const createStore = async (dto: ICreateInventoryStoreDto) => {
    const store = await inventoryStoresService.create(dto);
    await invalidate();
    return store;
  };

  const updateStore = async (id: string, dto: IUpdateInventoryStoreDto) => {
    const store = await inventoryStoresService.update(id, dto);
    await invalidate();
    return store;
  };

  const removeStore = async (id: string) => {
    await inventoryStoresService.remove(id);
    await invalidate();
  };

  return {
    stores,
    pagination: pageInfo(data, query.limit),
    isLoading,
    error,
    createStore,
    updateStore,
    removeStore,
  };
}

export function useActiveInventoryStores() {
  const { data, error, isLoading, mutate } = useSWR<IInventoryStore[]>(InventoryEndpointEnum.STORES_ACTIVE);
  return { stores: data ?? [], isLoading, error, mutate };
}

/** Paged stock rows. Pass `enabled: false` to wait (e.g. until the rows on screen are known). */
export function useInventoryStock(
  filters: IInventoryStockFilters = {},
  { enabled = true }: { enabled?: boolean } = {},
) {
  const url = enabled ? inventoryStockService.buildStockUrl(filters) : null;
  const { data, error, isLoading, mutate } = useSWR<IPagination<IInventoryStock>>(url, { keepPreviousData: true });
  return { stock: data?.items ?? [], pagination: pageInfo(data, filters.limit), isLoading, error, mutate };
}

export function useLowStock(query: IPageQuery = {}) {
  const url = inventoryStockService.buildLowStockUrl(query);
  const { data, error, isLoading, mutate } = useSWR<IPagination<IInventoryStock>>(url, { keepPreviousData: true });
  return { lowStock: data?.items ?? [], pagination: pageInfo(data, query.limit), isLoading, error, mutate };
}

export function useInventoryTransactions(filters: IInventoryTransactionFilters = {}) {
  const { mutate } = useSWRConfig();
  const url = inventoryStockService.buildTransactionsUrl(filters);

  const { data, error, isLoading } = useSWR<IPagination<IInventoryTransaction>>(url, { keepPreviousData: true });

  const recordTransaction = async (dto: ICreateInventoryTransactionDto) => {
    const txn = await inventoryStockService.recordTransaction(dto);
    await mutate(isInventoryKey);
    return txn;
  };

  return {
    transactions: data?.items ?? [],
    total: data?.total ?? 0,
    pagination: pageInfo(data, filters.limit),
    isLoading,
    error,
    recordTransaction,
  };
}
