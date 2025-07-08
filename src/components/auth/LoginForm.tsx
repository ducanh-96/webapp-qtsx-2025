'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { ButtonProps, InputProps } from '@/types';
import { useRouter } from 'next/navigation';

// Reusable Button Component
const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  onClick,
  type = 'button',
  className = '',
}) => {
  const baseClasses = 'btn focus-outline transition-all duration-200';
  const variantClasses = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    outline: 'btn-outline',
    ghost: 'bg-transparent hover:bg-gray-100 text-gray-700',
  };
  const sizeClasses = {
    sm: 'btn-sm',
    md: 'btn-md',
    lg: 'btn-lg',
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${baseClasses} ${variantClasses[variant]} ${
        sizeClasses[size]
      } ${className} ${
        disabled || loading ? 'opacity-50 cursor-not-allowed' : ''
      }`}
    >
      {loading && <span className="spinner mr-2"></span>}
      {children}
    </button>
  );
};

// Reusable Input Component
const Input: React.FC<InputProps> = ({
  id,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  disabled = false,
  required = false,
  className = '',
}) => {
  return (
    <div className="space-y-1">
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange?.(e.target.value)}
        disabled={disabled}
        required={required}
        className={`input ${
          error ? 'border-error-500 focus-visible:ring-error-500' : ''
        } ${className}`}
      />
      {error && (
        <p className="text-sm text-error-600" data-testid={`${id}-error`}>
          {error}
        </p>
      )}
    </div>
  );
};

interface LoginFormProps {
  onToggleMode?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onToggleMode }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {}
  );
  const [isLoading, setIsLoading] = useState(false);

  const [showForgot, setShowForgot] = useState(false);
  const [forgotMsg, setForgotMsg] = useState<string | null>(null);
  const [forgotLoading, setForgotLoading] = useState(false);

  const {
    signInWithEmail,
    signInWithGoogle,
    error,
    user,
    resendEmailVerification,
    sendPasswordReset,
  } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && user.emailVerified) {
      router.push('/dashboard');
    }
  }, [user, router]);

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email) {
      newErrors.email = 'Vui lòng nhập email';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    if (!password) {
      newErrors.password = 'Vui lòng nhập mật khẩu';
    } else if (password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setIsLoading(true);
      await signInWithEmail(email, password);
      // Redirect will be handled by the auth state change
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      await signInWithGoogle();
      // Redirect will be handled by the auth state change
    } catch (error) {
      console.error('Google login failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const [verifyMsg, setVerifyMsg] = useState<string | null>(null);
  const [verifyLoading, setVerifyLoading] = useState(false);

  const isUnverifiedError =
    error && error.toLowerCase().includes('chưa xác thực');

  const handleResendVerification = async () => {
    setVerifyLoading(true);
    setVerifyMsg(null);
    try {
      await resendEmailVerification(email, password);
      setVerifyMsg(
        'Đã gửi lại email xác thực. Vui lòng kiểm tra hộp thư của bạn.'
      );
    } catch (err) {
      const msg = (err as Error)?.message || 'Gửi lại email xác thực thất bại.';
      setVerifyMsg(msg);
    } finally {
      setVerifyLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="card">
        <div className="text-center mb-8 flex flex-col items-center">
          <Image
            src="/logo.png"
            alt="Logo"
            width={56}
            height={56}
            className="h-14 w-14 mb-2 rounded-lg object-contain"
            priority
          />
          <h2 className="text-xl font-bold text-gray-900">
            Hệ thống Báo cáo Quản trị Sản xuất
          </h2>
          <p className="mt-1 text-base text-gray-600">
            Quản lý báo cáo QTSX DDC 2025
          </p>
        </div>

        {isUnverifiedError ? (
          <div className="mb-6 p-4 bg-warning-50 border border-warning-200 rounded-md">
            <p className="text-sm text-warning-700">
              Email của bạn chưa được xác thực. Vui lòng kiểm tra hộp thư và
              nhấn vào link xác thực.
            </p>
            <Button
              variant="outline"
              size="md"
              loading={verifyLoading}
              onClick={handleResendVerification}
              className="mt-3"
            >
              Gửi lại email xác thực
            </Button>
            {verifyMsg && (
              <p className="text-xs mt-2 text-warning-600">{verifyMsg}</p>
            )}
          </div>
        ) : (
          error && (
            <div className="mb-6 p-4 bg-error-50 border border-error-200 rounded-md">
              <p className="text-sm text-error-600">{error}</p>
            </div>
          )
        )}

        <form onSubmit={handleEmailLogin} className="space-y-6" role="form">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Địa chỉ Email
            </label>
            <Input
              id="email"
              type="email"
              placeholder="Nhập email của bạn"
              value={email}
              onChange={setEmail}
              error={errors.email}
              disabled={isLoading}
              required
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Mật khẩu
            </label>
            <Input
              id="password"
              type="password"
              placeholder="Nhập mật khẩu"
              value={password}
              onChange={setPassword}
              error={errors.password}
              disabled={isLoading}
              required
              autoComplete="current-password"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label
                htmlFor="remember-me"
                className="ml-2 block text-sm text-gray-700"
              >
                Ghi nhớ đăng nhập
              </label>
            </div>

            <div className="text-sm">
              <button
                type="button"
                className="font-medium text-primary-600 hover:text-primary-500"
                onClick={() => setShowForgot(true)}
              >
                Quên mật khẩu?
              </button>
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={isLoading}
            className="w-full"
          >
            Đăng nhập
          </Button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">
                Hoặc tiếp tục với
              </span>
            </div>
          </div>

          <div className="mt-6">
            <Button
              variant="outline"
              size="lg"
              onClick={handleGoogleLogin}
              loading={isLoading}
              className="w-full"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Đăng nhập với Google
            </Button>
          </div>
        </div>

        {onToggleMode && (
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Chưa có tài khoản?{' '}
              <button
                onClick={onToggleMode}
                className="font-medium text-primary-600 hover:text-primary-500"
              >
                Đăng ký
              </button>
            </p>
          </div>
        )}
      </div>
      {/* Forgot Password Modal */}
      {showForgot && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-md shadow-lg p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold mb-4">Quên mật khẩu</h3>
            <p className="text-sm text-gray-600 mb-2">
              Nhập email của bạn để nhận liên kết đặt lại mật khẩu.
            </p>
            <input
              type="email"
              className="input w-full mb-2"
              placeholder="Nhập email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              disabled={forgotLoading}
            />
            {forgotMsg && (
              <p className="text-sm mb-2 text-primary-600">{forgotMsg}</p>
            )}
            <div className="flex justify-end space-x-2 mt-2">
              <button
                className="btn-outline"
                onClick={() => {
                  setShowForgot(false);
                  setForgotMsg(null);
                }}
                disabled={forgotLoading}
              >
                Đóng
              </button>
              <button
                className="btn-primary"
                disabled={forgotLoading || !email}
                onClick={async () => {
                  setForgotLoading(true);
                  setForgotMsg(null);
                  try {
                    await sendPasswordReset(email);
                    setForgotMsg(
                      'Đã gửi email đặt lại mật khẩu. Vui lòng kiểm tra hộp thư của bạn.'
                    );
                  } catch {
                    setForgotMsg(
                      'Không thể gửi email đặt lại mật khẩu. Vui lòng thử lại.'
                    );
                  } finally {
                    setForgotLoading(false);
                  }
                }}
              >
                {forgotLoading ? 'Đang gửi...' : 'Gửi'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginForm;
