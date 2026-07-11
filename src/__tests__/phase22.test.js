import { describe, expect, it } from 'vitest';
import request from 'supertest';
import app from '../app.js';

describe('Phase 22 compression support', () => {
  it('accepts compression for responses', async () => {
    const response = await request(app)
      .get('/health')
      .set('Accept-Encoding', 'gzip');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });
});
