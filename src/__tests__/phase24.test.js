import { describe, expect, it } from 'vitest';
import request from 'supertest';
import app from '../app.js';

describe('Phase 24 request body size limit', () => {
  it('rejects oversized JSON payloads', async () => {
    const largePayload = { value: 'x'.repeat(1024 * 1024 * 2) };
    const response = await request(app)
      .post('/health')
      .send(largePayload);

    expect(response.status).toBe(413);
  });
});
