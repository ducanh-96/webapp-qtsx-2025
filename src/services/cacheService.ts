// In-memory cache service for performance optimization
interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

interface CacheStats {
  hits: number;
  misses: number;
  hitRate: number;
  totalItems: number;
  memoryUsage: number;
}

class CacheService {
  private cache = new Map<string, CacheItem<unknown>>();
  private stats = {
    hits: 0,
    misses: 0,
  };
  private maxSize: number;
  private defaultTTL: number;

  constructor(maxSize = 1000, defaultTTL = 5 * 60 * 1000) {
    // 5 minutes default TTL
    this.maxSize = maxSize;
    this.defaultTTL = defaultTTL;

    // Clean up expired items every minute
    setInterval(() => this.cleanup(), 60 * 1000);
  }

  // Set item in cache
  set<T>(key: string, data: T, ttl?: number): void {
    // Remove oldest items if cache is full
    if (this.cache.size >= this.maxSize) {
      this.evictOldest();
    }

    const item: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL,
    };

    this.cache.set(key, item);
  }

  // Get item from cache
  get<T>(key: string): T | null {
    const item = this.cache.get(key);

    if (!item) {
      this.stats.misses++;
      return null;
    }

    // Check if item has expired
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      this.stats.misses++;
      return null;
    }

    this.stats.hits++;
    return item.data as T;
  }

  // Get or set pattern - if key exists, return it, otherwise set and return
  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    const cached = this.get<T>(key);

    if (cached !== null) {
      return cached;
    }

    const data = await factory();
    this.set(key, data, ttl);
    return data;
  }

  // Delete item from cache
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  // Clear all cache
  clear(): void {
    this.cache.clear();
    this.stats.hits = 0;
    this.stats.misses = 0;
  }

  // Check if key exists and is not expired
  has(key: string): boolean {
    const item = this.cache.get(key);

    if (!item) {
      return false;
    }

    // Check if expired
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  // Get cache statistics
  getStats(): CacheStats {
    const total = this.stats.hits + this.stats.misses;
    const hitRate = total > 0 ? (this.stats.hits / total) * 100 : 0;

    return {
      hits: this.stats.hits,
      misses: this.stats.misses,
      hitRate: Math.round(hitRate * 100) / 100,
      totalItems: this.cache.size,
      memoryUsage: this.getMemoryUsage(),
    };
  }

  // Get all cache keys
  getKeys(): string[] {
    return Array.from(this.cache.keys());
  }

  // Get cache size
  getSize(): number {
    return this.cache.size;
  }

  // Clean up expired items
  private cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.cache.delete(key));

    if (keysToDelete.length > 0) {
      console.log(
        `Cache cleanup: removed ${keysToDelete.length} expired items`
      );
    }
  }

  // Evict oldest items when cache is full
  private evictOldest(): void {
    let oldestKey: string | null = null;
    let oldestTimestamp = Date.now();

    for (const [key, item] of this.cache.entries()) {
      if (item.timestamp < oldestTimestamp) {
        oldestTimestamp = item.timestamp;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  // Estimate memory usage (rough calculation)
  private getMemoryUsage(): number {
    let size = 0;

    for (const [key, item] of this.cache.entries()) {
      size += key.length * 2; // String character size
      size += JSON.stringify(item.data).length * 2; // Rough data size
      size += 24; // Overhead for timestamp and ttl
    }

    return Math.round(size / 1024); // Return in KB
  }

  // Cache with prefix for different data types
  setUser(userId: string, userData: unknown, ttl?: number): void {
    this.set(`user:${userId}`, userData, ttl);
  }

  getUser(userId: string): unknown | null {
    return this.get(`user:${userId}`);
  }

  setReports(userId: string, reports: unknown[], ttl?: number): void {
    this.set(`reports:${userId}`, reports, ttl);
  }

  getReports(userId: string): unknown[] | null {
    return this.get(`reports:${userId}`);
  }

  // Invalidate related cache entries
  invalidateUser(userId: string): void {
    const keysToDelete = this.getKeys().filter(
      key =>
        key.startsWith(`user:${userId}`) || key.startsWith(`reports:${userId}`)
    );

    keysToDelete.forEach(key => this.delete(key));
  }

  // Preload frequently accessed data
  async preloadUserData(userId: string): Promise<void> {
    try {
      // This would typically load from your data services
      console.log(`Preloading data for user: ${userId}`);

      // Example: Preload user reports, etc.
      // const reports = await powerBiService.getReports()
      // this.setReports(userId, reports, 15 * 60 * 1000); // 15 minutes
    } catch (error) {
      console.error('Error preloading user data:', error);
    }
  }

  // Smart cache warming for common queries
  async warmCache(): Promise<void> {
    console.log('Warming cache with frequently accessed data...');

    try {
      // This would preload common data like user lists, etc.
      // Implementation depends on your specific use cases
    } catch (error) {
      console.error('Error warming cache:', error);
    }
  }
}

// Export singleton instance
export const cacheService = new CacheService();
export { CacheService };
export default cacheService;

// Export types
export type { CacheStats };
