'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  FaAngleDoubleLeft,
  FaAngleDoubleRight,
  FaBell,
  FaCog,
  FaHandHoldingMedical,
  FaMicroscope,
  FaNotesMedical,
  FaPills,
  FaProcedures,
  FaTachometerAlt,
  FaTasks,
  FaUserInjured,
  FaUserShield,
  FaWarehouse,
} from 'react-icons/fa';
import { UserRoleEnum } from '@/enum/user.enum';
import { useAuth, useSidebar } from '@/providers';

interface NavItem {
  key: string;
  label: string;
  href: string;
  icon: React.ReactNode;
}

const NAV: Record<string, NavItem> = {
  dashboard: {
    key: 'dashboard',
    label: 'Dashboard',
    href: '/dashboard',
    icon: <FaTachometerAlt aria-hidden className="h-5 w-5" />,
  },
  patients: {
    key: 'patients',
    label: 'Patients',
    href: '/patients',
    icon: <FaUserInjured aria-hidden className="h-5 w-5" />,
  },
  queue: { key: 'queue', label: 'Queue', href: '/queue', icon: <FaTasks aria-hidden className="h-5 w-5" /> },
  triage: { key: 'triage', label: 'Triage', href: '/triage', icon: <FaProcedures aria-hidden className="h-5 w-5" /> },
  consultations: {
    key: 'consultations',
    label: 'Consultations',
    href: '/consultations',
    icon: <FaNotesMedical aria-hidden className="h-5 w-5" />,
  },
  lab: { key: 'lab', label: 'Lab', href: '/lab', icon: <FaMicroscope aria-hidden className="h-5 w-5" /> },
  pharmacy: {
    key: 'pharmacy',
    label: 'Pharmacy',
    href: '/pharmacy',
    icon: <FaPills aria-hidden className="h-5 w-5" />,
  },
  inventory: {
    key: 'inventory',
    label: 'Inventory',
    href: '/inventory',
    icon: <FaWarehouse aria-hidden className="h-5 w-5" />,
  },
  services: {
    key: 'services',
    label: 'Services',
    href: '/services',
    icon: <FaHandHoldingMedical aria-hidden className="h-5 w-5" />,
  },
  notifications: {
    key: 'notifications',
    label: 'Notifications',
    href: '/notifications',
    icon: <FaBell aria-hidden className="h-5 w-5" />,
  },
  users: { key: 'users', label: 'Users', href: '/users', icon: <FaUserShield aria-hidden className="h-5 w-5" /> },
  settings: { key: 'settings', label: 'Settings', href: '/settings', icon: <FaCog aria-hidden className="h-5 w-5" /> },
};

const ALL_NAV: NavItem[] = [
  NAV.dashboard,
  NAV.patients,
  NAV.queue,
  NAV.triage,
  NAV.consultations,
  NAV.lab,
  NAV.pharmacy,
  NAV.inventory,
  NAV.services,
  NAV.notifications,
  NAV.users,
  NAV.settings,
];

const navigations: Record<UserRoleEnum, NavItem[]> = {
  [UserRoleEnum.SUPER_ADMIN]: ALL_NAV,
  [UserRoleEnum.ADMIN]: ALL_NAV,
  [UserRoleEnum.DOCTOR]: [
    NAV.dashboard,
    NAV.patients,
    NAV.queue,
    NAV.triage,
    NAV.consultations,
    NAV.lab,
    NAV.pharmacy,
    NAV.notifications,
    NAV.settings,
  ],
  [UserRoleEnum.NURSE]: [
    NAV.dashboard,
    NAV.patients,
    NAV.consultations,
    NAV.lab,
    NAV.pharmacy,
    NAV.notifications,
    NAV.settings,
  ],
  [UserRoleEnum.LAB_TECH]: [NAV.dashboard, NAV.patients, NAV.lab, NAV.inventory, NAV.notifications, NAV.settings],
  [UserRoleEnum.PHARMACIST]: [
    NAV.dashboard,
    NAV.patients,
    NAV.pharmacy,
    NAV.inventory,
    NAV.notifications,
    NAV.settings,
  ],
  [UserRoleEnum.RECEPTIONIST]: [NAV.dashboard, NAV.patients, NAV.services, NAV.notifications, NAV.settings],
  [UserRoleEnum.ACCOUNTANT]: [NAV.dashboard, NAV.patients, NAV.services, NAV.notifications, NAV.settings],
  [UserRoleEnum.PATIENT]: [
    NAV.dashboard,
    { ...NAV.queue, label: 'My Visits' },
    { ...NAV.lab, label: 'Lab Results' },
    NAV.notifications,
  ],
};

function SidebarContent({
  onNavigate,
  onToggleCollapse,
  collapsed = false,
}: {
  onNavigate?: () => void;
  onToggleCollapse?: () => void;
  collapsed?: boolean;
}) {
  const pathname = usePathname();
  const { effectiveRole: role } = useAuth();
  const navigation = role ? (navigations[role] ?? ALL_NAV) : ALL_NAV;

  return (
    <>
      <div className="flex h-32 shrink-0 items-center justify-center border-b border-slate-200">
        <Image
          src="/logo.png"
          alt="Suubi Medical Centre"
          width={192}
          height={128}
          priority
          className={collapsed ? 'h-auto w-12 object-contain' : 'h-20 w-auto max-w-[13rem] object-contain'}
        />
      </div>
      <nav aria-label="Primary" className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
        {navigation.map((item) => {
          const active = pathname.startsWith(item.href);

          return (
            <Link
              key={item.key}
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? 'page' : undefined}
              title={collapsed ? item.label : undefined}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                collapsed ? 'justify-center' : ''
              } ${active ? 'bg-green-100 text-green-800' : 'text-slate-900 hover:bg-amber-50 hover:text-amber-800'}`}
            >
              <span className={active ? 'text-green-700' : 'text-slate-900'}>{item.icon}</span>
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>
      {!onNavigate && (
        <div className="shrink-0 border-t border-slate-200 p-3">
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className={`flex h-10 w-full items-center rounded-lg text-slate-600 hover:bg-amber-50 hover:text-amber-800 ${
              collapsed ? 'justify-center' : 'justify-end px-3'
            }`}
          >
            {collapsed ? (
              <FaAngleDoubleRight aria-hidden className="h-4 w-4" />
            ) : (
              <FaAngleDoubleLeft aria-hidden className="h-4 w-4" />
            )}
          </button>
        </div>
      )}
    </>
  );
}

export default function Sidebar() {
  const { collapsed, setCollapsed, mobileOpen, setMobileOpen } = useSidebar();

  return (
    <>
      <aside
        className={`hidden h-full shrink-0 flex-col border-r border-slate-200 bg-white transition-[width] duration-200 lg:flex ${
          collapsed ? 'w-16' : 'w-64'
        }`}
      >
        <SidebarContent collapsed={collapsed} onToggleCollapse={() => setCollapsed(!collapsed)} />
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 flex lg:hidden">
          <button
            type="button"
            aria-label="Close navigation"
            onClick={() => setMobileOpen(false)}
            className="absolute inset-0 bg-black/40"
          />
          <aside className="relative flex h-full w-64 flex-col border-r border-slate-200 bg-white">
            <SidebarContent onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}
    </>
  );
}
