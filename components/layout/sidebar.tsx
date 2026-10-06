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
    href: '/',
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

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { collapsed, toggle } = useSidebar();
  const role = user?.role;
  const navigation = role ? (navigations[role] ?? ALL_NAV) : ALL_NAV;

  return (
    <aside
      className={`flex h-full shrink-0 flex-col border rounded-lg drop-shadow-md border-line bg-surface-raised transition-[width] duration-200 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      <div className="relative flex h-32 items-center justify-center border-b border-line">
        <Image
          src="/logo.png"
          alt="Suubi Medical Centre"
          width={192}
          height={128}
          priority
          className={`object-contain transition-all duration-200 ${
            collapsed ? 'h-12 w-12' : 'h-28 w-auto max-w-[12rem]'
          }`}
        />
        <button
          type="button"
          onClick={toggle}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className={`absolute flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-ink-muted transition hover:bg-surface hover:text-ink ${
            collapsed ? 'bottom-2 right-2' : 'right-4 top-1/2 -translate-y-1/2'
          }`}
        >
          {collapsed ? <FaAngleDoubleRight className="h-3.5 w-3.5" /> : <FaAngleDoubleLeft className="h-3.5 w-3.5" />}
        </button>
      </div>
      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-3 space-y-4">
        {navigation.map((item) => {
          const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);

          return (
            <Link
              key={item.key}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                collapsed ? 'justify-center' : ''
              } ${active ? 'bg-primary-soft text-primary' : 'text-ink-muted hover:bg-surface hover:text-ink'}`}
            >
              <span className={active ? 'text-primary' : 'text-ink-muted'}>{item.icon}</span>
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
