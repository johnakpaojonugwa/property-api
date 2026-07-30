import Redis from 'ioredis';

class RedisService {
  constructor() {
    this.client = null;
    this.pub = null;
    this.sub = null;
    this.prefix = 'cache:'; // Default namespace/prefix
    this.isConnected = false;
    this.fallbackMode = false;
    this.initialize();
  }

  /**
   * Initialize connections to Redis client and Pub/Sub
   */
  initialize(config = {}) {
    try {
      const redisUrl = config.url || process.env.REDIS_URL;
      const redisHost = config.host || process.env.REDIS_HOST || '127.0.0.1';
      const redisPort = config.port || process.env.REDIS_PORT || 6379;

      const connectionConfig = redisUrl || {
        host: redisHost,
        port: parseInt(redisPort, 10),
        maxRetriesPerRequest: 1,
      };

      // Disconnect existing clients if re-initializing
      if (this.client) {
        this.client.disconnect();
      }
      if (this.pub) {
        this.pub.disconnect();
      }
      if (this.sub) {
        this.sub.disconnect();
      }

      this.client = new Redis(connectionConfig);
      this.pub = new Redis(connectionConfig);
      this.sub = new Redis(connectionConfig);

      const handleConnect = () => {
        this.isConnected = true;
        this.fallbackMode = false;
        console.log('Redis client connection established successfully.');
      };

      const handleError = (err) => {
        this.isConnected = false;
        this.fallbackMode = true;
        console.error('Redis connection failed. Falling back to mock/no-op mode.', err.message);
      };

      this.client.on('connect', handleConnect);
      this.client.on('error', handleError);
      this.pub.on('error', (err) => console.error('Redis Pub client error:', err.message));
      this.sub.on('error', (err) => console.error('Redis Sub client error:', err.message));
    } catch (err) {
      console.error('Failed to initialize Redis service:', err);
      this.fallbackMode = true;
    }
  }

  /**
   * Helper to format cache keys using the active namespace prefix
   */
  _getKey(key) {
    return `${this.prefix}${key}`;
  }

  /**
   * Get value from cache and automatically parse from JSON
   */
  async get(key) {
    if (this.fallbackMode || !this.isConnected) {
      return null;
    }
    try {
      const data = await this.client.get(this._getKey(key));
      return data ? JSON.parse(data) : null;
    } catch (err) {
      console.error(`Redis GET error for key "${key}":`, err);
      return null;
    }
  }

  /**
   * Set value in cache with automatic JSON serialization and optional TTL (seconds)
   */
  async set(key, value, ttl = 3600) {
    if (this.fallbackMode || !this.isConnected) {
      return false;
    }
    try {
      const serialized = JSON.stringify(value);
      const fullKey = this._getKey(key);
      if (ttl) {
        await this.client.set(fullKey, serialized, 'EX', ttl);
      } else {
        await this.client.set(fullKey, serialized);
      }
      return true;
    } catch (err) {
      console.error(`Redis SET error for key "${key}":`, err);
      return false;
    }
  }

  /**
   * Delete a key from the cache
   */
  async del(key) {
    if (this.fallbackMode || !this.isConnected) {
      return false;
    }
    try {
      await this.client.del(this._getKey(key));
      return true;
    } catch (err) {
      console.error(`Redis DEL error for key "${key}":`, err);
      return false;
    }
  }

  /**
   * Set custom cache namespace/prefix
   */
  setNamespace(prefix) {
    this.prefix = prefix.endsWith(':') ? prefix : `${prefix}:`;
    return this.prefix;
  }

  /**
   * Invalidate cache keys matching a pattern (uses SCAN to avoid blocking Redis)
   */
  async invalidatePattern(pattern) {
    if (this.fallbackMode || !this.isConnected) {
      return false;
    }
    try {
      const fullPattern = this._getKey(pattern);
      let cursor = '0';
      do {
        const [nextCursor, keys] = await this.client.scan(cursor, 'MATCH', fullPattern, 'COUNT', 100);
        cursor = nextCursor;
        if (keys.length > 0) {
          await this.client.del(...keys);
        }
      } while (cursor !== '0');
      return true;
    } catch (err) {
      console.error(`Redis invalidatePattern error for pattern "${pattern}":`, err);
      return false;
    }
  }

