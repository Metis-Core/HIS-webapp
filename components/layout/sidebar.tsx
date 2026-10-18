'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  FaAngleDoubleLeft,
  FaBaby,
  FaAngleDoubleRight,
  FaChartLine,
  FaFileInvoiceDollar,
  FaCommentDots,
  FaHandHoldingMedical,
  FaXRay,
  FaMicroscope,
  FaNotesMedical,
  FaPills,
  FaTachometerAlt,
  FaUserInjured,
  FaUserShield,
  FaWarehouse,
} from 'react-icons/fa';
import { UserRoleEnum } from '@/enum/user.enum';
import { useUnreadMessages } from '@/hooks';
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
  consultations: {
    key: 'consultations',
    label: 'Consultations',
    href: '/consultations',
    icon: <FaNotesMedical aria-hidden className="h-5 w-5" />,
  },
  maternity: {
    key: 'maternity',
    label: 'Mother & child',
    href: '/maternity',
    icon: <FaBaby aria-hidden className="h-5 w-5" />,
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
  management: {
    key: 'management',
    label: 'Management',
    href: '/management',
    icon: <FaChartLine aria-hidden className="h-5 w-5" />,
  },
  billing: {
    key: 'billing',
    label: 'Billing',
    href: '/billing',
    icon: <FaFileInvoiceDollar aria-hidden className="h-5 w-5" />,
  },
  orders: {
    key: 'orders',
    label: 'Imaging & procedures',
    href: '/orders',
    icon: <FaXRay aria-hidden className="h-5 w-5" />,
  },
  services: {
    key: 'services',
    label: 'Services',
    href: '/services',
    icon: <FaHandHoldingMedical aria-hidden className="h-5 w-5" />,
  },
  messages: {
    key: 'messages',
    label: 'Messages',
    href: '/messages',
    icon: <FaCommentDots aria-hidden className="h-5 w-5" />,
  },
  users: { key: 'users', label: 'Users', href: '/users', icon: <FaUserShield aria-hidden className="h-5 w-5" /> },
};

const ALL_NAV: NavItem[] = [
  NAV.dashboard,
  NAV.management,
  NAV.patients,
  NAV.consultations,
  NAV.maternity,
  NAV.lab,
  NAV.orders,
  NAV.pharmacy,
  NAV.billing,
  NAV.inventory,
  NAV.services,
  NAV.messages,
  NAV.users,
];

// Triage lives under Patients and the queue board under the admin Dashboard (R4); their routes stay for deep links.
const navigations: Record<UserRoleEnum, NavItem[]> = {
  [UserRoleEnum.SUPER_ADMIN]: ALL_NAV,
  [UserRoleEnum.ADMIN]: ALL_NAV,
  [UserRoleEnum.DOCTOR]: [
    NAV.dashboard,
    NAV.patients,
    NAV.consultations,
    NAV.maternity,
    NAV.lab,
    NAV.orders,
    NAV.pharmacy,
    NAV.messages,
  ],
  [UserRoleEnum.NURSE]: [
    NAV.dashboard,
    NAV.patients,
    NAV.consultations,
    NAV.maternity,
    NAV.lab,
    NAV.orders,
    NAV.pharmacy,
    NAV.messages,
  ],
  // L3: the lab reaches patients through its queue, orders and search; no general patient list.
  [UserRoleEnum.LAB_TECH]: [NAV.dashboard, NAV.lab, NAV.orders, NAV.inventory, NAV.messages],
  [UserRoleEnum.PHARMACIST]: [NAV.dashboard, NAV.patients, NAV.pharmacy, NAV.inventory, NAV.messages],
  [UserRoleEnum.RECEPTIONIST]: [NAV.dashboard, NAV.patients, NAV.billing, NAV.services, NAV.messages],
  [UserRoleEnum.ACCOUNTANT]: [NAV.dashboard, NAV.management, NAV.patients, NAV.billing, NAV.services, NAV.messages],
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
  const unreadMessages = useUnreadMessages();

  return (
    <>
      <div className="flex h-32 shrink-0 items-center justify-center border-b border-slate-200">
        <Link href="/" onClick={onNavigate} aria-label="Go to home" title="Home">
          <Image
            src="/logo.png"
            alt="Suubi Medical Centre"
            width={192}
            height={128}
            priority
            className={collapsed ? 'h-auto w-12 object-contain' : 'h-20 w-auto max-w-[13rem] object-contain'}
          />
        </Link>
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
              {item.key === 'messages' && unreadMessages > 0 && (
                <span
                  aria-label={`${unreadMessages} unread messages`}
                  className={`rounded-full bg-critical px-1.5 text-[10px] font-semibold text-white ${collapsed ? '' : 'ml-auto'}`}
                >
                  {unreadMessages}
                </span>
              )}
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
