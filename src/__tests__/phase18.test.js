import { describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import app from '../app.js';

describe('Phase 18 rate limiting', () => {
  it('returns 429 after exceeding the request threshold', async () => {
    const dateSpy = vi.spyOn(Date, 'now').mockReturnValue(1700000000000);
    const testIp = '192.168.18.18';

    for (let index = 0; index < 100; index += 1) {
      await request(app)
        .get('/health')
        .set('X-Forwarded-For', testIp);
    }

    const response = await request(app)
      .get('/health')
      .set('X-Forwarded-For', testIp);

    expect(response.status).toBe(429);

    dateSpy.mockRestore();
  });
});
