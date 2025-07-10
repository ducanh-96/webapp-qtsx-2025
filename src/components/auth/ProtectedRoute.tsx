'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
  redirectTo?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  redirectTo = '/auth/login',
}) => {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.push(redirectTo);
        return;
      }

      if (
        requiredRole &&
        user &&
        typeof user.role === 'string' &&
        !hasRequiredRole(user.role as UserRole, requiredRole)
      ) {
        router.push('/unauthorized');
        return;
      }
    }
  }, [user, loading, isAuthenticated, requiredRole, router, redirectTo]);

  // Helper function to check role hierarchy
  const hasRequiredRole = (
    userRole: UserRole,
    requiredRole: UserRole
  ): boolean => {
    const roleHierarchy = {
      [UserRole.USER]: 1,
      [UserRole.MANAGER]: 2,
      [UserRole.ADMIN]: 3,
    };

    return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
  };

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

  if (!isAuthenticated) {
    return null; // Will redirect
  }

  if (
    requiredRole &&
    user &&
    typeof user.role === 'string' &&
    !hasRequiredRole(user.role as UserRole, requiredRole)
  ) {
    return null; // Will redirect to unauthorized
  }

  return <>{children}</>;
};

// Higher-order component for page-level protection
export const withAuth = <P extends object>(
  Component: React.ComponentType<P>,
  requiredRole?: UserRole
) => {
  return function AuthenticatedComponent(props: P) {
    return (
      <ProtectedRoute requiredRole={requiredRole}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };
};

// Hook for checking permissions
export const usePermissions = () => {
  const { user } = useAuth();

  const hasRole = (role: UserRole): boolean => {
    if (!user) return false;

    const roleHierarchy = {
      [UserRole.USER]: 1,
      [UserRole.MANAGER]: 2,
      [UserRole.ADMIN]: 3,
    };

    return roleHierarchy[user.role as UserRole] >= roleHierarchy[role];
  };

  const isAdmin = (): boolean => hasRole(UserRole.ADMIN);
  const isManager = (): boolean => hasRole(UserRole.MANAGER);
  const isUser = (): boolean => hasRole(UserRole.USER);

  const canAccess = (resource: string, action: string): boolean => {
    if (!user) return false;

    // Define permission matrix
    const permissions = {
      [UserRole.ADMIN]: {
        users: ['create', 'read', 'update', 'delete'],
        reports: ['create', 'read', 'update', 'delete'],
        system: ['read', 'update'],
      },
      [UserRole.MANAGER]: {
        users: ['read', 'update'],
        reports: ['read', 'update'],
        system: ['read'],
      },
      [UserRole.USER]: {
        reports: ['read'],
      },
    };

    const userPermissions = permissions[user.role as UserRole];
    const resourcePermissions =
      userPermissions?.[resource as keyof typeof userPermissions];

    return resourcePermissions?.includes(action) || false;
  };

  return {
    user,
    hasRole,
    isAdmin,
    isManager,
    isUser,
    canAccess,
  };
};

export default ProtectedRoute;
