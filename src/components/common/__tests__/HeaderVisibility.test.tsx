// Unit test for HeaderVisibility

import { render, screen } from '@testing-library/react';
import HeaderVisibility from '../HeaderVisibility';

// Mock AppHeader
jest.mock('../AppHeader', () => {
  const MockAppHeader = (props: { hideHeaderText?: boolean }) => (
    <div
      data-testid="header"
      data-hide-header-text={props.hideHeaderText ? 'yes' : 'no'}
    >
      Header
    </div>
  );
  MockAppHeader.displayName = 'MockAppHeader';
  return MockAppHeader;
});

// Mock useAuth
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

// Mock usePathname
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));

/* eslint-disable @typescript-eslint/no-var-requires */
import { useAuth } from '@/contexts/AuthContext';
import { usePathname } from 'next/navigation';
import { UserRole } from '@/types';

describe('HeaderVisibility', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('hides header on /auth route', () => {
    jest.spyOn({ usePathname }, 'usePathname').mockReturnValue('/auth/signup');
    jest.spyOn({ useAuth }, 'useAuth').mockReturnValue({
      user: {
        id: 'test-id',
        email: 'test@example.com',
        name: 'Test User',
        role: UserRole.USER,
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
    render(<HeaderVisibility />);
    expect(screen.queryByTestId('header')).not.toBeInTheDocument();
  });

  it('hides header when not authenticated', () => {
    jest.spyOn({ usePathname }, 'usePathname').mockReturnValue('/');
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
    render(<HeaderVisibility />);
    expect(screen.queryByTestId('header')).not.toBeInTheDocument();
  });

  it('hides header when loading', () => {
    jest.spyOn({ usePathname }, 'usePathname').mockReturnValue('/');
    jest.spyOn({ useAuth }, 'useAuth').mockReturnValue({
      user: null,
      loading: true,
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
    render(<HeaderVisibility />);
    expect(screen.queryByTestId('header')).not.toBeInTheDocument();
  });

  it('shows header when authenticated and not loading and not /auth', () => {
    jest.spyOn({ usePathname }, 'usePathname').mockReturnValue('/');
    jest.spyOn({ useAuth }, 'useAuth').mockReturnValue({
      user: {
        id: 'test-id',
        email: 'test@example.com',
        name: 'Test User',
        role: UserRole.USER,
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
    render(<HeaderVisibility />);
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('header')).toHaveAttribute(
      'data-hide-header-text',
      'no'
    );
  });

  it('passes hideHeaderText=true for /error-404', () => {
    jest.spyOn({ usePathname }, 'usePathname').mockReturnValue('/error-404');
    jest.spyOn({ useAuth }, 'useAuth').mockReturnValue({
      user: {
        id: 'test-id',
        email: 'test@example.com',
        name: 'Test User',
        role: UserRole.USER,
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
    render(<HeaderVisibility />);
    expect(screen.getByTestId('header')).toHaveAttribute(
      'data-hide-header-text',
      'yes'
    );
  });
});
