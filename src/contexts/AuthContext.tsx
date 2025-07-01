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
  signUpWithEmail: (email: string, password: string, displayName: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateUserProfile: (data: Partial<User>) => Promise<void>;
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
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Convert Firebase user to our User type
  const convertFirebaseUser = async (firebaseUser: FirebaseUser): Promise<User | null> => {
    try {
      const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, firebaseUser.uid));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
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
          isActive: userData.isActive ?? true,
        };
      } else {
        // Create new user document
        const newUser: User = {
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

        await setDoc(doc(db, COLLECTIONS.USERS, firebaseUser.uid), {
          ...newUser,
          createdAt: new Date(),
          updatedAt: new Date(),
          lastLoginAt: new Date(),
        });

        return newUser;
      }
    } catch (error) {
      console.error('Error converting Firebase user:', error);
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
      console.error('Error updating last login:', error);
    }
  };

  // Sign in with Google
  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await signInWithPopup(auth, googleProvider);
      const user = await convertFirebaseUser(result.user);
      
      if (user) {
        await updateLastLogin(user.uid);
        setUser(user);
      }
    } catch (error: any) {
      console.error('Google sign in error:', error);
      setError(error.message || 'Failed to sign in with Google');
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
      const user = await convertFirebaseUser(result.user);
      
      if (user) {
        await updateLastLogin(user.uid);
        setUser(user);
      }
    } catch (error: any) {
      console.error('Email sign in error:', error);
      setError(error.message || 'Failed to sign in');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Sign up with email and password
  const signUpWithEmail = async (email: string, password: string, displayName: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const { updateProfile } = await import('firebase/auth');
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update the user's display name
      await updateProfile(result.user, { displayName });
      
      const user = await convertFirebaseUser(result.user);
      
      if (user) {
        setUser(user);
      }
    } catch (error: any) {
      console.error('Email sign up error:', error);
      setError(error.message || 'Failed to create account');
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
    } catch (error: any) {
      console.error('Sign out error:', error);
      setError(error.message || 'Failed to sign out');
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
      setUser(prev => prev ? { ...prev, ...data, updatedAt: new Date() } : null);
    } catch (error: any) {
      console.error('Update profile error:', error);
      setError(error.message || 'Failed to update profile');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        setLoading(true);
        
        if (firebaseUser) {
          const user = await convertFirebaseUser(firebaseUser);
          setUser(user);
        } else {
          setUser(null);
        }
        
        setError(null);
      } catch (error: any) {
        console.error('Auth state change error:', error);
        setError(error.message || 'Authentication error');
        setUser(null);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const value: AuthContextType = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    signOut,
    updateUserProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;