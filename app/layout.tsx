import type { Metadata } from 'next';
import { Geist_Mono, Nunito_Sans } from 'next/font/google';
import './globals.css';
import Header from '../components/layout/header';
import Sidebar from '../components/layout/sidebar';

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
        <div className="flex h-screen w-screen overflow-hidden">
          <Sidebar />
          <div className="flex min-w-0 flex-1 flex-col">
            <Header />
            <main className="min-h-0 flex-1 overflow-auto p-4">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
