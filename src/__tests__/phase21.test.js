import { describe, expect, it } from 'vitest';
import request from 'supertest';
import app from '../app.js';

describe('Phase 21 proxy trust', () => {
  it('trusts proxy headers for forwarded requests', async () => {
    const response = await request(app)
      .get('/health')
      .set('X-Forwarded-Proto', 'https');

    expect(response.status).toBe(200);
  });
});
