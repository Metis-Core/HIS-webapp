export enum ServiceEndpointEnum {
  BASE = '/services',
  CONSULTATION_FEE = '/services/consultation-fee',
}

export enum PatientEndpointEnum {
  BASE = '/patients',
}

export enum VisitEndpointEnum {
  BASE = '/visits',
  QUEUES = '/visits/queues',
  QUEUE_BY_DEPARTMENT = '/visits/queue/department',
  QUEUE_BY_VISIT = '/visits/queue/visit',
  QUEUE_ENTRIES = '/visits/queue/entries',
}

export enum OtpEndpointEnum {
  GENERATE = '/otp/generate',
  VERIFY = '/otp/verify',
}

export enum ChargeEndpointEnum {
  BASE = '/charges',
  BY_VISIT = '/charges/visit',
}

/** Printable HTML documents. Each path takes the record id as its last segment. */
export enum DocumentEndpointEnum {
  LAB_ORDER = '/documents/lab-order',
  LAB_REPORT_VISIT = '/documents/lab-report/visit',
  PRESCRIPTION = '/documents/prescription',
  DISCHARGE = '/documents/discharge',
  RECEIPT = '/documents/receipt',
  PROCEDURE_REPORT = '/documents/procedure-report',
}
