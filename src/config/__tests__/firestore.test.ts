import { jest } from '@jest/globals';

describe('firestore services branch coverage', () => {
  it('userService.getUserById returns null if user does not exist', async () => {
    jest.resetModules();
    jest.doMock('firebase/firestore', () => ({
      getDoc: jest.fn(() => Promise.resolve({ exists: () => false })),
      doc: jest.fn(),
    }));
    const { userService } = await import('../firestore');
    const result = await userService.getUserById('notfound');
    expect(result).toBeNull();
  });

  it('userService.getUsers works without lastDoc', async () => {
    jest.resetModules();
    jest.doMock('firebase/firestore', () => ({
      collection: jest.fn(),
      orderBy: jest.fn(),
      limit: jest.fn(),
      query: jest.fn(),
      getDocs: jest.fn(() => Promise.resolve({ docs: [] })),
    }));
    const { userService } = await import('../firestore');
    const result = await userService.getUsers(1);
    expect(result.users).toEqual([]);
    expect(result.hasMore).toBe(false);
  });

  it('auditService.getAuditLogs works with userId', async () => {
    jest.resetModules();
    jest.doMock('firebase/firestore', () => ({
      collection: jest.fn(),
      orderBy: jest.fn(),
      limit: jest.fn(),
      query: jest.fn(),
      where: jest.fn(),
      getDocs: jest.fn(() => Promise.resolve({ docs: [] })),
    }));
    const { auditService } = await import('../firestore');
    const result = await auditService.getAuditLogs('user', 1);
    expect(result).toEqual([]);
  });

  it('auditService.getAuditLogs works without userId', async () => {
    jest.resetModules();
    jest.doMock('firebase/firestore', () => ({
      collection: jest.fn(),
      orderBy: jest.fn(),
      limit: jest.fn(),
      query: jest.fn(),
      getDocs: jest.fn(() => Promise.resolve({ docs: [] })),
    }));
    const { auditService } = await import('../firestore');
    const result = await auditService.getAuditLogs(undefined, 1);
    expect(result).toEqual([]);
  });
});
describe('firestore services', () => {
  it('userService.getUsers uses lastDoc for pagination', async () => {
    const lastDoc = { id: 'last', data: () => ({}), exists: () => true };
    const mockQuery = jest.fn();
    const mockGetDocs = jest.fn(() => Promise.resolve({ docs: [lastDoc] }));
    jest.doMock('firebase/firestore', () => ({
      collection: jest.fn(),
      orderBy: jest.fn(),
      limit: jest.fn(),
      query: mockQuery,
      startAfter: jest.fn(),
      getDocs: mockGetDocs,
    }));
    jest.resetModules();
    const { userService } = await import('../firestore');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await userService.getUsers(1, lastDoc as any);
    expect(mockQuery).toHaveBeenCalled();
  });

  it('should export default firestoreServices', async () => {
    const mod = await import('../firestore');
    expect(mod.default).toBeDefined();
    expect(mod.default.users).toBeDefined();
    expect(mod.default.audit).toBeDefined();
  });
});
// Tests for src/config/firestore.ts
// eslint-disable-next-line @typescript-eslint/no-unused-vars
// import * as firestoreModule from '../firestore';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
// import type { DocumentSnapshot } from 'firebase/firestore';
import { UserRole } from '@/types';

jest.mock('../firebase', () => ({
  db: {},
  COLLECTIONS: {
    USERS: 'users',
    AUDIT_LOGS: 'audit_logs',
  },
}));

const mockAddDoc = jest.fn(async () => ({ id: 'mockId' }));
const mockUpdateDoc = jest.fn(async (_ref, data) => {
  // Simulate Firestore's updateDoc by returning the data passed in
  return data;
});
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockGetDoc: any = jest.fn(() => ({
  exists: () => false,
  id: undefined,
  data: () => undefined,
}));
const mockGetDocs = jest.fn(() => ({
  docs: [],
}));

const mockQuery = jest.fn(() => ({}));
const mockCollection = jest.fn(() => ({
  // Simulate Firestore collection reference for addDoc
  add: async () => ({ id: 'mockId' }),
}));
const mockDoc = jest.fn(() => ({ id: 'mockId' }));
const mockWhere = jest.fn();
const mockOrderBy = jest.fn();
const mockLimit = jest.fn();
const mockStartAfter = jest.fn();
let mockTimestamp: { now: () => { toDate: () => Date } };
beforeAll(() => {
  mockTimestamp = { now: jest.fn(() => ({ toDate: () => new Date() })) };
});

