'use client';

import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import AppFooter from './AppFooter';

export default function FooterVisibility() {
  const pathname = usePathname() ?? '';
  const { isAuthenticated, loading } = useAuth();

  const hide = pathname.startsWith('/auth') || !isAuthenticated || loading;

  if (hide) return null;

  return <AppFooter />;
}
