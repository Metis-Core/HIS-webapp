export enum NotificationEndpointEnum {
  BASE = '/notifications',
  ME = '/notifications/me',
  UNREAD_COUNT = '/notifications/me/unread-count',
  READ_ALL = '/notifications/me/read-all',
}

export enum NotificationTypeEnum {
  SYSTEM = 'system',
  LAB_RESULT = 'lab_result',
  LAB_ORDER = 'lab_order',
  PRESCRIPTION = 'prescription',
  APPOINTMENT = 'appointment',
  VISIT = 'visit',
  QUEUE = 'queue',
  INVENTORY = 'inventory',
  GENERAL = 'general',
}

export enum NotificationChannelEnum {
  IN_APP = 'in_app',
  EMAIL = 'email',
  SMS = 'sms',
}

export enum NotificationStatusEnum {
  UNREAD = 'unread',
  READ = 'read',
  ARCHIVED = 'archived',
}

export enum NotificationPriorityEnum {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  CRITICAL = 'critical',
}
