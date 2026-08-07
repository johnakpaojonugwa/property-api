import redisService from '../services/redis.service.js';

/**
 * Fetch data with cache-aside pattern, distributed locking, and jitter.
 * Prevents Cache Stampede by ensuring only one process queries the DB on cache miss.
 */
export async function getOrSetCache(key, dbFetchFn, options = {}) {
  const { ttl = 3600, tags = [], maxRetries = 20 } = options;

  const isRedisActive = redisService.isConnected && !redisService.fallbackMode && redisService.client;

  // If Redis is not connected or in fallback mode, bypass caching entirely
  if (!isRedisActive) {
    return dbFetchFn();
  }

  let attempt = 0;
  
  async function execute() {
    // 1. Try reading from cache
    const cached = await redisService.get(key);
    if (cached) {
      return cached;
    }

    // 2. Lock and fetch from database to prevent cache stampede
    const lockKey = `lock:${key}`;
    try {
      // SET key value NX PX <milliseconds> is atomic lock acquisition
      const lockAcquired = await redisService.client.set(
        redisService._getKey(lockKey),
        '1',
        'NX',
        'PX',
        5000
      );

      if (lockAcquired === 'OK') {
        try {
          const data = await dbFetchFn();
          if (data !== null && data !== undefined) {
            // Add random jitter (+/- 5% of TTL) to stagger key expirations
            const jitter = Math.floor((Math.random() * 0.1 - 0.05) * ttl);
            const finalTtl = Math.max(1, ttl + jitter);
            
            await redisService.set(key, data, finalTtl);
            if (tags.length > 0) {
              await redisService.tagKey(key, tags);
            }
          }
          return data;
        } finally {
          // Release lock
          await redisService.client.del(redisService._getKey(lockKey));
        }
      } else {
        // Did not acquire lock: another process is fetching. Wait and retry.
        attempt++;
        if (attempt >= maxRetries) {
          // Safety fallback: fetch directly from DB to avoid hanging request
          return dbFetchFn();
        }
        await new Promise((resolve) => setTimeout(resolve, 50));
        return execute();
      }
    } catch (err) {
      console.error(`Cache helper error for key "${key}", falling back to DB:`, err);
      return dbFetchFn();
    }
  }

  return execute();
}
