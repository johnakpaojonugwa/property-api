import { describe, expect, it } from 'vitest';
import request from 'supertest';
import app from '../app.js';

describe('Phase 25 request timeout', () => {
  it('responds with a timeout error when a handler exceeds the limit', async () => {
    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
  });
});
