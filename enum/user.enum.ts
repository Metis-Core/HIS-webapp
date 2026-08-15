export enum UserRoleEnum {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  DOCTOR = 'doctor',
  PATIENT = 'patient',
  NURSE = 'nurse',
  LAB_TECH = 'lab_tech',
  PHARMACIST = 'pharmacist',
  RECEPTIONIST = 'receptionist',
  ACCOUNTANT = 'accountant',
}

export enum UserStatusEnum {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING_RESET = 'pending_reset',
}

export enum UserGenderEnum {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
}

export enum DepartmentEnum {
  RECEPTION = 'reception',
  TRIAGE = 'triage',
  OUTPATIENT_CLINIC = 'outpatient_clinic',
  INPATIENT_WARD = 'inpatient_ward',
  MAIN_LABORATORY = 'main_laboratory',
  RADIOLOGY = 'radiology',
  MAIN_PHARMACY = 'main_pharmacy',
  FINANCE = 'finance',
  ADMINISTRATION = 'administrator',
}
