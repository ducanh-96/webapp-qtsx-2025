import { waitFor } from '@testing-library/react';
// Unit test for AuthContext

import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../AuthContext';
import { UserRole } from '@/types';
import { Auth } from 'firebase/auth';

// --- Mocks ---
jest.mock('firebase/auth', () => ({
  signInWithPopup: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  onAuthStateChanged: jest.fn(),
  updateProfile: jest.fn(),
  sendEmailVerification: jest.fn(),
  sendPasswordResetEmail: jest.fn(),
}));
jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  getDoc: jest.fn(),
  setDoc: jest.fn(),
  updateDoc: jest.fn(),
}));
jest.mock('@/config/firebase', () => ({
  auth: {},
  googleProvider: {},
  db: {},
  COLLECTIONS: { USERS: 'users' },
}));
jest.mock('@/types', () => ({
  UserRole: { USER: 'USER', ADMIN: 'ADMIN' },
}));

const mockUser = {
  uid: '123',
  email: 'test@example.com',
  displayName: 'Test User',
  emailVerified: true,
  photoURL: 'photo.png',
};

const mockUserDoc = {
  exists: () => true,
  data: () => ({
    displayName: 'Test User',
    role: 'USER',
    createdAt: { toDate: () => new Date() },
    updatedAt: { toDate: () => new Date() },
    lastLoginAt: { toDate: () => new Date() },
    isActive: true,
    nhaMay: '',
    photoURL: 'photo.png',
  }),
};

import * as firebaseAuth from 'firebase/auth';
import * as firebaseFirestore from 'firebase/firestore';

// Access mocks via jest.Mocked
const mockSetDoc = firebaseFirestore.setDoc as jest.Mock;
const mockGetDoc = firebaseFirestore.getDoc as jest.Mock;
const mockUpdateDoc = firebaseFirestore.updateDoc as jest.Mock;
const mockSignInWithPopup = firebaseAuth.signInWithPopup as jest.Mock;
const mockSignInWithEmailAndPassword =
  firebaseAuth.signInWithEmailAndPassword as jest.Mock;
const mockCreateUserWithEmailAndPassword =
  firebaseAuth.createUserWithEmailAndPassword as jest.Mock;
const mockSignOut = firebaseAuth.signOut as jest.Mock;
const mockOnAuthStateChanged = firebaseAuth.onAuthStateChanged as jest.Mock;
const mockUpdateProfile = firebaseAuth.updateProfile as jest.Mock;
const mockSendEmailVerification =
  firebaseAuth.sendEmailVerification as jest.Mock;
