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
  RECEPTION = 'reception',
  CONSULTATION = 'consultation',
  EXAMINATION = 'triage',
  LAB = 'lab',
  RADIOLOGY = 'radiology',
  DENTAL = 'dental',
  ANTENATAL = 'antenatal',
  PHARMACY = 'pharmacy',
  SURGERY = 'surgery',
  POSTOPERATIVE = 'postoperative',
  FOLLOWUP = 'follow-up',
  BILLING = 'billing',
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
  DENTAL = 'dental',
  ANTENATAL = 'antenatal',
  PHARMACY = 'pharmacy',
  SURGERY = 'surgery',
  POSTOPERATIVE = 'postoperative',
  FOLLOWUP = 'follow-up',
  BILLING = 'billing',
  ADMISSION = 'admission',
}

/** Emergency triage colour (matches the API): red = immediate, yellow = urgent, green = can wait. */
export enum TriageCategoryEnum {
  RED = 'red',
  YELLOW = 'yellow',
  GREEN = 'green',
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
  DENTAL = 'dental',
  ANTENATAL = 'antenatal',
  MAIN_PHARMACY = 'main_pharmacy',
  FINANCE = 'finance',
  ADMINISTRATION = 'administrator',
}
