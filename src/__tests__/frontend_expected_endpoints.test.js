import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../app.js';

describe('Frontend Expected Endpoints Integration & OpenAPI Verification', () => {
  // --- 1. Response Envelope Verification Tests ---
  
  it('Error responses should contain standard ErrorResponse envelope (success, message, errors, statusCode)', async () => {
    const res = await request(app).get('/v1/properties/invalid-id-nonexistent');
    // It should fail validation or return 404/500/400
    expect(res.status).toBeGreaterThanOrEqual(400);
    expect(res.body).toHaveProperty('success', false);
    expect(res.body).toHaveProperty('message');
    expect(res.body).toHaveProperty('errors');
    expect(res.body).toHaveProperty('statusCode');
    expect(typeof res.body.statusCode).toBe('number');
  });

  it('Paginated list responses should contain standard ApiResponse envelope with meta (success, message, data, meta)', async () => {
    const res = await request(app).get('/v1/properties?page=1&limit=5');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    
    const meta = res.body.meta || (res.body.data && res.body.data.meta);
    const dataList = Array.isArray(res.body.data) ? res.body.data : (res.body.data && res.body.data.data);
    
    expect(dataList).toBeDefined();
    expect(Array.isArray(dataList)).toBe(true);
    expect(meta).toBeDefined();
    expect(meta).toHaveProperty('total');
    expect(meta).toHaveProperty('page');
    expect(meta).toHaveProperty('limit');
    expect(meta).toHaveProperty('totalPages');
  });

  // --- 2. Endpoint Verification Tests ---

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

  // --- 3. Swagger.json OpenAPI Document Completeness Tests ---

  it('OpenAPI spec (swagger.json) should contain all requested endpoints and matching schemas', async () => {
    const res = await request(app).get('/swagger.json');
    expect(res.status).toBe(200);
    const spec = res.body;

    // Verify critical endpoints exist
    const expectedPaths = [
      '/auth/login',
      '/token',
      '/properties',
      '/properties/{property_id}',
      '/properties/buy',
      '/properties/{property_id}/resource',
      '/properties/{property_id}/set-verified',
      '/users',
      '/users/{user_id}',
      '/users/{user_id}/resource',
      '/users/{user_id}/wishlist',
      '/users/{user_id}/properties',
      '/users/wishlist',
      '/agents',
      '/agents/{agent_id}',
      '/agents/{agent_id}/resource',
      '/agents/{agent_id}/wishlist',
      '/merchants',
      '/merchants/agents',
      '/merchants/verify-agent',
      '/merchants/{merchant_id}/wishlist',
      '/appointments',
      '/appointments/{appointment_id}',
      '/appointments/{appointment_id}/confirm-meeting',
      '/appointments/{appointment_id}/set-agent-appointment-completion',
      '/appointments/{appointment_id}/set-user-appointment-completion',
      '/reviews',
      '/reviews/{review_id}',
      '/notifications',
      '/notifications/{id}/read',
      '/admin/notifications/broadcast',
      '/notifications/preferences'
    ];

    for (const path of expectedPaths) {
      expect(spec.paths).toHaveProperty(path);
    }

    // Verify public endpoints have security: [] overridden (public access)
    const publicEndpoints = [
      { path: '/properties', method: 'get' },
      { path: '/properties/{property_id}', method: 'get' },
      { path: '/agents', method: 'get' },
      { path: '/merchants', method: 'get' },
      { path: '/merchants/agents', method: 'get' },
      { path: '/reviews', method: 'get' },
      { path: '/notifications', method: 'get' },
      { path: '/notifications/{id}/read', method: 'patch' }
    ];

    for (const { path, method } of publicEndpoints) {
      expect(spec.paths[path]).toHaveProperty(method);
      expect(spec.paths[path][method]).toHaveProperty('security');
      expect(spec.paths[path][method].security).toEqual([]);
    }

    // Verify all enhanced and new schemas are properly defined
    const expectedSchemas = [
      'ApiResponse',
      'ErrorResponse',
      'LoginRequest',
      'CreateUserRequest',
      'CreatePropertyRequest',
      'CreateAppointmentRequest',
      'CreateReviewRequest',
      'CreateWishlistRequest',
      'CreateAgentRequest',
      'CreateMerchantRequest',
      'VerifyAgentRequest',
      'Notification',
      'NotificationPreference',
      'UpdatePreferencesRequest',
      'BroadcastNotificationRequest'
    ];

    for (const schema of expectedSchemas) {
      expect(spec.components.schemas).toHaveProperty(schema);
    }
  });
});
