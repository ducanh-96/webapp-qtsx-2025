'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { ButtonProps, InputProps } from '@/types';

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
  onBlur,
}) => {
  return (
    <div className="space-y-1">
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange?.(e.target.value)}
        onBlur={onBlur}
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

const SignUpPage: React.FC = () => {
  const { signUpWithEmail, error } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    displayName?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(false);

  // Validate field on blur/change
  const validateField = (field: string, value: string) => {
    let errorMsg = '';
    if (field === 'email') {
      if (!value) errorMsg = 'Email là bắt buộc';
      else if (!/\S+@\S+\.\S+/.test(value)) errorMsg = 'Email không hợp lệ';
    }
    if (field === 'displayName') {
      if (!value) errorMsg = 'Tên hiển thị là bắt buộc';
    }
    if (field === 'password') {
      if (!value) errorMsg = 'Mật khẩu là bắt buộc';
      else if (value.length < 6) errorMsg = 'Mật khẩu tối thiểu 6 ký tự';
    }
    setErrors(prev => ({ ...prev, [field]: errorMsg }));
    return errorMsg === '';
  };

  const validateForm = () => {
    const newErrors: {
      email?: string;
      password?: string;
      displayName?: string;
    } = {};
    if (!email) newErrors.email = 'Email là bắt buộc';
    else if (!/\S+@\S+\.\S+/.test(email))
      newErrors.email = 'Email không hợp lệ';
    if (!displayName) newErrors.displayName = 'Tên hiển thị là bắt buộc';
    if (!password) newErrors.password = 'Mật khẩu là bắt buộc';
    else if (password.length < 6)
      newErrors.password = 'Mật khẩu tối thiểu 6 ký tự';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const [submitCount, setSubmitCount] = useState(0);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitCount(c => c + 1); // Force re-render for test
    if (!validateForm()) return;
    try {
      setIsLoading(true);
      await signUpWithEmail(email, password, displayName);
      router.push('/auth/login');
    } catch {
      // error handled by context
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md">
        <div className="card">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">
              Đăng ký tài khoản
            </h2>
            <p className="mt-2 text-gray-600">
              Tạo tài khoản mới để sử dụng hệ thống
            </p>
          </div>
          {error && (
            <div className="mb-6 p-4 bg-error-50 border border-error-200 rounded-md">
              <p className="text-sm text-error-600">{error}</p>
            </div>
          )}
          {/* Force re-render on submitCount for test */}
          <form
            onSubmit={handleSignUp}
            className="space-y-6"
            role="form"
            data-testid="signup-form"
          >
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
                onChange={v => {
                  setEmail(v);
                  validateField('email', v);
                }}
                onBlur={e => validateField('email', e.target.value)}
                error={errors.email}
                disabled={isLoading}
                required
                data-testid="input-email"
              />
            </div>
            <div>
              <label
                htmlFor="displayName"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Tên hiển thị
              </label>
              <Input
                id="displayName"
                type="text"
                placeholder="Nhập tên hiển thị"
                value={displayName}
                onChange={v => {
                  setDisplayName(v);
                  validateField('displayName', v);
                }}
                onBlur={e => validateField('displayName', e.target.value)}
                error={errors.displayName}
                disabled={isLoading}
                required
                data-testid="input-displayName"
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
                onChange={v => {
                  setPassword(v);
                  validateField('password', v);
                }}
                onBlur={e => validateField('password', e.target.value)}
                error={errors.password}
                disabled={isLoading}
                required
                data-testid="input-password"
              />
            </div>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={isLoading}
              className="w-full"
            >
              Đăng ký
            </Button>
            {/* Render submitCount for test to force update */}
            <span style={{ display: 'none' }} data-testid="submit-count">
              {submitCount}
            </span>
          </form>
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Đã có tài khoản?{' '}
              <a
                href="/auth/login"
                className="font-medium text-primary-600 hover:text-primary-500"
              >
                Đăng nhập
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
export { Button, Input };
