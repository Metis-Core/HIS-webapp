import type { IBaseEntity } from './base.interface';

export interface IContact extends IBaseEntity {
  name: string;
  phone: string;
  relationship?: string | null;
  patientId: string;
}

export interface ICreateContactDto {
  name: string;
  phone: string;
  relationship?: string;
}

export interface IUpdateContactDto {
  name?: string;
  phone?: string;
  relationship?: string | null;
}
