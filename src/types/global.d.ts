/// <reference types="@testing-library/jest-dom" />
// Extend Jest matchers with Testing Library's custom matchers

// Global type declarations for the application
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production' | 'test';
      NEXT_PUBLIC_FIREBASE_API_KEY: string;
      NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: string;
      NEXT_PUBLIC_FIREBASE_PROJECT_ID: string;
      NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: string;
      NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: string;
      NEXT_PUBLIC_FIREBASE_APP_ID: string;
      NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID?: string;
      NEXT_PUBLIC_GOOGLE_CLIENT_ID?: string;
      NEXT_PUBLIC_POWERBI_SHOP_DRAWING?: string;
      NEXT_PUBLIC_POWERBI_MMTB?: string;
      NEXT_PUBLIC_POWERBI_USAGE_REPORT_URL?: string;
      NEXT_PUBLIC_USE_FIREBASE_EMULATOR?: string;
      GOOGLE_SERVICE_ACCOUNT_KEY?: string;
    }
  }

  // Window object extensions
  interface Window {
    firebase?: unknown;
    gtag?: (...args: unknown[]) => void;
  }
}

export {};
