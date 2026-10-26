/**
 * In-Memory TTL Cache Module
 * Practical 9: In-Memory Caching and Query Optimization
 * CHARUSAT ITUE301 - Advanced Web Development Frameworks
 * Student: Ansh Sojitra | ID: 24CS095
 *
 * Implements a small, isolated in-memory key-value store with configurable Time-To-Live (TTL),
 * automatic expired-entry pruning, user-scoped key namespacing, and hit/miss diagnostics.
 */

class MemoryCache {
  /**
   * @param {Object} options
   * @param {number} options.defaultTTL - Default TTL in seconds (default: 60s)
   * @param {number} options.cleanupIntervalMs - Interval for background cleanup in ms (default: 30000ms)
   */
  constructor(options = {}) {
    this.store = new Map();
    this.defaultTTL = options.defaultTTL || parseInt(process.env.CACHE_TTL_SECONDS, 10) || 60;
    this.hits = 0;
    this.misses = 0;

    // Background timer to prune expired entries and prevent unbounded memory growth
    const cleanupInterval = options.cleanupIntervalMs || 30000;
    this.cleanupTimer = setInterval(() => {
      this.pruneExpired();
    }, cleanupInterval);

    // Unref cleanup timer so it does not block Node.js process exit during tests
    if (this.cleanupTimer.unref) {
      this.cleanupTimer.unref();
    }
  }

  /**
   * Retrieve a value from the cache.
   * If key does not exist or has expired, returns null and increments misses.
   * @param {string} key
   * @returns {any|null}
   */
  get(key) {
    const entry = this.store.get(key);
    if (!entry) {
      this.misses++;
      return null;
    }

    const now = Date.now();
    if (now >= entry.expiresAt) {
      // Entry has expired; remove it immediately and record a miss
      this.store.delete(key);
      this.misses++;
      return null;
    }

    entry.hitCount++;
    this.hits++;
    return entry.value;
  }

  /**
   * Store a value in the cache with a specified or default TTL.
   * Deep-clones the value (via JSON) to avoid accidental reference mutations.
   * @param {string} key
   * @param {any} value
   * @param {number} [ttlSeconds]
   */
  set(key, value, ttlSeconds) {
    const ttl = (typeof ttlSeconds === "number" && ttlSeconds > 0) ? ttlSeconds : this.defaultTTL;
    const now = Date.now();
    const expiresAt = now + ttl * 1000;

    this.store.set(key, {
      value: JSON.parse(JSON.stringify(value)),
      createdAt: now,
      expiresAt,
      ttl,
      hitCount: 0,
    });
  }

  /**
   * Delete a specific cache key.
   * @param {string} key
   * @returns {boolean}
   */
  del(key) {
    return this.store.delete(key);
  }

  /**
   * Invalidate all keys matching a given prefix.
   * Used for user-scoped cache invalidation on writes (POST, PUT, DELETE).
   * Example: invalidatePrefix("user:67123:") removes all cached queries for that user.
   * @param {string} prefix
   * @returns {number} count of keys deleted
   */
  invalidatePrefix(prefix) {
    let deletedCount = 0;
    for (const key of this.store.keys()) {
      if (key.startsWith(prefix)) {
        this.store.delete(key);
        deletedCount++;
      }
    }
    return deletedCount;
  }

  /**
   * Clear all entries and reset stats.
   */
  clear() {
    this.store.clear();
    this.hits = 0;
    this.misses = 0;
  }

  /**
   * Prune all expired entries from memory.
   * @returns {number} count of pruned entries
   */
  pruneExpired() {
    const now = Date.now();
    let pruned = 0;
    for (const [key, entry] of this.store.entries()) {
      if (now >= entry.expiresAt) {
        this.store.delete(key);
        pruned++;
      }
    }
    return pruned;
  }

  /**
   * Get diagnostics and performance metrics.
   * @returns {Object}
   */
  getStats() {
    const totalRequests = this.hits + this.misses;
    const hitRate = totalRequests > 0 ? ((this.hits / totalRequests) * 100).toFixed(2) + "%" : "0.00%";
    return {
      size: this.store.size,
      defaultTTL: this.defaultTTL,
      hits: this.hits,
      misses: this.misses,
      hitRate,
    };
  }

  /**
   * Stop background timer
   */
  destroy() {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
  }
}

// Export singleton instance configured with environment TTL
const cacheInstance = new MemoryCache();

module.exports = {
  MemoryCache,
  cache: cacheInstance,
};
