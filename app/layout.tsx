import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Geist_Mono, Nunito_Sans } from 'next/font/google';
import { AuthProvider, SwrProvider } from '@/providers';
import './globals.css';

const nunitoSans = Nunito_Sans({
  variable: '--font-nunito-sans',
  subsets: ['latin'],
  display: 'swap',
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Metis Healthcare',
  description: 'Metis Healthcare',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${nunitoSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        <SwrProvider>
          <Suspense fallback={null}>
            <AuthProvider>{children}</AuthProvider>
          </Suspense>
        </SwrProvider>
      </body>
    </html>
  );
}
