export enum InventoryEndpointEnum {
  ITEMS = '/inventory/items',
  STORES = '/inventory/stores',
  STORES_ACTIVE = '/inventory/stores/active',
  STOCK = '/inventory/stock',
  STOCK_LOW = '/inventory/stock/low',
  TRANSACTIONS = '/inventory/transactions',
}

export enum InventoryItemTypeEnum {
  MEDICATION = 'medication',
  CONSUMABLE = 'consumable',
  REAGENT = 'reagent',
  EQUIPMENT = 'equipment',
  OTHER = 'other',
}

export enum InventoryStoreTypeEnum {
  GENERAL = 'GENERAL',
  DEPARTMENT = 'DEPARTMENT',
}

export enum InventoryTransactionTypeEnum {
  RECEIPT = 'RECEIPT',
  ISSUE = 'ISSUE',
  TRANSFER_OUT = 'TRANSFER_OUT',
  TRANSFER_IN = 'TRANSFER_IN',
  ADJUSTMENT_IN = 'ADJUSTMENT_IN',
  ADJUSTMENT_OUT = 'ADJUSTMENT_OUT',
  RETURN = 'RETURN',
  DISPOSAL = 'DISPOSAL',
}

export enum UnitOfMeasureEnum {
  PCS = 'PCS',
  BOX = 'BOX',
  PACK = 'PACK',
  CARTON = 'CARTON',
  ROLL = 'ROLL',
  PAIR = 'PAIR',
  SET = 'SET',
  KG = 'KG',
  LITRE = 'LITRE',
  OTHER = 'OTHER',
}
