'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  FaBoxes,
  FaCalendar,
  FaClipboardList,
  FaCog,
  FaFileInvoiceDollar,
  FaFlask,
  FaHome,
  FaNotesMedical,
  FaPills,
  FaProcedures,
  FaStethoscope,
  FaUserInjured,
  FaXRay,
} from 'react-icons/fa';
import type { IconType } from 'react-icons';
import { UserRoleEnum } from '@/enum/user.enum';
import { useAuth } from '@/providers';

interface NavItem {
  label: string;
  href: string;
  icon: IconType;
}

interface NavSection {
  heading: string;
  items: NavItem[];
}

const dashboard: NavItem = { label: 'Dashboard', href: '/', icon: FaHome };

const adminNav: NavSection[] = [
  { heading: 'Overview', items: [dashboard] },
  {
    heading: 'Clinical',
    items: [
      { label: 'Patients', href: '/patients', icon: FaUserInjured },
      { label: 'Queue', href: '/queue', icon: FaClipboardList },
      { label: 'Triage', href: '/triage', icon: FaNotesMedical },
      { label: 'Consultation', href: '/consultation', icon: FaStethoscope },
      { label: 'Diagnosis', href: '/diagnosis', icon: FaNotesMedical },
    ],
  },
  {
    heading: 'Departments',
    items: [
      { label: 'Lab', href: '/lab', icon: FaFlask },
      { label: 'Radiology', href: '/radiology', icon: FaXRay },
      { label: 'Pharmacy', href: '/pharmacy', icon: FaPills },
      { label: 'Surgery', href: '/surgery', icon: FaProcedures },
    ],
  },
  {
    heading: 'Operations',
    items: [
      { label: 'Stock', href: '/stock', icon: FaBoxes },
      { label: 'Invoices', href: '/invoices', icon: FaFileInvoiceDollar },
      { label: 'Settings', href: '/settings', icon: FaCog },
    ],
  },
];

const doctorNav: NavSection[] = [
  { heading: 'Overview', items: [dashboard] },
  {
    heading: 'Clinical',
    items: [
      { label: 'Patients', href: '/patients', icon: FaUserInjured },
      { label: 'Queue', href: '/queue', icon: FaClipboardList },
      { label: 'Triage', href: '/triage', icon: FaNotesMedical },
      { label: 'Consultation', href: '/consultation', icon: FaStethoscope },
      { label: 'Diagnosis', href: '/diagnosis', icon: FaNotesMedical },
    ],
  },
  {
    heading: 'Departments',
    items: [
      { label: 'Lab', href: '/lab', icon: FaFlask },
      { label: 'Radiology', href: '/radiology', icon: FaXRay },
      { label: 'Pharmacy', href: '/pharmacy', icon: FaPills },
    ],
  },
];

const nurseNav: NavSection[] = [
  { heading: 'Overview', items: [dashboard] },
  {
    heading: 'Clinical',
    items: [
      { label: 'Patients', href: '/patients', icon: FaUserInjured },
      { label: 'Queue', href: '/queue', icon: FaClipboardList },
      { label: 'Triage', href: '/triage', icon: FaNotesMedical },
    ],
  },
];

const receptionNav: NavSection[] = [
  { heading: 'Overview', items: [dashboard] },
  {
    heading: 'Front desk',
    items: [
      { label: 'Patients Registry', href: '/patients', icon: FaUserInjured },
      { label: 'Queue Management', href: '/queue', icon: FaClipboardList },
      { label: 'Appointments', href: '/appointments', icon: FaCalendar },
    ],
  },
];

const labNav: NavSection[] = [
  { heading: 'Overview', items: [dashboard] },
  {
    heading: 'Laboratory',
    items: [
      { label: 'Queue', href: '/queue', icon: FaClipboardList },
      { label: 'Lab', href: '/lab', icon: FaFlask },
    ],
  },
];

