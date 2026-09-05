import { api } from './axios';
import { CrudService, buildQuery } from './crud.service';
import { InventoryEndpointEnum } from '@/enum';
import type {
  ICreateInventoryItemDto,
  ICreateInventoryStoreDto,
  ICreateInventoryTransactionDto,
  IInventoryItem,
  IInventoryItemFilters,
  IInventoryStock,
  IInventoryStore,
  IInventoryTransaction,
  IInventoryTransactionFilters,
  IPagination,
  IUpdateInventoryItemDto,
  IUpdateInventoryStoreDto,
} from '@/interfaces';

class InventoryItemsService extends CrudService<
  IInventoryItem,
  ICreateInventoryItemDto,
  IUpdateInventoryItemDto,
  IInventoryItemFilters
> {
  constructor() {
    super(InventoryEndpointEnum.ITEMS);
  }
}

class InventoryStoresService extends CrudService<IInventoryStore, ICreateInventoryStoreDto, IUpdateInventoryStoreDto> {
  constructor() {
    super(InventoryEndpointEnum.STORES);
  }

  async listActive(): Promise<IInventoryStore[]> {
    const { data } = await api.get<IInventoryStore[]>(InventoryEndpointEnum.STORES_ACTIVE);
    return data;
  }
}

class InventoryStockService {
  buildStockUrl(storeId?: string): string {
    return `${InventoryEndpointEnum.STOCK}${buildQuery({ storeId })}`;
  }

  async listStock(storeId?: string): Promise<IInventoryStock[]> {
    const { data } = await api.get<IInventoryStock[]>(this.buildStockUrl(storeId));
    return data;
  }

  async listLowStock(): Promise<IInventoryStock[]> {
    const { data } = await api.get<IInventoryStock[]>(InventoryEndpointEnum.STOCK_LOW);
    return data;
  }

  async getStock(storeId: string, itemId: string): Promise<IInventoryStock> {
    const { data } = await api.get<IInventoryStock>(`${InventoryEndpointEnum.STOCK}/${storeId}/${itemId}`);
    return data;
  }

  buildTransactionsUrl(filters?: IInventoryTransactionFilters): string {
    return `${InventoryEndpointEnum.TRANSACTIONS}${buildQuery(filters as Record<string, unknown>)}`;
  }

  async listTransactions(filters?: IInventoryTransactionFilters): Promise<IPagination<IInventoryTransaction>> {
    const { data } = await api.get<IPagination<IInventoryTransaction>>(this.buildTransactionsUrl(filters));
    return data;
  }

  async recordTransaction(dto: ICreateInventoryTransactionDto): Promise<IInventoryTransaction> {
    const { data } = await api.post<IInventoryTransaction>(InventoryEndpointEnum.TRANSACTIONS, dto);
    return data;
  }
}

const inventoryItemsService = new InventoryItemsService();
const inventoryStoresService = new InventoryStoresService();
const inventoryStockService = new InventoryStockService();

export { inventoryItemsService, inventoryStoresService, inventoryStockService };
