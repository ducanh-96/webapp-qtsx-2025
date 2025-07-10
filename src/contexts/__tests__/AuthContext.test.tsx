// Unit test for AuthContext

import React from 'react';
import { render, screen } from '@testing-library/react';
import { AuthProvider, useAuth } from '../AuthContext';

// Dummy consumer for context
function Consumer() {
  const ctx = useAuth();
  return (
    <div>
      <span data-testid="user">{ctx.user ? ctx.user.email : 'no-user'}</span>
      <span data-testid="loading">
        {ctx.loading ? 'loading' : 'not-loading'}
      </span>
      <span data-testid="error">{ctx.error || 'no-error'}</span>
      <span data-testid="is-auth">{ctx.isAuthenticated ? 'yes' : 'no'}</span>
      <span data-testid="has-methods">
        {typeof ctx.signInWithGoogle === 'function' &&
        typeof ctx.signInWithEmail === 'function' &&
        typeof ctx.signUpWithEmail === 'function' &&
        typeof ctx.signOut === 'function' &&
        typeof ctx.updateUserProfile === 'function' &&
        typeof ctx.resendEmailVerification === 'function' &&
        typeof ctx.sendPasswordReset === 'function'
          ? 'all-methods'
          : 'missing-method'}
      </span>
    </div>
  );
}

describe('AuthContext', () => {
  it('throws if useAuth called outside provider', () => {
    expect(() => render(<Consumer />)).toThrow(
      /must be used within an AuthProvider/
    );
  });

  it('provides default state and methods', () => {
    render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>
    );
    expect(screen.getByTestId('user')).toHaveTextContent('no-user');
    expect(screen.getByTestId('loading')).toHaveTextContent('loading');
    expect(screen.getByTestId('error')).toHaveTextContent('no-error');
    expect(screen.getByTestId('is-auth')).toHaveTextContent('no');
    expect(screen.getByTestId('has-methods')).toHaveTextContent('all-methods');
  });

  it('renders children', () => {
    render(
      <AuthProvider>
        <div data-testid="child">child-content</div>
      </AuthProvider>
    );
    expect(screen.getByTestId('child')).toHaveTextContent('child-content');
  });
});
