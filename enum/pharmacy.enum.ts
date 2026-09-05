export enum PharmacyEndpointEnum {
  PRESCRIPTIONS = '/pharmacy/prescriptions',
  PRESCRIPTIONS_BY_PATIENT = '/pharmacy/prescriptions/patient',
}

export enum PrescriptionStatusEnum {
  PENDING = 'pending',
  PARTIALLY_DISPENSED = 'partially_dispensed',
  DISPENSED = 'dispensed',
  CANCELLED = 'cancelled',
}

export enum PrescriptionItemStatusEnum {
  PENDING = 'pending',
  PARTIAL = 'partial',
  DISPENSED = 'dispensed',
  CANCELLED = 'cancelled',
}
