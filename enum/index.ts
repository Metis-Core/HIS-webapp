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
export { UserRoleEnum, UserStatusEnum, UserGenderEnum, DepartmentEnum } from './user.enum';
export { AuthEndpointEnum, AuthCookieEnum, JwtTokenTypeEnum, AuthErrorCodeEnum, AuthStatusEnum } from './auth.enum';
export { PatientStatusEnum, PatientTypeEnum, PatientMaritalStatusEnum, PatientBloodTypeEnum } from './patient.enum';
export { QueueEntryStatusEnum, VisitStatusEnum, VisitTypeEnum } from './queue.enum';
export { TriageAcuityEnum, TriageStatusEnum, ConsciousnessLevelEnum } from './triage.enum';
export { ConsultationStatusEnum, ConsultationTypeEnum } from './consultation.enum';
export {
  UserEndpointEnum,
  PatientEndpointEnum,
  QueueEndpointEnum,
  TriageEndpointEnum,
  ConsultationEndpointEnum,
} from './endpoints.enum';
