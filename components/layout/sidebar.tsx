'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  FaAngleDoubleLeft,
  FaAngleDoubleRight,
  FaBell,
  FaBoxes,
  FaClipboardList,
  FaConciergeBell,
  FaCog,
  FaFlask,
  FaHome,
  FaPills,
  FaStethoscope,
  FaUserInjured,
  FaUsersCog,
} from 'react-icons/fa';
import { UserRoleEnum } from '@/enum/user.enum';
import { useAuth, useSidebar } from '@/providers';
import MetisFooter from './metis-footer';

interface NavItem {
  key: string;
  label: string;
  href: string;
  icon: React.ReactNode;
}

const NAV: Record<string, NavItem> = {
  dashboard: { key: 'dashboard', label: 'Dashboard', href: '/', icon: <FaHome className="w-5 h-5" /> },
  patients: { key: 'patients', label: 'Patients', href: '/patients', icon: <FaUserInjured className="w-5 h-5" /> },
  queue: { key: 'queue', label: 'Queue', href: '/queue', icon: <FaClipboardList className="w-5 h-5" /> },
  triage: { key: 'triage', label: 'Triage', href: '/triage', icon: <FaStethoscope className="w-5 h-5" /> },
  consultations: {
    key: 'consultations',
    label: 'Consultations',
    href: '/consultations',
    icon: <FaStethoscope className="w-5 h-5" />,
  },
  lab: { key: 'lab', label: 'Lab', href: '/lab', icon: <FaFlask className="w-5 h-5" /> },
  pharmacy: { key: 'pharmacy', label: 'Pharmacy', href: '/pharmacy', icon: <FaPills className="w-5 h-5" /> },
  inventory: { key: 'inventory', label: 'Inventory', href: '/inventory', icon: <FaBoxes className="w-5 h-5" /> },
  services: { key: 'services', label: 'Services', href: '/services', icon: <FaConciergeBell className="w-5 h-5" /> },
  notifications: {
    key: 'notifications',
    label: 'Notifications',
    href: '/notifications',
    icon: <FaBell className="w-5 h-5" />,
  },
  users: { key: 'users', label: 'Users', href: '/users', icon: <FaUsersCog className="w-5 h-5" /> },
  settings: { key: 'settings', label: 'Settings', href: '/settings', icon: <FaCog className="w-5 h-5" /> },
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
    NAV.queue,
    NAV.triage,
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
  [UserRoleEnum.RECEPTIONIST]: [NAV.dashboard, NAV.patients, NAV.queue, NAV.services, NAV.notifications, NAV.settings],
  [UserRoleEnum.ACCOUNTANT]: [NAV.dashboard, NAV.patients, NAV.services, NAV.notifications, NAV.settings],
  [UserRoleEnum.PATIENT]: [
    NAV.dashboard,
    { ...NAV.queue, label: 'My Visits' },
    { ...NAV.lab, label: 'Lab Results' },
    NAV.notifications,
  ],
};

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { collapsed, toggle } = useSidebar();
  const role = user?.role;
  const navigation = role ? (navigations[role] ?? ALL_NAV) : ALL_NAV;

  return (
    <aside
      className={`flex h-full shrink-0 flex-col border-r border-line bg-surface-raised transition-[width] duration-200 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      <div
        className={`flex items-center border-b border-line py-4 ${collapsed ? 'justify-center px-2' : 'gap-2 px-5'}`}
      >
        {collapsed ? (
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-brand text-xs font-semibold text-white">
            M
          </div>
        ) : (
          <img src="/logo2.png" alt="Metis Healthcare" className="h-10 w-auto" />
        )}
      </div>
      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-3">
        {navigation.map((item) => {
          const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);

          return (
            <Link
              key={item.key}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition ${
                collapsed ? 'justify-center' : ''
              } ${active ? 'bg-brand-soft text-brand' : 'text-ink-muted hover:bg-surface hover:text-ink'}`}
            >
              <span className={active ? 'text-brand' : 'text-ink-muted'}>{item.icon}</span>
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>
      <button
        type="button"
        onClick={toggle}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        className="flex items-center justify-center gap-2 border-t border-line px-3 py-2.5 text-xs font-medium text-ink-muted hover:bg-surface hover:text-ink"
      >
        {collapsed ? (
          <FaAngleDoubleRight className="h-3.5 w-3.5" />
        ) : (
          <>
            <FaAngleDoubleLeft className="h-3.5 w-3.5" />
            <span>Collapse</span>
          </>
        )}
      </button>
      <MetisFooter compact={collapsed} className="border-t border-line" />
    </aside>
  );
}
