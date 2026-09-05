export enum LabEndpointEnum {
  TESTS = '/lab/tests',
  ORDERS = '/lab/orders',
  ORDERS_BY_PATIENT = '/lab/orders/patient',
  ORDERS_BY_CONSULTATION = '/lab/orders/consultation',
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
  CANCELLED = 'cancelled',
}

export enum LabPriorityEnum {
  ROUTINE = 'routine',
  URGENT = 'urgent',
  STAT = 'stat',
}
