// Unit tests for ProtectedRoute with 100% coverage

import React from 'react';
import { render, screen } from '@testing-library/react';
import { ProtectedRoute, withAuth, usePermissions } from '../ProtectedRoute';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

const mockPush = jest.fn();
beforeEach(() => {
  (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
});

const TestComponent = () => <div>Protected Content</div>;

describe('ProtectedRoute', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: null,
      loading: true,
      isAuthenticated: false,
    });
    render(
      <ProtectedRoute>
        <TestComponent />
      </ProtectedRoute>
    );
    expect(screen.getByText(/Loading.../i)).toBeInTheDocument();
  });

  it('redirects to login if not authenticated', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: null,
      loading: false,
      isAuthenticated: false,
    });
    render(
      <ProtectedRoute>
        <TestComponent />
      </ProtectedRoute>
    );
    expect(mockPush).toHaveBeenCalledWith('/auth/login');
  });

  it('redirects to custom path if not authenticated', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: null,
      loading: false,
      isAuthenticated: false,
    });
    render(
      <ProtectedRoute redirectTo="/custom-login">
        <TestComponent />
      </ProtectedRoute>
    );
    expect(mockPush).toHaveBeenCalledWith('/custom-login');
  });

  it('redirects to unauthorized if lacking required role', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { role: UserRole.USER },
      loading: false,
      isAuthenticated: true,
    });
    render(
      <ProtectedRoute requiredRole={UserRole.ADMIN}>
        <TestComponent />
      </ProtectedRoute>
    );
    expect(mockPush).toHaveBeenCalledWith('/unauthorized');
  });

  it('renders children if authenticated and has required role', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { role: UserRole.ADMIN },
      loading: false,
      isAuthenticated: true,
    });
    render(
      <ProtectedRoute requiredRole={UserRole.USER}>
        <TestComponent />
      </ProtectedRoute>
    );
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('renders children if authenticated and no required role', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { role: UserRole.USER },
      loading: false,
      isAuthenticated: true,
    });
    render(
      <ProtectedRoute>
        <TestComponent />
      </ProtectedRoute>
    );
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('returns null if not authenticated (render)', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: null,
      loading: false,
      isAuthenticated: false,
    });
    const { container } = render(
      <ProtectedRoute>
        <TestComponent />
      </ProtectedRoute>
    );
    expect(container.firstChild).toBeNull();
  });

  it('returns null if lacking required role (render)', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { role: UserRole.USER },
      loading: false,
      isAuthenticated: true,
    });
    const { container } = render(
      <ProtectedRoute requiredRole={UserRole.ADMIN}>
        <TestComponent />
      </ProtectedRoute>
    );
    expect(container.firstChild).toBeNull();
  });
});

describe('withAuth HOC', () => {
  it('wraps component with ProtectedRoute', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { role: UserRole.ADMIN },
      loading: false,
      isAuthenticated: true,
    });
    const Wrapped = withAuth(TestComponent, UserRole.USER);
    render(<Wrapped />);
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });
});

describe('usePermissions hook', () => {
  it('returns correct permission checks for admin', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { role: UserRole.ADMIN },
    });
    const TestPerm = () => {
      const perms = usePermissions();
      return (
        <div>
          <span>{perms.hasRole(UserRole.ADMIN) ? 'admin' : 'not-admin'}</span>
          <span>{perms.isAdmin() ? 'is-admin' : 'not-admin'}</span>
          <span>
            {perms.canAccess('users', 'delete')
              ? 'can-delete'
              : 'cannot-delete'}
          </span>
        </div>
      );
    };
    render(<TestPerm />);
    expect(screen.getByText('admin')).toBeInTheDocument();
    expect(screen.getByText('is-admin')).toBeInTheDocument();
    expect(screen.getByText('can-delete')).toBeInTheDocument();
  });

  it('returns correct permission checks for manager', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { role: UserRole.MANAGER },
    });
    const TestPerm = () => {
      const perms = usePermissions();
      return (
        <div>
          <span>{perms.hasRole(UserRole.USER) ? 'user' : 'not-user'}</span>
          <span>{perms.isManager() ? 'is-manager' : 'not-manager'}</span>
          <span>
            {perms.canAccess('system', 'read')
              ? 'can-read-system'
              : 'cannot-read-system'}
          </span>
        </div>
      );
    };
    render(<TestPerm />);
    expect(screen.getByText('user')).toBeInTheDocument();
    expect(screen.getByText('is-manager')).toBeInTheDocument();
    expect(screen.getByText('can-read-system')).toBeInTheDocument();
  });

  it('returns correct permission checks for user', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { role: UserRole.USER },
    });
    const TestPerm = () => {
      const perms = usePermissions();
      return (
        <div>
          <span>{perms.hasRole(UserRole.USER) ? 'user' : 'not-user'}</span>
          <span>{perms.isUser() ? 'is-user' : 'not-user'}</span>
          <span>
            {perms.canAccess('reports', 'read')
              ? 'can-read-report'
              : 'cannot-read-report'}
          </span>
        </div>
      );
    };
    render(<TestPerm />);
    expect(screen.getByText('user')).toBeInTheDocument();
    expect(screen.getByText('is-user')).toBeInTheDocument();
    expect(screen.getByText('can-read-report')).toBeInTheDocument();
  });

  it('returns false for permissions if no user', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: null,
    });
    const TestPerm = () => {
      const perms = usePermissions();
      return (
        <div>
          <span>{perms.hasRole(UserRole.USER) ? 'user' : 'not-user'}</span>
          <span>
            {perms.canAccess('reports', 'read')
              ? 'can-read-report'
              : 'cannot-read-report'}
          </span>
        </div>
      );
    };
    render(<TestPerm />);
    expect(screen.getByText('not-user')).toBeInTheDocument();
    expect(screen.getByText('cannot-read-report')).toBeInTheDocument();
  });
});
