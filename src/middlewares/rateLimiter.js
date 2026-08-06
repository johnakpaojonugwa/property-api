import redisService from '../services/redis.service.js';
import ApiResponse from '../utils/ApiResponse.js';

// Lua script to atomically evaluate rate limit via distributed Token Bucket
const LUA_TOKEN_BUCKET = `
local key = KEYS[1]
local capacity = tonumber(ARGV[1])
local refill_rate = tonumber(ARGV[2])
local now = tonumber(ARGV[3])
local window_ms = tonumber(ARGV[4])

local data = redis.call('HMGET', key, 'tokens', 'lastRefill')
local tokens = tonumber(data[1])
local last_refill = tonumber(data[2])

if not tokens then
    tokens = capacity - 1
    last_refill = now
    redis.call('HMSET', key, 'tokens', tokens, 'lastRefill', last_refill)
    redis.call('PEXPIRE', key, window_ms)
    return {1, tokens}
else
    local time_passed = now - last_refill
    local interval = 1000
    if window_ms < interval then
        interval = window_ms
    end
    local elapsed_intervals = math.floor(time_passed / interval)
    if elapsed_intervals > 0 then
        local tokens_to_add = elapsed_intervals * (refill_rate * interval)
        tokens = math.min(capacity, tokens + tokens_to_add)
        last_refill = last_refill + (elapsed_intervals * interval)
    end

    if tokens >= 1 then
        tokens = tokens - 1
        redis.call('HMSET', key, 'tokens', tokens, 'lastRefill', last_refill)
        redis.call('PEXPIRE', key, window_ms)
        return {1, math.floor(tokens)}
    else
        redis.call('HMSET', key, 'tokens', tokens, 'lastRefill', last_refill)
        redis.call('PEXPIRE', key, window_ms)
        return {0, math.floor(tokens)}
    end
end
`;

// Memory store fallback for environments where Redis is not running
const memoryStore = new Map();

// Periodic GC to prevent memory leaks in the fallback Map
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of memoryStore.entries()) {
    if (value.tokens >= value.capacity && now - value.lastRefill > value.windowMs) {
      memoryStore.delete(key);
    }
  }
}, 60000).unref(); // Use unref() so this timer doesn't keep the Node process running in test hooks

function evaluateMemoryTokenBucket(key, capacity, windowMs, now) {
  const refillRate = capacity / windowMs;
  let bucket = memoryStore.get(key);

  if (!bucket) {
    bucket = {
      tokens: capacity - 1,
      lastRefill: now,
      capacity,
      windowMs,
    };
    memoryStore.set(key, bucket);
    return { allowed: true, remaining: capacity - 1 };
  }

  const timePassed = now - bucket.lastRefill;
  const interval = Math.min(1000, windowMs);
  const elapsedIntervals = Math.floor(timePassed / interval);
  if (elapsedIntervals > 0) {
    const tokensToAdd = elapsedIntervals * (refillRate * interval);
    bucket.tokens = Math.min(capacity, bucket.tokens + tokensToAdd);
    bucket.lastRefill = bucket.lastRefill + (elapsedIntervals * interval);
  }

  if (bucket.tokens >= 1) {
    bucket.tokens -= 1;
    return { allowed: true, remaining: Math.floor(bucket.tokens) };
  }

  return { allowed: false, remaining: Math.floor(bucket.tokens) };
}

/**
 * Creates an Express middleware rate limiter using the Token Bucket algorithm.
 * Automatically switches to Redis-backed distributed store when available,
 * falling back gracefully to in-memory Map rate limiting.
 */
export const createTokenBucketLimiter = (options = {}) => {
  const {
    windowMs = 60 * 1000,
    max = 100,
    message = 'Too many requests, please try again later.',
    handler,
  } = options;

  const refillRate = max / windowMs; // tokens per millisecond

  return async (req, res, next) => {
    // Standard client key (IP address)
    const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown-ip';
    const redisKey = `ratelimit:${ip}:${windowMs}:${max}`;
    const now = Date.now();

    let allowed = false;
    let remainingTokens = 0;

    // 1. Try evaluating via Redis if connected
    const useRedis = redisService.isConnected && !redisService.fallbackMode && redisService.client;
    if (useRedis) {
      try {
        const result = await redisService.client.eval(
          LUA_TOKEN_BUCKET,
          1,
          redisKey,
          max,
          refillRate,
          now,
          windowMs
        );
        allowed = result[0] === 1;
        remainingTokens = result[1];
      } catch (err) {
        console.error('Redis token bucket evaluation failed, falling back to memory:', err.message);
        // Fallback to memory if Redis eval throws
        const memoryResult = evaluateMemoryTokenBucket(redisKey, max, windowMs, now);
        allowed = memoryResult.allowed;
        remainingTokens = memoryResult.remaining;
      }
    } else {
      // 2. Fallback to in-memory token bucket
      const memoryResult = evaluateMemoryTokenBucket(redisKey, max, windowMs, now);
      allowed = memoryResult.allowed;
      remainingTokens = memoryResult.remaining;
    }

    // 3. Set standard RFC rate limit headers
    res.setHeader('RateLimit-Limit', max);
    res.setHeader('RateLimit-Remaining', Math.max(0, remainingTokens));

    const resetSeconds = Math.max(0, Math.ceil(((1 - remainingTokens / max) * windowMs) / 1000));
    res.setHeader('RateLimit-Reset', resetSeconds);

    if (!allowed) {
      // Setup rateLimit payload object for compatibility with handlers
      req.rateLimit = {
        limit: max,
        remaining: 0,
        resetTime: new Date(now + resetSeconds * 1000),
      };

      if (handler) {
        return handler(req, res, next, options);
      }

      return res.status(429).json(
        ApiResponse.error(message, [
          {
            message: 'Rate limit exceeded.',
            resetTime: req.rateLimit.resetTime,
          },
        ], 429)
      );
    }

    next();
  };
};

export default createTokenBucketLimiter;
