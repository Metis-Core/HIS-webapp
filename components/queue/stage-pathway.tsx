'use client';

import {
  FaBaby,
  FaBed,
  FaCalendarCheck,
  FaClipboardCheck,
  FaDoorOpen,
  FaExchangeAlt,
  FaFlask,
  FaPills,
  FaProcedures,
  FaShareSquare,
  FaStethoscope,
  FaTooth,
  FaUserPlus,
  FaXRay,
} from 'react-icons/fa';
import type { IconType } from 'react-icons';
import { QueueStageEnum } from '@/enum/queue.enum';
import { stageLabel } from '@/data/queue';

export const mainPathway: QueueStageEnum[] = [
  QueueStageEnum.REGISTRATION,
  QueueStageEnum.CONSULTATION,
  QueueStageEnum.EXAMINATION,
  QueueStageEnum.LAB,
  QueueStageEnum.RADIOLOGY,
  QueueStageEnum.PHARMACY,
  QueueStageEnum.SURGERY,
  QueueStageEnum.POSTOPERATIVE,
  QueueStageEnum.DISCHARGE,
];

const stageIcons: Record<QueueStageEnum, IconType> = {
  [QueueStageEnum.REGISTRATION]: FaUserPlus,
  [QueueStageEnum.CONSULTATION]: FaStethoscope,
  [QueueStageEnum.EXAMINATION]: FaClipboardCheck,
  [QueueStageEnum.LAB]: FaFlask,
  [QueueStageEnum.RADIOLOGY]: FaXRay,
  [QueueStageEnum.DENTAL]: FaTooth,
  [QueueStageEnum.ANTENATAL]: FaBaby,
  [QueueStageEnum.PHARMACY]: FaPills,
  [QueueStageEnum.SURGERY]: FaProcedures,
  [QueueStageEnum.POSTOPERATIVE]: FaBed,
  [QueueStageEnum.DISCHARGE]: FaDoorOpen,
  [QueueStageEnum.FOLLOWUP]: FaCalendarCheck,
  [QueueStageEnum.REFERRAL]: FaShareSquare,
  [QueueStageEnum.TRANSFER]: FaExchangeAlt,
};

export default function StagePathway({ stage }: { stage: QueueStageEnum }) {
  const index = mainPathway.indexOf(stage);
  const Icon = stageIcons[stage];

  if (index === -1) {
    return (
      <div className="flex items-center gap-2">
        <Icon className="text-sm text-purple-700" aria-hidden />
        <span className="text-sm font-medium text-zinc-800">{stageLabel(stage)}</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center">
        {mainPathway.map((step, i) => (
          <div key={step} className="flex items-center">
            <span
              title={stageLabel(step)}
              className={`h-2.5 w-2.5 rounded-full ${
                i < index ? 'bg-normal' : i === index ? 'bg-info ring-4 ring-info/20' : 'bg-line'
              }`}
            />
            {i < mainPathway.length - 1 && <span className={`h-0.5 w-4 ${i < index ? 'bg-primary' : 'bg-line'}`} />}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-1.5">
        <Icon className="text-xs text-secondary" aria-hidden />
        <span className="text-sm font-medium text-zinc-800">{stageLabel(stage)}</span>
      </div>
    </div>
  );
}
