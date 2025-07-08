import cacheService, { CacheStats } from '../cacheService';

describe('CacheService', () => {
  beforeEach(() => {
    cacheService.clear();
  });

  afterEach(() => {
    cacheService.clear();
  });

  describe('Basic Cache Operations', () => {
    it('should set and get items from cache', () => {
      const testData = { id: 1, name: 'Test' };
      cacheService.set('test-key', testData);

      const retrieved = cacheService.get('test-key');
      expect(retrieved).toEqual(testData);
    });

    it('should return null for non-existent keys', () => {
      const result = cacheService.get('non-existent-key');
      expect(result).toBeNull();
    });

    it('should delete items from cache', () => {
      cacheService.set('test-key', 'test-value');
      expect(cacheService.get('test-key')).toBe('test-value');

      const deleted = cacheService.delete('test-key');
      expect(deleted).toBe(true);
      expect(cacheService.get('test-key')).toBeNull();
    });

    it('should check if key exists', () => {
      cacheService.set('test-key', 'test-value');
      expect(cacheService.has('test-key')).toBe(true);
      expect(cacheService.has('non-existent')).toBe(false);
    });

    it('should clear all cache', () => {
      cacheService.set('key1', 'value1');
      cacheService.set('key2', 'value2');

      expect(cacheService.getSize()).toBe(2);

      cacheService.clear();
      expect(cacheService.getSize()).toBe(0);
    });
  });

  describe('TTL (Time To Live)', () => {
    beforeAll(() => {
      jest.useFakeTimers();
    });

    afterAll(() => {
      jest.useRealTimers();
    });

    it('should expire items after TTL', () => {
      const shortTTL = 1000; // 1 second
      cacheService.set('test-key', 'test-value', shortTTL);

      expect(cacheService.get('test-key')).toBe('test-value');

      // Fast forward time past TTL
      jest.advanceTimersByTime(shortTTL + 1);

      expect(cacheService.get('test-key')).toBeNull();
    });

    it('should not expire items before TTL', () => {
      const longTTL = 10000; // 10 seconds
      cacheService.set('test-key', 'test-value', longTTL);

      expect(cacheService.get('test-key')).toBe('test-value');

      // Fast forward time less than TTL
      jest.advanceTimersByTime(longTTL - 1000);

      expect(cacheService.get('test-key')).toBe('test-value');
    });
  });

  describe('Cache Statistics', () => {
    it('should track cache hits and misses', () => {
      cacheService.set('test-key', 'test-value');

      // Generate hits
      cacheService.get('test-key');
      cacheService.get('test-key');

      // Generate misses
      cacheService.get('non-existent-1');
      cacheService.get('non-existent-2');

      const stats: CacheStats = cacheService.getStats();
      expect(stats.hits).toBe(2);
      expect(stats.misses).toBe(2);
      expect(stats.hitRate).toBe(50);
    });

    it('should track total items in cache', () => {
      cacheService.set('key1', 'value1');
      cacheService.set('key2', 'value2');
      cacheService.set('key3', 'value3');

      const stats: CacheStats = cacheService.getStats();
      expect(stats.totalItems).toBe(3);
    });
  });

  describe('Specialized Cache Methods', () => {
    it('should handle user-specific caching', () => {
      const userId = 'user123';
      const userData = { id: userId, name: 'John Doe' };

      cacheService.setUser(userId, userData);
      const retrieved = cacheService.getUser(userId);

      expect(retrieved).toEqual(userData);
    });
  });

  describe('Cache Invalidation', () => {
    it('should invalidate user-related cache entries', () => {
      const userId = 'user123';

      cacheService.setUser(userId, { name: 'John' });
      cacheService.setReports(userId, [{ id: 'report1' }]);

      expect(cacheService.getUser(userId)).toBeTruthy();
      expect(cacheService.getReports(userId)).toBeTruthy();

      cacheService.invalidateUser(userId);

      expect(cacheService.getUser(userId)).toBeNull();
      expect(cacheService.getReports(userId)).toBeNull();
    });
  });

  describe('GetOrSet Pattern', () => {
    it('should return cached value if exists', async () => {
      const factory = jest.fn().mockResolvedValue('factory-value');
      cacheService.set('test-key', 'cached-value');

      const result = await cacheService.getOrSet('test-key', factory);

      expect(result).toBe('cached-value');
      expect(factory).not.toHaveBeenCalled();
    });

    it('should call factory and cache result if not exists', async () => {
      const factory = jest.fn().mockResolvedValue('factory-value');

      const result = await cacheService.getOrSet('test-key', factory);

      expect(result).toBe('factory-value');
      expect(factory).toHaveBeenCalledTimes(1);
      expect(cacheService.get('test-key')).toBe('factory-value');
    });

    it('should handle factory errors', async () => {
      const factory = jest.fn().mockRejectedValue(new Error('Factory error'));

      await expect(cacheService.getOrSet('test-key', factory)).rejects.toThrow(
        'Factory error'
      );
      expect(cacheService.get('test-key')).toBeNull();
    });
  });

  describe('Cache Size Management', () => {
    it('should return correct cache size', () => {
      expect(cacheService.getSize()).toBe(0);

      cacheService.set('key1', 'value1');
      expect(cacheService.getSize()).toBe(1);

      cacheService.set('key2', 'value2');
      expect(cacheService.getSize()).toBe(2);

      cacheService.delete('key1');
      expect(cacheService.getSize()).toBe(1);
    });

    it('should return all cache keys', () => {
      cacheService.set('key1', 'value1');
      cacheService.set('key2', 'value2');
      cacheService.set('key3', 'value3');

      const keys = cacheService.getKeys();
      expect(keys).toHaveLength(3);
      expect(keys).toContain('key1');
      expect(keys).toContain('key2');
      expect(keys).toContain('key3');
    });
  });

  describe('Error Handling', () => {
    it('should handle circular reference objects', () => {
      const circularObj: { [key: string]: unknown } = { name: 'test' };
      circularObj.self = circularObj;

      // Should not throw error
      expect(() => {
        cacheService.set('circular', circularObj);
      }).not.toThrow();
    });

    it('should handle undefined and null values', () => {
      cacheService.set('undefined-key', undefined);
      cacheService.set('null-key', null);

      expect(cacheService.get('undefined-key')).toBeUndefined();
      expect(cacheService.get('null-key')).toBeNull();
    });
  });
});
