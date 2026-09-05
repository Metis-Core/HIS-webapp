import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign in · Metis Healthcare',
  description: 'Authorized staff access. A Metis Analytica product.',
};

/* Auth = minimal chrome, no sidebar/topbar (AGENTS.md §5). */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen w-full bg-surface">{children}</div>;
}
