'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const menuRef = useRef<HTMLDetailsElement>(null);

  const titleFromPath = (pathname: string) => {
    const segment = pathname.split('/').filter(Boolean).pop();
    if (!segment) return 'Dashboard';
    return segment.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const handleLogout = async () => {
    // logout handler
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

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-zinc-200 bg-white px-4 shadow-md">
      <h1 className="text-lg tracking-wider font-bold text-zinc-800">{titleFromPath(pathname)}</h1>

      <details ref={menuRef} className="relative">
        <summary className="flex cursor-pointer list-none items-center gap-3 rounded-sm px-2 py-1.5 hover:bg-zinc-50 [&::-webkit-details-marker]:hidden">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 text-xs font-semibold text-white">
            {'LA'}
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