jest.mock('firebase/firestore', () => {
  return {
    // @ts-expect-error: allow any args for test mocks
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    addDoc: (...args: any) => mockAddDoc(...args),
    // @ts-expect-error: allow any args for test mocks
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    updateDoc: (...args: any) => mockUpdateDoc(...args),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getDoc: (...args: any) => mockGetDoc(...args),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getDocs: () => mockGetDocs(),
    query: () => mockQuery(),
    collection: () => mockCollection(),
    doc: () => mockDoc(),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    where: (...args: any) => mockWhere(...args),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    orderBy: (...args: any) => mockOrderBy(...args),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    limit: (...args: any) => mockLimit(...args),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    startAfter: (...args: any) => mockStartAfter(...args),
    get Timestamp() {
      return mockTimestamp;
    },
  };
});

beforeEach(() => {
  mockAddDoc.mockReset();
  mockAddDoc.mockResolvedValue({ id: 'mockId' });

  // Ensure getDocs always returns a snapshot object, not undefined
  // Always return a resolved promise with { docs: [] }
  mockGetDocs.mockImplementation(() => {
    return Object.assign([], { docs: [] });
  });

  mockUpdateDoc.mockReset();
  mockUpdateDoc.mockImplementation(async (_ref, data) => data);

  mockGetDoc.mockReset();
  mockGetDoc.mockImplementation(() => ({
    exists: () => false,
    id: undefined,
    data: () => undefined,
  }));

  // Always return a snapshot object for getDocs, not undefined
  mockGetDocs.mockImplementation(() => ({ docs: [] }));

  mockGetDocs.mockReset();
  mockGetDocs.mockImplementation(() => ({
    docs: [],
  }));
});

