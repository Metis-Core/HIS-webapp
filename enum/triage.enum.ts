export enum TriageEndpointEnum {
  BASE = '/triage',
  QUEUE = '/triage/queue',
  BY_PATIENT = '/triage/patient',
}

export enum TriageAcuityEnum {
  LEVEL_1 = 'LEVEL_1',
  LEVEL_2 = 'LEVEL_2',
  LEVEL_3 = 'LEVEL_3',
  LEVEL_4 = 'LEVEL_4',
  LEVEL_5 = 'LEVEL_5',
}

export enum TriageStatusEnum {
  WAITING = 'WAITING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  REFERRED = 'REFERRED',
  LEFT_WITHOUT_BEING_SEEN = 'LEFT_WITHOUT_BEING_SEEN',
  CANCELLED = 'CANCELLED',
}

export enum ConsciousnessLevelEnum {
  ALERT = 'ALERT',
  VOICE = 'VOICE',
  PAIN = 'PAIN',
  UNRESPONSIVE = 'UNRESPONSIVE',
  UNKNOWN = 'UNKNOWN',
}

export enum TriageSortByEnum {
  CREATED_AT = 'createdAt',
  ARRIVED_AT = 'arrivedAt',
  ACUITY = 'acuity',
  STATUS = 'status',
  TRIAGED_AT = 'triagedAt',
}
