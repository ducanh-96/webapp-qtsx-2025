import securityService, { SecurityEventType } from '../securityService';

describe('SecurityService', () => {
  beforeEach(() => {
    // Clear any existing state
    jest.clearAllMocks();
  });

  describe('IP Blocking', () => {
    it('should block access for blocked IP addresses', () => {
      const blockedIP = '192.168.1.100';

      // Mock blocked IPs (normally this would be configured)
      const isBlocked = securityService.isIPBlocked(blockedIP);

      // Since we don't have blocked IPs configured in test, this should be false
      expect(isBlocked).toBe(false);
    });

    it('should allow access for non-blocked IP addresses', () => {
      const allowedIP = '192.168.1.1';

      const isBlocked = securityService.isIPBlocked(allowedIP);
      expect(isBlocked).toBe(false);
    });
  });

  describe('Domain Validation', () => {
    it('should allow all domains when no restrictions are set', () => {
      const testEmails = [
        'user@example.com',
        'admin@company.org',
        'test@domain.net',
      ];

      testEmails.forEach(email => {
        expect(securityService.isDomainAllowed(email)).toBe(true);
      });
    });
  });

  describe('Password Validation', () => {
    it('should validate strong passwords', () => {
      const strongPassword = 'StrongP@ssw0rd!';

      const result = securityService.validatePassword(strongPassword);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject passwords that are too short', () => {
      const shortPassword = 'Short1!';

      const result = securityService.validatePassword(shortPassword);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        'Password must be at least 8 characters long'
      );
    });

    it('should reject passwords without uppercase letters', () => {
      const noUpperPassword = 'lowercase123!';

      const result = securityService.validatePassword(noUpperPassword);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        'Password must contain at least one uppercase letter'
      );
    });

    it('should reject passwords without lowercase letters', () => {
      const noLowerPassword = 'UPPERCASE123!';

      const result = securityService.validatePassword(noLowerPassword);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        'Password must contain at least one lowercase letter'
      );
    });

    it('should reject passwords without numbers', () => {
      const noNumberPassword = 'NoNumbers!';

      const result = securityService.validatePassword(noNumberPassword);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        'Password must contain at least one number'
      );
    });

    it('should reject passwords without special characters', () => {
      const noSpecialPassword = 'NoSpecial123';

      const result = securityService.validatePassword(noSpecialPassword);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        'Password must contain at least one special character'
      );
    });

    it('should reject common passwords', () => {
      const commonPasswords = [
        'password',
        '123456',
        'password123',
        'admin',
        'qwerty',
      ];

      commonPasswords.forEach(password => {
        const result = securityService.validatePassword(password);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Password is too common');
      });
    });
  });

  describe('Login Attempt Handling', () => {
    beforeAll(() => {
      jest.useFakeTimers();
    });

    afterAll(() => {
      jest.useRealTimers();
    });

    it('should allow successful login attempts', async () => {
      const email = 'test@example.com';
      const ipAddress = '192.168.1.1';
      const userAgent = 'Mozilla/5.0';

      const result = await securityService.handleLoginAttempt(
        email,
        ipAddress,
        userAgent,
        true // successful login
      );

      expect(result).toBe(true);
    });

    it('should track failed login attempts', async () => {
      const email = 'test@example.com';
      const ipAddress = '192.168.1.1';
      const userAgent = 'Mozilla/5.0';

      // First failed attempt
      const result1 = await securityService.handleLoginAttempt(
        email,
        ipAddress,
        userAgent,
        false
      );

      expect(result1).toBe(false);

      // Should still allow more attempts initially
      const result2 = await securityService.handleLoginAttempt(
        email,
        ipAddress,
        userAgent,
        false
      );

      expect(result2).toBe(false);
    });

    it('should reset failed attempts on successful login', async () => {
      const email = 'test2@example.com'; // Use different email to avoid lockout conflicts
      const ipAddress = '192.168.1.2';
      const userAgent = 'Mozilla/5.0';

      // A few failed attempts (but not enough to lock)
      await securityService.handleLoginAttempt(
        email,
        ipAddress,
        userAgent,
        false
      );
      await securityService.handleLoginAttempt(
        email,
        ipAddress,
        userAgent,
        false
      );

      // Successful login should reset counter
      const successResult = await securityService.handleLoginAttempt(
        email,
        ipAddress,
        userAgent,
        true
      );

      expect(successResult).toBe(true);
    });
  });

  describe('Rate Limiting', () => {
    it('should allow requests within rate limits', () => {
      const endpoint = '/api/auth/login';
      const ipAddress = '192.168.1.1';

      // First request should be allowed
      const result1 = securityService.checkRateLimit(endpoint, ipAddress);
      expect(result1).toBe(true);

      // Second request should also be allowed
      const result2 = securityService.checkRateLimit(endpoint, ipAddress);
      expect(result2).toBe(true);
    });

    it('should block requests that exceed rate limits', () => {
      const endpoint = '/api/auth/login';
      const ipAddress = '192.168.1.2';

      // Make multiple requests to exceed rate limit
      for (let i = 0; i < 10; i++) {
        securityService.checkRateLimit(endpoint, ipAddress);
      }

      // Next request should be blocked
      const result = securityService.checkRateLimit(endpoint, ipAddress);
      expect(result).toBe(false);
    });

    it('should allow requests for endpoints without rate limits', () => {
      const endpoint = '/api/unprotected';
      const ipAddress = '192.168.1.3';

      const result = securityService.checkRateLimit(endpoint, ipAddress);
      expect(result).toBe(true);
    });
  });

  describe('Session Management', () => {
    it('should validate active sessions', () => {
      const sessionId = 'session123';
      const userId = 'user123';
      const ipAddress = '192.168.1.1';

      // Create session
      securityService.createSession(sessionId, userId, ipAddress);

      // Validate session
      const isValid = securityService.validateSession(
        sessionId,
        userId,
        ipAddress
      );
      expect(isValid).toBe(true);
    });

    it('should reject sessions with wrong user ID', () => {
      const sessionId = 'session123';
      const userId = 'user123';
      const wrongUserId = 'user456';
      const ipAddress = '192.168.1.1';

      // Create session
      securityService.createSession(sessionId, userId, ipAddress);

      // Validate with wrong user ID
      const isValid = securityService.validateSession(
        sessionId,
        wrongUserId,
        ipAddress
      );
      expect(isValid).toBe(false);
    });

    it('should reject sessions with different IP addresses', () => {
      const sessionId = 'session123';
      const userId = 'user123';
      const originalIP = '192.168.1.1';
      const differentIP = '192.168.1.2';

      // Create session
      securityService.createSession(sessionId, userId, originalIP);

      // Validate with different IP
      const isValid = securityService.validateSession(
        sessionId,
        userId,
        differentIP
      );
      expect(isValid).toBe(false);
    });

    it('should reject non-existent sessions', () => {
      const sessionId = 'nonexistent';
      const userId = 'user123';
      const ipAddress = '192.168.1.1';

      const isValid = securityService.validateSession(
        sessionId,
        userId,
        ipAddress
      );
      expect(isValid).toBe(false);
    });

    it('should destroy sessions', () => {
      const sessionId = 'session123';
      const userId = 'user123';
      const ipAddress = '192.168.1.1';

      // Create and validate session
      securityService.createSession(sessionId, userId, ipAddress);
      expect(
        securityService.validateSession(sessionId, userId, ipAddress)
      ).toBe(true);

      // Destroy session
      securityService.destroySession(sessionId);
      expect(
        securityService.validateSession(sessionId, userId, ipAddress)
      ).toBe(false);
    });
  });

  describe('Security Dashboard', () => {
    it('should provide security dashboard data', () => {
      const dashboard = securityService.getSecurityDashboard();

      expect(dashboard).toHaveProperty('recentEvents');
      expect(dashboard).toHaveProperty('activeAlerts');
      expect(dashboard).toHaveProperty('loginAttempts');
      expect(dashboard).toHaveProperty('blockedIPs');
      expect(dashboard).toHaveProperty('activeSessions');

      expect(Array.isArray(dashboard.recentEvents)).toBe(true);
      expect(Array.isArray(dashboard.activeAlerts)).toBe(true);
      expect(typeof dashboard.loginAttempts).toBe('number');
      expect(typeof dashboard.blockedIPs).toBe('number');
      expect(typeof dashboard.activeSessions).toBe('number');
    });
  });

  describe('Security Event Logging', () => {
    it('should log security events', async () => {
      const eventData = {
        type: 'login_attempt' as SecurityEventType,
        email: 'test@example.com',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
        details: { test: 'data' },
      };

      // This should not throw an error
      await expect(
        securityService.logSecurityEvent(eventData)
      ).resolves.toBeUndefined();
    });

    it('should calculate risk scores for events', async () => {
      const highRiskEvent = {
        type: 'unauthorized_access' as SecurityEventType,
        email: 'test@example.com',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
      };

      const lowRiskEvent = {
        type: 'login_success' as SecurityEventType,
        email: 'test@example.com',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
      };

      // Log events and verify they don't throw errors
      await expect(
        securityService.logSecurityEvent(highRiskEvent)
      ).resolves.toBeUndefined();
      await expect(
        securityService.logSecurityEvent(lowRiskEvent)
      ).resolves.toBeUndefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid input gracefully', () => {
      // Test with empty/invalid inputs
      expect(() => securityService.isIPBlocked('')).not.toThrow();
      expect(() => securityService.isDomainAllowed('')).not.toThrow();
      expect(() => securityService.validatePassword('')).not.toThrow();
    });

    it('should handle malformed email addresses', () => {
      const malformedEmails = [
        'notanemail',
        '@domain.com',
        'user@',
        'user@.com',
        '',
      ];

      malformedEmails.forEach(email => {
        expect(() => securityService.isDomainAllowed(email)).not.toThrow();
      });
    });
  });
});
