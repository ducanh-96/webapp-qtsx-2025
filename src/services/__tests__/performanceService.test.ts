// Unit tests for performanceService

import performanceService, {
  PerformanceMetric,
  ApiCallMetric,
} from '../performanceService';

describe('performanceService', () => {
  beforeEach(() => {
    performanceService.clearData();
  });

  it('records and retrieves metrics', () => {
    const metric: PerformanceMetric = {
      name: 'test-metric',
      value: 123,
      unit: 'ms',
      timestamp: Date.now(),
      category: 'ui',
    };
    performanceService.recordMetric(metric);
    expect(performanceService.getMetricsByCategory('ui')).toContainEqual(
      metric
    );
  });

  it('records and retrieves API calls', () => {
    const apiCall: ApiCallMetric = {
      endpoint: '/api/test',
      method: 'GET',
      duration: 200,
      status: 200,
      timestamp: Date.now(),
      success: true,
    };
    performanceService.recordApiCall(apiCall);
    const stats = performanceService.getStats();
    expect(stats.metrics).toBeInstanceOf(Array);
    expect(stats.metrics.length).toBeGreaterThanOrEqual(0);
    expect(stats.averageApiResponseTime).toBeGreaterThanOrEqual(0);
  });

  it('measures API call performance (success)', async () => {
    const result = await performanceService.measureApiCall(
      '/api/success',
      'GET',
      async () => 'ok'
    );
    expect(result).toBe('ok');
    const slowest = performanceService.getSlowestEndpoints();
    expect(slowest[0].endpoint).toContain('/api/success');
  });

  it('measures API call performance (failure)', async () => {
    await expect(
      performanceService.measureApiCall('/api/fail', 'POST', async () => {
        throw { status: 400 };
      })
    ).rejects.toHaveProperty('status', 400);
    const errorRates = performanceService.getErrorRatesByEndpoint();
    expect(errorRates[0].endpoint).toContain('/api/fail');
    expect(errorRates[0].errorRate).toBeGreaterThan(0);
  });

  it('returns recommendations based on stats', () => {
    // Add slow API call to trigger recommendation
    for (let i = 0; i < 10; i++) {
      performanceService.recordApiCall({
        endpoint: '/api/slow',
        method: 'GET',
        duration: 2000,
        status: 200,
        timestamp: Date.now(),
        success: true,
      });
    }
    const stats = performanceService.getStats();
    expect(
      stats.recommendations.some(r => r.includes('API response times are high'))
    ).toBe(true);
  });

  it('clears and exports data', () => {
    performanceService.recordMetric({
      name: 'clear-test',
      value: 1,
      unit: 'ms',
      timestamp: Date.now(),
      category: 'ui',
    });
    performanceService.clearData();
    expect(performanceService.getMetricsByCategory('ui')).toHaveLength(0);
    const exported = performanceService.exportData();
    expect(exported.metrics).toBeInstanceOf(Array);
    expect(exported.apiCalls).toBeInstanceOf(Array);
  });

  it('handles edge case: empty metrics/apiCalls', () => {
    performanceService.clearData();
    const stats = performanceService.getStats();
    expect(stats.averageApiResponseTime).toBe(0);
    expect(stats.cacheHitRate).toBeGreaterThanOrEqual(0);
    expect(stats.pageLoadTime).toBe(0);
    expect(stats.memoryUsage).toBeGreaterThanOrEqual(0);
    expect(stats.errorRate).toBe(0);
    expect(stats.recommendations.length).toBeGreaterThan(0);
  });

  it('does not throw when monitoring Core Web Vitals (no window)', () => {
    expect(() => performanceService.monitorCoreWebVitals()).not.toThrow();
  });
});