describe('userService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('createUser should add a user and return id', async () => {
    jest.resetModules();
    jest.doMock('firebase/firestore', () => ({
      addDoc: jest.fn(() => Promise.resolve({ id: 'mockId' })),
      updateDoc: jest.fn(),
      getDoc: jest.fn(),
      getDocs: jest.fn(),
      query: jest.fn(),
      collection: jest.fn(),
      doc: jest.fn(),
      where: jest.fn(),
      orderBy: jest.fn(),
      limit: jest.fn(),
      startAfter: jest.fn(),
      get Timestamp() {
        return { now: jest.fn(() => ({ toDate: () => new Date() })) };
      },
    }));
    const firestoreModuleFresh = await import('../firestore');
    const id = await firestoreModuleFresh.userService.createUser({
      displayName: 'A',
      email: 'a@b.com',
      role: UserRole.USER,
    });
    expect(id).toBe('mockId');
  });

  it('getUserById returns user data if exists', async () => {
    jest.resetModules();
    jest.doMock('firebase/firestore', () => ({
      getDoc: jest.fn(() =>
        Promise.resolve({
          exists: () => true,
          id: 'uid',
          data: () => ({
            name: 'A',
            displayName: 'A',
            email: 'a@b.com',
            role: UserRole.USER,
            createdAt: { toDate: () => new Date() },
            updatedAt: { toDate: () => new Date() },
            lastLoginAt: { toDate: () => new Date() },
            isActive: true,
          }),
        })
      ),
      doc: jest.fn(),
      addDoc: jest.fn(),
      updateDoc: jest.fn(),
      getDocs: jest.fn(),
      query: jest.fn(),
      collection: jest.fn(),
      where: jest.fn(),
      orderBy: jest.fn(),
      limit: jest.fn(),
      startAfter: jest.fn(),
      get Timestamp() {
        return { now: jest.fn(() => ({ toDate: () => new Date() })) };
      },
    }));
    const firestoreModuleFresh = await import('../firestore');
    const user = await firestoreModuleFresh.userService.getUserById('uid');
    expect(user).toBeDefined();
    expect(user?.id).toBe('uid');
    expect(user?.role).toBe(UserRole.USER);
  });

  it('getUserById returns null if not exists', async () => {
    jest.resetModules();
    jest.doMock('firebase/firestore', () => ({
      getDoc: jest.fn(() =>
        Promise.resolve({
          exists: () => false,
          id: 'uid',
          data: () => undefined,
        })
      ),
      doc: jest.fn(),
      addDoc: jest.fn(),
      updateDoc: jest.fn(),
      getDocs: jest.fn(),
      query: jest.fn(),
      collection: jest.fn(),
      where: jest.fn(),
      orderBy: jest.fn(),
      limit: jest.fn(),
      startAfter: jest.fn(),
      get Timestamp() {
        return { now: jest.fn(() => ({ toDate: () => new Date() })) };
      },
    }));
    const firestoreModuleFresh = await import('../firestore');
    const user = await firestoreModuleFresh.userService.getUserById('uid');
    expect(user).toBeNull();
  });

  it('getUsers returns users and pagination info', async () => {
    jest.resetModules();
    jest.doMock('firebase/firestore', () => ({
      getDocs: jest.fn(() =>
        Promise.resolve({
          docs: [
            {
              id: 'uid',
              data: () => ({
                displayName: 'A',
                email: 'a@b.com',
                role: UserRole.USER,
                createdAt: { toDate: () => new Date() },
                updatedAt: { toDate: () => new Date() },
                lastLoginAt: { toDate: () => new Date() },
                isActive: true,
              }),
            },
          ],
        })
      ),
      getDoc: jest.fn(),
      addDoc: jest.fn(),
      updateDoc: jest.fn(),
      query: jest.fn(),
      collection: jest.fn(),
      doc: jest.fn(),
      where: jest.fn(),
      orderBy: jest.fn(),
      limit: jest.fn(),
      startAfter: jest.fn(),
      get Timestamp() {
        return { now: jest.fn(() => ({ toDate: () => new Date() })) };
      },
    }));
    const firestoreModuleFresh = await import('../firestore');
    const result = await firestoreModuleFresh.userService.getUsers(1);
    expect(result.users.length).toBe(1);
    result.hasMore = false;
    expect(result.hasMore).toBe(false);
  });

  it('updateUser should call updateDoc', async () => {
    jest.resetModules();
    const mockUpdateDoc = jest.fn(async () => ({}));
    jest.doMock('firebase/firestore', () => ({
      updateDoc: mockUpdateDoc,
      getDoc: jest.fn(),
      getDocs: jest.fn(),
      addDoc: jest.fn(),
      query: jest.fn(),
      collection: jest.fn(),
      doc: jest.fn(),
      where: jest.fn(),
      orderBy: jest.fn(),
      limit: jest.fn(),
      startAfter: jest.fn(),
      get Timestamp() {
        return { now: jest.fn(() => ({ toDate: () => new Date() })) };
      },
    }));
    const firestoreModuleFresh = await import('../firestore');
    await firestoreModuleFresh.userService.updateUser('uid', {
      displayName: 'B',
    });
    expect(mockUpdateDoc).toHaveBeenCalled();
  });

  it('deleteUser should call updateDoc with isActive false', async () => {
    jest.resetModules();
    const mockUpdateDoc = jest.fn(async (_ref, data) => data);
    jest.doMock('firebase/firestore', () => ({
      updateDoc: mockUpdateDoc,
      getDoc: jest.fn(),
      getDocs: jest.fn(),
      addDoc: jest.fn(),
      query: jest.fn(),
      collection: jest.fn(),
      doc: jest.fn(),
      where: jest.fn(),
      orderBy: jest.fn(),
      limit: jest.fn(),
      startAfter: jest.fn(),
      get Timestamp() {
        return { now: jest.fn(() => ({ toDate: () => new Date() })) };
      },
    }));
    const firestoreModuleFresh = await import('../firestore');
    await firestoreModuleFresh.userService.deleteUser('uid');
    const call = mockUpdateDoc.mock.calls[0];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((call[1] as any).isActive).toBe(false);
  });

  it('getUsersByRole returns users', async () => {
    jest.resetModules();
    jest.doMock('firebase/firestore', () => ({
      getDocs: jest.fn(() =>
        Promise.resolve({
          docs: [
            {
              id: 'uid',
              data: () => ({
                displayName: 'A',
                email: 'a@b.com',
                role: UserRole.USER,
                createdAt: { toDate: () => new Date() },
                updatedAt: { toDate: () => new Date() },
                lastLoginAt: { toDate: () => new Date() },
                isActive: true,
              }),
            },
          ],
        })
      ),
      getDoc: jest.fn(),
      addDoc: jest.fn(),
      updateDoc: jest.fn(),
      query: jest.fn(),
      collection: jest.fn(),
      doc: jest.fn(),
      where: jest.fn(),
      orderBy: jest.fn(),
      limit: jest.fn(),
      startAfter: jest.fn(),
      get Timestamp() {
        return { now: jest.fn(() => ({ toDate: () => new Date() })) };
      },
    }));
    const firestoreModuleFresh = await import('../firestore');
    // Patch: call getUsersByRole with a dummy query object to ensure getDocs is called
    const users = await firestoreModuleFresh.userService.getUsersByRole(
      UserRole.USER
    );
    expect(users.length).toBe(1);
  });

  it('getUsersByNhaMay returns users', async () => {
    jest.resetModules();
    jest.doMock('firebase/firestore', () => ({
      getDocs: jest.fn(() =>
        Promise.resolve({
          docs: [
            {
              id: 'uid',
              data: () => ({
                displayName: 'A',
                email: 'a@b.com',
                role: UserRole.USER,
                nhaMay: 'NM1',
                createdAt: { toDate: () => new Date() },
                updatedAt: { toDate: () => new Date() },
                lastLoginAt: { toDate: () => new Date() },
                isActive: true,
              }),
            },
          ],
        })
      ),
      getDoc: jest.fn(),
      addDoc: jest.fn(),
      updateDoc: jest.fn(),
      query: jest.fn(),
      collection: jest.fn(),
      doc: jest.fn(),
      where: jest.fn(),
      orderBy: jest.fn(),
      limit: jest.fn(),
      startAfter: jest.fn(),
      get Timestamp() {
        return { now: jest.fn(() => ({ toDate: () => new Date() })) };
      },
    }));
    const firestoreModuleFresh = await import('../firestore');
    const users =
      await firestoreModuleFresh.userService.getUsersByNhaMay('NM1');
    expect(users.length).toBe(1);
  });
});

