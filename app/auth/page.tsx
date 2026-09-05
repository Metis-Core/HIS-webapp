'use client';

import { useState } from 'react';
import Image from 'next/image';
import { toast } from 'sonner';
import * as Yup from 'yup';
import { Button, Form, FormInput, MetisFooter } from '@/components';
import { useAuth } from '@/providers';

interface LoginFormValues {
  identifier: string;
  password: string;
}

const schema = Yup.object({
  identifier: Yup.string().trim().required('Username or email is required'),
  password: Yup.string().required('Password is required').min(12, 'Password must be at least 12 characters'),
});

const initialValues: LoginFormValues = { identifier: '', password: '' };

export default function AuthPage() {
  const { login } = useAuth();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: LoginFormValues) => {
    setSubmitError(null);
    setLoading(true);
    try {
      await login(values);
      toast.success('Signed in');
    } catch (err: any) {
      // Login failures NEVER use a toast — they need an inline banner (AGENTS.md §6).
      setSubmitError(err?.message ?? 'Invalid credentials. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center gap-4 p-4 sm:p-6">
      <div className="grid w-full max-w-5xl min-h-[540px] overflow-hidden rounded-xl border border-line bg-surface-raised md:grid-cols-2">
        <div className="relative hidden min-h-[540px] md:block">
          <Image src="/auth.jpg" alt="" fill className="object-cover object-[center_30%]" priority sizes="50vw" />
          <div className="absolute inset-0 bg-linear-to-t from-brand/95 via-brand/40 to-transparent" />
          <div className="absolute inset-0 flex flex-col justify-end p-8 text-white">
            <h2 className="max-w-sm text-2xl font-semibold leading-snug tracking-tight">Care that stays connected</h2>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/85">
              Access patient records, clinical workflows, and day-to-day hospital operations in one secure place.
            </p>
            <p className="mt-6 flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-white/70">
              Powered by
              <span className="inline-flex items-center rounded-md bg-white/95 px-2 py-1">
                <img src="/logo-dark.png" alt="Metis Analytica" className="h-3.5 w-auto" />
              </span>
            </p>
          </div>
        </div>

        <div className="flex flex-col justify-center gap-8 px-6 py-10 sm:px-10">
          <div className="flex flex-col items-center text-center">
            <Image
              src="/logo2.png"
              alt="Suubi Medical Centre"
              width={160}
              height={160}
              className="h-20 w-auto object-contain"
              priority
            />
            <h1 className="mt-4 text-xl font-semibold tracking-tight text-ink">Sign in</h1>
            <p className="mt-1 text-sm text-ink-muted">Enter your credentials to continue</p>
          </div>

          <Form
            initialValues={initialValues}
            validationSchema={schema}
            onSubmit={handleSubmit}
            className="flex flex-col gap-4"
          >
            <FormInput
              name="identifier"
              label="Username or email"
              placeholder="Enter username or email"
              autoComplete="username"
              required
            />
            <FormInput
              name="password"
              type="password"
              label="Password"
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />
            {submitError && (
              <div
                role="alert"
                className="flex items-start gap-2 rounded-md border border-critical/30 bg-critical-soft px-3 py-2 text-sm text-critical"
              >
                <span aria-hidden className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-critical" />
                <p>{submitError}</p>
              </div>
            )}
            <div className="flex justify-end">
              <button type="button" className="text-sm font-medium text-brand hover:text-brand-hover">
                Forgot password?
              </button>
            </div>
            <Button type="submit" loading={loading} className="mt-1 w-full">
              Sign in
            </Button>
          </Form>

          <p className="text-center text-xs text-ink-muted">Authorized staff only · A Metis Analytica product</p>
        </div>
      </div>
      <MetisFooter />
    </div>
  );
}
