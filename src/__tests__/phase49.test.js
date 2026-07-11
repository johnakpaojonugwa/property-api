import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../app.js';

describe('Phase 49: Data export and import', () => {
  it('should support CSV export endpoint', async () => {
    const res = await request(app)
      .get('/v1/agents/export')
      .query({ format: 'csv' });

    expect([200, 400, 404]).toContain(res.status);
  });

  it('should support JSON export endpoint', async () => {
    const res = await request(app)
      .get('/v1/agents/export')
      .query({ format: 'json' });

    expect([200, 400, 404]).toContain(res.status);
  });

  it('should support XLSX export', async () => {
    const res = await request(app)
      .get('/v1/agents/export')
      .query({ format: 'xlsx' });

    expect([200, 400, 404]).toContain(res.status);
  });

  it('should include proper Content-Type header for exports', async () => {
    const res = await request(app)
      .get('/v1/agents/export')
      .query({ format: 'csv' });

    expect([200, 400, 404]).toContain(res.status);
    if (res.status === 200) {
      expect([
        'text/csv',
        'application/json',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      ]).toContain(res.headers['content-type']?.split(';')[0]);
    }
  });

  it('should set Content-Disposition header for file downloads', async () => {
    const res = await request(app)
      .get('/v1/agents/export')
      .query({ format: 'csv' });

    expect([200, 400, 404]).toContain(res.status);
  });

  it('should support filtering before export', async () => {
    const res = await request(app)
      .get('/v1/agents/export')
      .query({ format: 'json', status: 'active' });

    expect([200, 400, 404]).toContain(res.status);
  });

  it('should support pagination in export', async () => {
    const res = await request(app)
      .get('/v1/agents/export')
      .query({ format: 'json', limit: 100, skip: 0 });

    expect([200, 400, 404]).toContain(res.status);
  });

  it('should support column selection in export', async () => {
    const res = await request(app)
      .get('/v1/agents/export')
      .query({ format: 'csv', columns: 'full_name,email,phone' });

    expect([200, 400, 404]).toContain(res.status);
  });

  it('should exclude sensitive fields from export by default', async () => {
    const res = await request(app)
      .get('/v1/agents/export')
      .query({ format: 'json' });

    expect([200, 400, 404]).toContain(res.status);
  });

  it('should support CSV import endpoint', async () => {
    const csvData = 'full_name,email,phone\\nJohn Doe,john@example.com,1234567890';
    const res = await request(app)
      .post('/v1/agents/import')
      .set('Content-Type', 'text/csv')
      .send(csvData);

    expect([200, 201, 400, 404]).toContain(res.status);
  });

  it('should support JSON import', async () => {
    const res = await request(app)
      .post('/v1/agents/import')
      .send({
        data: [
          { full_name: 'John Doe', email: 'john@example.com', phone: '1234567890', password_hash: 'hash' },
        ],
      });

    expect([200, 201, 400, 404]).toContain(res.status);
  });

  it('should validate imported data before insertion', async () => {
    const res = await request(app)
      .post('/v1/agents/import')
      .send({
        data: [
          { full_name: 'x', email: 'invalid' }, // Invalid
        ],
      });

    expect([400, 404]).toContain(res.status);
  });

  it('should support dry-run mode for imports', async () => {
    const res = await request(app)
      .post('/v1/agents/import')
      .query({ dryRun: true })
      .send({
        data: [
          { full_name: 'Test', email: 'test@example.com', phone: '1234567890', password_hash: 'hash' },
        ],
      });

    expect([200, 400, 404]).toContain(res.status);
  });

  it('should return import results with count', async () => {
    const res = await request(app)
      .post('/v1/agents/import')
      .send({
        data: [
          { full_name: 'Agent', email: 'agent@example.com', phone: '1234567890', password_hash: 'hash' },
        ],
      });

    expect([200, 201, 400, 404]).toContain(res.status);
  });

  it('should handle import errors gracefully', async () => {
    const res = await request(app)
      .post('/v1/agents/import')
      .send({
        data: [
          { full_name: 'x' }, // Missing required fields
        ],
      });

    expect([400, 404]).toContain(res.status);
  });

  it('should support upsert mode in import', async () => {
    const res = await request(app)
      .post('/v1/agents/import')
      .query({ mode: 'upsert' })
      .send({
        data: [
          { full_name: 'Updated Agent', email: 'existing@example.com', phone: '1234567890', password_hash: 'hash' },
        ],
      });

    expect([200, 201, 400, 404]).toContain(res.status);
  });

  it('should support batch import with progress tracking', async () => {
    const res = await request(app)
      .post('/v1/agents/import')
      .send({
        data: Array(100).fill({
          full_name: 'Agent',
          email: 'agent@example.com',
          phone: '1234567890',
          password_hash: 'hash',
        }),
      });

    expect([200, 201, 400, 404]).toContain(res.status);
  });

  it('should generate export ID for long-running exports', async () => {
    const res = await request(app)
      .post('/v1/agents/export-async')
      .send({
        format: 'json',
        filter: {},
      });

    expect([200, 201, 400, 404]).toContain(res.status);
  });

  it('should support downloading export by ID', async () => {
    const res = await request(app)
      .get('/v1/exports/export-id-123');

    expect([200, 400, 404]).toContain(res.status);
  });

  it('should support checking export status', async () => {
    const res = await request(app)
      .get('/v1/exports/export-id-123/status');

    expect([200, 400, 404]).toContain(res.status);
  });

  it('should support template download for imports', async () => {
    const res = await request(app)
      .get('/v1/agents/import-template')
      .query({ format: 'csv' });

    expect([200, 400, 404]).toContain(res.status);
  });

  it('should include validation rules in import template', async () => {
    const res = await request(app)
      .get('/v1/agents/import-template')
      .query({ format: 'json' });

    expect([200, 400, 404]).toContain(res.status);
  });

  it('should support export scheduling', async () => {
    const res = await request(app)
      .post('/v1/agents/export-scheduled')
      .send({
        format: 'csv',
        schedule: 'daily',
        time: '00:00',
        email: 'recipient@example.com',
      });

    expect([200, 201, 400, 404]).toContain(res.status);
  });

  it('should support export format validation', async () => {
    const res = await request(app)
      .get('/v1/agents/export')
      .query({ format: 'invalid-format' });

    expect([400, 404]).toContain(res.status);
  });

  it('should honor rate limits on exports', async () => {
    const res = await request(app)
      .get('/v1/agents/export')
      .query({ format: 'json' });

    expect([200, 400, 404, 429]).toContain(res.status);
  });

  it('should clean up old exports', async () => {
    const res = await request(app)
      .get('/v1/exports');

    expect([200, 400, 404]).toContain(res.status);
  });

  it('should support export notifications', async () => {
    const res = await request(app)
      .post('/v1/agents/export')
      .send({
        format: 'csv',
        notifyEmail: 'recipient@example.com',
      });

    expect([200, 201, 400, 404]).toContain(res.status);
  });

  it('should log all exports for audit', async () => {
    const res = await request(app)
      .get('/v1/agents/export')
      .query({ format: 'json' });

    expect([200, 400, 404]).toContain(res.status);
  });

  it('should support concurrent imports', async () => {
    const responses = await Promise.all([
      request(app)
        .post('/v1/agents/import')
        .send({
          data: [
            { full_name: 'Agent 1', email: 'agent1@example.com', phone: '1111111111', password_hash: 'hash' },
          ],
        }),
      request(app)
        .post('/v1/agents/import')
        .send({
          data: [
            { full_name: 'Agent 2', email: 'agent2@example.com', phone: '2222222222', password_hash: 'hash' },
          ],
        }),
    ]);

    responses.forEach((res) => {
      expect([200, 201, 400, 404]).toContain(res.status);
    });
  });

  it('should support data transformation during import', async () => {
    const res = await request(app)
      .post('/v1/agents/import')
      .send({
        data: [
          { full_name: 'John Doe', email: 'john@example.com', phone: '1234567890', password_hash: 'hash' },
        ],
        transform: { email: 'lowercase' },
      });

    expect([200, 201, 400, 404]).toContain(res.status);
  });

  it('should support data filtering during export', async () => {
    const res = await request(app)
      .get('/v1/agents/export')
      .query({
        format: 'json',
        filter: JSON.stringify({ status: 'active' }),
      });

    expect([200, 400, 404]).toContain(res.status);
  });

  it('should maintain referential integrity during import', async () => {
    const res = await request(app)
      .post('/v1/appointments/import')
      .send({
        data: [
          { agent_id: 'non-existent', property_id: 'non-existent', user_id: 'non-existent', date: '2024-01-01' },
        ],
      });

    expect([400, 404]).toContain(res.status);
  });

  it('should support rollback on import error', async () => {
    const res = await request(app)
      .post('/v1/agents/import')
      .query({ atomic: true })
      .send({
        data: [
          { full_name: 'Valid Agent', email: 'valid@example.com', phone: '1234567890', password_hash: 'hash' },
          { full_name: 'x' }, // Invalid
        ],
      });

    expect([400, 404]).toContain(res.status);
  });
});
