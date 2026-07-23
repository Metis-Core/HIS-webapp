export enum UserRoleEnum {
    SUPER_ADMIN = "super_admin",
    ADMIN = "admin",
    DOCTOR = "doctor",
    PATIENT = "patient",
    NURSE = 'nurse',
    LAB_TECH = 'lab_tech',
    PHARMACIST = 'pharmacist',
    RECEPTIONIST = 'receptionist',
    ACCOUNTANT = 'accountant',
}


export enum UserStatusEnum {
    ACTIVE = "active",
    INACTIVE = "inactive",
    PENDING = "pending",     // Just wodering Andrew what is the use of the pending status. 
    BLOCKED = "blocked",
}

export enum UserGenderEnum {
    MALE = "male",
    FEMALE = "female",
    OTHER = "other",
}