import { QueueStageEnum } from '@/enum/queue.enum';
import { stageLabel } from '@/data/queue';

export interface IServiceFee {
  stage: QueueStageEnum;
  fee: number;
}

export const serviceFees: IServiceFee[] = [
  { stage: QueueStageEnum.REGISTRATION, fee: 5000 },
  { stage: QueueStageEnum.CONSULTATION, fee: 20000 },
  { stage: QueueStageEnum.EXAMINATION, fee: 15000 },
  { stage: QueueStageEnum.LAB, fee: 25000 },
  { stage: QueueStageEnum.RADIOLOGY, fee: 40000 },
  { stage: QueueStageEnum.PHARMACY, fee: 10000 },
  { stage: QueueStageEnum.SURGERY, fee: 150000 },
  { stage: QueueStageEnum.POSTOPERATIVE, fee: 30000 },
  { stage: QueueStageEnum.DISCHARGE, fee: 5000 },
  { stage: QueueStageEnum.FOLLOWUP, fee: 10000 },
  { stage: QueueStageEnum.REFERRAL, fee: 5000 },
  { stage: QueueStageEnum.TRANSFER, fee: 5000 },
];

export const serviceFeeMap: Partial<Record<QueueStageEnum, number>> = Object.fromEntries(
  serviceFees.map((service) => [service.stage, service.fee]),
);

export { stageLabel };
