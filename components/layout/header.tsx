'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import NotificationsBell from './notifications-bell';
import { useAuth } from '@/providers';

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const menuRef = useRef<HTMLDetailsElement>(null);

  const titleFromPath = (pathname: string) => {
    const segment = pathname.split('/').filter(Boolean).pop();
    if (!segment) return 'Dashboard';
    return segment.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const handleLogout = async () => {
    await logout();
  };

  useEffect(() => {
    const close = () => {
      if (menuRef.current?.open) menuRef.current.open = false;
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
    };

    const onPointerDown = (event: PointerEvent) => {
      if (!menuRef.current?.open) return;
      if (!menuRef.current.contains(event.target as Node)) close();
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('pointerdown', onPointerDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('pointerdown', onPointerDown);
    };
  }, []);

  const initials = (user?.firstName?.[0] ?? '') + (user?.lastName?.[0] ?? user?.username?.[0] ?? '');

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-4 border-slate-300 rounded-lg shadow-lg bg-white px-6 backdrop-blur-xs">
      <h1 className="text-lg font-semibold tracking-tight text-primary">{titleFromPath(pathname)}</h1>

      <div className="ml-auto" />

      <NotificationsBell />

      <details ref={menuRef} className="relative">
        <summary className="flex cursor-pointer list-none items-center gap-2 rounded-lg px-1.5 py-1 hover:bg-surface [&::-webkit-details-marker]:hidden">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand text-xs font-semibold uppercase text-white">
            {initials || '?'}
          </div>
        </summary>

        <div className="absolute right-0 z-50 mt-2 w-52 overflow-hidden rounded-lg border border-line bg-surface-raised py-1 shadow-lg">
          <div className="border-b border-line px-3 py-2">
            <p className="truncate text-sm font-medium text-ink">
              {user?.firstName} {user?.lastName || user?.username}
            </p>
            <p className="truncate text-xs text-ink-muted">{user?.role}</p>
          </div>
          <button
            type="button"
            onClick={() => router.push('/settings')}
            className="block w-full px-3 py-2 text-left text-sm text-ink hover:bg-surface"
          >
            Settings
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="block w-full px-3 py-2 text-left text-sm text-critical hover:bg-critical-soft"
          >
            Logout
          </button>
        </div>
      </details>
    </header>
  );
}
