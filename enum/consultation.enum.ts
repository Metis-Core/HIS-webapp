export enum ConsultationEndpointEnum {
  BASE = '/consultations',
}

export enum ConsultationStatusEnum {
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum ConsultationTypeEnum {
  OUTPATIENT = 'outpatient',
  FOLLOW_UP = 'follow_up',
  EMERGENCY = 'emergency',
  INPATIENT_ROUND = 'inpatient_round',
  TELEMEDICINE = 'telemedicine',
}

export enum ConsultationSortByEnum {
  CREATED_AT = 'createdAt',
  STARTED_AT = 'startedAt',
  COMPLETED_AT = 'completedAt',
  FOLLOW_UP_DATE = 'followUpDate',
}
