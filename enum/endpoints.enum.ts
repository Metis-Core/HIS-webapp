export enum UserEndpointEnum {
  BASE = '/users',
}

export enum PatientEndpointEnum {
  BASE = '/patients',
}

export enum QueueEndpointEnum {
  BASE = '/queue',
  CHECK_IN = '/queue/check-in',
  ENTRIES = '/queue/entries',
  VISITS = '/queue/visits',
  DEPARTMENT = '/queue/department',
  DISPLAY = '/queue/display',
}

export enum TriageEndpointEnum {
  BASE = '/triage',
  QUEUE = '/triage/queue',
  PATIENT = '/triage/patient',
}

export enum ConsultationEndpointEnum {
  BASE = '/consultations',
  PATIENT = '/consultations/patient',
  VISIT = '/consultations/visit',
}
