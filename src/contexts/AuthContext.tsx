'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User as FirebaseUser,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, googleProvider, db, COLLECTIONS } from '@/config/firebase';
import { User, UserRole, AuthState } from '@/types';

interface AuthContextType extends AuthState {
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (
    email: string,
    password: string,
    displayName: string
  ) => Promise<void>;
  signOut: () => Promise<void>;
  updateUserProfile: (data: Partial<User>) => Promise<void>;
  resendEmailVerification: (email: string, password: string) => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // Gửi lại email xác thực
  const resendEmailVerification = async (email: string, password: string) => {
    try {
      const { signInWithEmailAndPassword, sendEmailVerification } =
        await import('firebase/auth');
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      if (userCredential.user.emailVerified) {
        throw new Error('Email đã được xác thực.');
      }
      await sendEmailVerification(userCredential.user);
    } catch (error) {
      throw error;
    }
  };

  // Gửi email quên mật khẩu
  const sendPasswordReset = async (email: string) => {
    try {
      const { sendPasswordResetEmail } = await import('firebase/auth');
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      throw error;
    }
  };
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  // Handle hydration
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Convert Firebase user to our User type
  /**
   * Convert Firebase user to app User type and ensure Firestore user doc is always up-to-date.
   * - Nếu user doc chưa tồn tại, sẽ tạo mới (thử lại tối đa 3 lần nếu lỗi permission).
   * - Nếu user doc thiếu trường quan trọng, sẽ tự động bổ sung và cập nhật lại Firestore.
   * - Nếu offline, trả về user cơ bản từ Firebase Auth và log cảnh báo.
   */
  const convertFirebaseUser = async (
    firebaseUser: FirebaseUser
  ): Promise<User | null> => {
    try {
      const userRef = doc(db, COLLECTIONS.USERS, firebaseUser.uid);
      const userDoc = await getDoc(userRef);

      const defaultUser: User = {
        uid: firebaseUser.uid,
        email: firebaseUser.email!,
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
        role: UserRole.USER,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLoginAt: new Date(),
        isActive: true,
      };

      if (userDoc.exists()) {
        const userData = userDoc.data();
        // Kiểm tra thiếu trường quan trọng, tự động bổ sung
        let needsUpdate = false;
        const updatedFields: Partial<User> = {};
        if (!userData.role) {
          updatedFields.role = UserRole.USER;
          needsUpdate = true;
        }
        if (!userData.createdAt) {
          updatedFields.createdAt = new Date();
          needsUpdate = true;
        }
        if (!userData.updatedAt) {
          updatedFields.updatedAt = new Date();
          needsUpdate = true;
        }
        if (!userData.lastLoginAt) {
          updatedFields.lastLoginAt = new Date();
          needsUpdate = true;
        }
        if (typeof userData.isActive === 'undefined') {
          updatedFields.isActive = true;
          needsUpdate = true;
        }
        if (needsUpdate) {
          try {
            await updateDoc(userRef, updatedFields);
            console.info(
              'User doc auto-updated missing fields:',
              updatedFields
            );
          } catch (updateErr) {
            console.warn(
              'Could not auto-update missing user fields:',
              updateErr
            );
          }
        }
        return {
          uid: firebaseUser.uid,
          email: firebaseUser.email!,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          role: userData.role || UserRole.USER,
          department: userData.department,
          createdAt: userData.createdAt?.toDate() || new Date(),
          updatedAt: userData.updatedAt?.toDate() || new Date(),
          lastLoginAt: userData.lastLoginAt?.toDate(),
          isActive:
            typeof userData.isActive === 'boolean' ? userData.isActive : true,
          emailVerified: firebaseUser.emailVerified,
        };
      } else {
        // Create new user document, retry up to 3 times if permission error
        let attempts = 0;
        let created = false;
        while (attempts < 3 && !created) {
          try {
            await setDoc(userRef, {
              ...defaultUser,
              createdAt: new Date(),
              updatedAt: new Date(),
              lastLoginAt: new Date(),
            });
            created = true;
          } catch (err) {
            if (
              typeof err === 'object' &&
              err !== null &&
              'code' in err &&
              (err as { code?: string }).code === 'permission-denied'
            ) {
              attempts++;
              await new Promise(res => setTimeout(res, 300 * attempts));
              continue;
            }
            // Nếu lỗi khác, log và dừng
            console.error('Failed to create user doc:', err);
            break;
          }
        }
        if (!created) {
          console.error('Could not create user doc after 3 attempts');
        }
        return defaultUser;
      }
    } catch (error) {
      console.error('Error converting Firebase user:', error);
      // If offline or connection failed, return a basic user object from Firebase auth
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        (error as { code?: string }).code &&
        ((error as { code: string }).code === 'unavailable' ||
          (error as { code: string }).code === 'failed-precondition')
      ) {
        console.info(
          'Working offline - using basic user profile from Firebase Auth'
        );
        return {
          uid: firebaseUser.uid,
          email: firebaseUser.email!,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          role: UserRole.USER,
          createdAt: new Date(),
          updatedAt: new Date(),
          isActive: true,
        };
      }
      if (
        typeof error === 'object' &&
        error !== null &&
        'message' in error &&
        typeof (error as { message?: string }).message === 'string' &&
        ((error as { message: string }).message.includes('offline') ||
          (error as { message: string }).message.includes('client is offline'))
      ) {
        console.info(
          'Working offline - using basic user profile from Firebase Auth'
        );
        return {
          uid: firebaseUser.uid,
          email: firebaseUser.email!,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          role: UserRole.USER,
          createdAt: new Date(),
          updatedAt: new Date(),
          isActive: true,
        };
      }
      return null;
    }
  };

  // Update last login time
  const updateLastLogin = async (uid: string) => {
    try {
      await updateDoc(doc(db, COLLECTIONS.USERS, uid), {
        lastLoginAt: new Date(),
        updatedAt: new Date(),
      });
    } catch (error) {
      // Silently fail if offline - this is not critical for authentication
      if (
        typeof error !== 'object' ||
        error === null ||
        !('code' in error) ||
        ((error as { code?: string }).code !== 'unavailable' &&
          (error as { code?: string }).code !== 'failed-precondition')
      ) {
        console.error('Error updating last login:', error);
      }
    }
  };

  // Mapping Firebase Auth error codes to friendly Vietnamese messages
  // Định nghĩa kiểu cho lỗi xác thực Firebase
  interface FirebaseAuthError {
    code?: string;
    message?: string;
    [key: string]: unknown;
  }

  const getFriendlyAuthErrorMessage = (error: unknown): string => {
    if (error && typeof error === 'object') {
      const code = (error as FirebaseAuthError).code;
      switch (code) {
        case 'auth/invalid-credential':
        case 'auth/wrong-password':
        case 'auth/user-not-found':
          return 'Email hoặc mật khẩu không đúng';
        case 'auth/user-disabled':
          return 'Tài khoản đã bị vô hiệu hóa';
        case 'auth/too-many-requests':
          return 'Bạn đã đăng nhập sai quá nhiều lần. Vui lòng thử lại sau.';
        case 'auth/popup-closed-by-user':
          return 'Bạn đã đóng cửa sổ đăng nhập Google trước khi hoàn tất.';
        case 'auth/cancelled-popup-request':
          return 'Yêu cầu đăng nhập Google đã bị hủy.';
        case 'auth/popup-blocked':
          return 'Trình duyệt đã chặn cửa sổ đăng nhập Google. Vui lòng tắt chặn popup.';
        case 'auth/network-request-failed':
          return 'Không thể kết nối tới máy chủ. Vui lòng kiểm tra kết nối mạng.';
        case 'auth/account-exists-with-different-credential':
          return 'Tài khoản đã tồn tại với phương thức đăng nhập khác.';
        case 'auth/operation-not-allowed':
          return 'Phương thức đăng nhập này đang bị tắt. Vui lòng liên hệ quản trị viên.';
        case 'auth/internal-error':
          return 'Có lỗi hệ thống. Vui lòng thử lại sau.';
        default:
          const msg = (error as FirebaseAuthError).message;
          if (typeof msg === 'string') {
            // Nếu message là tiếng Anh phổ biến, chuyển sang tiếng Việt
            if (msg.includes('network'))
              return 'Không thể kết nối tới máy chủ. Vui lòng kiểm tra kết nối mạng.';
            if (msg.includes('popup'))
              return 'Có lỗi với cửa sổ đăng nhập Google. Vui lòng thử lại.';
            if (msg.includes('cancelled'))
              return 'Yêu cầu đăng nhập đã bị hủy.';
            if (msg.includes('blocked'))
              return 'Trình duyệt đã chặn cửa sổ đăng nhập. Vui lòng tắt chặn popup.';
            return msg;
          }
      }
    }
    return 'Đăng nhập thất bại. Vui lòng thử lại.';
  };

  // Sign in with Google
  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await signInWithPopup(auth, googleProvider);

      // Kiểm tra domain Google Workspace nếu cấu hình
      const allowedDomain = process.env.NEXT_PUBLIC_GOOGLE_WORKSPACE_DOMAIN;
      const email = result.user.email || '';
      if (allowedDomain && !email.endsWith(`@${allowedDomain}`)) {
        setError(
          `Chỉ chấp nhận đăng nhập bằng tài khoản Google thuộc domain ${allowedDomain}`
        );
        throw new Error('Sai domain Google Workspace');
      }

      // --- Ensure Firestore user doc has latest Google photoURL ---
      try {
        const userRef = doc(db, COLLECTIONS.USERS, result.user.uid);
        const userDoc = await getDoc(userRef);
        const googlePhotoURL = result.user.photoURL;
        if (googlePhotoURL) {
          if (!userDoc.exists() || userDoc.data().photoURL !== googlePhotoURL) {
            await setDoc(
              userRef,
              {
                ...(userDoc.exists() ? userDoc.data() : {}),
                photoURL: googlePhotoURL,
                updatedAt: new Date(),
              },
              { merge: true }
            );
          }
        }
      } catch (photoErr) {
        console.warn(
          'Could not update Firestore user photoURL from Google:',
          photoErr
        );
      }
      // -----------------------------------------------------------

      const user = await convertFirebaseUser(result.user);

      if (user && user.isActive === false) {
        setError(
          'Tài khoản của bạn đã bị vô hiệu hóa. Vui lòng liên hệ quản trị viên.'
        );
        throw new Error('Tài khoản bị vô hiệu hóa');
      }

      if (user) {
        await updateLastLogin(user.uid);
        setUser(user);
      }
    } catch (error) {
      console.error('Google sign in error:', error);
      setError(getFriendlyAuthErrorMessage(error));
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Sign in with email and password
  const signInWithEmail = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      const result = await signInWithEmailAndPassword(auth, email, password);

      // Kiểm tra xác thực email
      if (!result.user.emailVerified) {
        setError(
          'Email của bạn chưa được xác thực. Vui lòng kiểm tra hộp thư và xác thực email trước khi đăng nhập.'
        );
        // KHÔNG set user, không redirect
        return;
      }

      const user = await convertFirebaseUser(result.user);

      if (user && user.isActive === false) {
        setError(
          'Tài khoản của bạn đã bị vô hiệu hóa. Vui lòng liên hệ quản trị viên.'
        );
        throw new Error('Tài khoản bị vô hiệu hóa');
      }

      if (user) {
        await updateLastLogin(user.uid);
        setUser(user);
      }
    } catch (error) {
      console.error('Email sign in error:', error);
      setError(getFriendlyAuthErrorMessage(error));
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Sign up with email and password
  const signUpWithEmail = async (
    email: string,
    password: string,
    displayName: string
  ) => {
    try {
      setLoading(true);
      setError(null);

      const { updateProfile, sendEmailVerification } = await import(
        'firebase/auth'
      );
      const result = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Update the user's display name
      await updateProfile(result.user, { displayName });

      // Gửi email xác thực ngay sau khi đăng ký
      await sendEmailVerification(result.user);

      // Không set user vào context, yêu cầu xác thực email trước khi đăng nhập
      // const user = await convertFirebaseUser(result.user);
      // if (user) setUser(user);
    } catch (error) {
      console.error('Email sign up error:', error);
      setError(
        typeof error === 'object' &&
          error !== null &&
          'message' in error &&
          typeof (error as { message?: string }).message === 'string'
          ? (error as { message: string }).message
          : 'Failed to create account'
      );
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      setLoading(true);
      await firebaseSignOut(auth);
      setUser(null);
      setError(null);
    } catch (error) {
      console.error('Sign out error:', error);
      setError(
        typeof error === 'object' &&
          error !== null &&
          'message' in error &&
          typeof (error as { message?: string }).message === 'string'
          ? (error as { message: string }).message
          : 'Failed to sign out'
      );
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Update user profile
  const updateUserProfile = async (data: Partial<User>) => {
    if (!user) {
      throw new Error('No user signed in');
    }

    try {
      setLoading(true);
      setError(null);

      await updateDoc(doc(db, COLLECTIONS.USERS, user.uid), {
        ...data,
        updatedAt: new Date(),
      });

      // Update local user state
      setUser(prev =>
        prev ? { ...prev, ...data, updatedAt: new Date() } : null
      );
    } catch (error) {
      console.error('Update profile error:', error);
      setError(
        typeof error === 'object' &&
          error !== null &&
          'message' in error &&
          typeof (error as { message?: string }).message === 'string'
          ? (error as { message: string }).message
          : 'Failed to update profile'
      );
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Auth state listener - only run after hydration
  useEffect(() => {
    if (!isHydrated) return;

    const unsubscribe = onAuthStateChanged(auth, async firebaseUser => {
      try {
        setLoading(true);

        if (firebaseUser) {
          // Nếu chưa xác thực email, không set user, chỉ set lỗi
          if (!firebaseUser.emailVerified) {
            setUser(null);
            setError(
              'Email của bạn chưa được xác thực. Vui lòng kiểm tra hộp thư và xác thực email trước khi đăng nhập.'
            );
            return;
          }
          const user = await convertFirebaseUser(firebaseUser);
          setUser(user);
          setError(null);
        } else {
          setUser(null);
          setError(null);
        }
      } catch (error) {
        console.error('Auth state change error:', error);
        setError(
          typeof error === 'object' &&
            error !== null &&
            'message' in error &&
            typeof (error as { message?: string }).message === 'string'
            ? (error as { message: string }).message
            : 'Authentication error'
        );
        setUser(null);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, [isHydrated]);

  const value: AuthContextType = {
    user,
    loading: loading || !isHydrated,
    error,
    isAuthenticated: !!user && isHydrated,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    signOut,
    updateUserProfile,
    resendEmailVerification,
    sendPasswordReset,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
