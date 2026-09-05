export enum ServiceEndpointEnum {
  BASE = '/services',
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
