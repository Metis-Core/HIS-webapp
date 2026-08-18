'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import * as Yup from 'yup';
import { Button, Form, FormInput, Input } from '@/components';
import { useAuth } from '@/providers';
import { AuthErrorCodeEnum } from '@/enum';
import { getApiBaseUrl, getDefaultApiBaseUrl, hasApiOverride, setApiBaseUrl } from '@/helpers/api-config';

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
  const [wasNetworkError, setWasNetworkError] = useState(false);
  const [showServerConfig, setShowServerConfig] = useState(false);
  const [apiUrlInput, setApiUrlInput] = useState('');
  const [activeApiUrl, setActiveApiUrl] = useState('');
  const [overrideActive, setOverrideActive] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null);

  useEffect(() => {
    const current = getApiBaseUrl();
    setActiveApiUrl(current);
    setApiUrlInput(current);
    setOverrideActive(hasApiOverride());
  }, []);

  const saveApiUrl = () => {
    const applied = setApiBaseUrl(apiUrlInput);
    setActiveApiUrl(applied);
    setApiUrlInput(applied);
    setOverrideActive(hasApiOverride());
    setSubmitError(null);
    setWasNetworkError(false);
  };

  const resetApiUrl = () => {
    const applied = setApiBaseUrl('');
    setActiveApiUrl(applied);
    setApiUrlInput(applied);
    setOverrideActive(false);
    setTestResult(null);
  };

  const testConnection = async () => {
    const target = apiUrlInput.trim().replace(/\/+$/, '');
    if (!target) return;
    setTesting(true);
    setTestResult(null);
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      const res = await fetch(target, { method: 'HEAD', signal: controller.signal });
      clearTimeout(timeout);
      setTestResult({ ok: true, message: `Reachable (HTTP ${res.status})` });
    } catch (err) {
      const msg = (err as Error).name === 'AbortError' ? 'Timed out after 5s' : (err as Error).message;
      setTestResult({ ok: false, message: `Could not reach server: ${msg}` });
    } finally {
      setTesting(false);
    }
  };

  const handleSubmit = async (values: LoginFormValues) => {
    setSubmitError(null);
    setWasNetworkError(false);
    setLoading(true);
    try {
      await login(values);
    } catch (error) {
      const err = error as { code?: AuthErrorCodeEnum; message?: string };
      const message =
        err.code === AuthErrorCodeEnum.INVALID_CREDENTIALS
          ? 'Invalid username or password'
          : err.code === AuthErrorCodeEnum.ACCOUNT_SUSPENDED
            ? 'Your account is inactive or suspended'
            : err.code === AuthErrorCodeEnum.NETWORK
              ? 'Could not reach the server. Check your connection.'
              : (err.message ?? 'Login failed. Please try again.');
      setSubmitError(message);
      setWasNetworkError(err.code === AuthErrorCodeEnum.NETWORK);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-linear-to-br from-slate-100 via-emerald-50/50 to-orange-50/40 p-4 sm:p-6">
      <div className="grid w-full max-w-5xl min-h-[540px] overflow-hidden rounded-xl bg-white  md:grid-cols-2">
        <div className="relative hidden min-h-[540px] md:block">
          <Image
            src="/auth.jpg"
            alt="Medical supplies"
            fill
            className="object-cover object-[center_30%]"
            priority
            sizes="50vw"
          />
          <div className="absolute inset-0 bg-linear-to-t from-[#0f1c3f]/90 via-[#0f1c3f]/35 to-transparent" />
          <div className="absolute inset-0 flex flex-col justify-end p-8 text-white">
            <div className="space-y-3">
              <h2 className="max-w-sm text-2xl font-semibold leading-snug tracking-tight">Care that stays connected</h2>
              <p className="max-w-sm text-sm leading-relaxed text-white/85">
                Access patient records, clinical workflows, and day-to-day hospital operations in one secure place.
              </p>
              <ul className="space-y-1.5 pt-1 text-sm text-white/75">
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Secure clinical access
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-orange-400" />
                  Real-time care coordination
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-center gap-8 px-6 py-10 sm:px-10">
          <div className="flex flex-col items-center text-center">
            <Image
              src="/logo2.png"
              alt="Suubi Medical Centre"
              width={200}
              height={200}
              className="h-28 w-auto object-contain"
              priority
            />
            <h1 className="mt-4 text-2xl font-semibold tracking-tight text-slate-900">Sign in</h1>
            <p className="mt-1 text-sm text-slate-500">Enter your credentials to continue</p>
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
              <div role="alert" className="flex flex-col gap-2 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
                <span>{submitError}</span>
                {wasNetworkError && (
                  <button
                    type="button"
                    onClick={() => setShowServerConfig(true)}
                    className="self-start text-xs font-semibold text-red-800 underline hover:text-red-900"
                  >
                    Configure server URL
                  </button>
                )}
              </div>
            )}
            <div className="flex justify-end">
              <button type="button" className="text-sm font-medium text-[#f37021] hover:underline">
                Forgot password?
              </button>
            </div>
            <Button type="submit" loading={loading} className="mt-1 w-full">
              Login
            </Button>
          </Form>

          <div className="flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={() => setShowServerConfig((v) => !v)}
              className="text-xs font-medium text-slate-500 underline decoration-dotted underline-offset-2 hover:text-slate-700"
            >
              Server: {activeApiUrl || '(unset)'} {overrideActive ? '(custom)' : ''}
            </button>
            <p className="text-center text-xs text-slate-400">Authorized staff only · Suubi Medical Centre</p>
          </div>

          {showServerConfig && (
            <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div>
                <h2 className="text-sm font-semibold text-slate-800">API server</h2>
                <p className="mt-0.5 text-xs text-slate-500">
                  The address of the backend this app should talk to. Change it if the default is unreachable.
                </p>
              </div>
              <Input
                label="Base URL"
                type="url"
                placeholder="https://api.example.com"
                value={apiUrlInput}
                onChange={(e) => setApiUrlInput(e.target.value)}
              />
              <p className="text-xs text-slate-500">
                Built-in default:{' '}
                <code className="rounded bg-white px-1.5 py-0.5">{getDefaultApiBaseUrl() || '(unset)'}</code>
              </p>
              {testResult && (
                <p
                  className={`rounded-md px-3 py-2 text-xs ${
                    testResult.ok ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-700'
                  }`}
                >
                  {testResult.message}
                </p>
              )}
              <div className="flex flex-wrap gap-2">
                <Button type="button" onClick={saveApiUrl} className="text-xs">
                  Save
                </Button>
                <Button type="button" onClick={testConnection} loading={testing} className="text-xs">
                  Test
                </Button>
                {overrideActive && (
                  <Button type="button" onClick={resetApiUrl} className="text-xs">
                    Reset
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
