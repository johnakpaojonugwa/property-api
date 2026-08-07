import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import redisService from '../services/redis.service.js';
import PropertyService from '../services/property.service.js';
import Property from '../models/property.model.js';
import mongoose from 'mongoose';

describe('Property Caching & Stampede Protection Tests', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    
    // Ensure redisService reports it is active for tests
    redisService.isConnected = true;
    redisService.fallbackMode = false;
    redisService.client = {
      set: vi.fn(),
      get: vi.fn(),
      del: vi.fn(),
      pipeline: vi.fn(),
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getPropertyById', () => {
    it('caches the result on the first lookup and serves from cache subsequently', async () => {
      const mockProperty = { _id: 'prop-123', name: 'Luxury Villa', city: 'London' };
      const cacheStore = {};

      vi.spyOn(mongoose.connection, 'readyState', 'get').mockReturnValue(1);

      // Mock redis get/set
      vi.spyOn(redisService, 'get').mockImplementation(async (key) => cacheStore[key] || null);
      vi.spyOn(redisService, 'set').mockImplementation(async (key, val) => {
        cacheStore[key] = val;
        return true;
      });

      // Mock Redis Lock NX to succeed
      redisService.client.set.mockResolvedValue('OK');

      const findSpy = vi.spyOn(Property, 'findById').mockReturnValue({
        lean: vi.fn().mockResolvedValue(mockProperty),
      });

      // First call (cache miss)
      const res1 = await PropertyService.getPropertyById('prop-123');
      expect(res1).toEqual(mockProperty);
      expect(findSpy).toHaveBeenCalledTimes(1);

      // Second call (cache hit)
      const res2 = await PropertyService.getPropertyById('prop-123');
      expect(res2).toEqual(mockProperty);
      expect(findSpy).toHaveBeenCalledTimes(1); // Mongoose query should not be called again
    });

    it('prevents cache stampede using mutex locking on concurrent requests', async () => {
      const mockProperty = { _id: 'prop-123', name: 'Luxury Villa' };
      let dbQueries = 0;

      vi.spyOn(mongoose.connection, 'readyState', 'get').mockReturnValue(1);

      // Mock db fetch to count calls
      vi.spyOn(Property, 'findById').mockReturnValue({
        lean: vi.fn().mockImplementation(async () => {
          dbQueries++;
          // Simulate latency
          await new Promise((resolve) => setTimeout(resolve, 100));
          return mockProperty;
        }),
      });

      // Lock mock: First request succeeds immediately, subsequent ones fail to acquire lock
      let lockAcquired = false;
      redisService.client.set.mockImplementation(async (key, val, mode, pMode, duration) => {
        if (key.includes('lock:') && !lockAcquired) {
          lockAcquired = true;
          return 'OK';
        }
        return null;
      });

      redisService.client.del.mockImplementation(async (key) => {
        if (key.includes('lock:')) {
          lockAcquired = false;
        }
        return 1;
      });

      const cacheStore = {};
      vi.spyOn(redisService, 'get').mockImplementation(async (key) => cacheStore[key] || null);
      vi.spyOn(redisService, 'set').mockImplementation(async (key, val) => {
        cacheStore[key] = val;
        return true;
      });

      // Trigger 3 concurrent lookups
      const results = await Promise.all([
        PropertyService.getPropertyById('prop-123'),
        PropertyService.getPropertyById('prop-123'),
        PropertyService.getPropertyById('prop-123'),
      ]);

      expect(results[0]).toEqual(mockProperty);
      expect(results[1]).toEqual(mockProperty);
      expect(results[2]).toEqual(mockProperty);
      
      // Crucial assertion: Mongoose findById was only called ONCE across all 3 concurrent requests!
      expect(dbQueries).toBe(1);
    });
  });

  describe('Cache Invalidation on Updates', () => {
    it('invalidates cache keys and tag lists when updating a property', async () => {
      vi.spyOn(mongoose.connection, 'readyState', 'get').mockReturnValue(1);
      
      vi.spyOn(Property, 'findById').mockResolvedValue({
        _id: 'prop-123',
        agent: 'agent-1',
        merchant: 'merchant-1',
      });

      vi.spyOn(Property, 'findByIdAndUpdate').mockReturnValue({
        lean: vi.fn().mockResolvedValue({ _id: 'prop-123', name: 'Updated name' }),
      });

      const delSpy = vi.spyOn(redisService, 'del').mockResolvedValue(true);
      const tagSpy = vi.spyOn(redisService, 'invalidateTag').mockResolvedValue(true);

      const actor = { id: 'agent-1', role: 'AGENT' };
      const updated = await PropertyService.updateProperty('prop-123', { name: 'Updated name' }, actor);
      
      expect(updated).toBeDefined();
      expect(delSpy).toHaveBeenCalledWith('property:id:prop-123');
      expect(tagSpy).toHaveBeenCalledWith('properties:list');
    });
  });
});
