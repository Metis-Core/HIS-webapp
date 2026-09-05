import type { Metadata } from 'next';
import { Geist_Mono, Inter } from 'next/font/google';
import { Toaster } from 'sonner';
import { AuthProvider, SidebarProvider, SwrProvider } from '@/providers';
import './globals.css';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Metis Healthcare — by Metis Analytica',
  description: 'Hospital information system for clinical staff. Built by Metis Analytica.',
  applicationName: 'Metis Healthcare',
  authors: [{ name: 'Metis Analytica' }],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans bg-surface text-ink">
        <AuthProvider>
          <SwrProvider>
            <SidebarProvider>{children}</SidebarProvider>
          </SwrProvider>
        </AuthProvider>
        {/* Single Toaster mounted once — modules must not add their own. See AGENTS.md §6. */}
        <Toaster
          position="bottom-right"
          mobileOffset={{ bottom: 16, left: 16, right: 16 }}
          toastOptions={{
            classNames: {
              toast: 'group toast font-sans !border !border-line !bg-surface-raised !text-ink !shadow-sm',
              description: '!text-ink-muted',
              actionButton: '!bg-brand !text-white',
              success: '!border-normal/40',
              error: '!border-critical/40',
              warning: '!border-watch/40',
              info: '!border-info/40',
            },
          }}
          duration={4000}
          closeButton
        />
      </body>
    </html>
  );
}
