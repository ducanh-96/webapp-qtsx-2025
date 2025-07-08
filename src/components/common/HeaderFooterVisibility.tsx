'use client';

import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import AppHeader from './AppHeader';
import AppFooter from './AppFooter';

export default function HeaderFooterVisibility() {
  const pathname = usePathname() ?? '';
  const { isAuthenticated, loading } = useAuth();

  // Hide header/footer on /auth/* pages or if not authenticated
  const hide = pathname.startsWith('/auth') || !isAuthenticated || loading;

  if (hide) return null;

  return (
    <>
      <AppHeader />
      <AppFooter />
    </>
  );
}
