'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { FaChevronRight } from 'react-icons/fa';
import { useAuth } from '@/providers';

const isDynamicSegment = (segment: string) => /^[0-9a-f-]{16,}$/i.test(segment);

const labelFor = (segment: string) =>
  isDynamicSegment(segment) ? 'Details' : segment.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const menuRef = useRef<HTMLDetailsElement>(null);

  const segments = pathname.split('/').filter(Boolean);
  const crumbs = [
    { label: 'Home', href: '/' },
    ...segments.map((segment, index) => ({
      label: labelFor(segment),
      href: `/${segments.slice(0, index + 1).join('/')}`,
    })),
  ];

  const handleLogout = async () => {
    await logout();
  };

  const initials = (() => {
    if (!user) return '';
    const first = user.firstName?.[0] ?? user.username?.[0] ?? user.email?.[0] ?? '';
    const last = user.lastName?.[0] ?? '';
    return `${first}${last}`.toUpperCase();
  })();

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

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-zinc-200 bg-white px-4 shadow-md">
      <nav aria-label="Breadcrumb">
        <ol className="flex items-center gap-1.5 text-sm">
          {crumbs.map((crumb, index) => {
            const isLast = index === crumbs.length - 1;
            return (
              <li key={crumb.href} className="flex items-center gap-1.5">
                {index > 0 && <FaChevronRight aria-hidden className="text-[10px] text-slate-300" />}
                {isLast ? (
                  <span aria-current="page" className="font-semibold text-slate-800">
                    {crumb.label}
                  </span>
                ) : (
                  <Link href={crumb.href} className="text-slate-500 transition hover:text-green-800">
                    {crumb.label}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>

      <details ref={menuRef} className="relative">
        <summary className="flex cursor-pointer list-none items-center gap-3 rounded-sm px-2 py-1.5 hover:bg-zinc-50 [&::-webkit-details-marker]:hidden">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 text-xs font-semibold text-white">
            {initials || '—'}
          </div>
        </summary>

        <div className="absolute right-0 z-50 mt-2 w-40 overflow-hidden rounded-sm border border-zinc-200 bg-white py-1 shadow-md">
          <button
            type="button"
            onClick={() => router.push('/settings')}
            className="block w-full px-3 py-2 text-left text-sm text-zinc-700 hover:bg-zinc-50"
          >
            Settings
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="block w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
          >
            Logout
          </button>
        </div>
      </details>
    </header>
  );
}
