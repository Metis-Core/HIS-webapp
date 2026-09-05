'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { IconType } from 'react-icons';

export type LinkTabItem = {
  href: string;
  label: string;
  icon?: IconType;
  matchExact?: boolean;
};

/* Link-based tabs used inside a nested layout so tab navigation is a URL change,
   deep-linkable, and the parent layout (patient banner) never remounts. */
export default function LinkTabs({ tabs }: { tabs: LinkTabItem[] }) {
  const pathname = usePathname();

  const isActive = (tab: LinkTabItem) =>
    tab.matchExact ? pathname === tab.href : pathname === tab.href || pathname.startsWith(`${tab.href}/`);

  return (
    <div className="flex flex-wrap gap-1 border-b border-line">
      {tabs.map((tab) => {
        const active = isActive(tab);
        const Icon = tab.icon;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex items-center gap-2 border-b-2 px-3 py-2.5 text-sm font-medium transition ${
              active ? 'border-brand text-brand' : 'border-transparent text-ink-muted hover:text-ink'
            }`}
          >
            {Icon && <Icon className="text-sm" />}
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
