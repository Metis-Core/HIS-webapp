'use client';

import { useField } from 'formik';
import { FaCheckCircle, FaRegCircle } from 'react-icons/fa';
import { passwordRules } from '@/helpers/password-policy';
import { usePasswordPolicy } from '@/hooks';

export function FormPasswordChecklist({ name }: { name: string }) {
  const [field] = useField<string>(name);
  return <PasswordChecklist value={field.value ?? ''} />;
}

export default function PasswordChecklist({ value }: { value: string }) {
  const { minLength } = usePasswordPolicy();
  return (
    <ul className="flex flex-col gap-1 text-xs" aria-live="polite">
      {passwordRules(minLength).map((rule) => {
        const met = rule.test(value);
        return (
          <li key={rule.label} className={`flex items-center gap-2 ${met ? 'text-normal' : 'text-ink-muted'}`}>
            {met ? <FaCheckCircle aria-hidden /> : <FaRegCircle aria-hidden />}
            <span>{rule.label}</span>
          </li>
        );
      })}
    </ul>
  );
}
