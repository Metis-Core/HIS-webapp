export { useUsers, useUserById } from './users.hook';
export { usePatients, usePatient } from './patients.hook';
export {
  useConsultations,
  useConsultation,
  useConsultationsByPatient,
  useConsultationsByVisit,
} from './consultations.hook';
export { useTriage, useTriageItem, useTriageQueue, useTriageByPatient } from './triage.hook';
export { useVisits, useVisit, useVisitQueues, useDepartmentQueue } from './visits.hook';
export { useServices, useService } from './services.hook';
export { useOtp } from './otp.hook';
export { useRoles } from './roles.hook';
export { useUser } from './user.hook';
export { useNotifications, useMyNotifications, useUnreadNotificationsCount } from './notifications.hook';
export {
  useLabTests,
  useLabTest,
  useLabOrders,
  useLabOrder,
  useLabOrdersByPatient,
  useLabOrdersByConsultation,
} from './lab.hook';
export {
  useInventoryItems,
  useInventoryItem,
  useInventoryStores,
  useActiveInventoryStores,
  useInventoryStock,
  useLowStock,
  useInventoryTransactions,
} from './inventory.hook';
export {
  usePrescriptions,
  usePrescription,
  usePrescriptionsByPatient,
  usePrescriptionDispenses,
} from './pharmacy.hook';
