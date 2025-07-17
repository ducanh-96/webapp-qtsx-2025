import React from 'react';
import { ButtonProps, InputProps } from '@/types';

export const Button: React.FC<ButtonProps> = ({
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

export const Input: React.FC<InputProps> = ({
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
