'use client';

import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import AppHeader from './AppHeader';

export default function HeaderVisibility() {
  const pathname = usePathname() ?? '';
  const { isAuthenticated, loading } = useAuth();

  const hide = pathname.startsWith('/auth') || !isAuthenticated || loading;

  if (hide) return null;

  // Ẩn header text nếu là trang /error-404
  const hideHeaderText = pathname === '/error-404';
  return <AppHeader hideHeaderText={hideHeaderText} />;
}
