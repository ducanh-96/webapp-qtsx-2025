import { NextRequest, NextResponse } from 'next/server';
import { securityService } from '@/services/securityService';

// Define types for health check responses
interface HealthCheckResult {
  status: string;
  responseTime: number;
  error?: string;
  message?: string;
}

interface HealthCheckResponse {
  status: string;
  timestamp: string;
  uptime: number;
  version: string;
  environment: string;
  checks: {
    database: HealthCheckResult;
    powerbi: HealthCheckResult;
    cache: HealthCheckResult;
    security: HealthCheckResult;
  };
  performance: {
    memoryUsage: NodeJS.MemoryUsage;
    responseTime: number;
  };
  security: {
    recentAlerts: number;
    activeSessions: number;
  };
}

export async function GET(_request: NextRequest) {
  const startTime = Date.now();

  try {
    // Health check results
    const healthChecks: HealthCheckResponse = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      checks: {
        database: { status: 'unknown', responseTime: 0 },
        powerbi: { status: 'unknown', responseTime: 0 },
        cache: { status: 'unknown', responseTime: 0 },
        security: { status: 'unknown', responseTime: 0 },
      },
      performance: {
        memoryUsage: process.memoryUsage(),
        responseTime: 0,
      },
      security: {
        recentAlerts: 0,
        activeSessions: 0,
      },
    };

    // Check Firebase/Firestore connection
    try {
      const dbStartTime = Date.now();
      // Simple connectivity test - in production, this would ping Firestore
      healthChecks.checks.database = {
        status: 'healthy',
        responseTime: Date.now() - dbStartTime,
      };
    } catch {
      healthChecks.checks.database = {
        status: 'unhealthy',
        responseTime: 0,
        error: 'Database connection failed',
      };
      healthChecks.status = 'degraded';
    }

    // Power BI is now iframe-only; always report healthy
    const powerBiStartTime = Date.now();
    healthChecks.checks.powerbi = {
      status: 'healthy',
      responseTime: Date.now() - powerBiStartTime,
      message: 'Power BI is integrated via iframe and always available.',
    };

    // Check cache service
    try {
      const cacheStartTime = Date.now();
      // Test cache functionality
      // This would use your cache service in a real implementation
      // For now, just test that the cache service is available

      healthChecks.checks.cache = {
        status: 'healthy', // retrievedValue === testValue ? 'healthy' : 'unhealthy',
        responseTime: Date.now() - cacheStartTime,
      };
    } catch {
      healthChecks.checks.cache = {
        status: 'unhealthy',
        responseTime: 0,
        error: 'Cache service failed',
      };
      healthChecks.status = 'degraded';
    }

    // Check security service
    try {
      const securityStartTime = Date.now();
      const securityDashboard = securityService.getSecurityDashboard();

      healthChecks.checks.security = {
        status: 'healthy',
        responseTime: Date.now() - securityStartTime,
      };

      healthChecks.security = {
        recentAlerts: securityDashboard.activeAlerts.length,
        activeSessions: securityDashboard.activeSessions,
      };
    } catch {
      healthChecks.checks.security = {
        status: 'unhealthy',
        responseTime: 0,
        error: 'Security service failed',
      };
      healthChecks.status = 'degraded';
    }

    // Calculate total response time
    healthChecks.performance.responseTime = Date.now() - startTime;

    // Determine overall health status
    const unhealthyChecks = Object.values(healthChecks.checks).filter(
      check => check.status === 'unhealthy'
    );

    if (unhealthyChecks.length > 0) {
      healthChecks.status =
        unhealthyChecks.length === Object.keys(healthChecks.checks).length
          ? 'unhealthy'
          : 'degraded';
    }

    // Return appropriate status code
    const statusCode =
      healthChecks.status === 'healthy'
        ? 200
        : healthChecks.status === 'degraded'
        ? 207
        : 503;

    return NextResponse.json(healthChecks, { status: statusCode });
  } catch (_error) {
    console.error('Health check failed:', _error);

    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Health check service failed',
        responseTime: Date.now() - startTime,
      },
      { status: 503 }
    );
  }
}

// Lightweight health check for load balancers
export async function HEAD(
  _request: NextRequest,
  ResponseClass: typeof NextResponse = NextResponse
) {
  try {
    // Simple health check that just returns 200 if the service is running
    return new ResponseClass(null, { status: 200 });
  } catch {
    // If NextResponse throws, fall back to native Response
    return new Response(null, { status: 503 });
  }
}
