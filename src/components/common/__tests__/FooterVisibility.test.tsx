// Unit test for FooterVisibility

import { render, screen } from '@testing-library/react';
import FooterVisibility from '../FooterVisibility';
import { UserRole } from '@/types';

// Mock AppFooter
jest.mock('../AppFooter', () => {
  const MockAppFooter = () => <div data-testid="footer">Footer</div>;
  MockAppFooter.displayName = 'MockAppFooter';
  return MockAppFooter;
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

describe('FooterVisibility', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('hides footer on /auth route', () => {
    jest.spyOn({ usePathname }, 'usePathname').mockReturnValue('/auth/login');
    jest.spyOn({ useAuth }, 'useAuth').mockReturnValue({
      user: null,
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
    render(<FooterVisibility />);
    expect(screen.queryByTestId('footer')).not.toBeInTheDocument();
  });

  it('hides footer when not authenticated', () => {
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
    render(<FooterVisibility />);
    expect(screen.queryByTestId('footer')).not.toBeInTheDocument();
  });

  it('hides footer when loading', () => {
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
    render(<FooterVisibility />);
    expect(screen.queryByTestId('footer')).not.toBeInTheDocument();
  });

  it('shows footer when authenticated and not loading and not /auth', () => {
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
    render(<FooterVisibility />);
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });
});
