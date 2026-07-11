import { describe, expect, it } from 'vitest';
import request from 'supertest';
import app from '../app.js';

describe('Phase 18 rate limiting', () => {
  it('returns 429 after exceeding the request threshold', async () => {
    for (let index = 0; index < 100; index += 1) {
      await request(app).get('/health');
    }

    const response = await request(app).get('/health');

    expect(response.status).toBe(429);
  });
});
