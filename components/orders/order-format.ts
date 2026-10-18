import type { IconType } from 'react-icons';
import {
  FaBan,
  FaCalendarAlt,
  FaCheckCircle,
  FaClock,
  FaExclamationCircle,
  FaExclamationTriangle,
  FaPlayCircle,
} from 'react-icons/fa';
import {
  LabResultFlagEnum,
  OrderKindEnum,
  OrderPriorityEnum,
  OrderStatusEnum,
  PillVariantEnum,
  ProcedureCategoryEnum,
  ResultClassificationEnum,
} from '@/enum';
import { isCriticalFlag, rangeFor } from '@/helpers/lab-results';
import type { ILabResultData, ILabResultField, ILabResultFlags, IPatient } from '@/interfaces';

export const KIND_LABEL: Record<OrderKindEnum, string> = {
  [OrderKindEnum.RADIOLOGY]: 'Radiology',
  [OrderKindEnum.SURGERY]: 'Surgery and procedures',
};

export const STATUS_LABEL: Record<OrderStatusEnum, string> = {
  [OrderStatusEnum.REQUESTED]: 'Requested',
  [OrderStatusEnum.SCHEDULED]: 'Scheduled',
  [OrderStatusEnum.IN_PROGRESS]: 'In progress',
  [OrderStatusEnum.COMPLETED]: 'Completed',
  [OrderStatusEnum.CANCELLED]: 'Cancelled',
};

export const STATUS_VARIANT: Record<OrderStatusEnum, PillVariantEnum> = {
  [OrderStatusEnum.REQUESTED]: PillVariantEnum.WARNING,
  [OrderStatusEnum.SCHEDULED]: PillVariantEnum.INFO,
  [OrderStatusEnum.IN_PROGRESS]: PillVariantEnum.INFO,
  [OrderStatusEnum.COMPLETED]: PillVariantEnum.SUCCESS,
  [OrderStatusEnum.CANCELLED]: PillVariantEnum.DEFAULT,
};

export const STATUS_ICON: Record<OrderStatusEnum, IconType> = {
  [OrderStatusEnum.REQUESTED]: FaClock,
  [OrderStatusEnum.SCHEDULED]: FaCalendarAlt,
  [OrderStatusEnum.IN_PROGRESS]: FaPlayCircle,
  [OrderStatusEnum.COMPLETED]: FaCheckCircle,
  [OrderStatusEnum.CANCELLED]: FaBan,
};

export const PRIORITY_LABEL: Record<OrderPriorityEnum, string> = {
  [OrderPriorityEnum.ROUTINE]: 'Routine',
  [OrderPriorityEnum.URGENT]: 'Urgent',
  [OrderPriorityEnum.EMERGENCY]: 'Emergency',
};

export const OPEN_ORDER_STATUSES = [OrderStatusEnum.REQUESTED, OrderStatusEnum.SCHEDULED, OrderStatusEnum.IN_PROGRESS];

export const isOpenOrder = (status: OrderStatusEnum) => OPEN_ORDER_STATUSES.includes(status);

export const CATEGORY_LABEL: Record<ProcedureCategoryEnum, string> = {
  [ProcedureCategoryEnum.XRAY]: 'X-ray',
  [ProcedureCategoryEnum.ULTRASOUND]: 'Ultrasound',
  [ProcedureCategoryEnum.ECG]: 'ECG',
  [ProcedureCategoryEnum.ECHO]: 'Echocardiogram',
  [ProcedureCategoryEnum.CT]: 'CT scan',
  [ProcedureCategoryEnum.MRI]: 'MRI',
  [ProcedureCategoryEnum.MINOR_PROCEDURE]: 'Minor procedure',
  [ProcedureCategoryEnum.MINOR_SURGERY]: 'Minor surgery',
  [ProcedureCategoryEnum.MAJOR_SURGERY]: 'Major surgery',
  [ProcedureCategoryEnum.OTHER]: 'Other',
};

export const CATEGORIES_BY_KIND: Record<OrderKindEnum, ProcedureCategoryEnum[]> = {
  [OrderKindEnum.RADIOLOGY]: [
    ProcedureCategoryEnum.XRAY,
    ProcedureCategoryEnum.ULTRASOUND,
    ProcedureCategoryEnum.ECG,
    ProcedureCategoryEnum.ECHO,
    ProcedureCategoryEnum.CT,
    ProcedureCategoryEnum.MRI,
    ProcedureCategoryEnum.OTHER,
  ],
  [OrderKindEnum.SURGERY]: [
    ProcedureCategoryEnum.MINOR_PROCEDURE,
    ProcedureCategoryEnum.MINOR_SURGERY,
    ProcedureCategoryEnum.MAJOR_SURGERY,
    ProcedureCategoryEnum.OTHER,
  ],
};

export const CLASSIFICATION_LABEL: Record<ResultClassificationEnum, string> = {
  [ResultClassificationEnum.NORMAL]: 'Normal',
  [ResultClassificationEnum.ABNORMAL]: 'Abnormal',
  [ResultClassificationEnum.CRITICAL]: 'Critical',
};

export const CLASSIFICATION_VARIANT: Record<ResultClassificationEnum, PillVariantEnum> = {
  [ResultClassificationEnum.NORMAL]: PillVariantEnum.SUCCESS,
  [ResultClassificationEnum.ABNORMAL]: PillVariantEnum.WARNING,
  [ResultClassificationEnum.CRITICAL]: PillVariantEnum.DANGER,
};

export const CLASSIFICATION_ICON: Record<ResultClassificationEnum, IconType> = {
  [ResultClassificationEnum.NORMAL]: FaCheckCircle,
  [ResultClassificationEnum.ABNORMAL]: FaExclamationTriangle,
  [ResultClassificationEnum.CRITICAL]: FaExclamationCircle,
};

/** Mirrors the API's flagging closely enough to pre-select a classification while the form is filled in. */
export function previewFlags(
  fields: ILabResultField[],
  data: ILabResultData,
  patient?: Pick<IPatient, 'gender' | 'dateOfBirth'>,
): ILabResultFlags {
  const flags: ILabResultFlags = {};
  fields.forEach((field) => {
    const value = data[field.key];
    if (value === undefined || value === '') return;
    if (typeof value === 'number') {
      const range = rangeFor(field, patient);
      if (!range) return;
      if (range.criticalLow !== undefined && value < range.criticalLow)
        flags[field.key] = LabResultFlagEnum.CRITICAL_LOW;
      else if (range.criticalHigh !== undefined && value > range.criticalHigh)
        flags[field.key] = LabResultFlagEnum.CRITICAL_HIGH;
      else if (range.low !== undefined && value < range.low) flags[field.key] = LabResultFlagEnum.LOW;
      else if (range.high !== undefined && value > range.high) flags[field.key] = LabResultFlagEnum.HIGH;
      return;
    }
    if (field.normalValues?.length && !field.normalValues.includes(String(value)))
      flags[field.key] = LabResultFlagEnum.ABNORMAL;
  });
  return flags;
}

export function suggestClassification(flags: ILabResultFlags): ResultClassificationEnum {
  const values = Object.values(flags);
  if (values.some((flag) => isCriticalFlag(flag))) return ResultClassificationEnum.CRITICAL;
  return values.length > 0 ? ResultClassificationEnum.ABNORMAL : ResultClassificationEnum.NORMAL;
}
