import { PatientsProvider } from './patients-provider';

export default function PatientsLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <PatientsProvider>{children}</PatientsProvider>;
}
