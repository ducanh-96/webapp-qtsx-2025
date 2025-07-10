// Unit test for HeaderFooterVisibility

import { render, screen } from '@testing-library/react';
import HeaderFooterVisibility from '../HeaderFooterVisibility';

// Mock AppHeader & AppFooter
jest.mock('../AppHeader', () => {
  const MockAppHeader = () => <div data-testid="header">Header</div>;
  MockAppHeader.displayName = 'MockAppHeader';
  return MockAppHeader;
});
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
import { UserRole } from '@/types';

describe('HeaderFooterVisibility', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('hides header/footer on /auth route', () => {
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
    render(<HeaderFooterVisibility />);
    expect(screen.queryByTestId('header')).not.toBeInTheDocument();
    expect(screen.queryByTestId('footer')).not.toBeInTheDocument();
  });

  it('hides header/footer when not authenticated', () => {
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
    render(<HeaderFooterVisibility />);
    expect(screen.queryByTestId('header')).not.toBeInTheDocument();
    expect(screen.queryByTestId('footer')).not.toBeInTheDocument();
  });

  it('hides header/footer when loading', () => {
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
    render(<HeaderFooterVisibility />);
    expect(screen.queryByTestId('header')).not.toBeInTheDocument();
    expect(screen.queryByTestId('footer')).not.toBeInTheDocument();
  });

  it('shows header/footer when authenticated and not loading and not /auth', () => {
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
    render(<HeaderFooterVisibility />);
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });
});
