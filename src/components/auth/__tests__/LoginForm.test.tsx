import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LoginForm } from '../LoginForm';
import AuthProvider from '../../../contexts/AuthContext';
import type { User } from '../../../types/index';

// Mock the AuthContext
const mockSignInWithEmail = jest.fn();
const mockSignInWithGoogle = jest.fn();
const mockResendEmailVerification = jest.fn();
const mockSendPasswordReset = jest.fn();
let mockError: string | null = null;
let mockLoading = false;
let mockUser: User | null = null;

jest.mock('../../contexts/AuthContext', () => ({
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

      expect(screen.getByText('Welcome back')).toBeInTheDocument();
      expect(screen.getByText('Sign in to your account')).toBeInTheDocument();
      expect(screen.getByLabelText('Email address')).toBeInTheDocument();
      expect(screen.getByLabelText('Password')).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /sign in$/i })
      ).toBeInTheDocument();
      expect(screen.getByText('Sign in with Google')).toBeInTheDocument();
    });

    it('should render remember me checkbox', () => {
      renderLoginForm();

      expect(screen.getByLabelText('Remember me')).toBeInTheDocument();
    });

    it('should render forgot password link', () => {
      renderLoginForm();

      expect(screen.getByText('Forgot your password?')).toBeInTheDocument();
    });

    it('should render sign up toggle when onToggleMode is provided', () => {
      const mockToggleMode = jest.fn();
      renderLoginForm({ onToggleMode: mockToggleMode });

      expect(screen.getByText("Don't have an account?")).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Sign up' })
      ).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('should show validation errors for empty form submission', async () => {
      renderLoginForm();

      const form = screen.getByRole('form');
      fireEvent.submit(form);

      await waitFor(() => {
        expect(screen.getByText('Email is required')).toBeInTheDocument();
        expect(screen.getByText('Password is required')).toBeInTheDocument();
      });

      expect(mockSignInWithEmail).not.toHaveBeenCalled();
    });

    it('should show email validation error for invalid email', async () => {
      renderLoginForm();

      const emailInput = screen.getByLabelText('Email address');
      const form = screen.getByRole('form');

      fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
      fireEvent.submit(form);

      await waitFor(() => {
        expect(screen.getByText('Email is invalid')).toBeInTheDocument();
      });

      expect(mockSignInWithEmail).not.toHaveBeenCalled();
    });

    it('should show password validation error for short password', async () => {
      renderLoginForm();

      const emailInput = screen.getByLabelText('Email address');
      const passwordInput = screen.getByLabelText('Password');
      const form = screen.getByRole('form');

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: '123' } });
      fireEvent.submit(form);

      await waitFor(() => {
        expect(
          screen.getByText('Password must be at least 6 characters')
        ).toBeInTheDocument();
      });

      expect(mockSignInWithEmail).not.toHaveBeenCalled();
    });
  });

  describe('Form Submission', () => {
    it('should submit form with valid credentials', async () => {
      mockSignInWithEmail.mockResolvedValue(undefined);
      renderLoginForm();

      const emailInput = screen.getByLabelText('Email address');
      const passwordInput = screen.getByLabelText('Password');
      const submitButton = screen.getByRole('button', { name: /sign in$/i });

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

      const emailInput = screen.getByLabelText('Email address');
      const passwordInput = screen.getByLabelText('Password');
      const submitButton = screen.getByRole('button', { name: /sign in$/i });

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

      const googleButton = screen.getByText('Sign in with Google');
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

      const googleButton = screen.getByText('Sign in with Google');
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

      const signUpButton = screen.getByRole('button', { name: 'Sign up' });
      fireEvent.click(signUpButton);

      expect(mockToggleMode).toHaveBeenCalled();
    });

    it('should update input values when user types', () => {
      renderLoginForm();

      const emailInput = screen.getByLabelText(
        'Email address'
      ) as HTMLInputElement;
      const passwordInput = screen.getByLabelText(
        'Password'
      ) as HTMLInputElement;

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });

      expect(emailInput.value).toBe('test@example.com');
      expect(passwordInput.value).toBe('password123');
    });

    it('should toggle remember me checkbox', () => {
      renderLoginForm();

      const rememberMeCheckbox = screen.getByLabelText(
        'Remember me'
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

      const emailInput = screen.getByLabelText('Email address');
      const passwordInput = screen.getByLabelText('Password');
      const submitButton = screen.getByRole('button', { name: /sign in$/i });

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
      expect(screen.getByLabelText('Email address')).toHaveAttribute(
        'type',
        'email'
      );
      expect(screen.getByLabelText('Password')).toHaveAttribute(
        'type',
        'password'
      );
      expect(screen.getByRole('button', { name: /sign in$/i })).toHaveAttribute(
        'type',
        'submit'
      );
    });

    it('should have proper form validation attributes', () => {
      renderLoginForm();

      const emailInput = screen.getByLabelText('Email address');
      const passwordInput = screen.getByLabelText('Password');

      expect(emailInput).toHaveAttribute('required');
      expect(passwordInput).toHaveAttribute('required');
    });
  });
});
