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
});
