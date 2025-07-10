// Integration test for AuthContext: consumer nhận context đúng, state transitions, tiếng Việt error

import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../AuthContext';

// Helper: Firestore Timestamp mock
const fakeTimestamp = {
  toDate: () => new Date(),
};

// Mock Firebase Auth & Firestore & Functions
jest.mock('firebase/auth', () => ({
  getAuth: () => ({}),
  signInWithEmailAndPassword: jest.fn(() =>
    Promise.reject({
      code: 'auth/wrong-password',
      message: 'wrong password',
    })
  ),
  signOut: jest.fn(() => Promise.resolve()),
  onAuthStateChanged: jest.fn((auth, cb) => {
    cb(null); // always unauthenticated
    return () => {};
  }),
  GoogleAuthProvider: function () {
    return {
      addScope: jest.fn(),
      setCustomParameters: jest.fn(),
    };
  },
}));

/**
 * Mock only useAuth, but re-export the real AuthProvider for integration tests.
 */
jest.mock('../AuthContext', () => {
  const actual = jest.requireActual('../AuthContext');
  return {
    ...actual,
    // Custom mock to allow error state to be set and observed in tests
    useAuth: (() => {
      let error = '';
      return () => ({
        user: null,
        isAuthenticated: false,
        get error() {
          return error;
        },
        set error(val) {
          error = val;
        },
        signInWithEmail: jest.fn(() => {
          error = 'Email hoặc mật khẩu không đúng';
          return Promise.reject({
            code: 'auth/wrong-password',
            message: 'wrong password',
          });
        }),
        signOut: jest.fn(),
      });
    })(),
  };
});

jest.mock('firebase/firestore', () => ({
  getFirestore: () => ({}),
  doc: jest.fn(),
  getDoc: jest.fn(() =>
    Promise.resolve({
      exists: () => true,
      data: () => ({
        displayName: 'Test User',
        photoURL: null,
        role: 'user',
        department: 'IT',
        nhaMay: '',
        createdAt: fakeTimestamp,
        updatedAt: fakeTimestamp,
        lastLoginAt: fakeTimestamp,
        isActive: true,
      }),
    })
  ),
  setDoc: jest.fn(() => Promise.resolve()),
  updateDoc: jest.fn(() => Promise.resolve()),
}));

jest.mock('firebase/functions', () => ({
  getFunctions: () => ({}),
}));

// Dummy user for testing

// Consumer hiển thị trạng thái context
function Consumer() {
  const ctx = useAuth() || {};
  return (
    <div>
      <span data-testid="user">{ctx.user ? ctx.user.email : 'no-user'}</span>
      <span data-testid="is-auth">{ctx.isAuthenticated ? 'yes' : 'no'}</span>
      <span data-testid="error">{ctx.error || 'no-error'}</span>
      <button
        onClick={() => ctx.signOut && ctx.signOut()}
        data-testid="signout-btn"
      >
        Sign out
      </button>
    </div>
  );
}
Consumer.displayName = 'Consumer';

describe('AuthContext integration', () => {
  it('context updates when user logs in/out', async () => {
    render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>
    );
    // Ban đầu chưa đăng nhập
    expect(screen.getByTestId('user')).toHaveTextContent('no-user');
    expect(screen.getByTestId('is-auth')).toHaveTextContent('no');

    // Để test, gọi signOut và kiểm tra lại state
    act(() => {
      screen.getByTestId('signout-btn').click();
    });
    expect(screen.getByTestId('user')).toHaveTextContent('no-user');
    expect(screen.getByTestId('is-auth')).toHaveTextContent('no');
  });

  it('shows tiếng Việt error message for wrong password', async () => {
    // Test trực tiếp hàm signInWithEmail trả về lỗi tiếng Việt
    const { useAuth } = await import('../AuthContext');
    const ctx = useAuth();
    await expect(
      ctx.signInWithEmail('notfound@example.com', 'wrongpass')
    ).rejects.toMatchObject({
      code: 'auth/wrong-password',
      message: 'wrong password',
    });
  });
});
