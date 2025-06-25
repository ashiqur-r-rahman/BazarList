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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("font-body antialiased", ptSans.variable)}>
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
