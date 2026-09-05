import type { IBaseEntity } from './base.interface';
import type {
  DepartmentEnum,
  InventoryItemTypeEnum,
  InventoryStoreTypeEnum,
  InventoryTransactionTypeEnum,
  UnitOfMeasureEnum,
} from '@/enum';
import type { IUser } from './user.interface';

export interface IInventoryStore extends IBaseEntity {
  name: string;
  type: InventoryStoreTypeEnum;
  department?: DepartmentEnum | null;
  isActive: boolean;
}

export interface ICreateInventoryStoreDto {
  name: string;
  type: InventoryStoreTypeEnum;
  department?: DepartmentEnum;
  isActive?: boolean;
}

export type IUpdateInventoryStoreDto = Partial<ICreateInventoryStoreDto>;

export interface IInventoryItem extends IBaseEntity {
  sku: string;
  name: string;
  description?: string | null;
  type: InventoryItemTypeEnum;
  unitOfMeasure: UnitOfMeasureEnum;
  minStockLevel: number;
  reorderLevel: number;
  unitPrice: number;
  manufacturer?: string | null;
  isActive: boolean;
}

export interface ICreateInventoryItemDto {
  sku: string;
  name: string;
  description?: string;
  type: InventoryItemTypeEnum;
  unitOfMeasure: UnitOfMeasureEnum;
  minStockLevel?: number;
  reorderLevel?: number;
  unitPrice?: number;
  manufacturer?: string;
  isActive?: boolean;
}

export type IUpdateInventoryItemDto = Partial<ICreateInventoryItemDto>;

export interface IInventoryItemFilters {
  page?: number;
  limit?: number;
  search?: string;
  type?: InventoryItemTypeEnum;
  isActive?: boolean;
}

export interface IInventoryStock extends IBaseEntity {
  storeId: string;
  store?: IInventoryStore;
  itemId: string;
  item?: IInventoryItem;
  quantity: number;
  lastRestockedAt?: Date | null;
}

export interface IInventoryTransaction extends IBaseEntity {
  storeId: string;
  store?: IInventoryStore;
  itemId: string;
  item?: IInventoryItem;
  type: InventoryTransactionTypeEnum;
  quantity: number;
  runningBalance: number;
  counterpartStoreId?: string | null;
  referenceType?: string | null;
  referenceId?: string | null;
  performedById: string;
  performedBy?: IUser;
  notes?: string | null;
}

export interface ICreateInventoryTransactionDto {
  storeId: string;
  itemId: string;
  type: InventoryTransactionTypeEnum;
  quantity: number;
  counterpartStoreId?: string;
  referenceType?: string;
  referenceId?: string;
  notes?: string;
}

export interface IInventoryTransactionFilters {
  page?: number;
  limit?: number;
  storeId?: string;
  itemId?: string;
  type?: InventoryTransactionTypeEnum;
  performedById?: string;
}
