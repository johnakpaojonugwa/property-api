import { describe, expect, it } from 'vitest';
import request from 'supertest';
import app from '../app.js';

describe('Phase 19 parameter pollution protection', () => {
  it('rejects requests with duplicate query parameters', async () => {
    const response = await request(app).get('/health?foo=1&foo=2');

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });
});
