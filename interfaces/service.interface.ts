import type { ModalDrawerModeEnum } from '@/enum';
import type { IBaseEntity } from '.';

export interface IService extends IBaseEntity {
  name: string;
  fee: number;
  description?: string | null;
  isActive: boolean;
}

export type ServiceFormValues = {
  name: string;
  fee: string;
  description: string;
  isActive: boolean;
};

export interface IServiceDrawerProps {
  mode: ModalDrawerModeEnum | null;
  service: IService | null;
  onClose: () => void;
  onSave: (values: ServiceFormValues) => void;
  onEdit: (service: IService) => void;
}
