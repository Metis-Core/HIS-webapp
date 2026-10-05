'use client';

import { useField } from 'formik';
import { FaCheckCircle, FaRegCircle } from 'react-icons/fa';

export const PASSWORD_MIN_LENGTH = 8;

export const passwordRules = [
  { label: `At least ${PASSWORD_MIN_LENGTH} characters`, test: (v: string) => v.length >= PASSWORD_MIN_LENGTH },
  { label: 'At least one letter', test: (v: string) => /[A-Za-z]/.test(v) },
  { label: 'At least one number', test: (v: string) => /\d/.test(v) },
];

export const isValidPassword = (value: string) => passwordRules.every((rule) => rule.test(value));

export function FormPasswordChecklist({ name }: { name: string }) {
  const [field] = useField<string>(name);
  return <PasswordChecklist value={field.value ?? ''} />;
}

export default function PasswordChecklist({ value }: { value: string }) {
  return (
    <ul className="flex flex-col gap-1 text-xs" aria-live="polite">
      {passwordRules.map((rule) => {
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
