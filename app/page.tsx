'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  FaCalculator,
  FaClipboardList,
  FaFlask,
  FaHeartbeat,
  FaPills,
  FaShieldAlt,
  FaStethoscope,
  FaUserInjured,
  FaUserNurse,
} from 'react-icons/fa';
import { Header } from '@/components';
import { UserRoleEnum } from '@/enum/user.enum';
import { roleInGroup } from '@/helpers/role-groups';
import { useAuth } from '@/providers';

interface RoleOption {
  role: UserRoleEnum;
  label: string;
  description: string;
  icon: React.ReactNode;
}

const ICON = 'h-6 w-6';

const ROLE_OPTIONS: RoleOption[] = [
  {
    role: UserRoleEnum.ADMIN,
    label: 'Administrator',
    description: 'Full access to every module, including users and settings.',
    icon: <FaShieldAlt aria-hidden className={ICON} />,
  },
  {
    role: UserRoleEnum.RECEPTIONIST,
    label: 'Receptionist',
    description: 'Patient registration, services and notifications.',
    icon: <FaClipboardList aria-hidden className={ICON} />,
  },
  {
    role: UserRoleEnum.DOCTOR,
    label: 'Doctor',
    description: 'Patients, queue, triage, consultations, lab and pharmacy.',
    icon: <FaStethoscope aria-hidden className={ICON} />,
  },
  {
    role: UserRoleEnum.NURSE,
    label: 'Nurse',
    description: 'Patients, consultations, lab and pharmacy.',
    icon: <FaUserNurse aria-hidden className={ICON} />,
  },
  {
    role: UserRoleEnum.LAB_TECH,
    label: 'Lab Technician',
    description: 'Lab orders and results, inventory.',
    icon: <FaFlask aria-hidden className={ICON} />,
  },
  {
    role: UserRoleEnum.PHARMACIST,
    label: 'Pharmacist',
    description: 'Prescriptions, dispensing and inventory.',
    icon: <FaPills aria-hidden className={ICON} />,
  },
  {
    role: UserRoleEnum.ACCOUNTANT,
    label: 'Accountant',
    description: 'Patients, services and billing.',
    icon: <FaCalculator aria-hidden className={ICON} />,
  },
  {
    role: UserRoleEnum.PATIENT,
    label: 'Patient',
    description: 'My visits, lab results and notifications.',
    icon: <FaUserInjured aria-hidden className={ICON} />,
  },
];

export default function RolesPage() {
  const router = useRouter();
  const { user, isLoading, viewAsRole } = useAuth();
  const isAdmin = roleInGroup(user?.role, 'ADMINS');

  useEffect(() => {
    if (!isLoading && user && !isAdmin) router.replace('/dashboard');
  }, [isLoading, user, isAdmin, router]);

  if (!isAdmin) return null;

  const choose = (role: UserRoleEnum) => {
    viewAsRole(role);
    router.push('/dashboard');
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-slate-50">
      <Header standalone />

      <main className="flex flex-1 flex-col items-center px-6 py-12">
        <div className="text-center">
          <h2 className="flex items-center justify-center gap-2 text-2xl font-semibold tracking-tight text-slate-900">
            <FaHeartbeat aria-hidden className="h-6 w-6 text-green-700" />
            Choose a role to continue
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            You will see exactly what that role sees. You can switch back from the profile menu.
          </p>
        </div>

        <ul className="mt-10 grid w-full max-w-5xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {ROLE_OPTIONS.map((option) => (
            <li key={option.role}>
              <button
                type="button"
                onClick={() => choose(option.role)}
                className="flex h-full w-full flex-col items-start gap-3 rounded-xl border border-slate-200 bg-white p-5 text-left shadow-sm transition-colors hover:border-green-600 hover:bg-green-50 focus-visible:outline-2 focus-visible:outline-green-700"
              >
                <span className="rounded-lg bg-green-100 p-2.5 text-green-700">{option.icon}</span>
                <span className="text-base font-semibold text-slate-900">{option.label}</span>
                <span className="text-sm text-slate-600">{option.description}</span>
              </button>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
