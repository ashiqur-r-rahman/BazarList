import type { Metadata } from 'next';
import { PT_Sans } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { BazarProvider } from '@/context/BazarContext';
import { AuthProvider } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

const ptSans = PT_Sans({
  subsets: ['latin'],
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  variable: '--font-pt-sans',
});

export const metadata: Metadata = {
  title: 'BazarList Simplified',
  description: 'Your simplified shopping list manager.',
  manifest: '/manifest.json',
  themeColor: '#F7F4E5',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'BazarList',
  },
  icons: {
    apple: 'https://placehold.co/180x180.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={cn("font-body antialiased", ptSans.variable)} suppressHydrationWarning>
        <AuthProvider>
          <BazarProvider>
            {children}
            <Toaster />
          </BazarProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
