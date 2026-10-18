'use client';

import { Pill } from '@/components';
import { PillVariantEnum } from '@/enum';

interface ChecklistProps {
  drafted: boolean;
  labOrders: number;
  resultsReady: number;
  prescriptions: number;
}

export default function ConsultationChecklist({ drafted, labOrders, resultsReady, prescriptions }: ChecklistProps) {
  const rows: Array<[string, PillVariantEnum, string]> = [
    ['Encounter', drafted ? PillVariantEnum.SUCCESS : PillVariantEnum.WARNING, drafted ? 'Drafted' : 'Pending'],
    [
      'Lab orders',
      labOrders ? PillVariantEnum.INFO : PillVariantEnum.DEFAULT,
      labOrders ? `${labOrders} ordered` : 'None',
    ],
    [
      'Results ready',
      resultsReady ? PillVariantEnum.SUCCESS : PillVariantEnum.DEFAULT,
      resultsReady ? `${resultsReady} back` : 'Awaiting',
    ],
    [
      'Prescriptions',
      prescriptions ? PillVariantEnum.INFO : PillVariantEnum.DEFAULT,
      prescriptions ? `${prescriptions} added` : 'None',
    ],
  ];
  return (
    <section className="flex flex-col gap-2 rounded-lg border border-line bg-surface-raised p-4">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Consultation checklist</h3>
      <ul className="flex flex-col gap-1.5 text-sm">
        {rows.map(([label, variant, text]) => (
          <li key={label} className="flex items-center justify-between">
            <span className="text-ink-muted">{label}</span>
            <Pill variant={variant}>{text}</Pill>
          </li>
        ))}
      </ul>
    </section>
  );
}