const pharmacyNav: NavSection[] = [
  { heading: 'Overview', items: [dashboard] },
  {
    heading: 'Pharmacy',
    items: [
      { label: 'Queue', href: '/queue', icon: FaClipboardList },
      { label: 'Pharmacy', href: '/pharmacy', icon: FaPills },
      { label: 'Stock', href: '/stock', icon: FaBoxes },
    ],
  },
];

const financeNav: NavSection[] = [
  { heading: 'Overview', items: [dashboard] },
  {
    heading: 'Finance',
    items: [
      { label: 'Queue', href: '/queue', icon: FaClipboardList },
      { label: 'Invoices', href: '/invoices', icon: FaFileInvoiceDollar },
    ],
  },
];

const patientNav: NavSection[] = [
  { heading: 'Overview', items: [dashboard] },
  {
    heading: 'My care',
    items: [
      { label: 'My Visits', href: '/queue', icon: FaClipboardList },
      { label: 'Lab Results', href: '/lab', icon: FaFlask },
      { label: 'Invoices', href: '/invoices', icon: FaFileInvoiceDollar },
    ],
  },
];

const navByRole: Record<UserRoleEnum, NavSection[]> = {
  [UserRoleEnum.SUPER_ADMIN]: adminNav,
  [UserRoleEnum.ADMIN]: adminNav,
  [UserRoleEnum.DOCTOR]: doctorNav,
  [UserRoleEnum.NURSE]: nurseNav,
  [UserRoleEnum.RECEPTIONIST]: receptionNav,
  [UserRoleEnum.LAB_TECH]: labNav,
  [UserRoleEnum.PHARMACIST]: pharmacyNav,
  [UserRoleEnum.ACCOUNTANT]: financeNav,
  [UserRoleEnum.PATIENT]: patientNav,
};

const roleLabels: Record<UserRoleEnum, string> = {
  [UserRoleEnum.SUPER_ADMIN]: 'Super Administrator',
  [UserRoleEnum.ADMIN]: 'Administrator',
  [UserRoleEnum.DOCTOR]: 'Doctor',
  [UserRoleEnum.NURSE]: 'Nurse',
  [UserRoleEnum.RECEPTIONIST]: 'Receptionist',
  [UserRoleEnum.LAB_TECH]: 'Lab Technician',
  [UserRoleEnum.PHARMACIST]: 'Pharmacist',
  [UserRoleEnum.ACCOUNTANT]: 'Accountant',
  [UserRoleEnum.PATIENT]: 'Patient',
};

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const role = user?.role;
  const sections = role ? navByRole[role] : [];

  return (
    <aside className="flex h-full w-72 shrink-0 flex-col border-r border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col items-center gap-2 border-b border-slate-200 px-4 py-6">
        <img src="/logo2.png" alt="Metis Healthcare" className="h-24 w-auto" />
        {role && (
          <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-green-800">
            {roleLabels[role]}
          </span>
        )}
      </div>

      <nav aria-label="Main navigation" className="flex flex-1 flex-col gap-5 overflow-y-auto px-3 py-5">
        {sections.map((section) => (
          <div key={section.heading} className="flex flex-col gap-1">
            <p className="px-3 pb-1 text-xs font-semibold uppercase tracking-wider text-slate-400">{section.heading}</p>
            {section.items.map((item) => {
              const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={`group relative flex min-h-11 items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-1 ${
                    active
                      ? 'bg-green-600 text-white shadow-sm'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <span
                    aria-hidden
                    className={`absolute left-0 top-1/2 h-6 -translate-y-1/2 rounded-r-full bg-green-800 transition-all ${
                      active ? 'w-1' : 'w-0'
                    }`}
                  />
                  <Icon
                    aria-hidden
                    className={`h-5 w-5 shrink-0 ${active ? 'text-white' : 'text-slate-500 group-hover:text-slate-700'}`}
                  />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
    </aside>
  );
}
