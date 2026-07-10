import { describe, expect, it } from 'vitest';
import request from 'supertest';
import app from '../app.js';

describe('Phase 17 not found handling', () => {
  it('returns a structured 404 response for unknown routes', async () => {
    const response = await request(app).get('/does-not-exist');

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Resource not found');
    // New contract: include statusCode in response body
    expect(response.body).toHaveProperty('statusCode');
    expect(response.body.statusCode).toBe(404);
  });
});