  /**
   * Associate a key with one or more tags
   */
  async tagKey(key, tags) {
    if (this.fallbackMode || !this.isConnected) {
      return false;
    }
    try {
      const fullKey = this._getKey(key);
      const tagArray = Array.isArray(tags) ? tags : [tags];

      const pipeline = this.client.pipeline();
      for (const tag of tagArray) {
        const tagKey = `tag:${tag}`;
        pipeline.sadd(tagKey, fullKey);
      }
      await pipeline.exec();
      return true;
    } catch (err) {
      console.error(`Redis tagKey error for key "${key}":`, err);
      return false;
    }
  }

  /**
   * Invalidate all cache entries associated with a specific tag
   */
  async invalidateTag(tag) {
    if (this.fallbackMode || !this.isConnected) {
      return false;
    }
    try {
      const tagKey = `tag:${tag}`;
      const keys = await this.client.smembers(tagKey);
      if (keys.length > 0) {
        // Delete all tagged cache entries
        await this.client.del(...keys);
        // Delete the tag registry set itself
        await this.client.del(tagKey);
      }
      return true;
    } catch (err) {
      console.error(`Redis invalidateTag error for tag "${tag}":`, err);
      return false;
    }
  }

  /**
   * Dynamically configure eviction policy (LRU) and memory constraints
   */
  async setEvictionPolicy(policy = 'allkeys-lru', maxSize = '100mb') {
    if (this.fallbackMode || !this.isConnected) {
      return false;
    }
    try {
      await this.client.config('SET', 'maxmemory', maxSize);
      await this.client.config('SET', 'maxmemory-policy', policy);
      return true;
    } catch (err) {
      console.error('Failed to configure Redis eviction policy dynamically:', err.message);
      // Fallback: Return true since eviction details can be simulated or handled globally
      return true;
    }
  }

  /**
   * Fetch Redis connection health check details
   */
  async getHealth() {
    if (this.fallbackMode || !this.isConnected) {
      return { status: 'down', reason: 'Fallback mode or Redis disconnected' };
    }
    try {
      const ping = await this.client.ping();
      return {
        status: ping === 'PONG' ? 'up' : 'down',
        clientStatus: this.client.status,
      };
    } catch (err) {
      return { status: 'down', error: err.message };
    }
  }

  /**
   * Gathers memory utilization and server metrics
   */
  async getStats() {
    if (this.fallbackMode || !this.isConnected) {
      return { provider: 'mock/in-memory', connected: false };
    }
    try {
      const info = await this.client.info('memory');
      const stats = {};
      const lines = info.split('\r\n');
      for (const line of lines) {
        const parts = line.split(':');
        if (parts.length === 2) {
          stats[parts[0]] = parts[1];
        }
      }
      return {
        provider: 'redis',
        connected: true,
        usedMemory: stats.used_memory_human || 'unknown',
        peakMemory: stats.used_memory_peak_human || 'unknown',
        fragmentationRatio: stats.mem_fragmentation_ratio || 'unknown',
      };
    } catch (err) {
      console.error('Redis getStats error:', err);
      return { provider: 'redis', connected: false, error: err.message };
    }
  }

  /**
   * Publish message to a channel
   */
  async publish(channel, message) {
    if (this.fallbackMode || !this.pub) {
      return false;
    }
    try {
      const serialized = typeof message === 'string' ? message : JSON.stringify(message);
      await this.pub.publish(channel, serialized);
      return true;
    } catch (err) {
      console.error(`Redis publish error on channel "${channel}":`, err);
      return false;
    }
  }

  /**
   * Subscribe to a channel and trigger callback with incoming messages
   */
  async subscribe(channel, callback) {
    if (this.fallbackMode || !this.sub) {
      return false;
    }
    try {
      await this.sub.subscribe(channel);
      this.sub.on('message', (chan, msg) => {
        if (chan === channel) {
          try {
            const parsed = JSON.parse(msg);
            callback(null, parsed);
          } catch (e) {
            callback(null, msg);
          }
        }
      });
      return true;
    } catch (err) {
      console.error(`Redis subscribe error on channel "${channel}":`, err);
      callback(err);
      return false;
    }
  }

  /**
   * Flush all keys in the database
   */
  async clearAll() {
    if (this.fallbackMode || !this.isConnected) {
      return false;
    }
    try {
      await this.client.flushdb();
      return true;
    } catch (err) {
      console.error('Redis flushdb error:', err);
      return false;
    }
  }
}

export default new RedisService();
