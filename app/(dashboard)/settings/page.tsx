'use client';

import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { FaBell, FaCog, FaKey, FaUser } from 'react-icons/fa';
import { Button, EmptyState, Input, PageHeader, Pill, Tabs } from '@/components';
import { ButtonVariantEnum, PillVariantEnum } from '@/enum';
import { useAuth } from '@/providers';
import usersService from '@/helpers/users.service';
import authService from '@/helpers/auth.service';
import { extractErrorMessage } from '@/helpers/errors';
import { RoleGroups } from '@/helpers/role-groups';
import PasswordChecklist, { isValidPassword, PASSWORD_MIN_LENGTH } from '@/components/forms/password-checklist';

type TabId = 'profile' | 'security' | 'preferences';

const NOTIFICATION_PREFS_KEY = 'his:notification-prefs';

interface NotificationPrefs {
  labResults: boolean;
  prescriptions: boolean;
  queueUpdates: boolean;
  systemAlerts: boolean;
}

const defaultPrefs: NotificationPrefs = {
  labResults: true,
  prescriptions: true,
  queueUpdates: true,
  systemAlerts: true,
};

export default function SettingsPage() {
  const [tab, setTab] = useState<TabId>('profile');
  const { user, refreshUser } = useAuth();

  return (
    <div className="flex flex-col gap-5">
      <PageHeader description="Your profile, password, and notification preferences. Manage staff on the Users page." />

      <Tabs<TabId>
        tabs={[
          { id: 'profile', label: 'Profile', icon: FaUser },
          { id: 'security', label: 'Security', icon: FaKey },
          { id: 'preferences', label: 'Preferences', icon: FaBell },
        ]}
        active={tab}
        onChange={setTab}
      />

      {!user ? (
        <EmptyState message="Sign in to manage your settings" icon={FaCog} />
      ) : tab === 'profile' ? (
        <ProfileCard onSaved={() => refreshUser()} />
      ) : tab === 'security' ? (
        <SecurityCard />
      ) : (
        <PreferencesCard />
      )}
    </div>
  );
}

function ProfileCard({ onSaved }: { onSaved: () => void }) {
  const { user } = useAuth();
  const [values, setValues] = useState({ username: '', email: '', currentPassword: '' });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user) setValues({ username: user.username, email: user.email, currentPassword: '' });
  }, [user]);

  if (!user) return null;

  // Everyone may change their username (re-confirming their password); email stays admin-managed
  // until there is a way to verify a new address (C-1 follow-up).
  const isAdmin = (RoleGroups.ADMINS as readonly string[]).includes(user.role);
  const usernameDirty = values.username.trim() !== user.username;
  const emailDirty = isAdmin && values.email.trim() !== user.email;
  const needsPassword = usernameDirty && !isAdmin;
  const dirty = usernameDirty || emailDirty;
  const canSubmit = dirty && (!needsPassword || values.currentPassword.length > 0);

  const save = () =>
    isAdmin
      ? usersService.update(user.id, { username: values.username.trim(), email: values.email.trim() })
      : authService.updateProfile(values.username.trim(), values.currentPassword);

  const submit = async () => {
    if (!canSubmit) return;
    setBusy(true);
    try {
      await toast
        .promise(save(), {
          loading: 'Saving profile…',
          success: 'Profile updated',
          error: (err: unknown) => extractErrorMessage(err, "Couldn't save — retry"),
        })
        .unwrap();
      setValues((s) => ({ ...s, currentPassword: '' }));
      onSaved();
    } catch {
      // The toast already shows the reason.
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="flex flex-col gap-4 rounded-lg border border-line bg-surface-raised p-5">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold text-ink">Profile</h2>
          <p className="text-xs text-ink-muted">
            {isAdmin
              ? 'Basic account information.'
              : 'You can change your username. Ask an administrator to change your email.'}
          </p>
        </div>
        <Pill variant={PillVariantEnum.INFO}>{user.role.replaceAll('_', ' ')}</Pill>
      </header>

      <div className="grid gap-3 sm:grid-cols-2">
        <Input
          label="Username"
          value={values.username}
          onChange={(e) => setValues((s) => ({ ...s, username: e.target.value }))}
        />
        <Input
          label="Email"
          type="email"
          value={values.email}
          disabled={!isAdmin}
          onChange={(e) => setValues((s) => ({ ...s, email: e.target.value }))}
        />
        {needsPassword && (
          <Input
            label="Current password (to confirm)"
            type="password"
            autoComplete="current-password"
            value={values.currentPassword}
            onChange={(e) => setValues((s) => ({ ...s, currentPassword: e.target.value }))}
          />
        )}
        <Input label="Role" value={user.role.replaceAll('_', ' ')} disabled />
        <Input label="Department" value={user.department?.replaceAll('_', ' ') ?? '—'} disabled />
      </div>

      <div className="grid gap-3 border-t border-line pt-3 text-xs text-ink-muted sm:grid-cols-3">
        <div>
          <p className="font-medium text-ink">Status</p>
          <p className="capitalize">{user.status.replaceAll('_', ' ')}</p>
        </div>
        <div>
          <p className="font-medium text-ink">Password last changed</p>
          <p className="tabular-nums">
            {user.passwordLastChangedAt ? new Date(user.passwordLastChangedAt).toLocaleDateString() : '—'}
          </p>
        </div>
        <div>
          <p className="font-medium text-ink">Member since</p>
          <p className="tabular-nums">{new Date(user.createdAt).toLocaleDateString()}</p>
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="button" variant={ButtonVariantEnum.PRIMARY} onClick={submit} loading={busy} disabled={!canSubmit}>
          Save changes
        </Button>
      </div>
    </section>
  );
}

