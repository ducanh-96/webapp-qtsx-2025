// Tests for src/config/firebase.ts

import * as firebaseModule from '../firebase';

jest.mock('firebase/app', () => ({
  getApps: jest.fn(() => []),
  initializeApp: jest.fn(() => ({})),
}));
jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({})),
  GoogleAuthProvider: jest.fn().mockImplementation(() => ({
    addScope: jest.fn(),
    setCustomParameters: jest.fn(),
  })),
}));
jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(() => ({})),
  connectFirestoreEmulator: jest.fn(),
}));
jest.mock('firebase/functions', () => ({
  getFunctions: jest.fn(() => ({})),
  connectFunctionsEmulator: jest.fn(),
}));

describe('firebase config', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env = {
      ...process.env,
      NODE_ENV: 'test',
      NEXT_PUBLIC_FIREBASE_API_KEY: 'key',
      NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: 'domain',
      NEXT_PUBLIC_FIREBASE_PROJECT_ID: 'pid',
      NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: 'bucket',
      NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: 'sender',
      NEXT_PUBLIC_FIREBASE_APP_ID: 'appid',
    };
  });
  it('throws error in production if required env vars are missing', async () => {
    Object.defineProperty(process.env, 'NODE_ENV', { value: 'production' });
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY = '';
    jest.resetModules();
    // Mock window as undefined to trigger server-side validation
    const originalWindow = global.window;
    // @ts-expect-error window may be undefined in test
    delete global.window;
    expect(() => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      require('../firebase');
    }).toThrow(/Thiếu biến môi trường Firebase/);
    // Restore window
    if (originalWindow !== undefined) global.window = originalWindow;
  });

  it('logs warning in development if required env vars are missing', async () => {
    Object.defineProperty(process.env, 'NODE_ENV', { value: 'development' });
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY = '';
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.resetModules();
    // Mock window as undefined to trigger server-side validation
    const originalWindow = global.window;
    // @ts-expect-error window may be undefined in test
    delete global.window;
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require('../firebase');
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('Thiếu biến môi trường Firebase')
    );
    warnSpy.mockRestore();
    // Restore window
    if (originalWindow !== undefined) global.window = originalWindow;
  });

  it('should export auth, db, functions, googleProvider, COLLECTIONS, isFirebaseConfigured, firebaseConfig', () => {
    expect(firebaseModule.auth).toBeDefined();
    expect(firebaseModule.db).toBeDefined();
    expect(firebaseModule.functions).toBeDefined();
    expect(firebaseModule.googleProvider).toBeDefined();
    expect(firebaseModule.COLLECTIONS).toBeDefined();
    expect(firebaseModule.isFirebaseConfigured).toBeInstanceOf(Function);
    expect(firebaseModule.firebaseConfig).toBeDefined();
  });
  it('sets customParams.hd when NEXT_PUBLIC_GOOGLE_WORKSPACE_DOMAIN is set', async () => {
    Object.defineProperty(process.env, 'NODE_ENV', { value: 'test' });
    process.env.NEXT_PUBLIC_GOOGLE_WORKSPACE_DOMAIN = 'example.com';
    jest.resetModules();
    const { googleProvider } = await import('../firebase');
    // @ts-expect-error mock type does not match actual type
    const params = googleProvider.setCustomParameters.mock.calls[0][0];
    expect(params.hd).toBe('example.com');
  });

  it('connects to emulators and logs success in development', async () => {
    Object.defineProperty(process.env, 'NODE_ENV', { value: 'development' });
    process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR = 'true';
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY = 'key';
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = 'domain';
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = 'pid';
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = 'bucket';
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = 'sender';
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID = 'appid';
    jest.resetModules();
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const connectFirestoreEmulator =
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      require('firebase/firestore').connectFirestoreEmulator;
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const connectFunctionsEmulator =
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      require('firebase/functions').connectFunctionsEmulator;
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    await import('../firebase');
    expect(connectFirestoreEmulator).toHaveBeenCalledWith(
      expect.anything(),
      'localhost',
      8080
    );
    expect(connectFunctionsEmulator).toHaveBeenCalledWith(
      expect.anything(),
      'localhost',
      5001
    );
    expect(logSpy).toHaveBeenCalledWith('Connected to Firebase emulators');
    logSpy.mockRestore();
  });

  it('should export default app', async () => {
    const mod = await import('../firebase');
    expect(mod.default).toBeDefined();
  });

  it('logs warning if connecting to emulators fails', async () => {
    Object.defineProperty(process.env, 'NODE_ENV', { value: 'development' });
    process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR = 'true';
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY = 'key';
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = 'domain';
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = 'pid';
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = 'bucket';
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = 'sender';
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID = 'appid';
    jest.resetModules();
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const connectFirestoreEmulator =
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      require('firebase/firestore').connectFirestoreEmulator;
    connectFirestoreEmulator.mockImplementation(() => {
      throw new Error('fail');
    });
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    await import('../firebase');
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('Failed to connect to Firebase emulators:'),
      expect.any(Error)
    );
    warnSpy.mockRestore();
  });

  it('isFirebaseConfigured returns true when env vars are set', () => {
    expect(firebaseModule.isFirebaseConfigured()).toBe(true);
  });

  it('isFirebaseConfigured returns false when env vars are missing', async () => {
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY = '';
    // Reload the module to pick up new env
    jest.resetModules();
    const reloaded = await import('../firebase');
    expect(reloaded.isFirebaseConfigured()).toBe(false);
  });

  it('should set Google provider scopes and custom parameters', async () => {
    jest.resetModules();
    const addScope = jest.fn();
    const setCustomParameters = jest.fn();
    jest.doMock('firebase/auth', () => ({
      getAuth: jest.fn(() => ({})),
      GoogleAuthProvider: jest.fn().mockImplementation(() => ({
        addScope,
        setCustomParameters,
      })),
    }));
    const reloaded = await import('../firebase');
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const provider = reloaded.googleProvider;
    expect(addScope).toHaveBeenCalledWith(
      'https://www.googleapis.com/auth/spreadsheets'
    );
    expect(addScope).toHaveBeenCalledWith('profile');
    expect(addScope).toHaveBeenCalledWith('email');
    expect(setCustomParameters).toHaveBeenCalledWith(
      expect.objectContaining({ prompt: 'select_account' })
    );
  });

  it('should export COLLECTIONS with expected keys', () => {
    expect(firebaseModule.COLLECTIONS.USERS).toBe('users');
    expect(firebaseModule.COLLECTIONS.FOLDERS).toBe('folders');
    expect(firebaseModule.COLLECTIONS.PERMISSIONS).toBe('permissions');
    expect(firebaseModule.COLLECTIONS.AUDIT_LOGS).toBe('audit_logs');
    expect(firebaseModule.COLLECTIONS.NOTIFICATIONS).toBe('notifications');
    expect(firebaseModule.COLLECTIONS.SYSTEM_CONFIG).toBe('system_config');
  });

  it('validateFirestoreRules returns true on success', async () => {
    jest.resetModules();
    jest.doMock('firebase/firestore', () => ({
      getFirestore: jest.fn(() => ({})),
      connectFirestoreEmulator: jest.fn(),
      Timestamp: { now: jest.fn(() => ({ toDate: () => new Date() })) },
      doc: jest.fn(),
      getDoc: jest.fn(() => Promise.resolve({})),
    }));
    const reloaded = await import('../firebase');
    const result = await reloaded.validateFirestoreRules();
    expect(result).toBe(true);
  });

  it('validateFirestoreRules returns false on error', async () => {
    jest.resetModules();
    jest.doMock('firebase/firestore', () => ({
      getFirestore: jest.fn(() => ({})),
      connectFirestoreEmulator: jest.fn(),
      Timestamp: { now: jest.fn(() => ({ toDate: () => new Date() })) },
      doc: jest.fn(),
      getDoc: jest.fn(() => {
        throw new Error('fail');
      }),
    }));
    const reloaded = await import('../firebase');
    const result = await reloaded.validateFirestoreRules();
    expect(result).toBe(false);
  });
});
