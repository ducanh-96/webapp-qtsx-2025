// Unit tests for powerBiService

import powerBiService from '../powerBiService';

describe('powerBiService', () => {
  describe('isConfigured', () => {
    it('returns false if any config is missing', () => {
      // Backup original config
      const originalConfig = { ...powerBiService['config'] };
      powerBiService['config'].clientId = '';
      expect(powerBiService.isConfigured()).toBe(false);
      powerBiService['config'].clientId = 'abc';
      powerBiService['config'].clientSecret = '';
      expect(powerBiService.isConfigured()).toBe(false);
      powerBiService['config'].clientSecret = 'secret';
      powerBiService['config'].tenantId = '';
      expect(powerBiService.isConfigured()).toBe(false);
      powerBiService['config'].tenantId = 'tenant';
      powerBiService['config'].workspaceId = '';
      expect(powerBiService.isConfigured()).toBe(false);
      // Restore
      powerBiService['config'] = originalConfig;
    });

    it('returns true if all required config present', () => {
      const originalConfig = { ...powerBiService['config'] };
      powerBiService['config'].clientId = 'a';
      powerBiService['config'].clientSecret = 'b';
      powerBiService['config'].tenantId = 'c';
      powerBiService['config'].workspaceId = 'd';
      expect(powerBiService.isConfigured()).toBe(true);
      powerBiService['config'] = originalConfig;
    });
  });

  describe('createUserFilters', () => {
    it('returns filter by userId for admin', () => {
      const filters = powerBiService.createUserFilters('u1', 'admin', 'IT');
      expect(filters).toHaveLength(1);
      expect(filters[0].target.column).toBe('UserId');
      expect(filters[0].values).toContain('u1');
    });

    it('returns filter by userId and department for non-admin', () => {
      const filters = powerBiService.createUserFilters('u2', 'user', 'HR');
      expect(filters).toHaveLength(2);
      expect(filters[0].target.column).toBe('UserId');
      expect(filters[1].target.column).toBe('Department');
      expect(filters[1].values).toContain('HR');
    });

    it('returns empty department values if not provided', () => {
      const filters = powerBiService.createUserFilters('u3', 'user');
      expect(filters[1].values).toEqual([]);
    });
  });
});
