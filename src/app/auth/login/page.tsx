'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import LoginForm from '@/components/auth/LoginForm';

export default function LoginPage() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <LoginForm onToggleMode={() => router.push('/auth/signup')} />

        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            Khi đăng nhập, bạn đồng ý với{' '}
            <a
              href="/terms"
              className="text-primary-600 hover:text-primary-500"
            >
              Điều khoản dịch vụ
            </a>{' '}
            và{' '}
            <a
              href="/privacy"
              className="text-primary-600 hover:text-primary-500"
            >
              Chính sách bảo mật
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
