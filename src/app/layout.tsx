import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import ClientAuthProvider from '@/components/providers/ClientAuthProvider';
import ConnectionStatus from '@/components/common/ConnectionStatus';
import HeaderVisibility from '@/components/common/HeaderVisibility';
import FooterVisibility from '@/components/common/FooterVisibility';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Enterprise Web Application',
  description: 'Enterprise Web Application with Google Workspace Integration',
  keywords: 'enterprise, web application, google workspace',
  authors: [{ name: 'Development Team' }],
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // SSR-safe: Hide header/footer if path matches login/signup
  // Hide header/footer for all /auth pages (login, signup, etc.)
  // Removed unused variable 'hideHeaderFooter'

  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body className={`${inter.className} h-full antialiased`}>
        <ConnectionStatus />
        <ClientAuthProvider>
          <div id="root" className="min-h-full flex flex-col min-h-screen">
            <HeaderVisibility />
            <div className="flex-1 flex flex-col min-h-0">{children}</div>
            <FooterVisibility />
          </div>
        </ClientAuthProvider>
      </body>
    </html>
  );
}
