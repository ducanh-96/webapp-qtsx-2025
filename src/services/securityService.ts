import { auditService } from '@/config/firestore';

// Security event types
type SecurityEventType = 
  | 'login_attempt'
  | 'login_success'
  | 'login_failure'
  | 'logout'
  | 'unauthorized_access'
  | 'permission_denied'
  | 'suspicious_activity'
  | 'data_access'
  | 'data_modification'
  | 'password_change'
  | 'account_lockout'
  | 'session_timeout';

interface SecurityEvent {
  type: SecurityEventType;
  userId?: string;
  email?: string;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
  details?: Record<string, any>;
  riskScore: number;
}

interface SecurityPolicy {
  maxLoginAttempts: number;
  lockoutDuration: number; // minutes
  sessionTimeout: number; // minutes
  passwordMinLength: number;
  requireMFA: boolean;
  allowedDomains: string[];
  blockedIPs: string[];
}

interface RateLimitRule {
  endpoint: string;
  maxRequests: number;
  windowMs: number;
  blockDurationMs: number;
}

interface SecurityAlert {
  id: string;
  type: 'high' | 'medium' | 'low';
  message: string;
  userId?: string;
  timestamp: Date;
  resolved: boolean;
}

class SecurityService {
  private loginAttempts = new Map<string, { count: number; lastAttempt: Date; lockedUntil?: Date }>();
  private rateLimits = new Map<string, { requests: Date[]; blocked: boolean; blockedUntil?: Date }>();
  private activeSessions = new Map<string, { userId: string; lastActivity: Date; ipAddress: string }>();
  private securityEvents: SecurityEvent[] = [];
  private securityAlerts: SecurityAlert[] = [];

  private readonly defaultPolicy: SecurityPolicy = {
    maxLoginAttempts: 5,
    lockoutDuration: 15, // 15 minutes
    sessionTimeout: 60, // 60 minutes
    passwordMinLength: 8,
    requireMFA: false,
    allowedDomains: [],
    blockedIPs: [],
  };

  private readonly rateLimitRules: RateLimitRule[] = [
    {
      endpoint: '/api/auth/login',
      maxRequests: 5,
      windowMs: 15 * 60 * 1000, // 15 minutes
      blockDurationMs: 30 * 60 * 1000, // 30 minutes
    },
    {
      endpoint: '/api/documents',
      maxRequests: 100,
      windowMs: 60 * 1000, // 1 minute
      blockDurationMs: 5 * 60 * 1000, // 5 minutes
    },
    {
      endpoint: '/api/users',
      maxRequests: 20,
      windowMs: 60 * 1000, // 1 minute
      blockDurationMs: 10 * 60 * 1000, // 10 minutes
    },
  ];

  constructor() {
    // Clean up expired sessions and rate limits every 5 minutes
    setInterval(() => {
      this.cleanupExpiredSessions();
      this.cleanupExpiredRateLimits();
      this.cleanupExpiredLockouts();
    }, 5 * 60 * 1000);
  }

  // Log security event
  async logSecurityEvent(event: Omit<SecurityEvent, 'timestamp' | 'riskScore'>): Promise<void> {
    const securityEvent: SecurityEvent = {
      ...event,
      timestamp: new Date(),
      riskScore: this.calculateRiskScore(event),
    };

    this.securityEvents.push(securityEvent);

    // Keep only recent events
    if (this.securityEvents.length > 1000) {
      this.securityEvents = this.securityEvents.slice(-1000);
    }

    // Log to audit service
    try {
      await auditService.logAction('SECURITY_EVENT', event.userId || 'system', {
        type: event.type,
        details: event.details,
        ipAddress: event.ipAddress,
        userAgent: event.userAgent,
        riskScore: securityEvent.riskScore,
      });
    } catch (error) {
      console.error('Failed to log security event:', error);
    }

    // Check for suspicious activity
    this.checkSuspiciousActivity(securityEvent);
  }

  // Check if IP is blocked
  isIPBlocked(ipAddress: string): boolean {
    return this.defaultPolicy.blockedIPs.includes(ipAddress);
  }

  // Check if domain is allowed
  isDomainAllowed(email: string): boolean {
    if (this.defaultPolicy.allowedDomains.length === 0) {
      return true; // No domain restrictions
    }

    const domain = email.split('@')[1];
    return this.defaultPolicy.allowedDomains.includes(domain);
  }

