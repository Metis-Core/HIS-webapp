'use client';

import { usePathname } from 'next/navigation';
import { FaLock } from 'react-icons/fa';
import EmptyState from '@/components/state/empty.state';
import { canOpenRoute } from '@/helpers/route-access';
import { useAuth } from '@/providers';

export default function RouteGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { effectiveRole } = useAuth();

  if (!canOpenRoute(effectiveRole, pathname)) {
    return (
      <div role="alert" className="flex h-80 items-center justify-center">
        <EmptyState message="Your role doesn't have access to this page." icon={FaLock} />
      </div>
    );
  }
  return <>{children}</>;
}
