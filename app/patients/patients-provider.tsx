'use client';

import { createContext, useContext, useMemo, useState } from 'react';
import { seedPatients } from '@/data/patients';
import type { IPatient } from '@/interfaces/patient.interface';

type PatientsContextValue = {
  patients: IPatient[];
  setPatients: React.Dispatch<React.SetStateAction<IPatient[]>>;
  getPatient: (id: string) => IPatient | undefined;
};

const PatientsContext = createContext<PatientsContextValue | null>(null);

export function PatientsProvider({ children }: { children: React.ReactNode }) {
  const [patients, setPatients] = useState<IPatient[]>(seedPatients);

  const value = useMemo(
    () => ({
      patients,
      setPatients,
      getPatient: (id: string) => patients.find((patient) => patient.id === id),
    }),
    [patients],
  );

  return <PatientsContext.Provider value={value}>{children}</PatientsContext.Provider>;
}

export function usePatients() {
  const context = useContext(PatientsContext);
  if (!context) {
    throw new Error('usePatients must be used within PatientsProvider');
  }
  return context;
}
