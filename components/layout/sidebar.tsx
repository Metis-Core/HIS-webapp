'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  FaBars,
  FaBoxes,
  FaClipboardList,
  FaFileInvoiceDollar,
  FaFlask,
  FaHome,
  FaNotesMedical,
  FaPills,
  FaProcedures,
  FaUserInjured,
  FaXRay,
  FaCalendar,
  FaCog,
} from 'react-icons/fa';
import { UserRoleEnum } from '@/enum/user.enum';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const navigations: Partial<Record<UserRoleEnum, NavItem[]>> = {
  [UserRoleEnum.ADMIN]: [
    { label: 'Dashboard', href: '/', icon: <FaBars className="w-4 h-4" /> },
    {
      label: 'Patients',
      href: '/patients',
      icon: <FaUserInjured className="w-5 h-5" />,
    },
    {
      label: 'Queue',
      href: '/queue',
      icon: <FaClipboardList className="w-5 h-5" />,
    },
    { label: 'Lab', href: '/lab', icon: <FaFlask className="w-5 h-5" /> },
    {
      label: 'Radiology',
      href: '/radiology',
      icon: <FaXRay className="w-5 h-5" />,
    },
    {
      label: 'Pharmacy',
      href: '/pharmacy',
      icon: <FaPills className="w-5 h-5" />,
    },
    {
      label: 'Surgery',
      href: '/surgery',
      icon: <FaProcedures className="w-5 h-5" />,
    },
    { label: 'Stock', href: '/stock', icon: <FaBoxes className="w-5 h-5" /> },
    {
      label: 'Invoices',
      href: '/invoices',
      icon: <FaFileInvoiceDollar className="w-5 h-5" />,
    },
    {
      label: 'Diagnosis',
      href: '/diagnosis',
      icon: <FaNotesMedical className="w-5 h-5" />,
    },
    {
      label: 'Settings',
      href: '/settings',
      icon: <FaCog className="w-5 h-5" />,
    },
  ],
  [UserRoleEnum.DOCTOR]: [
    { label: 'Dashboard', href: '/', icon: <FaHome className="w-5 h-5" /> },
    {
      label: 'Patients',
      href: '/patients',
      icon: <FaUserInjured className="w-5 h-5" />,
    },
    {
      label: 'Queue',
      href: '/queue',
      icon: <FaClipboardList className="w-5 h-5" />,
    },
    { label: 'Lab', href: '/lab', icon: <FaFlask className="w-5 h-5" /> },
    {
      label: 'Radiology',
      href: '/radiology',
      icon: <FaXRay className="w-5 h-5" />,
    },
    {
      label: 'Pharmacy',
      href: '/pharmacy',
      icon: <FaPills className="w-5 h-5" />,
    },
    {
      label: 'Surgery',
      href: '/surgery',
      icon: <FaProcedures className="w-5 h-5" />,
    },
    {
      label: 'Diagnosis',
      href: '/diagnosis',
      icon: <FaNotesMedical className="w-5 h-5" />,
    },
  ],
  [UserRoleEnum.RECEPTIONIST]: [
    { label: 'Dashboard', href: '/', icon: <FaHome className="w-5 h-5" /> },
    {
      label: 'Patients Registry',
      href: '/patients',
      icon: <FaUserInjured className="w-5 h-5" />,
    },
    {
      label: 'Queue Management',
      href: '/queue',
      icon: <FaClipboardList className="w-5 h-5" />,
    },
    { label: 'Appointments', href: '/appointments', icon: <FaCalendar className="w-5 h-5" /> },
    // {
    //   label: 'Invoices',
    //   href: '/invoices',
    //   icon: <FaFileInvoiceDollar className="w-5 h-5" />,
    // },
    {
      label: 'Settings',
      href: '/settings',
      icon: <FaCog className="w-5 h-5" />,
    },
  ],
  [UserRoleEnum.PATIENT]: [
    { label: 'Dashboard', href: '/', icon: <FaHome className="w-5 h-5" /> },
    {
      label: 'My Visits',
      href: '/queue',
      icon: <FaClipboardList className="w-5 h-5" />,
    },
    {
      label: 'Lab Results',
      href: '/lab',
      icon: <FaFlask className="w-5 h-5" />,
    },
    {
      label: 'Invoices',
      href: '/invoices',
      icon: <FaFileInvoiceDollar className="w-5 h-5" />,
    },
  ],
};

export default function Sidebar() {
  const pathname = usePathname();
  const navigation = navigations[UserRoleEnum.RECEPTIONIST] ?? [];

  return (
    <aside className="flex h-full w-72 shrink-0 flex-col border-r border-zinc-200 bg-white px-4 shadow-md">
      <div className="flex items-center justify-center border-b border-slate-400 py-8">
        <img src="/logo2.png" alt="Metis Healthcare" className="h-32 w-auto" />
      </div>
      <nav className="flex flex-1 flex-col gap-4 overflow-y-auto pt-4">
        {navigation.map((item) => {
          const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-4 rounded-sm px-3 py-3 text-md font-medium transition ${
                active ? 'bg-green-600 text-white' : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
