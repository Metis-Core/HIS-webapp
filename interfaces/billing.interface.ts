import type { IBaseEntity } from './base.interface';
import type { ChargeSourceEnum, ChargeStatusEnum } from '@/enum/billing.enum';

export interface IVisitCharge extends IBaseEntity {
  visitId: string;
  source: ChargeSourceEnum;
  referenceId: string | null;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  status: ChargeStatusEnum;
  addedById: string | null;
}

export interface IVisitBill {
  items: IVisitCharge[];
  total: number;
  outstanding: number;
}

export interface ICreateVisitChargeDto {
  visitId: string;
  serviceId?: string;
  description?: string;
  unitPrice?: number;
  quantity?: number;
}
