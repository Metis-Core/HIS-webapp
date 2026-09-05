'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { FaBars, FaSearch } from 'react-icons/fa';
import NotificationsBell from './notifications-bell';
import { useAuth, useSidebar } from '@/providers';

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { toggle: toggleSidebar } = useSidebar();
  const menuRef = useRef<HTMLDetailsElement>(null);
  const [platform, setPlatform] = useState<'mac' | 'other'>('other');

  const titleFromPath = (pathname: string) => {
    const segment = pathname.split('/').filter(Boolean).pop();
    if (!segment) return 'Dashboard';
    return segment.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const handleLogout = async () => {
    await logout();
  };

  useEffect(() => {
    setPlatform(/mac/i.test(navigator.platform) ? 'mac' : 'other');

    const close = () => {
      if (menuRef.current?.open) menuRef.current.open = false;
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        // Command palette hook — wired here so every screen answers ⌘K (AGENTS.md §7).
        document.getElementById('global-patient-search')?.focus();
      }
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
  const shortcut = platform === 'mac' ? '⌘K' : 'Ctrl K';

  return (
    <header className="flex h-14 shrink-0 items-center gap-4 border-b border-line bg-surface-raised px-4">
      <button
        type="button"
        aria-label="Toggle sidebar"
        onClick={toggleSidebar}
        className="flex h-8 w-8 items-center justify-center rounded-md text-ink-muted hover:bg-surface hover:text-ink"
      >
        <FaBars className="h-4 w-4" />
      </button>
      <h1 className="text-base font-semibold text-ink">{titleFromPath(pathname)}</h1>

      <div className="relative ml-auto hidden md:block">
        <FaSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-ink-muted" />
        <input
          id="global-patient-search"
          type="search"
          placeholder="Search patient, MRN, phone"
          className="w-72 rounded-md border border-line bg-surface pl-9 pr-16 py-1.5 text-sm text-ink placeholder:text-ink-muted/70 outline-none focus:border-brand focus:ring-1 focus:ring-brand"
        />
        <kbd className="pointer-events-none absolute right-2 top-1/2 hidden -translate-y-1/2 rounded border border-line bg-surface-raised px-1.5 py-0.5 text-[10px] font-medium text-ink-muted md:inline-flex">
          {shortcut}
        </kbd>
      </div>

      <NotificationsBell />

      <details ref={menuRef} className="relative">
        <summary className="flex cursor-pointer list-none items-center gap-2 rounded-md px-1.5 py-1 hover:bg-surface [&::-webkit-details-marker]:hidden">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand text-xs font-semibold uppercase text-white">
            {initials || '?'}
          </div>
        </summary>

        <div className="absolute right-0 z-50 mt-2 w-44 overflow-hidden rounded-md border border-line bg-surface-raised py-1 shadow-sm">
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
