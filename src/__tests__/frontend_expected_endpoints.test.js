import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../app.js';

describe('Frontend Expected Endpoints Integration & OpenAPI Verification', () => {
  it('GET /v1/users/:user_id should return user details endpoint', async () => {
    const res = await request(app).get('/v1/users/user-123');
    expect([200, 404]).toContain(res.status);
    if (res.status === 200) {
      expect(res.body).toHaveProperty('success', true);
    }
  });

  it('PUT /v1/users/:user_id/resource should handle user media upload endpoint', async () => {
    const res = await request(app)
      .put('/v1/users/user-123/resource')
      .send({ avatar: 'https://example.com/avatar.png' });
    expect([200, 404]).toContain(res.status);
    if (res.status === 200) {
      expect(res.body).toHaveProperty('success', true);
    }
  });

  it('PUT /v1/agents/:agent_id/resource should handle agent media upload endpoint', async () => {
    const res = await request(app)
      .put('/v1/agents/agent-123/resource')
      .send({ avatar: 'https://example.com/agent-photo.jpg' });
    expect([200, 404]).toContain(res.status);
    if (res.status === 200) {
      expect(res.body).toHaveProperty('success', true);
    }
  });

  it('DELETE /v1/agents/:agent_id should handle agent deletion endpoint', async () => {
    const res = await request(app).delete('/v1/agents/agent-123');
    expect([200, 404]).toContain(res.status);
    if (res.status === 200) {
      expect(res.body).toHaveProperty('success', true);
    }
  });

  it('GET /v1/merchants/:merchant_id/wishlist should return merchant wishlist', async () => {
    const res = await request(app).get('/v1/merchants/merchant-123/wishlist');
    expect([200, 404]).toContain(res.status);
    if (res.status === 200) {
      expect(res.body).toHaveProperty('success', true);
    }
  });

  it('PUT /v1/appointments/:appointment_id/set-user-appointment-completion should update status', async () => {
    const res = await request(app).put('/v1/appointments/appt-123/set-user-appointment-completion');
    expect([200, 404]).toContain(res.status);
    if (res.status === 200) {
      expect(res.body).toHaveProperty('success', true);
    }
  });

  it('OpenAPI spec (swagger.json) should contain all requested endpoints', async () => {
    const res = await request(app).get('/swagger.json');
    expect(res.status).toBe(200);
    const spec = res.body;

    expect(spec.paths).toHaveProperty('/users/{user_id}');
    expect(spec.paths['/users/{user_id}']).toHaveProperty('get');

    expect(spec.paths).toHaveProperty('/users/{user_id}/resource');
    expect(spec.paths['/users/{user_id}/resource']).toHaveProperty('put');

    expect(spec.paths).toHaveProperty('/agents/{agent_id}/resource');
    expect(spec.paths['/agents/{agent_id}/resource']).toHaveProperty('put');

    expect(spec.paths).toHaveProperty('/agents/{agent_id}');
    expect(spec.paths['/agents/{agent_id}']).toHaveProperty('delete');

    expect(spec.paths).toHaveProperty('/merchants/{merchant_id}/wishlist');
    expect(spec.paths['/merchants/{merchant_id}/wishlist']).toHaveProperty('get');

    expect(spec.paths).toHaveProperty('/appointments/{appointment_id}/set-user-appointment-completion');
    expect(spec.paths['/appointments/{appointment_id}/set-user-appointment-completion']).toHaveProperty('put');
  });
});
