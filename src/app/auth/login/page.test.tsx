// Unit test for src/app/auth/login/page.tsx (LoginPage)
import React from 'react';
import { render, screen } from '@testing-library/react';
import LoginPage from './page';

// Mock useAuth
let authValue = { isAuthenticated: false, loading: false };
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => authValue,
}));

// Mock useRouter
const pushMock = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
}));

// Mock LoginForm
jest.mock('@/components/auth/LoginForm', () => {
  const MockLoginForm = (props: Record<string, unknown>) => (
    <div
      data-testid="login-form"
      onClick={props.onToggleMode as React.MouseEventHandler<HTMLDivElement>}
    >
      LoginForm
    </div>
  );
  MockLoginForm.displayName = 'MockLoginForm';
  return MockLoginForm;
});

describe('LoginPage', () => {
  beforeEach(() => {
    pushMock.mockClear();
  });

  it('renders LoginForm when not authenticated', () => {
    authValue = { isAuthenticated: false, loading: false };
    render(<LoginPage />);
    expect(screen.getByTestId('login-form')).toBeInTheDocument();
    expect(screen.getByText(/Điều khoản dịch vụ/)).toBeInTheDocument();
    expect(screen.getByText(/Chính sách bảo mật/)).toBeInTheDocument();
  });

  it('shows loading UI when loading', () => {
    authValue = { isAuthenticated: false, loading: true };
    render(<LoginPage />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('redirects if authenticated', () => {
    authValue = { isAuthenticated: true, loading: false };
    render(<LoginPage />);
    expect(pushMock).toHaveBeenCalledWith('/dashboard');
  });
});
