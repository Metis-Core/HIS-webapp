import type { Metadata } from 'next';
import DashboardShell from '@/components/layout/dashboard-shell';

export const metadata: Metadata = {
  title: 'Metis Healthcare',
  description: 'Metis Healthcare',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <DashboardShell>{children}</DashboardShell>;
}
