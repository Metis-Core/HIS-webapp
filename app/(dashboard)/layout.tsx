import type { Metadata } from 'next';
import { Header, MetisFooter, Sidebar } from '@/components';

export const metadata: Metadata = {
  title: 'Metis Healthcare',
  description: 'Metis Healthcare',
};

/* Dashboard shell mounts once per session — sidebar, header, notification bell,
   and the @modal parallel slot survive navigation (AGENTS.md §5). */
export default function DashboardLayout({
  children,
  modal,
}: Readonly<{ children: React.ReactNode; modal: React.ReactNode }>) {
  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-surface">
      <div className="flex min-h-0 flex-1">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <Header />
          <main className="min-h-0 flex-1 overflow-auto">
            <div className="mx-auto max-w-[1600px] p-6">{children}</div>
          </main>
        </div>
      </div>
      <MetisFooter compact className="shrink-0 border-t border-line bg-surface-raised" />
      {modal}
    </div>
  );
}
