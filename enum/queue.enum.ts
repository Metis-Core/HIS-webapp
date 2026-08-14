export enum QueueStatusEnum {
  PENDING = 'pending',
  IN_PROGRESS = 'in-progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum QueueStageEnum {
  REGISTRATION = 'registration',
  CONSULTATION = 'consultation',
  EXAMINATION = 'examination',
  LAB = 'lab',
  RADIOLOGY = 'radiology',
  PHARMACY = 'pharmacy',
  SURGERY = 'surgery',
  POSTOPERATIVE = 'postoperative',
  DISCHARGE = 'discharge',
  FOLLOWUP = 'follow-up',
  REFERRAL = 'referral',
  TRANSFER = 'transfer',
}

export enum QueueEntryStatusEnum {
  WAITING = 'WAITING',
  CALLED = 'CALLED',
  IN_SERVICE = 'IN_SERVICE',
  COMPLETED = 'COMPLETED',
  SKIPPED = 'SKIPPED',
  TRANSFERRED = 'TRANSFERRED',
}

export enum VisitStatusEnum {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  NO_SHOW = 'NO_SHOW',
}

export enum VisitTypeEnum {
  WALK_IN = 'WALK_IN',
  APPOINTMENT = 'APPOINTMENT',
  EMERGENCY = 'EMERGENCY',
}
