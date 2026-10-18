'use client';

import { Pill } from '@/components';
import type { ResultClassificationEnum } from '@/enum';
import { CLASSIFICATION_ICON, CLASSIFICATION_LABEL, CLASSIFICATION_VARIANT } from './order-format';

export default function ClassificationPill({ classification }: { classification: ResultClassificationEnum | null }) {
  if (!classification) return null;
  const Icon = CLASSIFICATION_ICON[classification];
  return (
    <Pill variant={CLASSIFICATION_VARIANT[classification]} icon={<Icon aria-hidden className="h-3 w-3" />}>
      {CLASSIFICATION_LABEL[classification]}
    </Pill>
  );
}
