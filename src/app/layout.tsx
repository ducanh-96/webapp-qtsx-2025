import type { Metadata } from 'next';
/* Switched to local font to avoid external fetches */
import './globals.css';
import './globals.css';
import ClientAuthProvider from '@/components/providers/ClientAuthProvider';
import ConnectionStatus from '@/components/common/ConnectionStatus';
import HeaderVisibility from '@/components/common/HeaderVisibility';
import FooterVisibility from '@/components/common/FooterVisibility';

/* Removed Google Fonts import and usage */

export const metadata: Metadata = {
  title: 'Enterprise Web Application',
  description: 'Hệ thống Báo cáo Quản trị Sản xuất DDC',
  keywords: 'DDC, web app, google workspace',
  authors: [{ name: 'Nguyễn Đức Anh - Ban KSNB' }],
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
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="h-full antialiased">
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
