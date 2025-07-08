interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: number;
  category: 'api' | 'ui' | 'database' | 'cache' | 'network';
}

interface PerformanceReport {
  averageApiResponseTime: number;
  cacheHitRate: number;
  pageLoadTime: number;
  memoryUsage: number;
  errorRate: number;
  metrics: PerformanceMetric[];
  recommendations: string[];
}

interface ApiCallMetric {
  endpoint: string;
  method: string;
  duration: number;
  status: number;
  timestamp: number;
  success: boolean;
}

class PerformanceService {
  private metrics: PerformanceMetric[] = [];
  private apiCalls: ApiCallMetric[] = [];
  private maxMetricsHistory = 1000;
  private maxApiCallsHistory = 500;

  // Start timing an operation
  startTimer(name: string): () => void {
    const startTime = performance.now();

    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;

      this.recordMetric({
        name,
        value: duration,
        unit: 'ms',
        timestamp: Date.now(),
        category: 'ui',
      });
    };
  }

  // Record a performance metric
  recordMetric(metric: PerformanceMetric): void {
    this.metrics.push(metric);

    // Keep only recent metrics
    if (this.metrics.length > this.maxMetricsHistory) {
      this.metrics = this.metrics.slice(-this.maxMetricsHistory);
    }
  }

  // Record API call performance
  recordApiCall(apiCall: ApiCallMetric): void {
    this.apiCalls.push(apiCall);

    // Keep only recent API calls
    if (this.apiCalls.length > this.maxApiCallsHistory) {
      this.apiCalls = this.apiCalls.slice(-this.maxApiCallsHistory);
    }
  }

  // Measure API call performance
  async measureApiCall<T>(
    endpoint: string,
    method: string,
    apiCall: () => Promise<T>
  ): Promise<T> {
    const startTime = performance.now();
    let success = false;
    let status = 0;

    try {
      const result = await apiCall();
      success = true;
      status = 200;
      return result;
    } catch (error: unknown) {
      success = false;
      status =
        typeof error === 'object' &&
        error !== null &&
        'status' in error &&
        typeof (error as { status?: number }).status === 'number'
          ? (error as { status: number }).status
          : 500;
      throw error;
    } finally {
      const endTime = performance.now();
      const duration = endTime - startTime;

      this.recordApiCall({
        endpoint,
        method,
        duration,
        status,
        timestamp: Date.now(),
        success,
      });
    }
  }

  // Get performance statistics
  getStats(): PerformanceReport {
    const now = Date.now();
    const oneHourAgo = now - 60 * 60 * 1000;

    // Filter recent metrics and API calls
    const recentMetrics = this.metrics.filter(m => m.timestamp > oneHourAgo);
    const recentApiCalls = this.apiCalls.filter(a => a.timestamp > oneHourAgo);

    // Calculate averages
    const avgApiResponseTime =
      this.calculateAverageApiResponseTime(recentApiCalls);
    const cacheHitRate = this.getCacheHitRate();
    const pageLoadTime = this.getAveragePageLoadTime(recentMetrics);
    const memoryUsage = this.getMemoryUsage();
    const errorRate = this.calculateErrorRate(recentApiCalls);

    const recommendations = this.generateRecommendations({
      avgApiResponseTime,
      cacheHitRate,
      pageLoadTime,
      memoryUsage,
      errorRate,
    });

    return {
      averageApiResponseTime: avgApiResponseTime,
      cacheHitRate,
      pageLoadTime,
      memoryUsage,
      errorRate,
      metrics: recentMetrics,
      recommendations,
    };
  }

  // Calculate average API response time
  private calculateAverageApiResponseTime(apiCalls: ApiCallMetric[]): number {
    if (apiCalls.length === 0) return 0;

    const total = apiCalls.reduce((sum, call) => sum + call.duration, 0);
    return Math.round(total / apiCalls.length);
  }

  // Get cache hit rate from cache service
  private getCacheHitRate(): number {
    try {
      // This would integrate with the cache service
      // For now, return a mock value
      return 85.5;
    } catch {
      return 0;
    }
  }

  // Calculate average page load time
  private getAveragePageLoadTime(metrics: PerformanceMetric[]): number {
    const pageLoadMetrics = metrics.filter(m => m.name.includes('page-load'));

    if (pageLoadMetrics.length === 0) return 0;

    const total = pageLoadMetrics.reduce(
      (sum, metric) => sum + metric.value,
      0
    );
    return Math.round(total / pageLoadMetrics.length);
  }

  // Get memory usage information
  private getMemoryUsage(): number {
    if ('memory' in performance) {
      const memory = (
        performance as Performance & { memory?: { usedJSHeapSize: number } }
      ).memory;
      return memory
        ? Math.round((memory.usedJSHeapSize / 1024 / 1024) * 100) / 100
        : 0; // MB
    }
    return 0;
  }

  // Calculate error rate
  private calculateErrorRate(apiCalls: ApiCallMetric[]): number {
    if (apiCalls.length === 0) return 0;

    const errors = apiCalls.filter(call => !call.success).length;
    return Math.round((errors / apiCalls.length) * 100 * 100) / 100; // Percentage
  }

  // Generate performance recommendations
  private generateRecommendations(stats: {
    avgApiResponseTime: number;
    cacheHitRate: number;
    pageLoadTime: number;
    memoryUsage: number;
    errorRate: number;
  }): string[] {
    const recommendations: string[] = [];

    if (stats.avgApiResponseTime > 1000) {
      recommendations.push(
        'API response times are high. Consider optimizing database queries or adding caching.'
      );
    }

    if (stats.cacheHitRate < 70) {
      recommendations.push(
        'Cache hit rate is low. Review caching strategy and increase cache TTL for stable data.'
      );
    }

    if (stats.pageLoadTime > 3000) {
      recommendations.push(
        'Page load times are slow. Consider code splitting and lazy loading of components.'
      );
    }

    if (stats.memoryUsage > 50) {
      recommendations.push(
        'Memory usage is high. Check for memory leaks and optimize data structures.'
      );
    }

    if (stats.errorRate > 5) {
      recommendations.push(
        'Error rate is high. Review error handling and implement retry mechanisms.'
      );
    }

    if (recommendations.length === 0) {
      recommendations.push(
        'Performance is good! Continue monitoring for optimal user experience.'
      );
    }

    return recommendations;
  }

  // Get metrics by category
  getMetricsByCategory(
    category: PerformanceMetric['category']
  ): PerformanceMetric[] {
    return this.metrics.filter(m => m.category === category);
  }

  // Get slowest API endpoints
  getSlowestEndpoints(
    limit = 5
  ): Array<{ endpoint: string; avgDuration: number; callCount: number }> {
    const endpointStats = new Map<
      string,
      { totalDuration: number; count: number }
    >();

    this.apiCalls.forEach(call => {
      const key = `${call.method} ${call.endpoint}`;
      const stats = endpointStats.get(key) || { totalDuration: 0, count: 0 };

      stats.totalDuration += call.duration;
      stats.count += 1;

      endpointStats.set(key, stats);
    });

    return Array.from(endpointStats.entries())
      .map(([endpoint, stats]) => ({
        endpoint,
        avgDuration: Math.round(stats.totalDuration / stats.count),
        callCount: stats.count,
      }))
      .sort((a, b) => b.avgDuration - a.avgDuration)
      .slice(0, limit);
  }

  // Get error rates by endpoint
  getErrorRatesByEndpoint(): Array<{
    endpoint: string;
    errorRate: number;
    totalCalls: number;
  }> {
    const endpointStats = new Map<string, { errors: number; total: number }>();

    this.apiCalls.forEach(call => {
      const key = `${call.method} ${call.endpoint}`;
      const stats = endpointStats.get(key) || { errors: 0, total: 0 };

      stats.total += 1;
      if (!call.success) {
        stats.errors += 1;
      }

      endpointStats.set(key, stats);
    });

    return Array.from(endpointStats.entries())
      .map(([endpoint, stats]) => ({
        endpoint,
        errorRate: Math.round((stats.errors / stats.total) * 100 * 100) / 100,
        totalCalls: stats.total,
      }))
      .filter(item => item.errorRate > 0)
      .sort((a, b) => b.errorRate - a.errorRate);
  }

  // Monitor Core Web Vitals
  monitorCoreWebVitals(): void {
    // Largest Contentful Paint (LCP)
    if ('PerformanceObserver' in window) {
      try {
        const lcpObserver = new PerformanceObserver(list => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];

          this.recordMetric({
            name: 'LCP',
            value: lastEntry.startTime,
            unit: 'ms',
            timestamp: Date.now(),
            category: 'ui',
          });
        });

        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

        // First Input Delay (FID)
        const fidObserver = new PerformanceObserver(list => {
          const entries = list.getEntries();
          entries.forEach(entry => {
            const e = entry as PerformanceEntry & { processingStart?: number };
            if (typeof e.processingStart === 'number') {
              this.recordMetric({
                name: 'FID',
                value: e.processingStart - e.startTime,
                unit: 'ms',
                timestamp: Date.now(),
                category: 'ui',
              });
            }
          });
        });

        fidObserver.observe({ entryTypes: ['first-input'] });

        // Cumulative Layout Shift (CLS)
        const clsObserver = new PerformanceObserver(list => {
          let clsValue = 0;
          const entries = list.getEntries();

          entries.forEach(entry => {
            const e = entry as PerformanceEntry & {
              hadRecentInput?: boolean;
              value?: number;
            };
            if (!e.hadRecentInput) {
              clsValue += e.value ?? 0;
            }
          });

          this.recordMetric({
            name: 'CLS',
            value: clsValue,
            unit: 'score',
            timestamp: Date.now(),
            category: 'ui',
          });
        });

        clsObserver.observe({ entryTypes: ['layout-shift'] });
      } catch (error) {
        console.warn('Performance Observer not supported:', error);
      }
    }
  }

  // Clear all performance data
  clearData(): void {
    this.metrics = [];
    this.apiCalls = [];
  }

  // Export performance data for analysis
  exportData(): { metrics: PerformanceMetric[]; apiCalls: ApiCallMetric[] } {
    return {
      metrics: [...this.metrics],
      apiCalls: [...this.apiCalls],
    };
  }

  // Initialize performance monitoring
  initialize(): void {
    console.log('Performance monitoring initialized');

    // Monitor Core Web Vitals
    this.monitorCoreWebVitals();

    // Record initial page load time
    if (document.readyState === 'complete') {
      this.recordPageLoadTime();
    } else {
      window.addEventListener('load', () => this.recordPageLoadTime());
    }
  }

  // Record page load time
  private recordPageLoadTime(): void {
    if (performance.timing) {
      const loadTime =
        performance.timing.loadEventEnd - performance.timing.navigationStart;

      this.recordMetric({
        name: 'page-load-time',
        value: loadTime,
        unit: 'ms',
        timestamp: Date.now(),
        category: 'ui',
      });
    }
  }
}

// Export singleton instance
export const performanceService = new PerformanceService();
export default performanceService;

// Export types
export type { PerformanceMetric, PerformanceReport, ApiCallMetric };
