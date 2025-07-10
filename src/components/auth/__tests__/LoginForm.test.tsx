import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LoginForm } from '../LoginForm';
import { AuthProvider } from '../../../contexts/AuthContext';
import type { User } from '../../../types/index';

// Mock the AuthContext
const mockSignInWithEmail = jest.fn();
const mockSignInWithGoogle = jest.fn();
const mockResendEmailVerification = jest.fn();
const mockSendPasswordReset = jest.fn();
let mockError: string | null = null;
let mockLoading = false;
let mockUser: User | null = null;

jest.mock('../../../contexts/AuthContext', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  useAuth: () => ({
    signInWithEmail: mockSignInWithEmail,
    signInWithGoogle: mockSignInWithGoogle,
    resendEmailVerification: mockResendEmailVerification,
    sendPasswordReset: mockSendPasswordReset,
    error: mockError,
    loading: mockLoading,
    user: mockUser,
  }),
}));

describe('LoginForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockError = null;
    mockLoading = false;
    mockUser = null;
    mockSignInWithEmail.mockReset();
    mockSignInWithGoogle.mockReset();
    mockResendEmailVerification.mockReset();
    mockSendPasswordReset.mockReset();
  });

  const renderLoginForm = (props = {}) => {
    return render(
      <AuthProvider>
        <LoginForm {...props} />
      </AuthProvider>
    );
  };

  describe('Rendering', () => {
    it('should render login form with all required fields', () => {
      renderLoginForm();

      expect(
        screen.getByText('Hệ thống Báo cáo Quản trị Sản xuất')
      ).toBeInTheDocument();
      expect(
        screen.getByText('Quản lý báo cáo QTSX DDC 2025')
      ).toBeInTheDocument();
      expect(screen.getByLabelText('Địa chỉ Email')).toBeInTheDocument();
      expect(screen.getByLabelText('Mật khẩu')).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /đăng nhập$/i })
      ).toBeInTheDocument();
      expect(screen.getByText('Đăng nhập với Google')).toBeInTheDocument();
    });

    it('should render remember me checkbox', () => {
      renderLoginForm();

      expect(screen.getByLabelText('Ghi nhớ đăng nhập')).toBeInTheDocument();
    });

    it('should render forgot password link', () => {
      renderLoginForm();

      expect(screen.getByText('Quên mật khẩu?')).toBeInTheDocument();
    });

    it('should render sign up toggle when onToggleMode is provided', () => {
      const mockToggleMode = jest.fn();
      renderLoginForm({ onToggleMode: mockToggleMode });

      expect(screen.getByText('Chưa có tài khoản?')).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Đăng ký' })
      ).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('should show validation errors for empty form submission', async () => {
      renderLoginForm();

      const form = screen.getByRole('form');
      fireEvent.submit(form);

      await waitFor(() => {
        expect(screen.getByText('Vui lòng nhập email')).toBeInTheDocument();
        expect(screen.getByText('Vui lòng nhập mật khẩu')).toBeInTheDocument();
      });

      expect(mockSignInWithEmail).not.toHaveBeenCalled();
    });

    it('should show email validation error for invalid email', async () => {
      renderLoginForm();

      const emailInput = screen.getByLabelText('Địa chỉ Email');
      const form = screen.getByRole('form');

      fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
      fireEvent.submit(form);

      await waitFor(() => {
        expect(screen.getByText('Email không hợp lệ')).toBeInTheDocument();
      });

      expect(mockSignInWithEmail).not.toHaveBeenCalled();
    });

    it('should show password validation error for short password', async () => {
      renderLoginForm();

      const emailInput = screen.getByLabelText('Địa chỉ Email');
      const passwordInput = screen.getByLabelText('Mật khẩu');
      const form = screen.getByRole('form');

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: '123' } });
      fireEvent.submit(form);

      await waitFor(() => {
        expect(
          screen.getByText('Mật khẩu phải có ít nhất 6 ký tự')
        ).toBeInTheDocument();
      });

      expect(mockSignInWithEmail).not.toHaveBeenCalled();
    });
  });

  describe('Form Submission', () => {
    it('should submit form with valid credentials', async () => {
      mockSignInWithEmail.mockResolvedValue(undefined);
      renderLoginForm();

      const emailInput = screen.getByLabelText('Địa chỉ Email');
      const passwordInput = screen.getByLabelText('Mật khẩu');
      const submitButton = screen.getByRole('button', { name: /đăng nhập$/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockSignInWithEmail).toHaveBeenCalledWith(
          'test@example.com',
          'password123'
        );
      });
    });

    it('should handle form submission errors', async () => {
      const errorMessage = 'Invalid credentials';
      mockSignInWithEmail.mockRejectedValue(new Error(errorMessage));

      renderLoginForm();

      const emailInput = screen.getByLabelText('Địa chỉ Email');
      const passwordInput = screen.getByLabelText('Mật khẩu');
      const submitButton = screen.getByRole('button', { name: /đăng nhập$/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockSignInWithEmail).toHaveBeenCalled();
      });
    });
  });

  describe('Google Sign In', () => {
    it('should call Google sign in when button is clicked', async () => {
      mockSignInWithGoogle.mockResolvedValue(undefined);
      renderLoginForm();

      const googleButton = screen.getByText('Đăng nhập với Google');
      fireEvent.click(googleButton);

      await waitFor(() => {
        expect(mockSignInWithGoogle).toHaveBeenCalled();
      });
    });

    it('should handle Google sign in errors', async () => {
      mockSignInWithGoogle.mockRejectedValue(
        new Error('Google sign in failed')
      );
      renderLoginForm();

      const googleButton = screen.getByText('Đăng nhập với Google');
      fireEvent.click(googleButton);

      await waitFor(() => {
        expect(mockSignInWithGoogle).toHaveBeenCalled();
      });
    });
  });

  describe('User Interactions', () => {
    it('should call onToggleMode when sign up button is clicked', () => {
      const mockToggleMode = jest.fn();
      renderLoginForm({ onToggleMode: mockToggleMode });

      const signUpButton = screen.getByRole('button', { name: 'Đăng ký' });
      fireEvent.click(signUpButton);

      expect(mockToggleMode).toHaveBeenCalled();
    });

    it('should update input values when user types', () => {
      renderLoginForm();

      const emailInput = screen.getByLabelText(
        'Địa chỉ Email'
      ) as HTMLInputElement;
      const passwordInput = screen.getByLabelText(
        'Mật khẩu'
      ) as HTMLInputElement;

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });

      expect(emailInput.value).toBe('test@example.com');
      expect(passwordInput.value).toBe('password123');
    });

    it('should toggle remember me checkbox', () => {
      renderLoginForm();

      const rememberMeCheckbox = screen.getByLabelText(
        'Ghi nhớ đăng nhập'
      ) as HTMLInputElement;

      expect(rememberMeCheckbox.checked).toBe(false);

      fireEvent.click(rememberMeCheckbox);
      expect(rememberMeCheckbox.checked).toBe(true);

      fireEvent.click(rememberMeCheckbox);
      expect(rememberMeCheckbox.checked).toBe(false);
    });
  });

  describe('Loading States', () => {
    it('should disable form when submitting', async () => {
      mockSignInWithEmail.mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100))
      );
      renderLoginForm();

      const emailInput = screen.getByLabelText('Địa chỉ Email');
      const passwordInput = screen.getByLabelText('Mật khẩu');
      const submitButton = screen.getByRole('button', { name: /đăng nhập$/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      // Form should be disabled during submission
      await waitFor(() => {
        expect(emailInput).toBeDisabled();
        expect(passwordInput).toBeDisabled();
        expect(submitButton).toBeDisabled();
      });
    });
  });

  describe('Error Display', () => {
    it('should display authentication errors', () => {
      const errorMessage = 'Authentication failed';
      mockError = errorMessage;

      renderLoginForm();

      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels and roles', () => {
      renderLoginForm();

      expect(screen.getByRole('form')).toBeInTheDocument();
      expect(screen.getByLabelText('Địa chỉ Email')).toHaveAttribute(
        'type',
        'email'
      );
      expect(screen.getByLabelText('Mật khẩu')).toHaveAttribute(
        'type',
        'password'
      );
      expect(
        screen.getByRole('button', { name: /đăng nhập$/i })
      ).toHaveAttribute('type', 'submit');
    });

    it('should have proper form validation attributes', () => {
      renderLoginForm();

      const emailInput = screen.getByLabelText('Địa chỉ Email');
      const passwordInput = screen.getByLabelText('Mật khẩu');

      expect(emailInput).toHaveAttribute('required');
      expect(passwordInput).toHaveAttribute('required');
    });
  });
});