  // Validate password strength
  validatePassword(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (password.length < this.defaultPolicy.passwordMinLength) {
      errors.push(`Password must be at least ${this.defaultPolicy.passwordMinLength} characters long`);
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    // Check against common passwords
    const commonPasswords = ['password', '123456', 'password123', 'admin', 'qwerty'];
    if (commonPasswords.includes(password.toLowerCase())) {
      errors.push('Password is too common');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // Handle login attempt
  async handleLoginAttempt(email: string, ipAddress: string, userAgent: string, success: boolean): Promise<boolean> {
    const key = `${email}:${ipAddress}`;
    const now = new Date();

    // Check if IP is blocked
    if (this.isIPBlocked(ipAddress)) {
      await this.logSecurityEvent({
        type: 'unauthorized_access',
        email,
        ipAddress,
        userAgent,
        details: { reason: 'Blocked IP address' },
      });
      return false;
    }

    // Check if domain is allowed
    if (!this.isDomainAllowed(email)) {
      await this.logSecurityEvent({
        type: 'unauthorized_access',
        email,
        ipAddress,
        userAgent,
        details: { reason: 'Domain not allowed' },
      });
      return false;
    }

    const attempts = this.loginAttempts.get(key) || { count: 0, lastAttempt: now };

    // Check if account is locked
    if (attempts.lockedUntil && now < attempts.lockedUntil) {
      await this.logSecurityEvent({
        type: 'account_lockout',
        email,
        ipAddress,
        userAgent,
        details: { reason: 'Account locked due to too many failed attempts' },
      });
      return false;
    }

    if (success) {
      // Reset attempts on successful login
      this.loginAttempts.delete(key);
      
      await this.logSecurityEvent({
        type: 'login_success',
        email,
        ipAddress,
        userAgent,
      });

      return true;
    } else {
      // Increment failed attempts
      attempts.count += 1;
      attempts.lastAttempt = now;

      if (attempts.count >= this.defaultPolicy.maxLoginAttempts) {
        attempts.lockedUntil = new Date(now.getTime() + this.defaultPolicy.lockoutDuration * 60 * 1000);
        
        await this.createSecurityAlert({
          type: 'high',
          message: `Account ${email} locked due to ${attempts.count} failed login attempts`,
          timestamp: now,
          resolved: false,
        });
      }

      this.loginAttempts.set(key, attempts);

      await this.logSecurityEvent({
        type: 'login_failure',
        email,
        ipAddress,
        userAgent,
        details: { attemptCount: attempts.count },
      });

      return false;
    }
  }

  // Check rate limiting
  checkRateLimit(endpoint: string, ipAddress: string): boolean {
    const rule = this.rateLimitRules.find(r => endpoint.includes(r.endpoint));
    if (!rule) return true; // No rate limit for this endpoint

    const key = `${endpoint}:${ipAddress}`;
    const now = new Date();
    const rateLimit = this.rateLimits.get(key) || { requests: [], blocked: false };

    // Check if currently blocked
    if (rateLimit.blocked && rateLimit.blockedUntil && now < rateLimit.blockedUntil) {
      return false;
    }

    // Remove old requests outside the window
    const windowStart = new Date(now.getTime() - rule.windowMs);
    rateLimit.requests = rateLimit.requests.filter(req => req > windowStart);

    // Check if limit exceeded
    if (rateLimit.requests.length >= rule.maxRequests) {
      rateLimit.blocked = true;
      rateLimit.blockedUntil = new Date(now.getTime() + rule.blockDurationMs);
      this.rateLimits.set(key, rateLimit);
      return false;
    }

    // Add current request
    rateLimit.requests.push(now);
    rateLimit.blocked = false;
    this.rateLimits.set(key, rateLimit);

    return true;
  }

  // Validate session
  validateSession(sessionId: string, userId: string, ipAddress: string): boolean {
    const session = this.activeSessions.get(sessionId);
    
    if (!session) {
      return false;
    }

    if (session.userId !== userId) {
      return false;
    }

    // Check for IP change (potential session hijacking)
    if (session.ipAddress !== ipAddress) {
      this.logSecurityEvent({
        type: 'suspicious_activity',
        userId,
        ipAddress,
        userAgent: 'Unknown',
        details: { 
          reason: 'IP address change during session',
          originalIP: session.ipAddress,
          newIP: ipAddress,
        },
      });
      return false;
    }

    // Check session timeout
    const now = new Date();
    const sessionAge = now.getTime() - session.lastActivity.getTime();
    if (sessionAge > this.defaultPolicy.sessionTimeout * 60 * 1000) {
      this.activeSessions.delete(sessionId);
      
      this.logSecurityEvent({
        type: 'session_timeout',
        userId,
        ipAddress,
        userAgent: 'Unknown',
      });
      
      return false;
    }

    // Update last activity
    session.lastActivity = now;
    this.activeSessions.set(sessionId, session);

    return true;
  }

  // Create session
  createSession(sessionId: string, userId: string, ipAddress: string): void {
    this.activeSessions.set(sessionId, {
      userId,
      lastActivity: new Date(),
      ipAddress,
    });
  }

  // Destroy session
  destroySession(sessionId: string): void {
    this.activeSessions.delete(sessionId);
  }

  // Calculate risk score for security event
  private calculateRiskScore(event: Omit<SecurityEvent, 'timestamp' | 'riskScore'>): number {
    let score = 0;

    // Base scores by event type
    const eventScores: Record<SecurityEventType, number> = {
      login_attempt: 1,
      login_success: 0,
      login_failure: 3,
      logout: 0,
      unauthorized_access: 8,
      permission_denied: 5,
      suspicious_activity: 7,
      data_access: 2,
      data_modification: 4,
      password_change: 2,
      account_lockout: 6,
      session_timeout: 1,
    };

    score += eventScores[event.type] || 0;

    // Increase score for blocked IPs
    if (this.isIPBlocked(event.ipAddress)) {
      score += 5;
    }

    // Increase score for repeated events from same IP
    const recentEvents = this.securityEvents
      .filter(e => e.ipAddress === event.ipAddress && 
               Date.now() - e.timestamp.getTime() < 60 * 60 * 1000) // Last hour
      .length;
    
    if (recentEvents > 10) {
      score += 3;
    }

    return Math.min(score, 10); // Cap at 10
  }

  // Check for suspicious activity patterns
  private checkSuspiciousActivity(event: SecurityEvent): void {
    // Multiple failed logins from different IPs for same user
    if (event.type === 'login_failure' && event.email) {
      const recentFailures = this.securityEvents
        .filter(e => e.type === 'login_failure' && 
                e.email === event.email && 
                Date.now() - e.timestamp.getTime() < 30 * 60 * 1000) // Last 30 minutes
        .map(e => e.ipAddress);
      
      const uniqueIPs = new Set(recentFailures);
      
      if (uniqueIPs.size >= 3) {
        this.createSecurityAlert({
          type: 'high',
          message: `Suspicious login activity detected for ${event.email}: ${uniqueIPs.size} different IP addresses`,
          timestamp: new Date(),
          resolved: false,
        });
      }
    }

    // High-risk score events
    if (event.riskScore >= 7) {
      this.createSecurityAlert({
        type: event.riskScore >= 9 ? 'high' : 'medium',
        message: `High-risk security event: ${event.type} from ${event.ipAddress}`,
        userId: event.userId,
        timestamp: new Date(),
        resolved: false,
      });
    }
  }

  // Create security alert
  private createSecurityAlert(alert: Omit<SecurityAlert, 'id'>): void {
    const securityAlert: SecurityAlert = {
      ...alert,
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };

    this.securityAlerts.push(securityAlert);

    // Keep only recent alerts
    if (this.securityAlerts.length > 100) {
      this.securityAlerts = this.securityAlerts.slice(-100);
    }

    console.warn('Security Alert:', securityAlert);
  }

  // Get security dashboard data
  getSecurityDashboard(): {
    recentEvents: SecurityEvent[];
    activeAlerts: SecurityAlert[];
    loginAttempts: number;
    blockedIPs: number;
    activeSessions: number;
  } {
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    const recentEvents = this.securityEvents.filter(e => e.timestamp.getTime() > oneHourAgo);
    const activeAlerts = this.securityAlerts.filter(a => !a.resolved);

    return {
      recentEvents: recentEvents.slice(-20), // Last 20 events
      activeAlerts,
      loginAttempts: recentEvents.filter(e => e.type === 'login_attempt').length,
      blockedIPs: this.defaultPolicy.blockedIPs.length,
      activeSessions: this.activeSessions.size,
    };
  }

  // Cleanup methods
  private cleanupExpiredSessions(): void {
    const now = new Date();
    const timeout = this.defaultPolicy.sessionTimeout * 60 * 1000;
    
    for (const [sessionId, session] of this.activeSessions.entries()) {
      if (now.getTime() - session.lastActivity.getTime() > timeout) {
        this.activeSessions.delete(sessionId);
      }
    }
  }

  private cleanupExpiredRateLimits(): void {
    const now = new Date();
    
    for (const [key, rateLimit] of this.rateLimits.entries()) {
      if (rateLimit.blocked && rateLimit.blockedUntil && now > rateLimit.blockedUntil) {
        rateLimit.blocked = false;
        rateLimit.blockedUntil = undefined;
        this.rateLimits.set(key, rateLimit);
      }
    }
  }

  private cleanupExpiredLockouts(): void {
    const now = new Date();
    
    for (const [key, attempts] of this.loginAttempts.entries()) {
      if (attempts.lockedUntil && now > attempts.lockedUntil) {
        this.loginAttempts.delete(key);
      }
    }
  }
}

// Export singleton instance
export const securityService = new SecurityService();
export default securityService;

// Export types
export type { SecurityEvent, SecurityPolicy, SecurityAlert, SecurityEventType };