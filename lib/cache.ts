// Cache utility for database queries and API responses
// Implements in-memory caching with TTL support

interface CacheItem {
  data: any;
  timestamp: number;
  ttl: number;
}

class CacheManager {
  private cache: Map<string, CacheItem>;
  private defaultTTL: number;

  constructor(defaultTTL: number = 5 * 60 * 1000) { // 5 minutes default
    this.cache = new Map();
    this.defaultTTL = defaultTTL;
    
    // Clean expired items every 10 minutes
    setInterval(() => this.cleanup(), 10 * 60 * 1000);
  }

  set(key: string, data: any, ttl?: number): void {
    const item: CacheItem = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL
    };
    this.cache.set(key, item);
  }

  get(key: string): any | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }

    // Check if expired
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  has(key: string): boolean {
    const item = this.cache.get(key);
    if (!item) return false;

    // Check if expired
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  // Clean expired items
  private cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key);
      }
    }
  }

  // Get cache statistics
  getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }

  // Generate cache key for database queries
  static generateKey(collection: string, operation: string, params: any): string {
    const paramString = JSON.stringify(params, Object.keys(params).sort());
    return `${collection}:${operation}:${Buffer.from(paramString).toString('base64')}`;
  }
}

// Singleton cache instance
export const cache = new CacheManager();

// Cache duration constants
export const CACHE_DURATIONS = {
  PROJECTS: 10 * 60 * 1000,        // 10 minutes - project data changes less frequently
  USER_PROFILE: 30 * 60 * 1000,    // 30 minutes - user profiles don't change often
  VERIFICATION: 5 * 60 * 1000,     // 5 minutes - verification status needs to be current
  ANALYTICS: 60 * 60 * 1000,       // 1 hour - analytics data can be cached longer
  SEARCH_RESULTS: 15 * 60 * 1000,  // 15 minutes - search results
  STATIC_DATA: 60 * 60 * 1000,     // 1 hour - cities, categories, etc.
};

// Utility functions for common cache operations
export const CacheUtils = {
  // Cache wrapper for database queries
  async cacheQuery<T>(
    key: string,
    queryFn: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    // Check cache first
    const cached = cache.get(key);
    if (cached !== null) {
      return cached;
    }

    // Execute query
    const result = await queryFn();
    
    // Cache result
    cache.set(key, result, ttl);
    
    return result;
  },

  // Invalidate cache patterns
  invalidatePattern(pattern: string): void {
    const keys = Array.from(cache.getStats().keys);
    const regex = new RegExp(pattern);
    
    keys.forEach(key => {
      if (regex.test(key)) {
        cache.delete(key);
      }
    });
  },

  // Cache for paginated results
  cachePaginatedQuery<T>(
    collection: string,
    query: any,
    page: number,
    limit: number,
    sortBy: any = {}
  ): string {
    return CacheManager.generateKey(collection, 'paginated', {
      query,
      page,
      limit,
      sortBy
    });
  }
};
