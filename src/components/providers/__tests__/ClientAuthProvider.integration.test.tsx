// Integration & edge case test for ClientAuthProvider context
// Mock next/dynamic để bỏ qua loading UI, trả về AuthProvider trực tiếp
jest.mock('next/dynamic', () => {
  const MockDynamic = () => {
    const DynamicComponent = (props: { children: React.ReactNode }) => (
      <>{props.children}</>
    );
    DynamicComponent.displayName = 'MockDynamicComponent';
    return DynamicComponent;
  };
  MockDynamic.displayName = 'MockDynamic';
  return MockDynamic;
});

import { render, screen } from '@testing-library/react';
import React from 'react';
import ClientAuthProvider from '../ClientAuthProvider';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';
import type { User } from '@/types';

// Consumer component for testing
function ConsumerComponent() {
  const { user, isAuthenticated } = useAuth() as {
    user?: User | null;
    isAuthenticated: boolean;
  };
  return (
    <div>
      <span data-testid="user">
        {typeof user === 'object' && user && 'displayName' in user
          ? String((user as { displayName?: unknown }).displayName)
          : 'No User'}
      </span>
      <span data-testid="auth">
        {isAuthenticated ? 'Đã đăng nhập' : 'Chưa đăng nhập'}
      </span>
    </div>
  );
}
ConsumerComponent.displayName = 'ConsumerComponent';

// Mock useAuth for context
jest.mock('@/contexts/AuthContext', () => {
  const actual = jest.requireActual('@/contexts/AuthContext');
  return {
    ...actual,
    useAuth: jest.fn(),
    AuthProvider: ({ children }: { children: React.ReactNode }) => {
      const Comp = <>{children}</>;
      // @ts-expect-error: displayName is not a valid property on JSX.Element, but this is for test display only
      Comp.displayName = 'MockAuthProvider';
      return Comp;
    },
  };
});

/* eslint-disable @typescript-eslint/no-var-requires */

describe('ClientAuthProvider context consumer', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders consumer with authenticated user', () => {
    // moved import to top-level, so just use the imported useAuth
    jest.spyOn({ useAuth }, 'useAuth').mockReturnValue({
      user: {
        id: 'test-id',
        email: 'nguyenvanb@example.com',
        name: 'Nguyễn Văn B',
        role: UserRole.USER,
        displayName: 'Nguyễn Văn B',
      },
      loading: false,
      error: null,
      isAuthenticated: true,
      signInWithGoogle: jest.fn(),
      signInWithEmail: jest.fn(),
      signUpWithEmail: jest.fn(),
      signOut: jest.fn(),
      updateUserProfile: jest.fn(),
      resendEmailVerification: jest.fn(),
      sendPasswordReset: jest.fn(),
    });
    render(
      <ClientAuthProvider>
        <ConsumerComponent />
      </ClientAuthProvider>
    );
    expect(screen.getByTestId('user')).toHaveTextContent('Nguyễn Văn B');
    expect(screen.getByTestId('auth')).toHaveTextContent('Đã đăng nhập');
  });

  it('renders consumer with unauthenticated state', () => {
    jest.spyOn({ useAuth }, 'useAuth').mockReturnValue({
      user: null,
      loading: false,
      error: null,
      isAuthenticated: false,
      signInWithGoogle: jest.fn(),
      signInWithEmail: jest.fn(),
      signUpWithEmail: jest.fn(),
      signOut: jest.fn(),
      updateUserProfile: jest.fn(),
      resendEmailVerification: jest.fn(),
      sendPasswordReset: jest.fn(),
    });
    render(
      <ClientAuthProvider>
        <ConsumerComponent />
      </ClientAuthProvider>
    );
    expect(screen.getByTestId('user')).toHaveTextContent('No User');
    expect(screen.getByTestId('auth')).toHaveTextContent('Chưa đăng nhập');
  });

  it('throws error if useAuth called outside provider', () => {
    // Restore original implementation for this test
    jest.unmock('@/contexts/AuthContext');
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    function BrokenConsumer() {
      const { useAuth: realUseAuth } = jest.requireActual(
        '@/contexts/AuthContext'
      );
      realUseAuth();
      return null;
    }
    BrokenConsumer.displayName = 'BrokenConsumer';
    expect(() => render(<BrokenConsumer />)).toThrow(
      /must be used within an AuthProvider/
    );
  });
});
