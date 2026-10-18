'use client';

import { useState } from 'react';
import { FaBaby, FaClock, FaFemale, FaHeartbeat, FaSyringe } from 'react-icons/fa';
import { PageHeader, Tabs } from '@/components';
import ClinicRegister from '@/components/clinic/clinic-register';
import MaternityWaiting from '@/components/clinic/maternity-waiting';
import { ClinicRecordKindEnum } from '@/enum/clinic.enum';

type TabId = 'waiting' | ClinicRecordKindEnum;

/** Antenatal, birth, postnatal and immunization work in one place: who is waiting and every record taken. */
export default function MaternityPage() {
  const [tab, setTab] = useState<TabId>('waiting');
  return (
    <div className="flex flex-col gap-4">
      <PageHeader description="Mothers and children: who is waiting, and the antenatal, birth, postnatal and immunization registers. Records are added from the patient's visit." />
      <Tabs<TabId>
        tabs={[
          { id: 'waiting', label: 'Waiting', icon: FaClock },
          { id: ClinicRecordKindEnum.ANTENATAL_VISIT, label: 'Antenatal', icon: FaFemale },
          { id: ClinicRecordKindEnum.DELIVERY, label: 'Births', icon: FaBaby },
          { id: ClinicRecordKindEnum.POSTNATAL_VISIT, label: 'Postnatal', icon: FaHeartbeat },
          { id: ClinicRecordKindEnum.IMMUNIZATION, label: 'Immunization', icon: FaSyringe },
        ]}
        active={tab}
        onChange={setTab}
      />
      {tab === 'waiting' ? <MaternityWaiting /> : <ClinicRegister key={tab} kind={tab} />}
    </div>
  );
}
