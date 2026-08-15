'use client';

import * as Yup from 'yup';
import { format } from 'date-fns';
import Drawer from './drawer';
import Button from '../buttons/button';
import Form from '../forms/form';
import FormDropdown from '../forms/form-dropdown';
import FormInput from '../forms/form-input';
import Pill from '../pills/pill';
import { ButtonVariantEnum, ModalDrawerModeEnum } from '@/enum';
import { DepartmentEnum, UserRoleEnum, UserStatusEnum } from '@/enum/user.enum';
import { roleLabel, statusVariants } from '@/data/users';
import type { IUserDrawerProps, UserFormValues } from '@/interfaces';

const roleOptions = Object.values(UserRoleEnum).map((role) => ({ label: roleLabel(role), value: role }));
const departmentOptions = Object.values(DepartmentEnum).map((department) => ({
  label: roleLabel(department),
  value: department,
}));
const statusOptions = Object.values(UserStatusEnum).map((status) => ({ label: roleLabel(status), value: status }));

const emptyValues: UserFormValues = {
  username: '',
  email: '',
  password: '',
  role: UserRoleEnum.RECEPTIONIST,
  department: DepartmentEnum.RECEPTION,
  status: UserStatusEnum.ACTIVE,
};

function buildSchema(mode: ModalDrawerModeEnum | null) {
  return Yup.object({
    username: Yup.string()
      .required('Username is required')
      .matches(/^[a-zA-Z0-9._-]{3,32}$/, 'Use 3-32 letters, numbers, dots, dashes or underscores'),
    email: Yup.string().email('Enter a valid email').required('Email is required'),
    password:
      mode === ModalDrawerModeEnum.ADD
        ? Yup.string().min(12, 'Password must be at least 12 characters').required('Password is required')
        : Yup.string().test('len', 'Password must be at least 12 characters', (value) => !value || value.length >= 12),
    role: Yup.string().oneOf(Object.values(UserRoleEnum)).required('Role is required'),
    department: Yup.string().oneOf(Object.values(DepartmentEnum)).required('Department is required'),
    status: Yup.string().oneOf(Object.values(UserStatusEnum)).required('Status is required'),
  });
}

function ViewField({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-400">{label}</dt>
      <dd className="mt-1 text-zinc-900">{value?.trim() ? value : '—'}</dd>
    </div>
  );
}

export default function UserDrawer({ mode, user, onClose, onSave, onEdit }: IUserDrawerProps) {
  const title =
    mode === ModalDrawerModeEnum.ADD ? 'Add user' : mode === ModalDrawerModeEnum.EDIT ? 'Edit user' : 'User details';

  const initialValues: UserFormValues = user
    ? {
        username: user.username,
        email: user.email,
        password: '',
        role: user.role,
        department: user.department,
        status: user.status,
      }
    : emptyValues;

  return (
    <Drawer open={mode !== null} onClose={onClose} title={title} width="w-125">
      {mode === ModalDrawerModeEnum.VIEW && user ? (
        <div className="flex flex-col gap-8">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-800 text-xl font-bold text-white">
              {user.username.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="text-xl font-bold text-zinc-900">{user.username}</p>
              <Pill variant={statusVariants[user.status]}>{user.status}</Pill>
            </div>
          </div>

          <dl className="grid gap-4 sm:grid-cols-2">
            <ViewField label="Email" value={user.email} />
            <ViewField label="Role" value={roleLabel(user.role)} />
            <ViewField label="Department" value={roleLabel(user.department)} />
            <ViewField
              label="Password last changed"
              value={user.passwordLastChangedAt ? format(new Date(user.passwordLastChangedAt), 'dd MMM yyyy') : 'Never'}
            />
          </dl>

          <div className="flex justify-end gap-3 border-t border-zinc-100 pt-5">
            <Button type="button" variant={ButtonVariantEnum.DANGER} onClick={onClose}>
              Close
            </Button>
            <Button type="button" onClick={() => onEdit(user)}>
              Edit user
            </Button>
          </div>
        </div>
      ) : (
        <Form
          key={user?.id ?? 'new'}
          initialValues={initialValues}
          validationSchema={buildSchema(mode)}
          onSubmit={(values, { resetForm }) => {
            onSave(values);
            resetForm();
          }}
          className="flex h-full flex-col gap-4"
        >
          <FormInput name="username" label="Username" placeholder="Username" required />
          <FormInput name="email" label="Email" type="email" placeholder="Email" required />
          <FormInput
            name="password"
            label={mode === ModalDrawerModeEnum.EDIT ? 'New password' : 'Password'}
            type="password"
            placeholder={mode === ModalDrawerModeEnum.EDIT ? 'Leave blank to keep current password' : 'Password'}
            required={mode === ModalDrawerModeEnum.ADD}
          />
          <FormDropdown name="role" label="Role" options={roleOptions} placeholder="Select role" />
          <FormDropdown
            name="department"
            label="Department"
            options={departmentOptions}
            placeholder="Select department"
          />
          <FormDropdown name="status" label="Status" options={statusOptions} placeholder="Select status" />

          <Button type="submit" className="mt-2 w-full justify-center">
            {mode === ModalDrawerModeEnum.EDIT ? 'Save changes' : 'Add user'}
          </Button>
        </Form>
      )}
    </Drawer>
  );
}
