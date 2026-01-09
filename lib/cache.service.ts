/**
 * Simple client-side caching service with TTL support
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

class CacheService {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private persistToStorage: boolean = true;

  constructor() {
    // Load cache from localStorage on initialization (client-side only)
    if (typeof window !== 'undefined') {
      this.loadFromStorage();
    }
  }

  /**
   * Store data in cache with optional TTL
   */
  set<T>(key: string, data: T, ttl: number = 5 * 60 * 1000): void {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl,
    };

    this.cache.set(key, entry);

    // Persist to localStorage
    if (this.persistToStorage && typeof window !== 'undefined') {
      this.saveToStorage();
    }
  }

  /**
   * Get data from cache if it exists and is not expired
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Check if entry has expired
    const isExpired = Date.now() - entry.timestamp > entry.ttl;
    if (isExpired) {
      this.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Check if a key exists in cache and is not expired
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * Delete a specific key from cache
   */
  delete(key: string): boolean {
    const result = this.cache.delete(key);

    if (this.persistToStorage && typeof window !== 'undefined') {
      this.saveToStorage();
    }

    return result;
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();

    if (typeof window !== 'undefined') {
      localStorage.removeItem('app_cache');
    }
  }

  /**
   * Clear expired cache entries
   */
  clearExpired(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];

    this.cache.forEach((entry, key) => {
      if (now - entry.timestamp > entry.ttl) {
        expiredKeys.push(key);
      }
    });

    expiredKeys.forEach((key) => this.cache.delete(key));

    if (expiredKeys.length > 0 && this.persistToStorage && typeof window !== 'undefined') {
      this.saveToStorage();
    }
  }

  /**
   * Get all cache keys
   */
  keys(): string[] {
    return Array.from(this.cache.keys());
  }

  /**
   * Get cache size
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * Load cache from localStorage
   */
  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem('app_cache');
      if (stored) {
        const entries: Array<[string, CacheEntry<any>]> = JSON.parse(stored);
        this.cache = new Map(entries);
        this.clearExpired(); // Clean up expired entries on load
      }
    } catch (error) {
      console.error('Failed to load cache from localStorage:', error);
    }
  }

  /**
   * Save cache to localStorage
   */
  private saveToStorage(): void {
    try {
      const entries = Array.from(this.cache.entries());
      localStorage.setItem('app_cache', JSON.stringify(entries));
    } catch (error) {
      console.error('Failed to save cache to localStorage:', error);
      // Handle quota exceeded error
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        // Clear some old entries and try again
        this.clearExpired();
        try {
          const entries = Array.from(this.cache.entries());
          localStorage.setItem('app_cache', JSON.stringify(entries));
        } catch {
          console.error('Failed to save cache even after clearing expired entries');
        }
      }
    }
  }

  /**
   * Enable or disable persistence to localStorage
   */
  setPersistence(enabled: boolean): void {
    this.persistToStorage = enabled;
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    totalEntries: number;
    expiredEntries: number;
    validEntries: number;
    totalSize: number;
  } {
    const now = Date.now();
    let expiredCount = 0;
    let validCount = 0;

    this.cache.forEach((entry) => {
      if (now - entry.timestamp > entry.ttl) {
        expiredCount++;
      } else {
        validCount++;
      }
    });

    return {
      totalEntries: this.cache.size,
      expiredEntries: expiredCount,
      validEntries: validCount,
      totalSize: typeof window !== 'undefined' 
        ? new Blob([localStorage.getItem('app_cache') || '']).size 
        : 0,
    };
  }
}

// Export singleton instance
export const cacheService = new CacheService();

// Cache key generators for consistent naming
export const CacheKeys = {
  aboutUs: (id?: string) => id ? `about_us_${id}` : 'about_us_default',
  aboutUsActive: () => 'about_us_active',
  aboutUsList: () => 'about_us_list',
  course: (id: string) => `course_${id}`,
  coursesList: (query?: string) => query ? `courses_list_${query}` : 'courses_list',
  user: (id: string) => `user_${id}`,
  currentUser: () => 'current_user',
};

// Auto-cleanup: Clear expired entries every 5 minutes
if (typeof window !== 'undefined') {
  setInterval(() => {
    cacheService.clearExpired();
  }, 5 * 60 * 1000);
}



