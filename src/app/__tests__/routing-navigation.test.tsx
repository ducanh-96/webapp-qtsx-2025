/**
 * Integration test: routing/navigation between pages
 * NOTE: ClientAuthProvider is mocked to avoid dynamic import/loading in test.
 */

import * as React from 'react';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';
import HomePage from '../page';

/* UserRole import removed to avoid circular/hoisting issues */

// Mock ClientAuthProvider to just render children
jest.mock('../../components/providers/ClientAuthProvider', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock AuthProvider to provide a static authenticated context
jest.mock('../../contexts/AuthContext', () => {
  const user = {
    uid: 'test-user',
    email: 'test@example.com',
    displayName: 'Test User',
    role: 'ADMIN',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    nhaMay: '',
  };
  const value = {
    user,
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
  };
  return {
    __esModule: true,
    AuthProvider: ({ children }: { children: React.ReactNode }) => (
      <React.Fragment>{children}</React.Fragment>
    ),
    useAuth: () => value,
    default: ({ children }: { children: React.ReactNode }) => (
      <React.Fragment>{children}</React.Fragment>
    ),
  };
});

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

import ClientAuthProvider from '../../components/providers/ClientAuthProvider';

describe('Integration: Routing/Navigation between pages', () => {
  let pushMock: jest.Mock;

  beforeEach(() => {
    pushMock = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ push: pushMock });
  });

  const renderWithAuth = (ui: React.ReactElement) =>
    render(<ClientAuthProvider>{ui}</ClientAuthProvider>);

  it('navigates between report tabs in ReportsPage', async () => {
    renderWithAuth(<HomePage />);
    // Tab đầu tiên ("Sản Lượng") phải active
    expect(screen.getByRole('button', { name: /Sản Lượng/i })).toHaveClass(
      'text-[#ea2227]'
    );
    // Click tab "BC Nhân Công"
    const nhanCongTab = screen.getByRole('button', { name: /BC Nhân Công/i });
    await act(async () => {
      await userEvent.click(nhanCongTab);
    });
    // Tab "BC Nhân Công" phải active
    expect(nhanCongTab).toHaveClass('text-[#ea2227]');
  });
});