const mockSendPasswordResetEmail =
  firebaseAuth.sendPasswordResetEmail as jest.Mock;

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
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.NEXT_PUBLIC_GOOGLE_WORKSPACE_DOMAIN = '';
    mockGetDoc.mockResolvedValue(mockUserDoc);
    mockSetDoc.mockResolvedValue(undefined);
    mockUpdateDoc.mockResolvedValue(undefined);
  });

  it('throws if useAuth called outside provider', () => {
    expect(() => render(<Consumer />)).toThrow(
      /must be used within an AuthProvider/
    );
  });

  it('provides default state and methods', async () => {
    await act(async () => {
      render(
        <AuthProvider>
          <Consumer />
        </AuthProvider>
      );
    });
    expect(screen.getByTestId('user')).toHaveTextContent('no-user');
    expect(screen.getByTestId('loading')).toHaveTextContent('loading');
    expect(screen.getByTestId('error')).toHaveTextContent('no-error');
    expect(screen.getByTestId('is-auth')).toHaveTextContent('no');
    expect(screen.getByTestId('has-methods')).toHaveTextContent('all-methods');
  });

  it('renders children', async () => {
    await act(async () => {
      render(
        <AuthProvider>
          <div data-testid="child">child-content</div>
        </AuthProvider>
      );
    });
    expect(screen.getByTestId('child')).toHaveTextContent('child-content');
  });

  // --- Google Sign-In ---
  type GoogleSignInTestProps = {
    onResult: (ctx: ReturnType<typeof useAuth>, error: string | null) => void;
  };

  function GoogleSignInTest({ onResult }: GoogleSignInTestProps) {
    const ctx = useAuth();
    const [error, setError] = React.useState<string | null>(null);

    React.useEffect(() => {
      onResult(ctx, error);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ctx, error]);

    const handleGoogleSignIn = async () => {
      try {
        await ctx.signInWithGoogle();
        setError(null);
      } catch (err: unknown) {
        if (err && typeof err === 'object' && 'message' in err) {
          setError((err as { message?: string }).message || err.toString());
        } else {
          setError(String(err));
        }
      }
    };

    return (
      <>
        <button data-testid="google" onClick={handleGoogleSignIn}>
          SignInWithGoogle
        </button>
        <span data-testid="test-error">{error || ''}</span>
      </>
    );
  }

  it('signs in with Google (success)', async () => {
    mockSignInWithPopup.mockResolvedValue({ user: mockUser });
    let ctxResult: ReturnType<typeof useAuth> | undefined = undefined;
    await act(async () => {
      render(
        <AuthProvider>
          <GoogleSignInTest
            onResult={ctx => {
              ctxResult = ctx;
            }}
          />
        </AuthProvider>
      );
    });
    await act(async () => {
      await screen.getByTestId('google').click();
    });
    expect(mockSignInWithPopup).toHaveBeenCalled();
    expect(ctxResult).toBeDefined();
    expect(ctxResult!.user?.email).toBe('test@example.com');
    expect(ctxResult!.error).toBeNull();
  });

  it('signs in with Google (disallowed domain)', async () => {
    process.env.NEXT_PUBLIC_GOOGLE_WORKSPACE_DOMAIN = 'forbidden.com';
    mockSignInWithPopup.mockResolvedValue({
      user: { ...mockUser, email: 'user@other.com' },
    });
    let ctxResult: ReturnType<typeof useAuth> | undefined = undefined;
    await act(async () => {
      render(
        <AuthProvider>
          <GoogleSignInTest
            onResult={(ctx, _err) => {
              ctxResult = ctx;
            }}
          />
        </AuthProvider>
      );
    });
    await act(async () => {
      await screen.getByTestId('google').click();
    });
    expect(ctxResult).toBeDefined();
    expect(ctxResult!.error).toMatch(
      /Chỉ chấp nhận đăng nhập bằng tài khoản DDC/
    );
    expect(screen.getByTestId('test-error').textContent).toMatch(
      /Chỉ chấp nhận đăng nhập bằng tài khoản DDC/
    );
  });

  it('signs in with Google (disabled user)', async () => {
    mockSignInWithPopup.mockResolvedValue({ user: mockUser });
    mockGetDoc.mockResolvedValue({
      ...mockUserDoc,
      data: () => ({ ...mockUserDoc.data(), isActive: false }),
    });
    let ctxResult: ReturnType<typeof useAuth> | undefined = undefined;
    await act(async () => {
      render(
        <AuthProvider>
          <GoogleSignInTest
            onResult={(ctx, _err) => {
              ctxResult = ctx;
            }}
          />
        </AuthProvider>
      );
    });
    await act(async () => {
      await screen.getByTestId('google').click();
    });
    expect(ctxResult).toBeDefined();
    await waitFor(() => {
      expect(ctxResult!.error).toMatch(/Tài khoản của bạn đã bị vô hiệu hóa/);
      expect(screen.getByTestId('test-error').textContent).toMatch(
        /Tài khoản của bạn đã bị vô hiệu hóa/
      );
    });
  });

  it('signs in with Google (error)', async () => {
    mockSignInWithPopup.mockRejectedValue({
      code: 'auth/popup-closed-by-user',
    });
    let ctxResult: ReturnType<typeof useAuth> | undefined = undefined;
    await act(async () => {
      render(
        <AuthProvider>
          <GoogleSignInTest
            onResult={(ctx, _err) => {
              ctxResult = ctx;
            }}
          />
        </AuthProvider>
      );
    });
    await act(async () => {
      await screen.getByTestId('google').click();
    });
    expect(ctxResult).toBeDefined();
    expect(ctxResult!.error).toMatch(/đã đóng cửa sổ đăng nhập Google/);
    // expect(ctxResult!.error).toMatch(/đã đóng cửa sổ đăng nhập Google/);
    expect(screen.getByTestId('test-error').textContent).toMatch(
      /đã đóng cửa sổ đăng nhập Google/
    );
  });

  // --- Email Sign-In ---
  it('signs in with email (success)', async () => {
    mockSignInWithEmailAndPassword.mockResolvedValue({
      user: { ...mockUser, emailVerified: true },
    });
    let ctxResult: ReturnType<typeof useAuth> | undefined = undefined;
    function TestComponent() {
      const ctx = useAuth();
      React.useEffect(() => {
        ctxResult = ctx;
      }, [ctx]);
      return null;
    }
    await act(async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );
    });
    await act(async () => {
      await ctxResult!.signInWithEmail('test@example.com', 'pw');
    });
    expect(ctxResult!.user?.email).toBe('test@example.com');
    expect(ctxResult!.error).toBeNull();
  });

  it('signs in with email (unverified email)', async () => {
    mockSignInWithEmailAndPassword.mockResolvedValue({
      user: { ...mockUser, emailVerified: false },
    });
    let ctxResult: ReturnType<typeof useAuth> | undefined = undefined;
    function TestComponent() {
      const ctx = useAuth();
      React.useEffect(() => {
        ctxResult = ctx;
      }, [ctx]);
      return null;
    }
    await act(async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );
    });
    await act(async () => {
      await ctxResult!.signInWithEmail('test@example.com', 'pw');
    });
    expect(ctxResult!.user).toBeNull();
    expect(ctxResult!.error).toMatch(/chưa được xác thực/);
  });

  it('signs in with email (disabled user)', async () => {
    mockSignInWithEmailAndPassword.mockResolvedValue({
      user: { ...mockUser, emailVerified: true },
    });
    mockGetDoc.mockResolvedValue({
      ...mockUserDoc,
      data: () => ({ ...mockUserDoc.data(), isActive: false }),
    });
    let ctxResult: ReturnType<typeof useAuth> | undefined = undefined;
    function TestComponent() {
      const ctx = useAuth();
      React.useEffect(() => {
        ctxResult = ctx;
      }, [ctx]);
      return null;
    }
    await act(async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );
    });
    await expect(
      ctxResult!.signInWithEmail('test@example.com', 'pw')
    ).rejects.toThrow(/Tài khoản của bạn đã bị vô hiệu hóa/);
    await waitFor(() => {
      expect(ctxResult!.error).toMatch(/Tài khoản của bạn đã bị vô hiệu hóa/);
    });
  });

  it('signs in with email (error)', async () => {
    mockSignInWithEmailAndPassword.mockRejectedValue({
      code: 'auth/wrong-password',
    });
    let ctxResult: ReturnType<typeof useAuth> | undefined = undefined;
    function TestComponent() {
      const ctx = useAuth();
      React.useEffect(() => {
        ctxResult = ctx;
      }, [ctx]);
      return null;
    }
    await act(async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );
    });
    await expect(
      ctxResult!.signInWithEmail('test@example.com', 'pw')
    ).rejects.toBeDefined();
    await waitFor(() => {
      expect(ctxResult!.error).toMatch(/không đúng/);
    });
  });

  // --- Email Sign-Up ---
  it('signs up with email (success)', async () => {
    mockCreateUserWithEmailAndPassword.mockResolvedValue({ user: mockUser });
    mockUpdateProfile.mockResolvedValue(undefined);
    mockSendEmailVerification.mockResolvedValue(undefined);
    let ctxResult: ReturnType<typeof useAuth> | undefined = undefined;
    function TestComponent() {
      const ctx = useAuth();
      React.useEffect(() => {
        ctxResult = ctx;
      }, [ctx]);
      return null;
    }
    await act(async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );
    });
    await act(async () => {
      await ctxResult!.signUpWithEmail('test@example.com', 'pw', 'Test User');
    });
    expect(mockCreateUserWithEmailAndPassword).toHaveBeenCalled();
    expect(mockUpdateProfile).toHaveBeenCalled();
    expect(mockSendEmailVerification).toHaveBeenCalled();
    expect(ctxResult!.user).toBeNull(); // Should not set user until email verified
  });

  it('signs up with email (error)', async () => {
    mockCreateUserWithEmailAndPassword.mockRejectedValue({
      message: 'Signup failed',
    });
    let ctxResult: ReturnType<typeof useAuth> | undefined = undefined;
    function TestComponent() {
      const ctx = useAuth();
      React.useEffect(() => {
        ctxResult = ctx;
      }, [ctx]);
      return null;
    }
    await act(async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );
    });
    await expect(
      ctxResult!.signUpWithEmail('test@example.com', 'pw', 'Test User')
    ).rejects.toBeDefined();
    await waitFor(() => {
      expect(ctxResult!.error).toMatch(/Signup failed/);
    });
  });

  // --- Sign Out ---
  it('signs out (success)', async () => {
    mockSignOut.mockResolvedValue(undefined);
    let ctxResult: ReturnType<typeof useAuth> | undefined = undefined;
    function TestComponent() {
      const ctx = useAuth();
      React.useEffect(() => {
        ctxResult = ctx;
      }, [ctx]);
      return null;
    }
    await act(async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );
    });
    ctxResult!.user = {
      ...mockUser,
      id: '123',
      role: UserRole.USER,
      name: 'Test User',
    };
    await act(async () => {
      await ctxResult!.signOut();
    });
    expect(mockSignOut).toHaveBeenCalled();
    expect(ctxResult!.user).toBeNull();
    expect(ctxResult!.error).toBeNull();
  });

  it('signs out (error)', async () => {
    mockSignOut.mockRejectedValue({ message: 'Sign out failed' });
    let ctxResult: ReturnType<typeof useAuth> | undefined = undefined;
    function TestComponent() {
      const ctx = useAuth();
      React.useEffect(() => {
        ctxResult = ctx;
      }, [ctx]);
      return null;
    }
    await act(async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );
    });
    ctxResult!.user = {
      ...mockUser,
      id: '123',
      role: UserRole.USER,
      name: 'Test User',
    };
    await expect(ctxResult!.signOut()).rejects.toBeDefined();
    await waitFor(() => {
      expect(ctxResult!.error).toMatch(/Sign out failed/);
    });
  });

  // --- Update User Profile ---
  it('updates user profile (success)', async () => {
    mockUpdateDoc.mockResolvedValue(undefined);
    let ctxResult: ReturnType<typeof useAuth> | undefined = undefined;
    function TestComponent() {
      const ctx = useAuth();
      React.useEffect(() => {
        ctxResult = ctx;
      }, [ctx]);
      return null;
    }
    await act(async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );
    });
    mockSignInWithEmailAndPassword.mockResolvedValue({
      user: { ...mockUser, emailVerified: true },
    });
    await act(async () => {
      await ctxResult!.signInWithEmail('test@example.com', 'pw');
    });
    await act(async () => {
      await ctxResult!.updateUserProfile({ name: 'New Name' });
    });
    expect(mockUpdateDoc).toHaveBeenCalled();
    expect(ctxResult!.user?.name).toBe('New Name');
    expect(ctxResult!.error).toBeNull();
  });

  it('updates user profile (error)', async () => {
    mockUpdateDoc.mockRejectedValue({ message: 'Update failed' });
    let ctxResult: ReturnType<typeof useAuth> | undefined = undefined;
    function TestComponent() {
      const ctx = useAuth();
      React.useEffect(() => {
        ctxResult = ctx;
      }, [ctx]);
      return null;
    }
    await act(async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );
    });
    ctxResult!.user = {
      ...mockUser,
      id: '123',
      role: UserRole.USER,
      name: 'Test User',
    };
    await expect(
      ctxResult!.updateUserProfile({ name: 'New Name' })
    ).rejects.toBeDefined();
    await waitFor(() => {
      expect(ctxResult!.error).toMatch(
        /Bạn cần đăng nhập trước khi cập nhật thông tin cá nhân/
      );
    });
  });

  // --- Resend Email Verification ---
  it('resends email verification (success)', async () => {
    mockSignInWithEmailAndPassword.mockResolvedValue({
      user: { ...mockUser, emailVerified: false },
    });
    mockSendEmailVerification.mockResolvedValue(undefined);
    let ctxResult: ReturnType<typeof useAuth> | undefined = undefined;
    function TestComponent() {
      const ctx = useAuth();
      React.useEffect(() => {
        ctxResult = ctx;
      }, [ctx]);
      return null;
    }
    await act(async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );
    });
    await act(async () => {
      await ctxResult!.resendEmailVerification('test@example.com', 'pw');
    });
    expect(mockSignInWithEmailAndPassword).toHaveBeenCalled();
    expect(mockSendEmailVerification).toHaveBeenCalled();
  });

  it('resends email verification (already verified)', async () => {
    mockSignInWithEmailAndPassword.mockResolvedValue({
      user: { ...mockUser, emailVerified: true },
    });
    let ctxResult: ReturnType<typeof useAuth> | undefined = undefined;
    function TestComponent() {
      const ctx = useAuth();
      React.useEffect(() => {
        ctxResult = ctx;
      }, [ctx]);
      return null;
    }
    await act(async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );
    });
    await expect(
      ctxResult!.resendEmailVerification('test@example.com', 'pw')
    ).rejects.toThrow(/Email đã được xác thực/);
  });

  it('resends email verification (error)', async () => {
    mockSignInWithEmailAndPassword.mockRejectedValue({
      message: 'Resend failed',
    });
    let ctxResult: ReturnType<typeof useAuth> | undefined = undefined;
    function TestComponent() {
      const ctx = useAuth();
      React.useEffect(() => {
        ctxResult = ctx;
      }, [ctx]);
      return null;
    }
    await act(async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );
    });
    await expect(
      ctxResult!.resendEmailVerification('test@example.com', 'pw')
    ).rejects.toBeDefined();
  });

  // --- Password Reset ---
  it('sends password reset (success)', async () => {
    mockSendPasswordResetEmail.mockResolvedValue(undefined);
    let ctxResult: ReturnType<typeof useAuth> | undefined = undefined;
    function TestComponent() {
      const ctx = useAuth();
      React.useEffect(() => {
        ctxResult = ctx;
      }, [ctx]);
      return null;
    }
    await act(async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );
    });
    await act(async () => {
      await ctxResult!.sendPasswordReset('test@example.com');
    });
    expect(mockSendPasswordResetEmail).toHaveBeenCalled();
  });

  it('sends password reset (error)', async () => {
    mockSendPasswordResetEmail.mockRejectedValue({ message: 'Reset failed' });
    let ctxResult: ReturnType<typeof useAuth> | undefined = undefined;
    function TestComponent() {
      const ctx = useAuth();
      React.useEffect(() => {
        ctxResult = ctx;
      }, [ctx]);
      return null;
    }
    await act(async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );
    });
    await expect(
      ctxResult!.sendPasswordReset('test@example.com')
    ).rejects.toBeDefined();
  });

  // --- Auth State Listener ---
  it('handles auth state change (valid user)', async () => {
    let handler: (user: unknown) => unknown;
    mockOnAuthStateChanged.mockImplementation(
      (_auth: Auth, cb: (user: unknown) => unknown) => {
        handler = cb;
        return () => {};
      }
    );
    await act(async () => {
      render(
        <AuthProvider>
          <Consumer />
        </AuthProvider>
      );
    });
    await act(async () => {
      await handler({ ...mockUser, emailVerified: true });
    });
    expect(screen.getByTestId('user')).toHaveTextContent('test@example.com');
    expect(screen.getByTestId('is-auth')).toHaveTextContent('yes');
  });

  it('handles auth state change (unverified email)', async () => {
    let handler: (user: unknown) => unknown;
    mockOnAuthStateChanged.mockImplementation(
      (_auth: Auth, cb: (user: unknown) => unknown) => {
        handler = cb;
        return () => {};
      }
    );
    await act(async () => {
      render(
        <AuthProvider>
          <Consumer />
        </AuthProvider>
      );
    });
    await act(async () => {
      await handler({ ...mockUser, emailVerified: false });
    });
    expect(screen.getByTestId('user')).toHaveTextContent('no-user');
    expect(screen.getByTestId('error')).toHaveTextContent(/chưa được xác thực/);
  });

  it('handles auth state change (sign-out)', async () => {
    let handler: (user: unknown) => unknown;
    mockOnAuthStateChanged.mockImplementation(
      (_auth: Auth, cb: (user: unknown) => unknown) => {
        handler = cb;
        return () => {};
      }
    );
    await act(async () => {
      render(
        <AuthProvider>
          <Consumer />
        </AuthProvider>
      );
    });
    await act(async () => {
      await handler(null);
    });
    expect(screen.getByTestId('user')).toHaveTextContent('no-user');
    expect(screen.getByTestId('is-auth')).toHaveTextContent('no');
  });

  it('handles auth state change (error)', async () => {
    let handler: (user: unknown) => unknown;
    mockOnAuthStateChanged.mockImplementation(
      (_auth: Auth, cb: (user: unknown) => unknown) => {
        handler = cb;
        return () => {};
      }
    );
    mockGetDoc.mockRejectedValue(new Error('Listener error'));
    await act(async () => {
      render(
        <AuthProvider>
          <Consumer />
        </AuthProvider>
      );
    });
    await act(async () => {
      await handler({ ...mockUser, emailVerified: true });
    });
    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent(/Listener error/);
    });
    expect(screen.getByTestId('user')).toHaveTextContent('no-user');
  });

  // --- Edge Cases ---
  it('handles offline Firestore error', async () => {
    mockSignInWithPopup.mockResolvedValue({ user: mockUser });
    mockGetDoc.mockRejectedValue({ code: 'unavailable' });
    let ctxResult: ReturnType<typeof useAuth> | undefined = undefined;
    function TestComponent() {
      const ctx = useAuth();
      React.useEffect(() => {
        ctxResult = ctx;
      }, [ctx]);
      return null;
    }
    await act(async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );
    });
    await act(async () => {
      await ctxResult!.signInWithGoogle();
    });
    expect(ctxResult!.user?.email).toBe('test@example.com');
  });

  it('handles permission denied on user doc creation', async () => {
    let attempts = 0;
    mockSignInWithPopup.mockResolvedValue({ user: mockUser });
    mockGetDoc.mockResolvedValue({ exists: () => false });
    mockSetDoc.mockImplementation(() => {
      if (attempts < 2) {
        attempts++;
        const err = new Error('permission denied') as Error & { code: string };
        err.code = 'permission-denied';
        throw err;
      }
      return undefined;
    });
    let ctxResult: ReturnType<typeof useAuth> | undefined = undefined;
    function TestComponent() {
      const ctx = useAuth();
      React.useEffect(() => {
        ctxResult = ctx;
      }, [ctx]);
      return null;
    }
    await act(async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );
    });
    await act(async () => {
      await ctxResult!.signInWithGoogle();
    });
    expect(mockSetDoc).toHaveBeenCalledTimes(3);
    expect(ctxResult!.user?.email).toBe('test@example.com');
  });

  it('handles missing Firestore fields', async () => {
    mockSignInWithPopup.mockResolvedValue({ user: mockUser });
    mockGetDoc.mockResolvedValue({
      ...mockUserDoc,
      data: () => ({}),
    });
    mockUpdateDoc.mockResolvedValue(undefined);
    let ctxResult: ReturnType<typeof useAuth> | undefined = undefined;
    function TestComponent() {
      const ctx = useAuth();
      React.useEffect(() => {
        ctxResult = ctx;
      }, [ctx]);
      return null;
    }
    await act(async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );
    });
    await act(async () => {
      await ctxResult!.signInWithGoogle();
    });
    expect(mockUpdateDoc).toHaveBeenCalled();
    expect(ctxResult!.user?.role).toBe('USER');
  });
});