function SecurityCard() {
  const { user } = useAuth();
  const [values, setValues] = useState({ current: '', next: '', confirm: '' });
  const [busy, setBusy] = useState(false);

  if (!user) return null;

  const submit = async () => {
    if (!values.current) {
      toast.error('Enter your current password');
      return;
    }
    if (!isValidPassword(values.next)) {
      toast.error('New password does not meet the rules');
      return;
    }
    if (values.next !== values.confirm) {
      toast.error('Passwords do not match');
      return;
    }
    setBusy(true);
    try {
      await toast
        .promise(authService.changePassword(values.current, values.next), {
          loading: 'Updating password…',
          success: 'Password updated — other devices have been signed out',
          error: (err: unknown) => extractErrorMessage(err, "Couldn't update — retry"),
        })
        .unwrap();
      setValues({ current: '', next: '', confirm: '' });
    } catch {
      // The toast already shows the reason; keep the form filled so the user can correct it.
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="flex flex-col gap-4 rounded-lg border border-line bg-surface-raised p-5">
      <header>
        <h2 className="text-sm font-semibold text-ink">Change password</h2>
        <p className="text-xs text-ink-muted">
          Use at least {PASSWORD_MIN_LENGTH} characters with a letter and a number. Changing it signs you out on every
          other device.
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2">
        <Input
          label="Current password"
          type="password"
          autoComplete="current-password"
          value={values.current}
          onChange={(e) => setValues((s) => ({ ...s, current: e.target.value }))}
        />
        <span />
        <Input
          label="New password"
          type="password"
          autoComplete="new-password"
          value={values.next}
          onChange={(e) => setValues((s) => ({ ...s, next: e.target.value }))}
        />
        <Input
          label="Confirm new password"
          type="password"
          autoComplete="new-password"
          value={values.confirm}
          onChange={(e) => setValues((s) => ({ ...s, confirm: e.target.value }))}
        />
        <PasswordChecklist value={values.next} />
      </div>

      <div className="flex justify-end">
        <Button
          type="button"
          variant={ButtonVariantEnum.PRIMARY}
          loading={busy}
          onClick={submit}
          disabled={!values.current || !values.next || !values.confirm}
        >
          Update password
        </Button>
      </div>
    </section>
  );
}

function PreferencesCard() {
  const [prefs, setPrefs] = useState<NotificationPrefs>(defaultPrefs);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const raw = window.localStorage.getItem(NOTIFICATION_PREFS_KEY);
    if (raw) {
      try {
        setPrefs({ ...defaultPrefs, ...(JSON.parse(raw) as NotificationPrefs) });
      } catch {
        setPrefs(defaultPrefs);
      }
    }
  }, []);

  const toggle = (key: keyof NotificationPrefs) => {
    setPrefs((s) => {
      const next = { ...s, [key]: !s[key] };
      window.localStorage.setItem(NOTIFICATION_PREFS_KEY, JSON.stringify(next));
      toast.success('Preference updated');
      return next;
    });
  };

  const rows = useMemo(
    () => [
      { key: 'labResults' as const, label: 'Lab result notifications', hint: 'Notify me when lab results are ready' },
      { key: 'prescriptions' as const, label: 'Prescription updates', hint: 'Notify on dispense and cancellations' },
      { key: 'queueUpdates' as const, label: 'Queue updates', hint: 'When a patient advances in the queue' },
      { key: 'systemAlerts' as const, label: 'System alerts', hint: 'Low stock, downtime, maintenance' },
    ],
    [],
  );

  return (
    <section className="flex flex-col gap-4 rounded-lg border border-line bg-surface-raised p-5">
      <header>
        <h2 className="text-sm font-semibold text-ink">Notification preferences</h2>
        <p className="text-xs text-ink-muted">
          Stored locally in this browser. Server-side channels are configured by administrators.
        </p>
      </header>

      <ul className="flex flex-col divide-y divide-line rounded-md border border-line">
        {rows.map((r) => (
          <li key={r.key} className="flex items-center justify-between gap-3 px-4 py-3">
            <div>
              <p className="text-sm font-medium text-ink">{r.label}</p>
              <p className="text-xs text-ink-muted">{r.hint}</p>
            </div>
            <button
              type="button"
              onClick={() => toggle(r.key)}
              aria-pressed={prefs[r.key]}
              className={`inline-flex h-6 w-11 items-center rounded-full transition ${
                prefs[r.key] ? 'bg-brand' : 'bg-line'
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${
                  prefs[r.key] ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              />
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
