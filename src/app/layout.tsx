import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Enterprise Web Application',
  description: 'Enterprise Web Application with Google Workspace Integration',
  keywords: 'enterprise, web application, google workspace, document management',
  authors: [{ name: 'Development Team' }],
  viewport: 'width=device-width, initial-scale=1',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full antialiased`}>
        <AuthProvider>
          <div id="root" className="min-h-full">
            {children}
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}