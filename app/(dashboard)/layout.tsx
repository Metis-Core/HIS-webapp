import type { Metadata } from 'next';
import { Header, Sidebar } from '@/components';

export const metadata: Metadata = {
  title: 'Metis Healthcare',
  description: 'Metis Healthcare',
};

export default function DashboardLayout({
  children,
  modal,
}: Readonly<{ children: React.ReactNode; modal: React.ReactNode }>) {
  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-white p-2">
      <div className="flex min-h-0 flex-1 space-x-2">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <Header />
          <main className="min-h-0 flex-1 overflow-auto">
            <div className="w-full px-6 py-5">{children}</div>
          </main>
        </div>
      </div>
      {/* <MetisFooter compact className="shrink-0 border-t border-line bg-surface-raised" /> */}
      {modal}
    </div>
  );
}
