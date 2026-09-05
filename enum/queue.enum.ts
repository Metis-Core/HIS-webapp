export enum VisitStatusEnum {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no_show',
}

export enum QueueStatusEnum {
  PENDING = 'pending',
  IN_PROGRESS = 'in-progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum QueueStageEnum {
  REGISTRATION = 'registration',
  CONSULTATION = 'consultation',
  EXAMINATION = 'triage',
  LAB = 'lab',
  RADIOLOGY = 'radiology',
  PHARMACY = 'pharmacy',
  SURGERY = 'surgery',
  POSTOPERATIVE = 'postoperative',
  FOLLOWUP = 'follow-up',
  DISCHARGE = 'discharge',
  REFERRAL = 'referral',
  TRANSFER = 'transfer',
}

export enum VisitTypeEnum {
  WALK_IN = 'walk_in',
  APPOINTMENT = 'appointment',
  EMERGENCY = 'emergency',
}

export enum VisitIntentEnum {
  CONSULTATION = 'consultation',
  EXAMINATION = 'triage',
  LAB = 'lab',
  RADIOLOGY = 'radiology',
  PHARMACY = 'pharmacy',
  SURGERY = 'surgery',
  POSTOPERATIVE = 'postoperative',
  FOLLOWUP = 'follow-up',
}

export enum QueueEntryStatusEnum {
  WAITING = 'waiting',
  CALLED = 'called',
  IN_SERVICE = 'in_service',
  COMPLETED = 'completed',
  SKIPPED = 'skipped',
  TRANSFERRED = 'transfered',
}

export enum DepartmentEnum {
  RECEPTION = 'reception',
  TRIAGE = 'triage',
  OUTPATIENT_CLINIC = 'outpatient_clinic',
  INPATIENT_WARD = 'inpatient_ward',
  MAIN_LABORATORY = 'main_laboratory',
  RADIOLOGY = 'radiology',
  MAIN_PHARMACY = 'main_pharmacy',
  FINANCE = 'finance',
  ADMINISTRATION = 'administrator',
}
