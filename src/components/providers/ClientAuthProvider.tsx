'use client';

import dynamic from 'next/dynamic';
import { ReactNode } from 'react';

// Dynamically import AuthProvider with no SSR
const AuthProvider = dynamic(
  () =>
    import('@/contexts/AuthContext').then(mod => ({
      default: mod.AuthProvider,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    ),
  }
);

interface ClientAuthProviderProps {
  children: ReactNode;
}

export default function ClientAuthProvider({
  children,
}: ClientAuthProviderProps) {
  return <AuthProvider>{children}</AuthProvider>;
}
