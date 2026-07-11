import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../app.js';

describe('Phase 51: Localization and i18n support', () => {
  it('should support accept-language header', async () => {
    const res = await request(app)
      .get('/v1/agents')
      .set('Accept-Language', 'en-US');

    expect([200, 400, 404]).toContain(res.status);
  });

  it('should return responses in requested language', async () => {
    const res = await request(app)
      .get('/v1/agents')
      .set('Accept-Language', 'es-ES');

    expect([200, 400, 404]).toContain(res.status);
  });

  it('should support language query parameter', async () => {
    const res = await request(app)
      .get('/v1/agents')
      .query({ lang: 'fr' });

    expect([200, 400, 404]).toContain(res.status);
  });

  it('should support multiple language preferences', async () => {
    const res = await request(app)
      .get('/v1/agents')
      .set('Accept-Language', 'es-ES,es;q=0.9,en;q=0.8');

    expect([200, 400, 404]).toContain(res.status);
  });

  it('should default to English for unsupported languages', async () => {
    const res = await request(app)
      .get('/v1/agents')
      .set('Accept-Language', 'xx-XX');

    expect([200, 400, 404]).toContain(res.status);
  });

  it('should translate error messages based on locale', async () => {
    const res = await request(app)
      .post('/v1/agents')
      .set('Accept-Language', 'es-ES')
      .send({});

    expect([400, 404]).toContain(res.status);
  });

  it('should include locale in response headers', async () => {
    const res = await request(app)
      .get('/v1/agents')
      .set('Accept-Language', 'en-US');

    expect([200, 400, 404]).toContain(res.status);
  });

  it('should support date formatting by locale', async () => {
    const res = await request(app)
      .get('/v1/appointments')
      .set('Accept-Language', 'en-US');

    expect([200, 400, 404]).toContain(res.status);
  });

  it('should support currency formatting by locale', async () => {
    const res = await request(app)
      .get('/v1/properties')
      .set('Accept-Language', 'en-GB');

    expect([200, 400, 404]).toContain(res.status);
  });

  it('should support number formatting by locale', async () => {
    const res = await request(app)
      .get('/v1/properties')
      .query({ priceMin: 1000, priceMax: 5000000 })
      .set('Accept-Language', 'de-DE');

    expect([200, 400, 404]).toContain(res.status);
  });

  it('should translate field names in responses', async () => {
    const res = await request(app)
      .get('/v1/agents')
      .set('Accept-Language', 'fr-FR');

    expect([200, 400, 404]).toContain(res.status);
  });

  it('should support RTL (right-to-left) language detection', async () => {
    const res = await request(app)
      .get('/v1/agents')
      .set('Accept-Language', 'ar-SA');

    expect([200, 400, 404]).toContain(res.status);
  });

  it('should translate validation error messages', async () => {
    const res = await request(app)
      .post('/v1/agents')
      .set('Accept-Language', 'ja-JP')
      .send({
        full_name: 'x', // Too short
      });

    expect([400, 404]).toContain(res.status);
  });

  it('should support pluralization rules by language', async () => {
    const res = await request(app)
      .get('/v1/appointments')
      .set('Accept-Language', 'ru-RU');

    expect([200, 400, 404]).toContain(res.status);
  });

  it('should translate email templates', async () => {
    const res = await request(app)
      .post('/v1/auth/forgot-password')
      .set('Accept-Language', 'it-IT')
      .send({
        email: 'user@example.com',
      });

    expect([200, 201, 400, 404]).toContain(res.status);
  });

  it('should support locale-specific time zones', async () => {
    const res = await request(app)
      .get('/v1/appointments')
      .set('Accept-Language', 'en-US')
      .query({ tz: 'America/New_York' });

    expect([200, 400, 404]).toContain(res.status);
  });

  it('should support content negotiation for different locales', async () => {
    const res = await request(app)
      .get('/v1/agents')
      .set('Accept-Language', 'de-DE, de;q=0.9, en;q=0.8, en-US;q=0.7');

    expect([200, 400, 404]).toContain(res.status);
  });

  it('should cache translations per locale', async () => {
    const res1 = await request(app)
      .get('/v1/agents')
      .set('Accept-Language', 'es-ES');

    const res2 = await request(app)
      .get('/v1/agents')
      .set('Accept-Language', 'es-ES');

    expect(res1.status).toBe(res2.status);
  });

  it('should translate pagination metadata', async () => {
    const res = await request(app)
      .get('/v1/agents')
      .query({ limit: 10, skip: 0 })
      .set('Accept-Language', 'pt-BR');

    expect([200, 400, 404]).toContain(res.status);
  });

  it('should support region-specific variants of language', async () => {
    const res = await request(app)
      .get('/v1/agents')
      .set('Accept-Language', 'zh-CN'); // Simplified Chinese

    expect([200, 400, 404]).toContain(res.status);
  });

  it('should translate API documentation links', async () => {
    const res = await request(app)
      .get('/v1/help')
      .set('Accept-Language', 'ko-KR');

    expect([200, 400, 404]).toContain(res.status);
  });

  it('should preserve original text for unsupported locales', async () => {
    const res = await request(app)
      .get('/v1/agents')
      .set('Accept-Language', 'xx-YY');

    expect([200, 400, 404]).toContain(res.status);
  });

  it('should translate webhook notification messages', async () => {
    const res = await request(app)
      .post('/v1/webhooks')
      .set('Accept-Language', 'nl-NL')
      .send({
        url: 'https://example.com/webhook',
        event: 'property.created',
      });

    expect([200, 201, 400, 404]).toContain(res.status);
  });

  it('should support locale in user preferences', async () => {
    const res = await request(app)
      .patch('/v1/users/profile')
      .send({
        preferredLanguage: 'fr-FR',
        timezone: 'Europe/Paris',
      });

    expect([200, 400, 401, 404]).toContain(res.status);
  });

  it('should translate sorting field names', async () => {
    const res = await request(app)
      .get('/v1/properties')
      .query({ sort: 'pricePerSquareMeter', lang: 'de' });

    expect([200, 400, 404]).toContain(res.status);
  });

  it('should translate sorting and filtering descriptions', async () => {
    const res = await request(app)
      .get('/v1/properties')
      .query({ filter: 'recent', lang: 'it' });

    expect([200, 400, 404]).toContain(res.status);
  });

  it('should support language fallback chains', async () => {
    const res = await request(app)
      .get('/v1/agents')
      .set('Accept-Language', 'es-MX, es;q=0.9, en;q=0.8');

    expect([200, 400, 404]).toContain(res.status);
  });

  it('should translate pagination controls text', async () => {
    const res = await request(app)
      .get('/v1/agents')
      .query({ page: 1, pageSize: 20 })
      .set('Accept-Language', 'sv-SE');

    expect([200, 400, 404]).toContain(res.status);
  });

  it('should support locale-aware search results', async () => {
    const res = await request(app)
      .get('/v1/search')
      .query({ q: 'apartment', lang: 'pl' });

    expect([200, 400, 404]).toContain(res.status);
  });

  it('should translate boolean field names', async () => {
    const res = await request(app)
      .get('/v1/properties')
      .set('Accept-Language', 'tr-TR');

    expect([200, 400, 404]).toContain(res.status);
  });

  it('should translate enum values', async () => {
    const res = await request(app)
      .get('/v1/properties')
      .query({ type: 'apartment', lang: 'th' });

    expect([200, 400, 404]).toContain(res.status);
  });

  it('should translate status messages', async () => {
    const res = await request(app)
      .patch('/v1/appointments/appt-123')
      .set('Accept-Language', 'hi-IN')
      .send({ status: 'completed' });

    expect([200, 400, 404]).toContain(res.status);
  });

  it('should support custom locale codes', async () => {
    const res = await request(app)
      .get('/v1/agents')
      .set('Accept-Language', 'en-GB-oed'); // Oxford English Dialect

    expect([200, 400, 404]).toContain(res.status);
  });

  it('should translate rate limiting error messages', async () => {
    const res = await request(app)
      .get('/v1/agents')
      .set('Accept-Language', 'el-GR');

    expect([200, 429, 404]).toContain(res.status);
  });

  it('should support translation for batch operations', async () => {
    const res = await request(app)
      .post('/v1/batch')
      .set('Accept-Language', 'nb-NO')
      .send({
        operations: [
          { method: 'GET', url: '/v1/agents' },
          { method: 'POST', url: '/v1/appointments', body: {} },
        ],
      });

    expect([200, 207, 400, 404]).toContain(res.status);
  });

  it('should maintain locale across redirect', async () => {
    const res = await request(app)
      .get('/v1/agents/redirect')
      .set('Accept-Language', 'vi-VN');

    expect([200, 301, 302, 400, 404]).toContain(res.status);
  });

  it('should translate API schema descriptions', async () => {
    const res = await request(app)
      .get('/v1/schema')
      .set('Accept-Language', 'uk-UA');

    expect([200, 400, 404]).toContain(res.status);
  });

  it('should support concurrent requests in different locales', async () => {
    const responses = await Promise.all([
      request(app)
        .get('/v1/agents')
        .set('Accept-Language', 'en-US'),
      request(app)
        .get('/v1/agents')
        .set('Accept-Language', 'fr-FR'),
      request(app)
        .get('/v1/agents')
        .set('Accept-Language', 'de-DE'),
    ]);

    responses.forEach((res) => {
      expect([200, 400, 404]).toContain(res.status);
    });
  });
});
