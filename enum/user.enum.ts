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

// Mirror of API `Department` enum. Adjust values if the backend enum changes.
export enum DepartmentEnum {
  ADMINISTRATION = 'administration',
  RECEPTION = 'reception',
  MEDICAL = 'medical',
  NURSING = 'nursing',
  LAB = 'lab',
  PHARMACY = 'pharmacy',
  RADIOLOGY = 'radiology',
  SURGERY = 'surgery',
  ACCOUNTS = 'accounts',
  NONE = 'none',
}
