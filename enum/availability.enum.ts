export enum AvailabilityEndpointEnum {
  BASE = '/availability',
  ME = '/availability/me',
  USERS = '/availability/users',
  STAFF = '/availability/staff',
}

export enum DoctorEndpointEnum {
  BASE = '/doctors',
  VISITS = '/doctors/visits',
}

export enum AvailabilityStatusEnum {
  AVAILABLE = 'available',
  BUSY = 'busy',
  ON_LEAVE = 'on_leave',
  OUT_OF_OFFICE = 'out_of_office',
}

export enum AssignmentSourceEnum {
  AUTO = 'auto',
  MANUAL = 'manual',
  CLAIMED = 'claimed',
}
