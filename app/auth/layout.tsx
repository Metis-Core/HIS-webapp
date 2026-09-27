import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign in · Metis Healthcare',
  description: 'Authorized staff access. A Metis Analytica product.',
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen w-full bg-surface">{children}</div>;
}
