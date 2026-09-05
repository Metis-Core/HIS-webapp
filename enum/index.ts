export enum ButtonVariantEnum {
  PRIMARY = 'primary',
  SECONDARY = 'secondary',
  DANGER = 'danger',
  GHOST = 'ghost',
}

export enum PillVariantEnum {
  DEFAULT = 'default',
  SUCCESS = 'success',
  WARNING = 'warning',
  DANGER = 'danger',
  INFO = 'info',
}

export enum GenderEnum {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
}

export enum ModalDrawerModeEnum {
  ADD = 'add',
  EDIT = 'edit',
  VIEW = 'view',
}

export { StatVariantEnum } from './stat.enum';
export { UserRoleEnum, UserEndpointEnum, UserStatusEnum, UserGenderEnum, DepartmentEnum } from './user.enum';
export { AuthEndpointEnum, AuthCookieEnum, JwtTokenTypeEnum, AuthErrorCodeEnum, AuthStatusEnum } from './auth.enum';
export {
  PatientTypeEnum,
  PatientStatusEnum,
  PatientMaritalStatusEnum,
  PatientBloodTypeEnum,
  PatientGenderEnum,
} from './patient.enum';
export {
  QueueStatusEnum,
  QueueStageEnum,
  VisitTypeEnum,
  VisitIntentEnum,
  VisitStatusEnum,
  QueueEntryStatusEnum,
} from './queue.enum';
export {
  ConsultationEndpointEnum,
  ConsultationStatusEnum,
  ConsultationTypeEnum,
  ConsultationSortByEnum,
} from './consultation.enum';
export {
  TriageEndpointEnum,
  TriageAcuityEnum,
  TriageStatusEnum,
  ConsciousnessLevelEnum,
  TriageSortByEnum,
} from './triage.enum';
export { ServiceEndpointEnum, PatientEndpointEnum, VisitEndpointEnum, OtpEndpointEnum } from './endpoints.enum';
export { SortOrderEnum } from './common.enum';
export {
  NotificationEndpointEnum,
  NotificationTypeEnum,
  NotificationChannelEnum,
  NotificationStatusEnum,
  NotificationPriorityEnum,
} from './notification.enum';
export {
  LabEndpointEnum,
  LabTestTypeEnum,
  LabTestCategoryEnum,
  LabSampleTypeEnum,
  LabOrderStatusEnum,
  LabOrderItemStatusEnum,
  LabPriorityEnum,
} from './lab.enum';
export {
  InventoryEndpointEnum,
  InventoryItemTypeEnum,
  InventoryStoreTypeEnum,
  InventoryTransactionTypeEnum,
  UnitOfMeasureEnum,
} from './inventory.enum';
export { PharmacyEndpointEnum, PrescriptionStatusEnum, PrescriptionItemStatusEnum } from './pharmacy.enum';
