'use client';

import {
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
  FaUserPlus,
  FaXRay,
} from 'react-icons/fa';
import type { IconType } from 'react-icons';
import { QueueStageEnum } from '@/enum/queue.enum';
import { stageLabel } from '@/data/queue';

// The primary in-hospital care pathway a patient walks through, end to end.
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
                i < index ? 'bg-green-600' : i === index ? 'bg-blue-600 ring-4 ring-blue-100' : 'bg-zinc-200'
              }`}
            />
            {i < mainPathway.length - 1 && (
              <span className={`h-0.5 w-4 ${i < index ? 'bg-green-600' : 'bg-zinc-200'}`} />
            )}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-1.5">
        <Icon className="text-xs text-blue-700" aria-hidden />
        <span className="text-sm font-medium text-zinc-800">{stageLabel(stage)}</span>
      </div>
    </div>
  );
}
