'use client';

import type { ReactNode } from 'react';
import { format } from 'date-fns';
import {
  FaClipboardCheck,
  FaFlask,
  FaHospital,
  FaShieldAlt,
  FaStethoscope,
  FaSyringe,
  FaUserCheck,
  FaUserPlus,
} from 'react-icons/fa';
import { VerticalTimeline, VerticalTimelineElement } from 'react-vertical-timeline-component';
import 'react-vertical-timeline-component/style.min.css';
import type { IPatientHistoryEvent, PatientVisitType } from '@/data/patient-history';

type PatientTimelineProps = {
  events: IPatientHistoryEvent[];
  onSelect: (event: IPatientHistoryEvent) => void;
};

const visitStyles: Record<PatientVisitType, { icon: ReactNode; color: string }> = {
  registration: { icon: <FaUserPlus />, color: '#166534' },
  consultation: { icon: <FaStethoscope />, color: '#1d4ed8' },
  treatment: { icon: <FaSyringe />, color: '#b45309' },
  admission: { icon: <FaHospital />, color: '#7c3aed' },
  lab: { icon: <FaFlask />, color: '#0891b2' },
  'follow-up': { icon: <FaClipboardCheck />, color: '#059669' },
  insurance: { icon: <FaShieldAlt />, color: '#0f766e' },
  update: { icon: <FaUserCheck />, color: '#64748b' },
};

export default function PatientTimeline({ events, onSelect }: PatientTimelineProps) {
  if (events.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-zinc-200 px-4 py-8 text-center text-sm text-zinc-500">
        No visits or activity recorded for this patient yet.
      </p>
    );
  }

  return (
    <div className="patient-activity-timeline">
      <VerticalTimeline animate={false} lineColor="#e4e4e7">
        {events.map((event) => {
          const style = visitStyles[event.type];

          return (
            <VerticalTimelineElement
              key={event.id}
              date={format(event.date, 'dd MMM yyyy · HH:mm')}
              iconStyle={{ background: style.color, color: '#fff' }}
              icon={style.icon}
              contentStyle={{
                background: '#ffffff',
                border: '1px solid #e4e4e7',
                boxShadow: '0 1px 2px rgb(0 0 0 / 0.05)',
                cursor: 'pointer',
              }}
              contentArrowStyle={{ borderRight: '7px solid #e4e4e7' }}
            >
              <button type="button" className="w-full cursor-pointer text-left" onClick={() => onSelect(event)}>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-green-800">
                  {event.type.replace('-', ' ')}
                </p>
                <h3 className="text-base font-semibold text-zinc-900">{event.title}</h3>
                <p className="mt-1 text-sm text-zinc-600">{event.description}</p>
                <p className="mt-2 text-xs text-zinc-400">
                  Handled by {event.handledBy} · {event.department}
                </p>
                <p className="mt-2 text-xs font-medium text-green-700">View details</p>
              </button>
            </VerticalTimelineElement>
          );
        })}
      </VerticalTimeline>
    </div>
  );
}
