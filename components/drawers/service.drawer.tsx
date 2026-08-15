'use client';

import * as Yup from 'yup';
import { useField } from 'formik';
import Drawer from './drawer';
import Button from '../buttons/button';
import Form from '../forms/form';
import FormInput from '../forms/form-input';
import Toggle from '../inputs/toggle';
import Pill from '../pills/pill';
import { ButtonVariantEnum, ModalDrawerModeEnum, PillVariantEnum } from '@/enum';
import type { IServiceDrawerProps, ServiceFormValues } from '@/interfaces';

const schema = Yup.object({
  name: Yup.string().required('Service name is required').max(150, 'Keep it under 150 characters'),
  fee: Yup.number().typeError('Fee must be a number').min(0, 'Fee cannot be negative').required('Fee is required'),
  description: Yup.string().max(255, 'Keep it under 255 characters'),
});

const emptyValues: ServiceFormValues = {
  name: '',
  fee: '',
  description: '',
  isActive: true,
};

function FormToggle({ name, label }: { name: string; label?: string }) {
  const [field, , helpers] = useField<boolean>(name);
  return <Toggle checked={field.value} onChange={(value) => helpers.setValue(value)} label={label} />;
}

function ViewField({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-400">{label}</dt>
      <dd className="mt-1 text-zinc-900">{value?.trim() ? value : '—'}</dd>
    </div>
  );
}

export default function ServiceDrawer({ mode, service, onClose, onSave, onEdit }: IServiceDrawerProps) {
  const title =
    mode === ModalDrawerModeEnum.ADD
      ? 'Add service'
      : mode === ModalDrawerModeEnum.EDIT
        ? 'Edit service'
        : 'Service details';

  const initialValues: ServiceFormValues = service
    ? {
        name: service.name,
        fee: String(service.fee),
        description: service.description ?? '',
        isActive: service.isActive,
      }
    : emptyValues;

  return (
    <Drawer open={mode !== null} onClose={onClose} title={title} width="w-125">
      {mode === ModalDrawerModeEnum.VIEW && service ? (
        <div className="flex flex-col gap-8">
          <div>
            <p className="text-xl font-bold text-zinc-900">{service.name}</p>
            <Pill variant={service.isActive ? PillVariantEnum.SUCCESS : PillVariantEnum.DEFAULT}>
              {service.isActive ? 'Active' : 'Inactive'}
            </Pill>
          </div>

          <dl className="grid gap-4 sm:grid-cols-2">
            <ViewField label="Fee (UGX)" value={service.fee.toLocaleString()} />
            <ViewField label="Description" value={service.description} />
          </dl>

          <div className="flex justify-end gap-3 border-t border-zinc-100 pt-5">
            <Button type="button" variant={ButtonVariantEnum.DANGER} onClick={onClose}>
              Close
            </Button>
            <Button type="button" onClick={() => onEdit(service)}>
              Edit service
            </Button>
          </div>
        </div>
      ) : (
        <Form
          key={service?.id ?? 'new'}
          initialValues={initialValues}
          validationSchema={schema}
          onSubmit={(values, { resetForm }) => {
            onSave(values);
            resetForm();
          }}
          className="flex h-full flex-col gap-4"
        >
          <FormInput name="name" label="Service name" placeholder="e.g. Consultation" required />
          <FormInput name="fee" label="Fee (UGX)" type="number" min={0} placeholder="0" required />
          <FormInput name="description" label="Description" placeholder="Optional" />
          <FormToggle name="isActive" label="Active" />

          <Button type="submit" className="mt-2 w-full justify-center">
            {mode === ModalDrawerModeEnum.EDIT ? 'Save changes' : 'Add service'}
          </Button>
        </Form>
      )}
    </Drawer>
  );
}
