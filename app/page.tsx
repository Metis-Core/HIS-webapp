'use client';

import { useRouter } from 'next/navigation';
import {
  FaCalculator,
  FaClipboardList,
  FaFlask,
  FaLock,
  FaPills,
  FaShieldAlt,
  FaStethoscope,
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
];

export default function RolesPage() {
  const router = useRouter();
  const { user, viewAsRole } = useAuth();
  const isAdmin = roleInGroup(user?.role, 'ADMINS');

  if (!user) return null;

  const canAccess = (role: UserRoleEnum) => isAdmin || role === user.role;
  const options = [...ROLE_OPTIONS].sort((a, b) => Number(canAccess(b.role)) - Number(canAccess(a.role)));

  const choose = (role: UserRoleEnum) => {
    if (!canAccess(role)) return;
    if (isAdmin) viewAsRole(role);
    router.push('/dashboard');
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-slate-50">
      <Header standalone />

      <main className="flex flex-1 flex-col items-center px-6 py-12">
        <div className="text-center">
          <h2 className="flex items-center justify-center gap-2 text-2xl font-semibold tracking-tight text-slate-900">
            Choose a role to continue
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            {isAdmin
              ? 'As an administrator you can open any role and see exactly what it sees.'
              : 'You can only open the role assigned to you. Roles marked with a lock are not available to your account.'}
          </p>
        </div>

        <ul className="mt-10 grid w-full max-w-5xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {options.map((option) => {
            const allowed = canAccess(option.role);
            return (
              <li key={option.role}>
                <button
                  type="button"
                  onClick={() => choose(option.role)}
                  disabled={!allowed}
                  className="relative flex h-full w-full flex-col items-start gap-3 rounded-xl border border-slate-200 bg-white p-5 text-left shadow-sm transition-colors hover:border-green-600 hover:bg-green-50 focus-visible:outline-2 focus-visible:outline-green-700 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 disabled:hover:border-slate-200 disabled:hover:bg-slate-100"
                >
                  {!allowed && (
                    <span className="absolute right-4 top-4 flex items-center gap-1 text-xs font-medium text-slate-500">
                      <FaLock aria-hidden className="h-4 w-4" />
                      <span className="sr-only">No access</span>
                    </span>
                  )}
                  <span
                    className={`rounded-lg p-2.5 ${allowed ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-400'}`}
                  >
                    {option.icon}
                  </span>
                  <span className={`text-base font-semibold ${allowed ? 'text-slate-900' : 'text-slate-500'}`}>
                    {option.label}
                  </span>
                  <span className={`text-sm ${allowed ? 'text-slate-600' : 'text-slate-400'}`}>
                    {option.description}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </main>
    </div>
  );
}