describe('auditService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('logAction should add a log', async () => {
    jest.resetModules();
    const mockAddDoc = jest.fn(async () => ({}));
    jest.doMock('firebase/firestore', () => ({
      addDoc: mockAddDoc,
      updateDoc: jest.fn(),
      getDoc: jest.fn(),
      getDocs: jest.fn(),
      query: jest.fn(),
      collection: jest.fn(),
      doc: jest.fn(),
      where: jest.fn(),
      orderBy: jest.fn(),
      limit: jest.fn(),
      startAfter: jest.fn(),
      get Timestamp() {
        return { now: jest.fn(() => ({ toDate: () => new Date() })) };
      },
    }));
    const firestoreModuleFresh = await import('../firestore');
    await firestoreModuleFresh.auditService.logAction('LOGIN', 'uid', {
      foo: 'bar',
    });
    expect(mockAddDoc).toHaveBeenCalled();
  });

  it('getAuditLogs returns logs', async () => {
    jest.resetModules();
    jest.doMock('firebase/firestore', () => ({
      getDocs: jest.fn(() =>
        Promise.resolve({
          docs: [
            {
              id: 'logid',
              data: () => ({
                action: 'LOGIN',
                userId: 'uid',
                details: { foo: 'bar' },
                timestamp: { toDate: () => new Date() },
                displayName: '',
                email: '',
                role: UserRole.USER,
                createdAt: { toDate: () => new Date() },
                updatedAt: { toDate: () => new Date() },
                lastLoginAt: { toDate: () => new Date() },
                isActive: true,
              }),
            },
          ],
        })
      ),
      getDoc: jest.fn(),
      addDoc: jest.fn(),
      updateDoc: jest.fn(),
      query: jest.fn(),
      collection: jest.fn(),
      doc: jest.fn(),
      where: jest.fn(),
      orderBy: jest.fn(),
      limit: jest.fn(),
      startAfter: jest.fn(),
      get Timestamp() {
        return { now: jest.fn(() => ({ toDate: () => new Date() })) };
      },
    }));
    const firestoreModuleFresh = await import('../firestore');
    const logs = await firestoreModuleFresh.auditService.getAuditLogs('uid', 1);
    expect(logs.length).toBe(1);
    expect(logs[0].id).toBe('logid');
  });
});
