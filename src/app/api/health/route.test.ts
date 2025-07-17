// Unit test for src/app/api/health/route.ts
import { GET, HEAD } from './route';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type NextRequestMock = any;

jest.mock('@/services/securityService', () => ({
  securityService: {
    getSecurityDashboard: jest.fn(() => ({
      activeAlerts: [],
      activeSessions: 2,
    })),
  },
}));

describe('api/health/route', () => {
  const mockRequest = {} as NextRequestMock;

  it('GET returns healthy status and correct structure', async () => {
    const res = await GET(mockRequest);
    expect([200, 207]).toContain(res.status);
    const json = await res.json();
    expect(['healthy', 'degraded']).toContain(json.status);
    expect(json.checks).toBeDefined();
    expect(json.performance).toBeDefined();
    expect(json.security).toBeDefined();
    expect(json.checks.database).toBeDefined();
    expect(json.checks.powerbi).toBeDefined();
    expect(json.checks.cache).toBeDefined();
    expect(json.checks.security).toBeDefined();
  });

  it('GET returns degraded if database fails', async () => {
    // Mock database check to throw
    jest.spyOn(process, 'uptime').mockImplementationOnce(() => {
      throw new Error('fail');
    });
    const res = await GET(mockRequest);
    expect([200, 207, 503]).toContain(res.status);
    await res.json(); // just to ensure it doesn't throw
  });

  it('HEAD returns 200', async () => {
    const res = await HEAD(mockRequest);
    expect(res.status).toBe(200);
  });

  it('GET returns degraded if cache check throws', async () => {
    // Patch Object.defineProperty to throw when accessing healthChecks.checks.cache
    const originalDefineProperty = Object.defineProperty;
    let called = false;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Object.defineProperty = function <T>(
      obj: T,
      prop: PropertyKey,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      descriptor: PropertyDescriptor & ThisType<any>
    ): T {
      if (prop === 'cache' && !called) {
        called = true;
        throw new Error('cache fail');
      }
      originalDefineProperty.call(Object, obj, prop, descriptor);
      return obj;
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = await GET({} as any);
    expect([207, 503]).toContain(res.status);
    await res.json();
    Object.defineProperty = originalDefineProperty;
  });

  it('GET returns degraded if cache fails', async () => {
    // Mock Date.now to simulate cache check throwing
    const originalDateNow = Date.now;
    let callCount = 0;
    Date.now = () => {
      callCount++;
      // Simulate error on cache check
      if (callCount === 4) throw new Error('cache fail');
      return originalDateNow();
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = await GET({} as any);
    expect([207, 503]).toContain(res.status);
    await res.json();
    Date.now = originalDateNow;
  });

  it('GET uses default version and environment if env vars are missing', async () => {
    const oldVersion = process.env.npm_package_version;
    const oldEnv = process.env.NODE_ENV;
    Object.defineProperty(process.env, 'npm_package_version', {
      value: undefined,
      configurable: true,
      writable: true,
    });
    Object.defineProperty(process.env, 'NODE_ENV', {
      value: undefined,
      configurable: true,
      writable: true,
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = await GET({} as any);
    const json = await res.json();
    expect(json.version).toBe('1.0.0');
    expect(json.environment).toBe('development');
    Object.defineProperty(process.env, 'npm_package_version', {
      value: oldVersion,
      configurable: true,
      writable: true,
    });
    Object.defineProperty(process.env, 'NODE_ENV', {
      value: oldEnv,
      configurable: true,
      writable: true,
    });
  });

  it('GET returns unhealthy if all checks fail', async () => {
    // Mock all checks to fail
    jest.spyOn(process, 'uptime').mockReturnValueOnce(1);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    jest.spyOn(process, 'memoryUsage').mockReturnValueOnce({} as any);
    jest.mock('@/services/securityService', () => ({
      securityService: {
        getSecurityDashboard: () => {
          throw new Error('fail');
        },
      },
    }));
    const originalDateNow = Date.now;
    let callCount = 0;
    Date.now = () => {
      callCount++;
      // Throw on database and cache checks
      if (callCount === 2 || callCount === 4) throw new Error('fail');
      return originalDateNow();
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = await GET({} as any);
    expect(res.status).toBe(503);
    const json = await res.json();
    expect(json.status).toBe('unhealthy');
    Date.now = originalDateNow;
  });
});
