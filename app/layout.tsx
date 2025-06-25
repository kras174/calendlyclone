import './globals.css';

import { Geist, Geist_Mono } from 'next/font/google';

import { ClerkProvider } from '@clerk/nextjs';
import type { Metadata } from 'next';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Calendar App',
  description: 'Description for Calendar app',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className='h-full'>
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased animate-fade-in h-full`}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
