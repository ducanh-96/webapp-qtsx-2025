import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';

// console.log('FIREBASE ENV:', {
//   apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
//   authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
//   projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
//   storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
//   messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
//   appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
// });

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Validate required environment variables
const requiredEnvVars = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID',
];

if (typeof window === 'undefined') {
  const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
  if (missingEnvVars.length > 0) {
    const msg = `Thiếu biến môi trường Firebase: ${missingEnvVars.join(', ')}`;
    if (process.env.NODE_ENV === 'production') {
      // Ở production, throw error để tránh chạy sai cấu hình
      throw new Error(msg);
    } else {
      // Ở dev, chỉ cảnh báo
      console.warn(msg);
    }
  }
}

// Initialize Firebase
const app =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);

// Configure Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('https://www.googleapis.com/auth/spreadsheets');
googleProvider.addScope('profile');
googleProvider.addScope('email');

// Set custom parameters
const customParams: { prompt: string; hd?: string } = {
  prompt: 'select_account',
};

if (process.env.NEXT_PUBLIC_GOOGLE_WORKSPACE_DOMAIN) {
  customParams.hd = process.env.NEXT_PUBLIC_GOOGLE_WORKSPACE_DOMAIN;
}

googleProvider.setCustomParameters(customParams);

// Connect to emulators in development
if (process.env.NODE_ENV === 'development') {
  const isEmulatorEnabled =
    process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true';

  if (isEmulatorEnabled) {
    try {
      // Connect to Firestore emulator
      connectFirestoreEmulator(db, 'localhost', 8080);

      // Đã loại bỏ Storage, không cần connectStorageEmulator

      // Connect to Functions emulator
      connectFunctionsEmulator(functions, 'localhost', 5001);

      console.log('Connected to Firebase emulators');
    } catch (error) {
      console.warn('Failed to connect to Firebase emulators:', error);
    }
  }
}

// Export the initialized app
export default app;

// Firebase collections and document references
export const COLLECTIONS = {
  USERS: 'users',
  FOLDERS: 'folders',
  PERMISSIONS: 'permissions',
  AUDIT_LOGS: 'audit_logs',
  NOTIFICATIONS: 'notifications',
  SYSTEM_CONFIG: 'system_config',
} as const;

// Firestore security rules validation
export const validateFirestoreRules = async () => {
  try {
    // This would typically test the security rules
    // For now, we'll just check if Firestore is accessible
    const { doc, getDoc } = await import('firebase/firestore');
    const testDoc = doc(db, 'test', 'connectivity');
    await getDoc(testDoc);
    console.log('Firestore connectivity test passed');
    return true;
  } catch (error) {
    console.error('Firestore connectivity test failed:', error);
    return false;
  }
};

// Helper function to check if Firebase is properly configured
export const isFirebaseConfigured = (): boolean => {
  return (
    !!firebaseConfig.apiKey &&
    !!firebaseConfig.authDomain &&
    !!firebaseConfig.projectId &&
    !!firebaseConfig.storageBucket &&
    !!firebaseConfig.messagingSenderId &&
    !!firebaseConfig.appId
  );
};

// Export configuration for debugging
export { firebaseConfig };
