export enum QueueStatusEnum {
  PENDING = "pending",
  IN_PROGRESS = "in-progress",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}

export enum QueueStageEnum  {
    REGISTRATION = "registration",
    CONSULTATION = "consultation",
    EXAMINATION = "examination",
    LAB = "lab",
    RADIOLOGY = "radiology",
    PHARMACY = "pharmacy",
    SURGERY = "surgery",
    POSTOPERATIVE = "postoperative",
    DISCHARGE = "discharge",
    FOLLOWUP = "follow-up",
    REFERRAL = "referral",
    TRANSFER = "transfer"
}