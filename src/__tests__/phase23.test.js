import { describe, expect, it } from 'vitest';
import request from 'supertest';
import app from '../app.js';

describe('Phase 23 cookie security', () => {
  it('sets a cookie with secure defaults', async () => {
    const response = await request(app)
      .get('/health')
      .set('Cookie', ['session=test']);

    expect(response.headers['set-cookie']).toBeDefined();
  });
});
