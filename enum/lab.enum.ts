export enum LabEndpointEnum {
  TESTS = '/lab/tests',
  ORDERS = '/lab/orders',
  ORDERS_BY_PATIENT = '/lab/orders/patient',
  ORDERS_BY_CONSULTATION = '/lab/orders/consultation',
  ITEMS = '/lab/items',
  ITEMS_SUMMARY = '/lab/items/summary',
  REPORTS = '/lab/reports',
  REPORTS_EXPORT = '/lab/reports/export',
  LAB_ONLY_VISIT = '/visits/lab-only',
}

export enum LabTestTypeEnum {
  LAB_TEST = 'lab-test',
  LAB_TEST_GROUP = 'lab-test-group',
}

export enum LabTestCategoryEnum {
  HEMATOLOGY = 'hematology',
  CHEMISTRY = 'chemistry',
  MICROBIOLOGY = 'microbiology',
  IMMUNOLOGY = 'immunology',
  URINALYSIS = 'urinalysis',
  PARASITOLOGY = 'parasitology',
  RADIOLOGY = 'radiology',
  HISTOPATHOLOGY = 'histopathology',
  OTHER = 'other',
}

export enum LabSampleTypeEnum {
  BLOOD = 'blood',
  URINE = 'urine',
  STOOL = 'stool',
  SPUTUM = 'sputum',
  CSF = 'csf',
  TISSUE = 'tissue',
  SWAB = 'swab',
  IMAGING = 'imaging',
  OTHER = 'other',
}

export enum LabOrderStatusEnum {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum LabOrderItemStatusEnum {
  PENDING = 'pending',
  COLLECTED = 'collected',
  IN_PROCESS = 'in_process',
  RESULT_READY = 'result_ready',
  VERIFIED = 'verified',
  CANCELLED = 'cancelled',
}

/** Computed by the API from the field's reference ranges (L6). */
export enum LabResultFlagEnum {
  LOW = 'low',
  HIGH = 'high',
  CRITICAL_LOW = 'critical_low',
  CRITICAL_HIGH = 'critical_high',
  ABNORMAL = 'abnormal',
}

/** L11 age bands, age taken on the result date (Decision 3 default). */
export enum LabAgeBandEnum {
  UNDER_5 = 'under_5',
  AGE_5_12 = '5_12',
  AGE_13_17 = '13_17',
  AGE_18_59 = '18_59',
  AGE_60_PLUS = '60_plus',
}

export enum LabPriorityEnum {
  ROUTINE = 'routine',
  URGENT = 'urgent',
  STAT = 'stat',
}
